import { useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Package } from "lucide-react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProductForm {
  name: string;
  category: string;
  size: string;
  price: string;
  stock: string;
}

const SIZES = ["-", "XS", "S", "M", "L", "XL", "XXL", "Free"];
const CATEGORIES = ["General", "Shirt", "Pant", "Dress", "Saree", "Kameez", "Kurta", "Jacket", "Shoes", "Accessories"];

const DEFAULT_FORM: ProductForm = { name: "", category: "General", size: "-", price: "", stock: "" };

function formatBDT(amount: number) {
  return `BDT ${Number(amount).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function stockBadge(stock: number) {
  if (stock === 0) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(0,84%,94%)] dark:bg-[hsl(0,84%,18%)] text-[hsl(0,84%,40%)] dark:text-[hsl(0,84%,70%)]">Out of Stock</span>;
  if (stock <= 5) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(38,92%,92%)] dark:bg-[hsl(38,92%,18%)] text-[hsl(38,92%,35%)] dark:text-[hsl(38,92%,65%)]">Low: {stock}</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[hsl(142,76%,90%)] dark:bg-[hsl(142,76%,18%)] text-[hsl(142,76%,28%)] dark:text-[hsl(142,76%,65%)]">{stock} pcs</span>;
}

function ProductFormModal({
  title,
  form,
  onChange,
  onSave,
  onClose,
  saving,
}: {
  title: string;
  form: ProductForm;
  onChange: (f: ProductForm) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-card border border-card-border rounded-2xl shadow-xl w-full max-w-md p-6 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. Men's Cotton Shirt"
              data-testid="input-product-name"
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => onChange({ ...form, category: e.target.value })}
                data-testid="select-product-category"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] transition"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Size</label>
              <select
                value={form.size}
                onChange={e => onChange({ ...form, size: e.target.value })}
                data-testid="select-product-size"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] transition"
              >
                {SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Price (BDT) *</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={e => onChange({ ...form, price: e.target.value })}
                placeholder="0"
                data-testid="input-product-price"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Stock (pcs) *</label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={e => onChange({ ...form, stock: e.target.value })}
                placeholder="0"
                data-testid="input-product-stock"
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] transition"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSave}
            disabled={saving || !form.name.trim()}
            data-testid="button-save-product"
            className="flex-1 py-2.5 rounded-xl bg-[hsl(174,72%,40%)] hover:bg-[hsl(174,72%,34%)] disabled:opacity-60 text-white font-semibold text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(DEFAULT_FORM);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
  }

  function openAdd() {
    setForm(DEFAULT_FORM);
    setEditId(null);
    setShowAdd(true);
  }

  function openEdit(p: { id: number; name: string; category: string; size: string; price: number; stock: number }) {
    setForm({ name: p.name, category: p.category, size: p.size, price: String(p.price), stock: String(p.stock) });
    setEditId(p.id);
    setShowAdd(true);
  }

  function handleSave() {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      size: form.size,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
    };

    if (editId !== null) {
      updateProduct.mutate({ id: editId, data: payload }, {
        onSuccess: () => { setShowAdd(false); invalidate(); },
      });
    } else {
      createProduct.mutate({ data: payload }, {
        onSuccess: () => { setShowAdd(false); invalidate(); },
      });
    }
  }

  function handleDelete(id: number) {
    setDeletingId(id);
    deleteProduct.mutate({ id }, {
      onSuccess: () => { setDeletingId(null); invalidate(); },
      onError: () => setDeletingId(null),
    });
  }

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <>
      {showAdd && (
        <ProductFormModal
          title={editId !== null ? "Edit Product" : "Add New Product"}
          form={form}
          onChange={setForm}
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
          saving={saving}
        />
      )}

      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-wrap gap-3">
            <h2 className="text-sm font-bold text-foreground">Product Inventory</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  data-testid="input-search-products"
                  className="pl-9 pr-4 py-1.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(174,72%,40%)] w-48 transition"
                />
              </div>
              <button
                onClick={openAdd}
                data-testid="button-add-product"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[hsl(174,72%,40%)] hover:bg-[hsl(174,72%,34%)] text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />Add Product
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Size</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Price</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground">Stock</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Package className="w-10 h-10 opacity-30" />
                      <p className="text-sm">{search ? "No products match your search" : "No products yet. Add your first product!"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => (
                  <tr key={product.id} className="border-b border-border/60 hover:bg-muted/30 transition-colors" data-testid={`row-product-${product.id}`}>
                    <td className="px-5 py-3 text-sm font-medium text-muted-foreground">#{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">{product.name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{product.category}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{product.size}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-foreground">{formatBDT(product.price)}</td>
                    <td className="px-5 py-3">{stockBadge(product.stock)}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                          className="p-2 rounded-lg bg-[hsl(221,83%,53%)] hover:bg-[hsl(221,83%,45%)] text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          data-testid={`button-delete-${product.id}`}
                          className="p-2 rounded-lg bg-[hsl(0,84%,55%)] hover:bg-[hsl(0,84%,48%)] disabled:opacity-50 text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{filtered.length} product{filtered.length !== 1 ? "s" : ""} total</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
