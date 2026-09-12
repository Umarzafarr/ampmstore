import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id?: string | null;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string | null;
  created_at?: string;
  categories?: { name: string } | null;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  phone_number?: string;
  shipping_address: string;
  total_amount: number;
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled";
  payment_method: "cod" | "online";
  payment_screenshot_url?: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string | null;
  link_url?: string;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

import initialProductsData from "@/data/products.json";

// Clean initial categories matching VapeMall
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "698d919a-273b-4a34-a27e-8a59bb3aefb7",
    name: "Pod Kits",
    description: "Refillable pod starter kits and smart compact systems"
  },
  {
    id: "e6ab9c69-50aa-4752-804c-4a804e3ff234",
    name: "Disposable Vapes",
    description: "High-puff rechargeable smart disposables"
  },
  {
    id: "cd3609cb-0b9e-4d88-b049-8093f1a250e3",
    name: "E-Liquids & Nic Salts",
    description: "Premium imported salt nicotine and freebase e-juices"
  },
  {
    id: "148d0bae-5694-433a-a42c-83b6451e55bd",
    name: "Coils & Cartridges",
    description: "Replacement mesh coils and empty cartridges"
  },
  {
    id: "cc492657-bbcb-4391-b8a9-70bbc05db619",
    name: "Mod Kits & Devices",
    description: "High-wattage box mods, dual battery devices, and advanced kits"
  },
  {
    id: "a06c0cdb-3abd-4a4b-9310-03ab0ffc35c2",
    name: "Tanks & Rebuildables",
    description: "Sub-ohm tanks, RDAs, RTAs, cotton, and specialty coils"
  },
  {
    id: "3d2d2d1c-c258-4098-84f8-3a9b2dfd04c3",
    name: "Accessories & Hardware",
    description: "High-drain batteries, fast chargers, lanyards, and tools"
  }
];

const INITIAL_PRODUCTS: Product[] = initialProductsData as Product[];
const INITIAL_BANNERS: Banner[] = [];
const INITIAL_ORDERS: Order[] = [];

// Local storage keys (versioned clean)
const KEY_PRODUCTS = "ampm_live_products_v2";
const KEY_CATEGORIES = "ampm_live_categories_v2";
const KEY_ORDERS = "ampm_live_orders_v2";
const KEY_BANNERS = "ampm_live_banners_v2";
const KEY_ADMIN_AUTH = "ampm_admin_authenticated";

// Clean up old placeholder v1 caches if present
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("ampm_products_v1");
    localStorage.removeItem("ampm_categories_v1");
    localStorage.removeItem("ampm_orders_v1");
    localStorage.removeItem("ampm_banners_v1");
  } catch {
    // ignore
  }
}

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn("Storage write error:", e);
  }
}

// ---------------- Authentication ----------------
export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(KEY_ADMIN_AUTH) === "true";
}

export function setAdminLoggedIn(status: boolean): void {
  if (status) {
    localStorage.setItem(KEY_ADMIN_AUTH, "true");
  } else {
    localStorage.removeItem(KEY_ADMIN_AUTH);
  }
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  const cleanUser = user.trim().toLowerCase();
  const cleanPass = pass.trim();
  return (
    (cleanUser === "admin" || cleanUser === "admin@ampm.com" || cleanUser === "admin@admin.com") &&
    cleanPass === "admin"
  );
}

// ---------------- Products ----------------
export async function getProducts(): Promise<Product[]> {
  try {
    const [r1, r2, r3] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }).range(0, 999),
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }).range(1000, 1999),
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }).range(2000, 2999)
    ]);
    const all = [
      ...(r1.data || []),
      ...(r2.data || []),
      ...(r3.data || [])
    ];
    if (all.length > 0) {
      return all as Product[];
    }
  } catch (e) {
    console.warn("DB getProducts fetch:", e);
  }
  return INITIAL_PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  // Instant in-memory lookup for fastest page transitions
  const foundLocal = INITIAL_PRODUCTS.find((p) => p.id === id);
  if (foundLocal) return foundLocal;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return data as Product;
  } catch {
    // fallback to local
  }
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function saveProduct(product: Partial<Product> & { name: string; price: number }): Promise<Product> {
  let savedProduct: Product | null = null;
  const categories = await getCategories();
  const catObj = categories.find((c) => c.id === product.category_id);

  // 1. Try writing directly to live database
  try {
    if (product.id) {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category_id: product.category_id,
          image_url: product.image_url,
        })
        .eq("id", product.id)
        .select("*, categories(name)")
        .maybeSingle();
      if (!error && data) savedProduct = data as Product;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          sku: product.sku || `AMP-${Date.now().toString().slice(-5)}`,
          description: product.description,
          price: product.price,
          stock: product.stock ?? 0,
          category_id: product.category_id,
          image_url: product.image_url,
        })
        .select("*, categories(name)")
        .maybeSingle();
      if (!error && data) savedProduct = data as Product;
    }
  } catch (err) {
    console.warn("DB saveProduct error:", err);
  }

  // 2. Update local state
  const products = loadLocal<Product[]>(KEY_PRODUCTS, INITIAL_PRODUCTS);
  if (!savedProduct) {
    if (product.id) {
      const idx = products.findIndex((p) => p.id === product.id);
      savedProduct = {
        ...products[idx],
        ...product,
        categories: catObj ? { name: catObj.name } : products[idx]?.categories,
      } as Product;
      if (idx !== -1) products[idx] = savedProduct;
      else products.unshift(savedProduct);
    } else {
      savedProduct = {
        ...product,
        id: `prod-${crypto.randomUUID()}`,
        sku: product.sku || `AMP-${Date.now().toString().slice(-5)}`,
        stock: product.stock ?? 0,
        categories: catObj ? { name: catObj.name } : null,
        created_at: new Date().toISOString(),
      } as Product;
      products.unshift(savedProduct);
    }
  } else {
    const idx = products.findIndex((p) => p.id === savedProduct!.id);
    if (idx !== -1) products[idx] = savedProduct;
    else products.unshift(savedProduct);
  }

  saveLocal(KEY_PRODUCTS, products);
  return savedProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await supabase.from("products").delete().eq("id", id);
  } catch (e) {
    console.warn("DB deleteProduct error:", e);
  }

  const products = loadLocal<Product[]>(KEY_PRODUCTS, INITIAL_PRODUCTS);
  saveLocal(KEY_PRODUCTS, products.filter((p) => p.id !== id));
}

// ---------------- Categories ----------------
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (!error && data) {
      saveLocal(KEY_CATEGORIES, data);
      return data as Category[];
    }
  } catch (e) {
    console.warn("DB getCategories error:", e);
  }
  return loadLocal<Category[]>(KEY_CATEGORIES, INITIAL_CATEGORIES);
}

export async function addCategory(name: string, description?: string): Promise<Category> {
  let created: Category | null = null;
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, description })
      .select()
      .maybeSingle();
    if (!error && data) created = data as Category;
  } catch (e) {
    console.warn("DB addCategory error:", e);
  }

  if (!created) {
    created = {
      id: `cat-${crypto.randomUUID()}`,
      name,
      description,
      created_at: new Date().toISOString(),
    };
  }

  const categories = loadLocal<Category[]>(KEY_CATEGORIES, INITIAL_CATEGORIES);
  categories.push(created);
  saveLocal(KEY_CATEGORIES, categories);
  return created;
}

export async function updateCategory(id: string, name: string, description?: string): Promise<Category | null> {
  let updated: Category | null = null;
  try {
    const { data, error } = await supabase
      .from("categories")
      .update({ name, description })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (!error && data) updated = data as Category;
  } catch (e) {
    console.warn("DB updateCategory error:", e);
  }

  const categories = loadLocal<Category[]>(KEY_CATEGORIES, INITIAL_CATEGORIES);
  const idx = categories.findIndex((c) => c.id === id);
  if (idx !== -1) {
    categories[idx] = updated || { ...categories[idx], name, description };
    saveLocal(KEY_CATEGORIES, categories);
    return categories[idx];
  }
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await supabase.from("categories").delete().eq("id", id);
  } catch (e) {
    console.warn("DB deleteCategory error:", e);
  }

  const categories = loadLocal<Category[]>(KEY_CATEGORIES, INITIAL_CATEGORIES);
  saveLocal(KEY_CATEGORIES, categories.filter((c) => c.id !== id));
}

// ---------------- Orders ----------------
export let lastDbError: string | null = null;
export let lastDbSyncTime: Date | null = null;

export async function getOrders(): Promise<Order[]> {
  const localOrders = loadLocal<Order[]>(KEY_ORDERS, INITIAL_ORDERS);
  try {
    let { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    // Fallback: if foreign key join has any issue, fetch orders directly
    if (error) {
      console.warn("Retrying orders fetch without join:", error);
      const plainRes = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!plainRes.error && plainRes.data) {
        data = plainRes.data.map((o) => ({ ...o, order_items: [] }));
        error = null;
      }
    }

    if (!error && data) {
      lastDbError = null;
      lastDbSyncTime = new Date();
      // Supabase database orders (authoritative)
      const orderMap = new Map<string, Order>();
      for (const o of data as Order[]) {
        orderMap.set(o.id, o);
      }
      // Only keep offline-created orders (ord- prefix) that haven't synced yet
      for (const loc of localOrders) {
        if (loc.id.startsWith("ord-") && !orderMap.has(loc.id)) {
          orderMap.set(loc.id, loc);
        }
      }
      const merged = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      saveLocal(KEY_ORDERS, merged);
      return merged;
    }
    if (error) {
      lastDbError = error.message || JSON.stringify(error);
      console.warn("DB getOrders error:", error);
    }
  } catch (e: any) {
    lastDbError = e?.message || String(e);
    console.warn("DB getOrders exception:", e);
  }
  return localOrders;
}

export async function addOrder(orderData: Omit<Order, "id" | "created_at">): Promise<Order> {
  let createdOrder: Order | null = null;
  let insertError: any = null;

  try {
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id || null,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        phone_number: orderData.phone_number || null,
        shipping_address: orderData.shipping_address,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_screenshot_url: orderData.payment_screenshot_url || null,
        status: orderData.status,
      })
      .select()
      .maybeSingle();

    if (!orderErr && order) {
      if (orderData.order_items && orderData.order_items.length > 0) {
        const isUUID = (val: any) =>
          typeof val === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const itemsPayload = orderData.order_items.map((it) => ({
          order_id: order.id,
          product_id: isUUID(it.product_id) ? it.product_id : null,
          product_name: it.product_name,
          quantity: it.quantity,
          price: it.price,
        }));

        try {
          const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
          if (itemsErr) {
            console.warn("Item insert failed, retrying with null product_id:", itemsErr);
            const fallbackPayload = itemsPayload.map((it) => ({ ...it, product_id: null }));
            await supabase.from("order_items").insert(fallbackPayload);
          }
        } catch (itemErr) {
          console.warn("Item insert exception:", itemErr);
        }
      }
      createdOrder = {
        ...order,
        order_items: orderData.order_items || [],
      } as Order;
    } else if (orderErr) {
      insertError = orderErr;
      console.error("Supabase order insert error:", orderErr);
    }
  } catch (e: any) {
    insertError = e;
    console.warn("DB addOrder error:", e);
  }

  if (!createdOrder) {
    createdOrder = {
      ...orderData,
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      order_items: orderData.order_items || [],
    };
    if (insertError) {
      (createdOrder as any)._syncError = insertError?.message || String(insertError);
    }
  }

  const orders = loadLocal<Order[]>(KEY_ORDERS, INITIAL_ORDERS);
  orders.unshift(createdOrder);
  saveLocal(KEY_ORDERS, orders);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ampm_orders_updated", { detail: createdOrder }));
  }

  return createdOrder;
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  try {
    await supabase.from("orders").update({ status }).eq("id", id);
  } catch (e) {
    console.warn("DB updateOrderStatus error:", e);
  }

  const orders = loadLocal<Order[]>(KEY_ORDERS, INITIAL_ORDERS);
  const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
  saveLocal(KEY_ORDERS, updated);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ampm_orders_updated"));
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await supabase.from("order_items").delete().eq("order_id", id);
    await supabase.from("orders").delete().eq("id", id);
  } catch (e) {
    console.warn("DB deleteOrder error:", e);
  }

  const orders = loadLocal<Order[]>(KEY_ORDERS, INITIAL_ORDERS);
  const updated = orders.filter((o) => o.id !== id);
  saveLocal(KEY_ORDERS, updated);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ampm_orders_updated"));
  }
}

// ---------------- Banners ----------------
export async function getBanners(): Promise<Banner[]> {
  try {
    const { data, error } = await supabase.from("banners").select("*").order("sort_order");
    if (!error && data) {
      saveLocal(KEY_BANNERS, data);
      return data as Banner[];
    }
  } catch (e) {
    console.warn("DB getBanners error:", e);
  }
  return loadLocal<Banner[]>(KEY_BANNERS, INITIAL_BANNERS);
}

export async function saveBanner(banner: Partial<Banner> & { title: string }): Promise<Banner> {
  let created: Banner | null = null;
  try {
    if (banner.id) {
      const { data, error } = await supabase
        .from("banners")
        .update({
          title: banner.title,
          subtitle: banner.subtitle,
          link_url: banner.link_url,
          image_url: banner.image_url,
          is_active: banner.is_active,
        })
        .eq("id", banner.id)
        .select()
        .maybeSingle();
      if (!error && data) created = data as Banner;
    } else {
      const { data, error } = await supabase
        .from("banners")
        .insert({
          title: banner.title,
          subtitle: banner.subtitle,
          link_url: banner.link_url,
          image_url: banner.image_url,
          is_active: banner.is_active ?? true,
          sort_order: banner.sort_order ?? 1,
        })
        .select()
        .maybeSingle();
      if (!error && data) created = data as Banner;
    }
  } catch (e) {
    console.warn("DB saveBanner error:", e);
  }

  const banners = loadLocal<Banner[]>(KEY_BANNERS, INITIAL_BANNERS);
  if (!created) {
    if (banner.id) {
      const idx = banners.findIndex((b) => b.id === banner.id);
      created = { ...banners[idx], ...banner } as Banner;
      if (idx !== -1) banners[idx] = created;
      else banners.push(created);
    } else {
      created = {
        ...banner,
        id: `bnr-${crypto.randomUUID().slice(0, 8)}`,
        is_active: banner.is_active ?? true,
        sort_order: banner.sort_order ?? banners.length + 1,
      } as Banner;
      banners.push(created);
    }
  } else {
    const idx = banners.findIndex((b) => b.id === created!.id);
    if (idx !== -1) banners[idx] = created;
    else banners.push(created);
  }

  saveLocal(KEY_BANNERS, banners);
  return created;
}

export async function deleteBanner(id: string): Promise<void> {
  try {
    await supabase.from("banners").delete().eq("id", id);
  } catch (e) {
    console.warn("DB deleteBanner error:", e);
  }

  const banners = loadLocal<Banner[]>(KEY_BANNERS, INITIAL_BANNERS);
  saveLocal(KEY_BANNERS, banners.filter((b) => b.id !== id));
}

export async function toggleBannerActive(id: string, isActive: boolean): Promise<void> {
  try {
    await supabase.from("banners").update({ is_active: isActive }).eq("id", id);
  } catch (e) {
    console.warn("DB toggleBannerActive error:", e);
  }

  const banners = loadLocal<Banner[]>(KEY_BANNERS, INITIAL_BANNERS);
  saveLocal(KEY_BANNERS, banners.map((b) => (b.id === id ? { ...b, is_active: isActive } : b)));
}
