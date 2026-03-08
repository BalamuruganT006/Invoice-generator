"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function InvoicePage() {
  useEffect(() => {
    // Initialize the app after component mounts
    if (typeof window !== "undefined") {
      // Load invoices from localStorage when page loads
      const event = new Event("appReady");
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="lazyOnload"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
        strategy="lazyOnload"
      />
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
                  <span className="stat-value" id="stat-count">0</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Amount</span>
                  <span className="stat-value" id="stat-total">₹0.00</span>
                </div>
              </div>
            </div>
          </header>

          <main className="main-content">
            {/* Form Section */}
            <section className="form-section">
              <div className="section-header">
                <h2 className="section-title" id="form-title">Add New Invoice</h2>
              </div>
              <form id="invoice-form" className="invoice-form">
                <input type="hidden" id="edit-id" value="" />
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="date" className="form-label">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="paymentMethod" className="form-label">Payment Method</label>
                    <select id="paymentMethod" name="paymentMethod" className="form-input" required>
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
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" id="submit-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Add Invoice
                  </button>
                  <button type="button" className="btn btn-secondary" id="cancel-edit-btn" style={{ display: "none" }}>
                    Cancel
                  </button>
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
                  />
                </div>
                <select id="filter-method" className="filter-select">
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
                  <button className="btn btn-success" id="download-pdf-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Download PDF
                  </button>
                  <button className="btn btn-info" id="print-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 5V3h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M5 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Print
                  </button>
                  <button className="btn btn-danger" id="clear-all-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4h10M6 4V3h4v1M5 4v8h6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Clear All
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="invoice-table" id="invoice-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment Method</th>
                      <th>Payment To</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="invoice-tbody">
                    <tr id="empty-row">
                      <td colSpan={5} className="empty-state">
                        <div className="empty-content">
                          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
                            <path d="M16 16h16M16 22h16M16 28h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <p>No invoices yet. Add your first invoice above!</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={3} className="total-label">Total</td>
                      <td className="total-amount" id="table-total">₹0.00</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </main>
        </div>

        {/* Inline Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
// ============================================================
// STORAGE MODULE
// ============================================================
const Storage = {
  KEY: 'invoice_app_data',
  
  saveInvoices(invoices) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(invoices));
    } catch (e) {
      console.error('Failed to save invoices:', e);
    }
  },
  
  loadInvoices() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load invoices:', e);
      return [];
    }
  },
  
  clearAllInvoices() {
    localStorage.removeItem(this.KEY);
  }
};

// ============================================================
// PDF GENERATOR MODULE
// ============================================================
const PDFGenerator = {
  generatePDF(invoices) {
    const jsPDFLib = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (typeof jsPDFLib === 'undefined') {
      alert('PDF library not loaded. Please wait a moment and try again.');
      return;
    }
    
    const doc = new jsPDFLib();
    
    // Title
    doc.setFontSize(22);
    doc.setTextColor(102, 51, 153);
    doc.text('Invoice Report', 14, 22);
    
    // Subtitle / date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const now = new Date();
    doc.text('Generated: ' + now.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }), 14, 30);
    
    // Divider line
    doc.setDrawColor(102, 51, 153);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 196, 34);
    
    // Table
    const formatINR = (amount) => '\u20B9' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    const tableData = invoices.map(inv => [
      inv.date,
      inv.paymentMethod,
      inv.paymentTo,
      formatINR(inv.amount)
    ]);
    
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    
    doc.autoTable({
      startY: 40,
      head: [['Date', 'Payment Method', 'Payment To', 'Amount (INR)']],
      body: tableData,
      foot: [['', '', 'Total', formatINR(total)]],
      headStyles: {
        fillColor: [102, 51, 153],
        textColor: 255,
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 235, 248],
        textColor: [50, 50, 50],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 245, 255]
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      columnStyles: {
        3: { halign: 'right' }
      }
    });
    
    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Page ' + i + ' of ' + pageCount,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Download
    const dateStr = now.toISOString().split('T')[0];
    doc.save('invoices_' + dateStr + '.pdf');
  }
};

// ============================================================
// MAIN APP
// ============================================================
const App = {
  invoices: [],
  editingId: null,
  
  init() {
    this.invoices = Storage.loadInvoices();
    this.bindEvents();
    this.renderTable();
    this.updateStats();
  },
  
  bindEvents() {
    // Form submit
    document.getElementById('invoice-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });
    
    // Cancel edit
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
      this.cancelEdit();
    });
    
    // Download PDF
    document.getElementById('download-pdf-btn').addEventListener('click', () => {
      if (this.invoices.length === 0) {
        alert('No invoices to download.');
        return;
      }
      PDFGenerator.generatePDF(this.invoices);
    });
    
    // Print
    document.getElementById('print-btn').addEventListener('click', () => {
      window.print();
    });
    
    // Clear All
    document.getElementById('clear-all-btn').addEventListener('click', () => {
      if (this.invoices.length === 0) {
        alert('No invoices to clear.');
        return;
      }
      if (confirm('Are you sure you want to delete ALL invoices? This cannot be undone.')) {
        this.invoices = [];
        Storage.clearAllInvoices();
        this.renderTable();
        this.updateStats();
      }
    });
    
    // Search
    document.getElementById('search-input').addEventListener('input', () => {
      this.renderTable();
    });
    
    // Filter
    document.getElementById('filter-method').addEventListener('change', () => {
      this.renderTable();
    });
  },
  
  handleFormSubmit() {
    const date = document.getElementById('date').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentTo = document.getElementById('paymentTo').value.trim();
    const amount = document.getElementById('amount').value;
    
    if (!date || !paymentMethod || !paymentTo || !amount) {
      alert('Please fill in all fields.');
      return;
    }
    
    if (this.editingId !== null) {
      // Update existing
      const idx = this.invoices.findIndex(inv => inv.id === this.editingId);
      if (idx !== -1) {
        this.invoices[idx] = { ...this.invoices[idx], date, paymentMethod, paymentTo, amount: parseFloat(amount) };
      }
      this.cancelEdit();
    } else {
      // Add new
      const invoice = {
        id: Date.now() + Math.random(),
        date,
        paymentMethod,
        paymentTo,
        amount: parseFloat(amount)
      };
      this.invoices.push(invoice);
    }
    
    Storage.saveInvoices(this.invoices);
    this.renderTable();
    this.updateStats();
    document.getElementById('invoice-form').reset();
  },
  
  editInvoice(id) {
    const invoice = this.invoices.find(inv => inv.id === id);
    if (!invoice) return;
    
    this.editingId = id;
    document.getElementById('date').value = invoice.date;
    document.getElementById('paymentMethod').value = invoice.paymentMethod;
    document.getElementById('paymentTo').value = invoice.paymentTo;
    document.getElementById('amount').value = invoice.amount;
    
    document.getElementById('form-title').textContent = 'Edit Invoice';
    document.getElementById('submit-btn').innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 10l4 4L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Update Invoice';
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
    
    // Scroll to form
    document.getElementById('invoice-form').scrollIntoView({ behavior: 'smooth' });
  },
  
  cancelEdit() {
    this.editingId = null;
    document.getElementById('invoice-form').reset();
    document.getElementById('form-title').textContent = 'Add New Invoice';
    document.getElementById('submit-btn').innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> Add Invoice';
    document.getElementById('cancel-edit-btn').style.display = 'none';
  },
  
  deleteInvoice(id) {
    if (confirm('Delete this invoice?')) {
      this.invoices = this.invoices.filter(inv => inv.id !== id);
      Storage.saveInvoices(this.invoices);
      this.renderTable();
      this.updateStats();
    }
  },
  
  getFilteredInvoices() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const method = document.getElementById('filter-method').value;
    
    return this.invoices.filter(inv => {
      const matchSearch = !search || inv.paymentTo.toLowerCase().includes(search);
      const matchMethod = !method || inv.paymentMethod === method;
      return matchSearch && matchMethod;
    });
  },
  
  renderTable() {
    const tbody = document.getElementById('invoice-tbody');
    const filtered = this.getFilteredInvoices();
    
    if (filtered.length === 0) {
      const msg = this.invoices.length === 0 
        ? 'No invoices yet. Add your first invoice above!'
        : 'No invoices match your search.';
      tbody.innerHTML = \`
        <tr id="empty-row">
          <td colspan="5" class="empty-state">
            <div class="empty-content">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" stroke-width="2"/>
                <path d="M16 16h16M16 22h16M16 28h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p>\${msg}</p>
            </div>
          </td>
        </tr>
      \`;
    } else {
      tbody.innerHTML = filtered.map((inv, index) => \`
        <tr class="invoice-row \${this.editingId === inv.id ? 'editing' : ''}">
          <td>\${this.formatDate(inv.date)}</td>
          <td><span class="method-badge method-\${inv.paymentMethod.toLowerCase().replace(' ', '-')}">\${inv.paymentMethod}</span></td>
          <td class="payee-cell">\${this.escapeHtml(inv.paymentTo)}</td>
          <td class="amount-cell">&#x20B9;\${parseFloat(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="actions-cell">
            <button class="btn-action btn-edit" onclick="App.editInvoice(\${inv.id})" title="Edit">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Edit
            </button>
            <button class="btn-action btn-delete" onclick="App.deleteInvoice(\${inv.id})" title="Delete">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M5 3.5V2.5h4v1M4 3.5v7h6v-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete
            </button>
          </td>
        </tr>
      \`).join('');
    }
    
    // Update table total (filtered)
    const filteredTotal = filtered.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    document.getElementById('table-total').textContent = '\u20B9' + filteredTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  
  updateStats() {
    const count = this.invoices.length;
    const total = this.invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    document.getElementById('stat-count').textContent = count;
    document.getElementById('stat-total').textContent = '\u20B9' + total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  
  formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return month + '/' + day + '/' + year;
  },
  
  escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
            `,
          }}
        />
      </div>
    </>
  );
}
