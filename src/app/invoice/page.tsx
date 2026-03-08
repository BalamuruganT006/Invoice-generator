"use client";

import { useState, useCallback } from "react";

interface Invoice {
  id: number;
  date: string;
  paymentMethod: string;
  paymentTo: string;
  amount: number;
}

const STORAGE_KEY = "invoice_app_data";

function loadInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices: Invoice[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch {
    // ignore
  }
}

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    if (typeof window === "undefined") return [];
    return loadInvoices();
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("");

  // Form state
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [amount, setAmount] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const matchSearch = !search || inv.paymentTo.toLowerCase().includes(search.toLowerCase());
    const matchMethod = !filterMethod || inv.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const totalAll = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalFiltered = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const resetForm = useCallback(() => {
    setDate("");
    setPaymentMethod("");
    setPaymentTo("");
    setAmount("");
    setEditingId(null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !paymentMethod || !paymentTo.trim() || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    let updated: Invoice[];
    if (editingId !== null) {
      updated = invoices.map((inv) =>
        inv.id === editingId
          ? { ...inv, date, paymentMethod, paymentTo: paymentTo.trim(), amount: parseFloat(amount) }
          : inv
      );
    } else {
      const newInvoice: Invoice = {
        id: Date.now() + Math.random(),
        date,
        paymentMethod,
        paymentTo: paymentTo.trim(),
        amount: parseFloat(amount),
      };
      updated = [...invoices, newInvoice];
    }

    setInvoices(updated);
    saveInvoices(updated);
    resetForm();
  };

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setDate(inv.date);
    setPaymentMethod(inv.paymentMethod);
    setPaymentTo(inv.paymentTo);
    setAmount(String(inv.amount));
    document.getElementById("invoice-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this invoice?")) {
      const updated = invoices.filter((inv) => inv.id !== id);
      setInvoices(updated);
      saveInvoices(updated);
      if (editingId === id) resetForm();
    }
  };

  const handleClearAll = () => {
    if (invoices.length === 0) { alert("No invoices to clear."); return; }
    if (confirm("Are you sure you want to delete ALL invoices? This cannot be undone.")) {
      setInvoices([]);
      localStorage.removeItem(STORAGE_KEY);
      resetForm();
    }
  };

  const handleDownloadPDF = async () => {
    if (invoices.length === 0) { alert("No invoices to download."); return; }
    try {
      const jsPDFModule = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF();
      const now = new Date();

      doc.setFontSize(22);
      doc.setTextColor(102, 51, 153);
      doc.text("Invoice Report", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Generated: " + now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        14, 30
      );

      doc.setDrawColor(102, 51, 153);
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);

      const tableData = invoices.map((inv) => [inv.date, inv.paymentMethod, inv.paymentTo, formatINR(inv.amount)]);
      autoTable(doc, {
        startY: 40,
        head: [["Date", "Payment Method", "Payment To", "Amount (INR)"]],
        body: tableData,
        foot: [["", "", "Total", formatINR(totalAll)]],
        headStyles: { fillColor: [102, 51, 153], textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [240, 235, 248], textColor: [50, 50, 50], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [248, 245, 255] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: { 3: { halign: "right" } },
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          "Page " + i + " of " + pageCount,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      }

      doc.save("invoices_" + now.toISOString().split("T")[0] + ".pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const methodBadgeClass = (method: string) =>
    "method-badge method-" + method.toLowerCase().replace(/ /g, "-");

  return (
    <>
      <div id="app-root">
        <div className="app-container">
          {/* Header */}
          <header className="app-header">
            <div className="header-content">
              <div className="header-left">
                <div className="logo">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2" />
                    <path d="M8 10h16M8 16h16M8 22h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <h1 className="app-title">Invoice Manager</h1>
                  <p className="app-subtitle">Track and manage your payments</p>
                </div>
              </div>
              <div className="header-stats">
                <div className="stat-card">
                  <span className="stat-label">Total Invoices</span>
                  <span className="stat-value">{invoices.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Amount</span>
                  <span className="stat-value">{formatINR(totalAll)}</span>
                </div>
              </div>
            </div>
          </header>

          <main className="main-content">
            {/* Form Section */}
            <section className="form-section">
              <div className="section-header">
                <h2 className="section-title">{editingId !== null ? "Edit Invoice" : "Add New Invoice"}</h2>
              </div>
              <form id="invoice-form" className="invoice-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-input"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      className="form-input"
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="">Select method...</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="paymentTo" className="form-label">Payment To</label>
                    <input
                      type="text"
                      id="paymentTo"
                      name="paymentTo"
                      className="form-input"
                      placeholder="Vendor or payee name"
                      required
                      value={paymentTo}
                      onChange={(e) => setPaymentTo(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="amount" className="form-label">Amount (₹)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      className="form-input"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      {editingId !== null ? (
                        <path d="M2 10l4 4L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      )}
                    </svg>
                    {editingId !== null ? "Update Invoice" : "Add Invoice"}
                  </button>
                  {editingId !== null && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Search & Filter */}
            <section className="filter-section">
              <div className="filter-bar">
                <div className="search-group">
                  <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    id="search-input"
                    className="search-input"
                    placeholder="Search by vendor name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  id="filter-method"
                  className="filter-select"
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                >
                  <option value="">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </section>

            {/* Table Section */}
            <section className="table-section">
              <div className="section-header">
                <h2 className="section-title">Invoices</h2>
                <div className="action-buttons">
                  <button className="btn btn-success" onClick={handleDownloadPDF}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Download PDF
                  </button>
                  <button className="btn btn-info" onClick={() => window.print()}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 5V3h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M5 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Print
                  </button>
                  <button className="btn btn-danger" onClick={handleClearAll}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4h10M6 4V3h4v1M5 4v8h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment Method</th>
                      <th>Payment To</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          <div className="empty-content">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                              <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                              <path d="M16 16h16M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <p>
                              {invoices.length === 0
                                ? "No invoices yet. Add your first invoice above!"
                                : "No invoices match your search."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className={`invoice-row${editingId === inv.id ? " editing" : ""}`}>
                          <td>{formatDate(inv.date)}</td>
                          <td>
                            <span className={methodBadgeClass(inv.paymentMethod)}>{inv.paymentMethod}</span>
                          </td>
                          <td className="payee-cell">{inv.paymentTo}</td>
                          <td className="amount-cell">{formatINR(inv.amount)}</td>
                          <td className="actions-cell">
                            <button className="btn-action btn-edit" onClick={() => handleEdit(inv)} title="Edit">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Edit
                            </button>
                            <button className="btn-action btn-delete" onClick={() => handleDelete(inv.id)} title="Delete">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 3.5h10M5 3.5V2.5h4v1M4 3.5v7h6v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3} className="total-label">Total</td>
                      <td className="total-amount">{formatINR(totalFiltered)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
