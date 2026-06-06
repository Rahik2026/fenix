"use client";

import { useEffect, useState } from "react";
import SmartImage from "@/components/ui/SmartImage";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/ui/Toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeCategories, saveCategory, deleteCategory } from "@/lib/db";
import { genId } from "@/lib/utils";
import type { Category } from "@/types";

const empty = (): Category => ({
  id: genId("cat"),
  name: "",
  slug: "",
  description: "",
  image: "",
  enabled: true,
  order: 99,
});

export default function CategoriesPanel() {
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    if (isFirebaseConfigured) return subscribeCategories(setItems, true);
  }, []);

  const save = async (c: Category) => {
    if (!c.name.trim()) return toast("Category name required", "error");
    const slug = c.slug.trim() || c.name.toLowerCase().replace(/\s+/g, "-");
    await saveCategory({ ...c, slug });
    toast("Category saved", "success");
    setEditing(null);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="serif-title text-2xl">Categories</h2>
          <p className="text-muted text-sm">{items.length} categories — also used as banner cards.</p>
        </div>
        <button onClick={() => setEditing(empty())} className="btn">+ New category</button>
      </div>

      <div className="grid gap-2">
        {items.map((c) => (
          <div key={c.id} className="card p-3 flex items-center gap-3">
            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-[#eef5fb] shrink-0">
              <SmartImage src={c.image} alt={c.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.name}</p>
              <p className="text-xs text-muted truncate">/{c.slug}</p>
            </div>
            {!c.enabled && <span className="pill status-cancelled text-[10px]">Hidden</span>}
            <button onClick={() => setEditing(c)} className="btn-ghost text-sm py-1.5 px-3">Edit</button>
            <button onClick={() => { if (confirm("Delete category?")) deleteCategory(c.id); }} className="text-danger text-sm font-semibold">Delete</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[1100] bg-black/50 grid place-items-center p-3 overflow-auto">
          <div className="bg-white rounded-xl2 w-full max-w-lg p-6 grid gap-4">
            <h3 className="serif-title text-xl">{editing.name ? "Edit category" : "New category"}</h3>
            <div><label className="label">Name</label><input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><label className="label">Slug</label><input className="input" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto from name" /></div>
            <div><label className="label">Description</label><textarea className="input min-h-[60px]" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div><label className="label">Order</label><input className="input" type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} /></div>
            <ImageUploader bucket="banners" label="Card image (16:9)" aspect="aspect-video" value={editing.image} onChange={(url) => setEditing({ ...editing, image: url })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-auto" checked={editing.enabled} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} /> Visible</label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              <button onClick={() => save(editing)} className="btn">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
