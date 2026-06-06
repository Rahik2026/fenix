import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { requireDb } from "@/lib/firebase";
import type {
  Product,
  Category,
  Coupon,
  Order,
  SiteSettings,
  PaymentRecord,
  PaymentInfo,
  OrderStatus,
} from "@/types";
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_SETTINGS,
  SEED_ORDERS,
} from "@/lib/seed";
import { getAdminEmails } from "@/lib/utils";

export const COLLECTIONS = [
  "products",
  "orders",
  "users",
  "payments",
  "settings",
  "categories",
  "coupons",
  "admin",
] as const;

const SETTINGS_DOC = "site";

/* ----------------------------- Products ----------------------------- */
export async function fetchProducts(includeDisabled = false): Promise<Product[]> {
  const db = requireDb();
  const snap = await getDocs(collection(db, "products"));
  const list = snap.docs.map((d) => d.data() as Product);
  return includeDisabled ? list : list.filter((p) => p.enabled !== false);
}

export function subscribeProducts(
  cb: (items: Product[]) => void,
  includeDisabled = false
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(collection(db, "products"), (snap) => {
    const list = snap.docs.map((d) => d.data() as Product);
    cb(includeDisabled ? list : list.filter((p) => p.enabled !== false));
  });
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? (snap.data() as Product) : null;
}

export async function saveProduct(product: Product): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, "products", product.id), product, { merge: true });
}

export async function deleteProduct(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, "products", id));
}

/* ----------------------------- Categories ----------------------------- */
export function subscribeCategories(
  cb: (items: Category[]) => void,
  includeDisabled = false
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(collection(db, "categories"), (snap) => {
    const list = snap.docs
      .map((d) => d.data() as Category)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    cb(includeDisabled ? list : list.filter((c) => c.enabled !== false));
  });
}

export async function fetchCategories(includeDisabled = false): Promise<Category[]> {
  const db = requireDb();
  const snap = await getDocs(collection(db, "categories"));
  const list = snap.docs
    .map((d) => d.data() as Category)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return includeDisabled ? list : list.filter((c) => c.enabled !== false);
}

export async function saveCategory(category: Category): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, "categories", category.id), category, { merge: true });
}

export async function deleteCategory(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, "categories", id));
}

/* ----------------------------- Coupons ----------------------------- */
export function subscribeCoupons(
  cb: (items: Coupon[]) => void,
  includeDisabled = false
): Unsubscribe {
  const db = requireDb();
  return onSnapshot(collection(db, "coupons"), (snap) => {
    const list = snap.docs.map((d) => d.data() as Coupon);
    cb(includeDisabled ? list : list.filter((c) => c.enabled !== false));
  });
}

export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const db = requireDb();
  const q = query(
    collection(db, "coupons"),
    where("code", "==", code.toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const c = snap.docs[0].data() as Coupon;
  return c.enabled ? c : null;
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, "coupons", coupon.id), coupon, { merge: true });
}

export async function deleteCoupon(id: string): Promise<void> {
  const db = requireDb();
  await deleteDoc(doc(db, "coupons", id));
}

/* ----------------------------- Settings (CMS) ----------------------------- */
export function subscribeSettings(cb: (s: SiteSettings) => void): Unsubscribe {
  const db = requireDb();
  return onSnapshot(doc(db, "settings", SETTINGS_DOC), (snap) => {
    if (snap.exists()) cb(snap.data() as SiteSettings);
    else cb(SEED_SETTINGS);
  });
}

export async function fetchSettings(): Promise<SiteSettings> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "settings", SETTINGS_DOC));
  return snap.exists() ? (snap.data() as SiteSettings) : SEED_SETTINGS;
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, "settings", SETTINGS_DOC), settings, { merge: true });
}

/* ----------------------------- Orders ----------------------------- */
export async function createOrder(order: Order): Promise<void> {
  const db = requireDb();
  await setDoc(doc(db, "orders", order.id), order);
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "orders", id));
  return snap.exists() ? (snap.data() as Order) : null;
}

export function subscribeOrders(cb: (items: Order[]) => void): Unsubscribe {
  const db = requireDb();
  return onSnapshot(collection(db, "orders"), (snap) => {
    const list = snap.docs
      .map((d) => d.data() as Order)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    cb(list);
  });
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const db = requireDb();
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Order)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, "orders", id), patch as Record<string, unknown>);
}

export async function submitPayment(
  orderId: string,
  payment: PaymentInfo
): Promise<void> {
  const db = requireDb();
  const record: PaymentRecord = {
    id: `pay-${orderId}`,
    orderId,
    transactionId: payment.transactionId,
    senderNumber: payment.senderNumber,
    amount: payment.amount,
    method: "bKash",
    verified: false,
    createdAt: payment.submittedAt,
  };
  const batch = writeBatch(db);
  batch.update(doc(db, "orders", orderId), {
    payment,
    status: "Payment Submitted" as OrderStatus,
  });
  batch.set(doc(db, "payments", record.id), record);
  await batch.commit();
}

export async function setOrderStatus(
  orderId: string,
  status: OrderStatus,
  adminNotes?: string
): Promise<void> {
  const db = requireDb();
  const batch = writeBatch(db);
  const patch: Partial<Order> = { status };
  if (typeof adminNotes === "string") patch.adminNotes = adminNotes;
  batch.update(doc(db, "orders", orderId), patch as Record<string, unknown>);
  if (status === "Verified") {
    batch.set(
      doc(db, "payments", `pay-${orderId}`),
      { verified: true },
      { merge: true }
    );
  }
  await batch.commit();
}

export function subscribePayments(cb: (items: PaymentRecord[]) => void): Unsubscribe {
  const db = requireDb();
  return onSnapshot(collection(db, "payments"), (snap) => {
    cb(snap.docs.map((d) => d.data() as PaymentRecord));
  });
}

/* ----------------------------- Init / Reset ----------------------------- */
export async function initializeDatabase(): Promise<string[]> {
  const db = requireDb();
  const log: string[] = [];

  // Settings
  const settingsSnap = await getDoc(doc(db, "settings", SETTINGS_DOC));
  if (!settingsSnap.exists()) {
    await saveSettings(SEED_SETTINGS);
    log.push("settings: seeded site config");
  } else log.push("settings: already exists, skipped");

  // Categories
  const catSnap = await getDocs(collection(db, "categories"));
  if (catSnap.empty) {
    const batch = writeBatch(db);
    SEED_CATEGORIES.forEach((c) => batch.set(doc(db, "categories", c.id), c));
    await batch.commit();
    log.push(`categories: seeded ${SEED_CATEGORIES.length} items`);
  } else log.push(`categories: ${catSnap.size} existing, skipped`);

  // Products
  const prodSnap = await getDocs(collection(db, "products"));
  if (prodSnap.empty) {
    const batch = writeBatch(db);
    SEED_PRODUCTS.forEach((p) => batch.set(doc(db, "products", p.id), p));
    await batch.commit();
    log.push(`products: seeded ${SEED_PRODUCTS.length} items`);
  } else log.push(`products: ${prodSnap.size} existing, skipped`);

  // Coupons
  const coupSnap = await getDocs(collection(db, "coupons"));
  if (coupSnap.empty) {
    const batch = writeBatch(db);
    SEED_COUPONS.forEach((c) => batch.set(doc(db, "coupons", c.id), c));
    await batch.commit();
    log.push(`coupons: seeded ${SEED_COUPONS.length} items`);
  } else log.push(`coupons: ${coupSnap.size} existing, skipped`);

  // Orders
  const orderSnap = await getDocs(collection(db, "orders"));
  if (orderSnap.empty && SEED_ORDERS.length) {
    const batch = writeBatch(db);
    SEED_ORDERS.forEach((o) => batch.set(doc(db, "orders", o.id), o));
    await batch.commit();
    log.push(`orders: seeded ${SEED_ORDERS.length} items`);
  } else log.push(`orders: ${orderSnap.size} existing, skipped`);

  // Admin registry
  const adminEmails = getAdminEmails();
  const batch = writeBatch(db);
  adminEmails.forEach((email, i) => {
    batch.set(
      doc(db, "admin", `admin-${i + 1}`),
      { id: `admin-${i + 1}`, email, role: i === 0 ? "Owner" : "Manager" },
      { merge: true }
    );
  });
  await batch.commit();
  log.push(`admin: registered ${adminEmails.length} email(s)`);

  // payments + users collections are created on first write (Firestore is schemaless)
  log.push("payments / users: created on first document write");

  return log;
}

export async function resetDatabase(): Promise<string[]> {
  const db = requireDb();
  const log: string[] = [];
  for (const col of COLLECTIONS) {
    const snap = await getDocs(collection(db, col));
    if (snap.empty) {
      log.push(`${col}: empty`);
      continue;
    }
    // batches limited to 500 ops
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 450) {
      const batch = writeBatch(db);
      docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    log.push(`${col}: deleted ${docs.length} docs`);
  }
  return log;
}
