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

// Zero placeholder data - completely clean initial states
const INITIAL_CATEGORIES: Category[] = [];
const INITIAL_PRODUCTS: Product[] = [];
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
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      saveLocal(KEY_PRODUCTS, data);
      return data as Product[];
    }
  } catch (e) {
    console.warn("DB getProducts fetch:", e);
  }
  return loadLocal<Product[]>(KEY_PRODUCTS, INITIAL_PRODUCTS);
}

export async function getProductById(id: string): Promise<Product | null> {
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
export async function getOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      saveLocal(KEY_ORDERS, data);
      return data as Order[];
    }
  } catch (e) {
    console.warn("DB getOrders error:", e);
  }
  return loadLocal<Order[]>(KEY_ORDERS, INITIAL_ORDERS);
}

export async function addOrder(orderData: Omit<Order, "id" | "created_at">): Promise<Order> {
  let createdOrder: Order | null = null;

  try {
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        phone_number: orderData.phone_number,
        shipping_address: orderData.shipping_address,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_screenshot_url: orderData.payment_screenshot_url,
        status: orderData.status,
      })
      .select()
      .maybeSingle();

    if (!orderErr && order) {
      if (orderData.order_items && orderData.order_items.length > 0) {
        const itemsPayload = orderData.order_items.map((it) => ({
          order_id: order.id,
          product_id: it.product_id || null,
          product_name: it.product_name,
          quantity: it.quantity,
          price: it.price,
        }));
        await supabase.from("order_items").insert(itemsPayload);
      }
      createdOrder = {
        ...order,
        order_items: orderData.order_items,
      };
    }
  } catch (e) {
    console.warn("DB addOrder error:", e);
  }

  if (!createdOrder) {
    createdOrder = {
      ...orderData,
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
    };
  }

  const orders = loadLocal<Order[]>(KEY_ORDERS, INITIAL_ORDERS);
  orders.unshift(createdOrder);
  saveLocal(KEY_ORDERS, orders);
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
