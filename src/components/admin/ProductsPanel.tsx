"use client";

import { useEffect, useState } from "react";
import SmartImage from "@/components/ui/SmartImage";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeProducts,
  saveProduct,
  deleteProduct,
  subscribeCategories,
} from "@/lib/db";
import { genId, formatCurrency } from "@/lib/utils";
import type { Product, Category } from "@/types";

const empty = (): Product => ({
  id: genId("prod"),
  name: "",
  categoryId: "",
  category: "",
  description: "",
  details: "",
  specifications: [],
  sizeOptions: ["S", "M", "L", "XL"],
  stock: 0,
  sku: "",
  originalPrice: 0,
  offerPrice: 0,
  mainImage: "",
  detailImages: [],
  featured: false,
  newArrival: false,
  enabled: true,
  createdAt: new Date().toISOString(),
});

export default function ProductsPanel() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const u1 = subscribeProducts(setProducts, true);
    const u2 = subscribeCategories(setCategories, true);
    return () => { u1(); u2(); };
  }, []);

  const save = async (p: Product) => {
    if (!p.name.trim()) return toast("Product name required", "error");
    const cat = categories.find((c) => c.id === p.categoryId);
    try {
      await saveProduct({ ...p, category: cat?.name || p.category });
      toast("Product saved", "success");
      setEditing(null);
    } catch (err: any) {
      toast(err?.message || "Save failed", "error");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    toast("Product deleted");
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="serif-title text-2xl">Products</h2>
          <p className="text-muted text-sm">{products.length} products</p>
        </div>
        <button onClick={() => setEditing(empty())} className="btn">+ New product</button>
      </div>

      <div className="grid gap-2">
        {products.map((p) => (
          <div key={p.id} className="card p-3 flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#eef5fb] shrink-0">
              <SmartImage src={p.mainImage} alt={p.name} fill sizes="56px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              <p className="text-xs text-muted">{p.category} · {formatCurrency(p.offerPrice)} · stock {p.stock}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!p.enabled && <span className="pill status-cancelled text-[10px]">Hidden</span>}
              {p.featured && <span className="pill-gold text-[10px]">Featured</span>}
              <button onClick={() => setEditing(p)} className="btn-ghost text-sm py-1.5 px-3">Edit</button>
              <button onClick={() => remove(p.id)} className="text-danger text-sm font-semibold">Delete</button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-muted text-sm">No products yet — run Initialize Database or add one.</p>
        )}
      </div>

      {editing && (
        <ProductModal
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<Product>(product);
  const set = (k: keyof Product, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[1100] bg-black/50 grid place-items-center p-3 overflow-auto">
      <div className="bg-white rounded-xl2 w-full max-w-2xl max-h-[92vh] overflow-auto scroll-thin p-5 md:p-6 grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="serif-title text-xl">{product.name ? "Edit product" : "New product"}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink text-2xl leading-none">×</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Select…</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="label">SKU</label>
            <input className="input" value={form.sku} onChange={(e) => set("sku", e.target.value)} />
          </div>
          <div>
            <label className="label">Original price</label>
            <input className="input" type="number" value={form.originalPrice} onChange={(e) => set("originalPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Offer price</label>
            <input className="input" type="number" value={form.offerPrice} onChange={(e) => set("offerPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Stock</label>
            <input className="input" type="number" value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Sizes (comma separated)</label>
            <input className="input" value={form.sizeOptions.join(", ")} onChange={(e) => set("sizeOptions", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <textarea className="input min-h-[70px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Details</label>
            <textarea className="input min-h-[70px]" value={form.details} onChange={(e) => set("details", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Specifications (one per line)</label>
            <textarea className="input min-h-[70px]" value={form.specifications.join("\n")} onChange={(e) => set("specifications", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
          </div>
          <div className="sm:col-span-2">
            <ImageUploader bucket="products" label="Main image (1:1)" value={form.mainImage} onChange={(url) => set("mainImage", url)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Detail image URLs (one per line)</label>
            <textarea className="input min-h-[70px]" value={form.detailImages.join("\n")} onChange={(e) => set("detailImages", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />
            <div className="mt-2">
              <ImageUploader bucket="products" label="Add a detail image" value="" onChange={(url) => set("detailImages", [...form.detailImages, url])} />
            </div>
          </div>
          <div className="flex gap-4 sm:col-span-2 flex-wrap">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-auto" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-auto" checked={form.newArrival} onChange={(e) => set("newArrival", e.target.checked)} /> New arrival</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-auto" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} /> Visible</label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-line">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => onSave(form)} className="btn">Save product</button>
        </div>
      </div>
    </div>
  );
}
