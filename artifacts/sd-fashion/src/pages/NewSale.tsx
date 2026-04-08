import { useState } from "react";
import { Plus, Trash2, ShoppingCart, CheckCircle } from "lucide-react";

const PRODUCTS = [
  { name: "Slim Fit Jeans", price: 1800 },
  { name: "Floral Dress", price: 2500 },
  { name: "Polo Shirt", price: 950 },
  { name: "Bomber Jacket", price: 4200 },
  { name: "Linen Trousers", price: 1600 },
  { name: "Knit Sweater", price: 2100 },
  { name: "Cargo Pants", price: 1400 },
  { name: "Maxi Skirt", price: 1750 },
  { name: "Denim Jacket", price: 3200 },
  { name: "Sports Tee", price: 750 },
];

interface CartItem {
  name: string;
  price: number;
  qty: number;
}

function formatBDT(amount: number) {
  return `BDT ${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function NewSale() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [payment, setPayment] = useState<"Cash" | "Card" | "Mobile">("Cash");
  const [success, setSuccess] = useState(false);

  const addToCart = (product: { name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === product.name);
      if (existing) {
        return prev.map(i => i.name === product.name ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(i => i.name !== name));
  };

  const updateQty = (name: string, qty: number) => {
    if (qty <= 0) return removeFromCart(name);
    setCart(prev => prev.map(i => i.name === name ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSubmit = () => {
    if (cart.length === 0) return;
    setSuccess(true);
    setCart([]);
    setCustomer("");
    setTimeout(() => setSuccess(false), 3000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-full bg-[hsl(174,72%,94%)] dark:bg-[hsl(174,72%,20%)] flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-[hsl(174,72%,40%)]" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Sale Recorded!</h2>
        <p className="text-muted-foreground text-sm">The sale has been saved successfully.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product grid */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Select Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PRODUCTS.map(product => (
            <button
              key={product.name}
              onClick={() => addToCart(product)}
              data-testid={`button-add-${product.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group bg-card border border-card-border rounded-xl p-4 text-left hover:border-[hsl(174,72%,40%)] hover:shadow-md transition-all duration-150 active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-lg bg-[hsl(174,72%,94%)] dark:bg-[hsl(174,72%,20%)] flex items-center justify-center mb-3 group-hover:bg-[hsl(174,72%,40%)] transition-colors">
                <ShoppingCart className="w-4 h-4 text-[hsl(174,72%,40%)] group-hover:text-white transition-colors" />
              </div>
              <p className="text-sm font-semibold text-foreground leading-tight">{product.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatBDT(product.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cart</h2>
        <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
          <div className="space-y-2 mb-4">
            <label className="text-xs font-medium text-muted-foreground">Customer Name</label>
            <input
              type="text"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              placeholder="e.g. Rahul Ahmed"
              data-testid="input-customer"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] transition"
            />
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No items added</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.name} className="flex items-center gap-2 py-2 border-b border-border last:border-0" data-testid={`cart-item-${item.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBDT(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.name, item.qty - 1)}
                      className="w-6 h-6 rounded-md bg-muted hover:bg-muted-foreground/20 flex items-center justify-center text-sm font-bold text-foreground transition-colors"
                      data-testid={`button-decrease-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >−</button>
                    <span className="w-6 text-center text-xs font-semibold text-foreground">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.name, item.qty + 1)}
                      className="w-6 h-6 rounded-md bg-muted hover:bg-muted-foreground/20 flex items-center justify-center text-sm font-bold text-foreground transition-colors"
                      data-testid={`button-increase-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.name)}
                    data-testid={`button-remove-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Payment Method</label>
              <div className="flex gap-2">
                {(["Cash", "Card", "Mobile"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    data-testid={`button-payment-${m.toLowerCase()}`}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      payment === m
                        ? "bg-[hsl(174,72%,40%)] text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-base font-extrabold text-foreground" data-testid="text-cart-total">{formatBDT(total)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={cart.length === 0}
              data-testid="button-complete-sale"
              className="w-full py-2.5 rounded-xl bg-[hsl(174,72%,40%)] hover:bg-[hsl(174,72%,35%)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
