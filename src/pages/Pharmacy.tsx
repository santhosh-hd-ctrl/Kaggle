import React, { useState, useEffect } from "react";
import { dbService } from "../services/db";
import { Medicine } from "../types/hospital";
import { useAuth } from "../context/AuthContext";
import { 
  Package, Plus, Trash2, Search, Filter, RefreshCw, X, 
  TrendingDown, ShieldAlert, Sparkles, AlertTriangle, ArrowUpDown, ChevronUp, ChevronDown 
} from "lucide-react";

export const PharmacyInventory: React.FC = () => {
  const { user, addToast } = useAuth();
  
  // States
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockSelector, setStockSelector] = useState("All");
  const [loading, setLoading] = useState(true);

  // New medication form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [medName, setMedName] = useState("");
  const [medStock, setMedStock] = useState(100);
  const [medExpiry, setMedExpiry] = useState("2027-04-12");
  const [medPrice, setMedPrice] = useState(12.50);

  const loadMedicines = () => {
    setLoading(true);
    setTimeout(() => {
      setMedicines(dbService.getMedicines());
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  // Filter
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (stockSelector === "Low") {
      return matchesSearch && med.stock < 50;
    }
    if (stockSelector === "Critical") {
      return matchesSearch && med.stock < 15;
    }
    return matchesSearch;
  });

  const handleUpdateStock = (id: string, name: string, delta: number) => {
    const list = dbService.getMedicines();
    const updated = list.map((med) => {
      if (med.id === id) {
        return {
          ...med,
          stock: Math.max(0, med.stock + delta),
          status: (med.stock + delta) < 15 ? "Critical" : (med.stock + delta) < 50 ? "Low" : "Available" as any
        };
      }
      return med;
    });

    dbService.saveMedicines(updated);
    dbService.logAction(user?.id || "System", user?.name || "Pharmacist", "Doctor/Staff", "PHARMACY_STOCK", `Adjusted stock of ${name} by ${delta}`);
    addToast(`Stock for ${name} updated by ${delta > 0 ? "+" : ""}${delta}.`, "success");
    loadMedicines();
  };

  const handleCreateMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) {
      addToast("Medication description is required.", "warning");
      return;
    }

    const list = dbService.getMedicines();
    const generatedId = "MED-00" + (list.length + 1);

    const newMed: Medicine = {
      id: generatedId,
      name: medName,
      stock: medStock,
      expiryDate: medExpiry,
      price: medPrice,
      status: medStock < 15 ? "Critical" : medStock < 50 ? "Low" : "Available"
    };

    const updated = [...list, newMed];
    dbService.saveMedicines(updated);
    dbService.logAction(user?.id || "System", user?.name || "Admin", "Admin", "PHARMACY_CREATE", `Registered new medication sku: ${newMed.name}`);

    addToast(`Medication ${newMed.name} added successfully. ID: ${newMed.id}`, "success");
    setIsFormOpen(false);
    loadMedicines();
  };

  return (
    <div className="space-y-6" id="pharmacy-records">
      
      {/* HEADER CONTROLS */}
      <div className="flex border-b border-slate-805 pb-4 items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            Apothecary &amp; Meds Inventory
          </h2>
          <p className="text-xs text-slate-400">Inventory control desk: Track medicine batch codes, set pricing arrays, and manage threshold warnings</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadMedicines}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {user?.role !== "Patient" && (
            <button
              onClick={() => {
                setMedName("");
                setMedStock(100);
                setMedExpiry("2027-05-18");
                setMedPrice(18.00);
                setIsFormOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-650 hover:from-amber-655 bg-amber-650 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Medication SKU
            </button>
          )}
        </div>
      </div>

      {/* SEARCH AND QUICK FILTER TILES */}
      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Search matching therapeutic medication names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-slate-305 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 select-none text-[10px]">
          <span className="text-slate-500 font-mono font-bold mr-1">THRESHOLD FILTER:</span>
          {["All", "Low", "Critical"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setStockSelector(lvl)}
              className={`px-3 py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                stockSelector === lvl 
                  ? "bg-amber-650 bg-amber-600 text-white" 
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {lvl} Category
            </button>
          ))}
        </div>
      </div>

      {/* MEDICINES LIST GRID */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-900 rounded-xl" />)}
        </div>
      ) : filteredMedicines.length > 0 ? (
        <div className="space-y-3">
          {filteredMedicines.map((med) => (
            <div key={med.id} className="p-4 bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 shrink-0">
                  <Package className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] font-mono text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 block leading-none">{med.id}</span>
                    <strong className="font-display font-extrabold text-sm text-slate-100">{med.name}</strong>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Expiry Date: <span className="font-mono text-[11px] text-slate-500">{med.expiryDate}</span></p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Unit Cash Exchange fee: ${med.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Adjust Stock Counter Panel */}
              <div className="flex flex-wrap items-center gap-6 w-full md:w-auto justify-between md:justify-end font-mono">
                
                <div className="text-right">
                  <span className="text-[9.5px] text-slate-500 font-bold block mb-0.5 select-none">BATCH QUANTITY:</span>
                  <span className={`text-sm font-extrabold block ${
                    med.stock < 15 ? "text-rose-500 animate-pulse" : med.stock < 50 ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    {med.stock} units
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${
                    med.status === "Available" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/15" :
                    med.status === "Low" ? "bg-amber-500/10 text-amber-400 border-amber-500/15" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/15 animate-pulse"
                  }`}>
                    {med.status}
                  </span>

                  {user?.role !== "Patient" && (
                    <div className="flex gap-1 pl-2">
                      <button 
                        onClick={() => handleUpdateStock(med.id, med.name, 10)}
                        className="p-1 px-2 bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-850 hover:border-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
                        title="Add +10 stock"
                      >
                        +10
                      </button>
                      <button 
                        onClick={() => handleUpdateStock(med.id, med.name, -10)}
                        className="p-1 px-2 bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-850 hover:border-slate-700 text-xs font-bold rounded cursor-pointer transition-colors"
                        title="Remove -10 stock"
                      >
                        -10
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center max-w-sm mx-auto space-y-3 bg-slate-900 border border-slate-850 rounded-2xl animate-fade-in animate-duration-300">
          <AlertTriangle className="w-12 h-12 text-slate-650 mx-auto opacity-35" />
          <h3 className="text-sm font-extrabold text-slate-350">Stock Racks Unfilled</h3>
          <p className="text-xs text-slate-500">No SKU listings match current criteria.</p>
        </div>
      )}

      {/* NEW SKU MULTIPLEXER MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative space-y-4 animate-scale-up">
            
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="font-display font-extrabold text-base text-white">Register Medication SKU</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define pharmaceutical parameters and batch initial volumes</p>
            </div>

            <form onSubmit={handleCreateMedicine} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">MEDICATION DISCRIPTION NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Paracetamol 500mg (Tablets)"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">INITIAL STOCK</label>
                  <input 
                    type="number" 
                    required
                    value={medStock}
                    onChange={(e) => setMedStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 block">PRICE/UNIT ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={medPrice}
                    onChange={(e) => setMedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 block">EXPIRY BATCH VALIDITY</label>
                <input 
                  type="date" 
                  required
                  value={medExpiry}
                  onChange={(e) => setMedExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Add Medicine SKU
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
