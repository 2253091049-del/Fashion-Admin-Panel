import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { getAllSales, Sale } from "@/lib/salesData";

function formatBDT(amount: number) {
  return `BDT ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function SaleDetailModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const total = sale.total;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-card border border-card-border rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">{sale.id}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{sale.date} · {sale.paymentMethod}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            data-testid="button-close-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 mb-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Customer</span>
            <span className="font-medium text-foreground">{sale.customer}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <div className="grid grid-cols-[1fr_48px_80px_80px] gap-2 text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>
          {sale.items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_48px_80px_80px] gap-2 py-1.5 border-b border-border/50 last:border-0">
              <span className="text-sm text-foreground truncate">{item.name}</span>
              <span className="text-sm text-center text-foreground">{item.qty}</span>
              <span className="text-sm text-right text-muted-foreground">{formatBDT(item.price)}</span>
              <span className="text-sm text-right font-semibold text-foreground">{formatBDT(item.qty * item.price)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="font-bold text-foreground">Total</span>
          <span className="font-extrabold text-foreground">{formatBDT(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function SalesHistory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Sale | null>(null);
  const PER_PAGE = 20;

  const allSales = useMemo(() => getAllSales().slice().reverse(), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return allSales;
    return allSales.filter(
      s =>
        s.id.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.date.includes(q) ||
        s.paymentMethod.toLowerCase().includes(q)
    );
  }, [search, allSales]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      {viewing && <SaleDetailModal sale={viewing} onClose={() => setViewing(null)} />}

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Sales History</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                data-testid="input-search"
                className="pl-9 pr-4 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] w-52 transition"
              />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Total</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Paid</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Due</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                <th className="px-5 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">
                    No sales found
                  </td>
                </tr>
              ) : (
                paginated.map((sale, idx) => {
                  const num = (page - 1) * PER_PAGE + idx + 1;
                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                      data-testid={`row-sale-${sale.id}`}
                    >
                      <td className="px-5 py-3 text-sm font-medium text-muted-foreground">#{num}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{sale.customer}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-foreground">{formatBDT(sale.total)}</td>
                      <td className="px-5 py-3 text-sm text-foreground">{formatDate(sale.date)}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">—</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{formatDate(sale.date)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setViewing(sale)}
                          data-testid={`button-view-${sale.id}`}
                          className="px-4 py-1.5 rounded-lg bg-[hsl(221,83%,53%)] hover:bg-[hsl(221,83%,45%)] text-white text-xs font-semibold transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="button-next-page"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-foreground"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
