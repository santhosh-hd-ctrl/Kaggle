import { dbService } from "./db";

// Interface for tracking download status
export interface DownloadState {
  status: "idle" | "authorizing" | "syncing" | "generating" | "downloading" | "completed" | "failed";
  progress: number;
  fileName: string;
  errorMessage: string;
}

class AdvancedDownloadService {
  private getSession() {
    const session = localStorage.getItem("smarthosp_session");
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  }

  // Exchanges local session credentials for a secure backend JWT
  public async getSecureJwt(): Promise<string> {
    const session = this.getSession();
    if (!session) {
      throw new Error("No active credentials. This action requires medical authorization.");
    }

    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.id,
        name: session.name,
        role: session.role
      })
    });

    if (!res.ok) {
      throw new Error(`Failed secure audit clearance dispatch: status ${res.status}`);
    }

    const data = await res.json();
    return data.token;
  }

  // Pushes local DB state to the server so PDFs contain all newly added records
  public async syncStateToServer(): Promise<void> {
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patients: dbService.getPatients(),
          doctors: dbService.getDoctors(),
          appointments: dbService.getAppointments(),
          medicines: dbService.getMedicines(),
          labTests: dbService.getLabTests(),
          invoices: dbService.getInvoices(),
          bloodStock: dbService.getBloodStock()
        })
      });

      if (!res.ok) {
         console.warn(`Sync warning: server responded with ${res.status}`);
      }
    } catch (e) {
      console.error("State-sync failed:", e);
    }
  }

  // Core high-fidelity file downloader with progressive streaming & response headers parsing
  public async downloadDocument(
    endpoint: string,
    onProgress: (state: DownloadState) => void,
    retryCount = 0
  ): Promise<void> {
    const defaultState: DownloadState = {
      status: "authorizing",
      progress: 0,
      fileName: "",
      errorMessage: ""
    };

    try {
      onProgress(defaultState);

      // 1. Authorization
      const token = await this.getSecureJwt();

      // 2. Synchronize LocalState databases
      onProgress({ ...defaultState, status: "syncing", progress: 20 });
      await this.syncStateToServer();

      // 3. Document Generation
      onProgress({ ...defaultState, status: "generating", progress: 45 });

      // 4. Hit Stream API endpoint
      const response = await fetch(endpoint, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        let errText = "Inpatient record database cleared check-in failed.";
        try {
          const errData = await response.json();
          errText = errData.error || errData.details || errText;
        } catch {}
        throw new Error(errText);
      }

      // Check content-disposition header for file name
      let fileName = "smart_hospital_document.pdf";
      const contentDisposition = response.headers.get("content-disposition");
      if (contentDisposition) {
        const matches = /filename="([^"]+)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      onProgress({
        status: "downloading",
        progress: 60,
        fileName,
        errorMessage: ""
      });

      // 5. Track download progress using native ReadableStream
      const contentLength = response.headers.get("content-length");
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to initialize document file reader stream.");
      }

      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        const progressPercent = totalBytes 
          ? Math.min(100, Math.floor(60 + (receivedBytes / totalBytes) * 40))
          : 85;

        onProgress({
          status: "downloading",
          progress: progressPercent,
          fileName,
          errorMessage: ""
        });
      }

      // 6. Concatenate chunks to Blob and download
      const fullBlob = new Blob(chunks, { type: "application/pdf" });
      const dlUrl = URL.createObjectURL(fullBlob);
      const link = document.createElement("a");
      link.href = dlUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(dlUrl);

      onProgress({
        status: "completed",
        progress: 100,
        fileName,
        errorMessage: ""
      });

    } catch (e: any) {
      console.error("Downloader encountered failure:", e);
      
      if (retryCount > 0) {
        console.warn(`Encountered error, retrying... (${retryCount} efforts left)`);
        return this.downloadDocument(endpoint, onProgress, retryCount - 1);
      }

      onProgress({
        status: "failed",
        progress: 0,
        fileName: "",
        errorMessage: e.message || "Unknown error occurred on compilation."
      });
    }
  }
}

export const downloadService = new AdvancedDownloadService();
