import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Receipt } from "lucide-react";
import { getAllSales, Sale } from "@/lib/salesData";

function formatBDT(amount: number) {
  return `BDT ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function paymentBadgeClass(method: string) {
  switch (method) {
    case "Cash": return "bg-[hsl(174,72%,94%)] text-[hsl(174,72%,30%)] dark:bg-[hsl(174,72%,20%)] dark:text-[hsl(174,72%,70%)]";
    case "Card": return "bg-[hsl(221,83%,94%)] text-[hsl(221,83%,40%)] dark:bg-[hsl(221,83%,20%)] dark:text-[hsl(221,83%,70%)]";
    case "Mobile": return "bg-[hsl(262,80%,94%)] text-[hsl(262,80%,40%)] dark:bg-[hsl(262,80%,20%)] dark:text-[hsl(262,80%,70%)]";
    default: return "bg-muted text-muted-foreground";
  }
}

function SaleRow({ sale }: { sale: Sale }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => setExpanded(e => !e)}
        data-testid={`row-sale-${sale.id}`}
      >
        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{sale.id}</td>
        <td className="px-4 py-3 text-sm text-foreground">{sale.date}</td>
        <td className="px-4 py-3 text-sm text-foreground">{sale.customer}</td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadgeClass(sale.paymentMethod)}`}>
            {sale.paymentMethod}
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-bold text-foreground text-right">{formatBDT(sale.total)}</td>
        <td className="px-4 py-3 text-right">
          <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/30">
          <td colSpan={6} className="px-6 py-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Items</p>
              {sale.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-foreground py-0.5">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-semibold">{formatBDT(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function SalesHistory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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

  const grandTotal = filtered.reduce((s, sale) => s + sale.total, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground">
            {filtered.length} records &nbsp;·&nbsp; {formatBDT(grandTotal)} total
          </h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by ID, customer, date..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            data-testid="input-search"
            className="pl-9 pr-4 py-2 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] w-full sm:w-72 transition"
          />
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Receipt className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No sales found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sale ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginated.map(sale => (
                  <SaleRow key={sale.id} sale={sale} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="button-prev-page"
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              data-testid="button-next-page"
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
