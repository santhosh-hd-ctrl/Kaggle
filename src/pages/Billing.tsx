import React, { useState, useEffect } from "react";
import { dbService } from "../services/db";
import { Invoice } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { DocumentButton } from "../components/DocumentButton";
import { 
  CreditCard, DollarSign, Search, Filter, RefreshCw, FileText, 
  TrendingUp, Wallet, Check, Ban, Receipt, ArrowUpRight 
} from "lucide-react";

export const BillingLedger: React.FC = () => {
  const { user, addToast } = useAuth();
  
  // Ledgers states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadInvoices = () => {
    setLoading(true);
    setTimeout(() => {
      setInvoices(dbService.getInvoices());
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Filter
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = 
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summaries details
  const totalPaidRevenue = invoices
    .filter(i => i.status === "Paid")
    .reduce((sum, current) => sum + current.total, 0);

  const totalOutstanding = invoices
    .filter(i => i.status === "Unpaid")
    .reduce((sum, current) => sum + current.total, 0);

  const totalTaxSurcharge = invoices
    .filter(i => i.status === "Paid")
    .reduce((sum, current) => sum + current.tax, 0);

  const handlePayInvoice = (id: string, clientName: string, totalVal: number) => {
    const allInvs = dbService.getInvoices();
    const updated = allInvs.map(inv => {
      if (inv.id === id) {
        return { ...inv, status: "Paid" as any };
      }
      return inv;
    });

    dbService.saveInvoices(updated);
    dbService.logAction(user?.id || "System", user?.name || "Finance Lead", user?.role || "Staff", "INVOICE_PAY", `Settled invoice sheet: ${id} ($${totalVal}) for patient: ${clientName}`);
    
    addToast(`Invoice ${id} paid. $${totalVal} cleared and posted to hospital revenue registers.`, "success");
    loadInvoices();
  };

  const getInvoiceReportData = (inv: Invoice) => ({
    subtitle: "Official Medical Treatment Invoice & Clearing Receipt",
    sections: [
      {
        title: "Invoice Clearance Details",
        fields: [
          { label: "Invoice Identifier", value: inv.id },
          { label: "Patient Subject Legal Name", value: inv.patientName },
          { label: "Consul Attending Provider", value: inv.doctorName },
          { label: "Date of Transaction", value: inv.date },
          { label: "Current Balance Status", value: inv.status.toUpperCase() }
        ]
      },
      {
        title: "Service Ledger Itemizations",
        fields: [
          { label: "Service Provision Type", value: inv.service },
          { label: "Subtotal Fee Basis", value: `$${inv.amount}.00 USD` },
          { label: "Regulatory Tax Surcharges", value: `$${inv.tax}.00 USD` },
          { label: "Total Outstanding Amount Due", value: `$${inv.total}.00 USD` }
        ],
        content: `Payment Terms Statement:\nThis sheet serves as certified proof of charges for the consulting services. For paid bills, the patient's balance is $0.00. For unpaid, full settlement is required within 30 days of release.`
      }
    ],
    excelHeaders: ["Invoice ID", "Patient Name", "Physician", "Date", "Service", "Subtotal", "Tax", "Total Amount", "Status"],
    excelRows: [[
      inv.id,
      inv.patientName,
      inv.doctorName,
      inv.date,
      inv.service,
      `$${inv.amount}`,
      `$${inv.tax}`,
      `$${inv.total}`,
      inv.status
    ]]
  });

  return (
    <div className="space-y-6" id="billing-ledger">
      
      {/* HEADER SECTION */}
      <div className="flex border-b border-slate-800 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            Finances &amp; Billing Ledger
          </h2>
          <p className="text-xs text-slate-400">PostgreSQL financial records: Liquid assets registry, transaction clearance pipelines, and invoicing ledgers</p>
        </div>
        
        <button 
          onClick={loadInvoices}
          className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* CORE FINANCIAL SUMMARIES WIDGETS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900 border border-slate-805 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 relative">
            <span className="text-[9.5px] font-mono font-bold text-slate-500 tracking-wider uppercase block">CLEARED REVENUE INCOME</span>
            <span className="text-2xl font-display font-extrabold text-emerald-450">${totalPaidRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block font-mono flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              15% state medical surcharge logged
            </span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-805 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-mono font-bold text-slate-500 tracking-wider uppercase block">OUTSTANDING PAYMENTS BALANCE</span>
            <span className="text-2xl font-display font-extrabold text-amber-500">${totalOutstanding.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block font-mono">Collectable assets from inpatient files</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-805 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-mono font-bold text-slate-500 tracking-wider uppercase block">TAXES COLLECTIBLES</span>
            <span className="text-2xl font-display font-extrabold text-indigo-400">${totalTaxSurcharge.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block font-mono">FDA regulatory healthcare taxes</span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

      </section>

      {/* SEARCH AND FILTERS SHEET */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search matching names, invoice ID, service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-305"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end select-none">
          <span className="text-[10px] text-slate-500 font-mono font-bold">STATUS:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-800 text-slate-350 text-xs rounded-lg focus:outline-none"
          >
            <option value="All">All statuses</option>
            <option value="Paid">Cleared (Paid)</option>
            <option value="Unpaid">Pending Balance (Unpaid)</option>
          </select>
        </div>
      </div>

      {/* DETAILED TRANSACTION TABLE RECORDS */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-900 rounded-xl" />)}
        </div>
      ) : filteredInvoices.length > 0 ? (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => (
            <div key={inv.id} className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 shrink-0">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold bg-slate-950 border border-slate-850 px-1.5 py-0.2 rounded block leading-none">{inv.id}</span>
                    <strong className="font-display font-extrabold text-sm text-slate-100">{inv.patientName}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{inv.service} • <span className="font-semibold text-indigo-350">{inv.doctorName}</span></p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Cleared date: {inv.date}</p>
                </div>
              </div>

              {/* Financial calculations */}
              <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="font-mono text-xs text-right hidden sm:block">
                  <p className="text-slate-500">Amount: <span className="text-slate-350">${inv.amount}</span></p>
                  <p className="text-slate-500">Tax Sur: <span className="text-slate-350">${inv.tax}</span></p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-500 font-bold block mb-0.5">TOTAL FEE:</span>
                  <span className="text-sm font-extrabold text-slate-100 font-mono">${inv.total}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                  <DocumentButton
                    title={`Invoice Statement: ${inv.id}`}
                    category="Invoice"
                    documentId={inv.id}
                    data={getInvoiceReportData(inv)}
                    variant="outline"
                    label="Download Bill"
                  />
                  <span className={`px-2.5 py-0.5 text-[9px] font-extrabold font-mono rounded-full border uppercase leading-tight select-none ${
                    inv.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {inv.status}
                  </span>

                  {/* Payment settlement button */}
                  {inv.status === "Unpaid" && (
                    <button 
                      onClick={() => handlePayInvoice(inv.id, inv.patientName, inv.total)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Discharge Bill
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3 bg-slate-900 border border-slate-850 rounded-2xl animate-fade-in">
          <CreditCard className="w-12 h-12 text-slate-650 mx-auto opacity-35" />
          <h3 className="text-sm font-extrabold text-slate-350 font-display">Invoices Ledger Empty</h3>
          <p className="text-xs text-slate-500">No transactional invoice statements found.</p>
        </div>
      )}

    </div>
  );
};
