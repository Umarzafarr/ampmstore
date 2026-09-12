import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2, Pencil, Plus, Upload, Image, Shield, DollarSign,
  Package, ShoppingBag, Eye, LogOut, ArrowLeft, Search, CheckCircle2,
  Clock, AlertTriangle, ExternalLink, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Product, Category, Order, Banner,
  getProducts, saveProduct, deleteProduct as removeProduct,
  getCategories, addCategory as insertCategory, updateCategory as modifyCategory, deleteCategory as removeCategory,
  getOrders, updateOrderStatus as changeOrderStatus,
  getBanners, saveBanner as updateBanner, deleteBanner as removeBanner, toggleBannerActive,
  isAdminLoggedIn, setAdminLoggedIn, verifyAdminCredentials
} from "@/lib/store-data";
import { supabase } from "@/integrations/supabase/client";

function OrderCard({
  order,
  updateOrderStatus,
  showRestore,
}: {
  order: Order;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  showRestore?: boolean;
}) {
  const [screenshotOpen, setScreenshotOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border/80 bg-card/70 backdrop-blur-md p-5 space-y-3 glow-card">
      <div className="flex flex-wrap justify-between items-start gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-foreground text-base">#{order.id.slice(0, 8)}</span>
            <Badge variant="outline" className="border-border text-xs font-semibold">
              {order.payment_method === "online" ? "Online Transfer" : "Cash on Delivery"}
            </Badge>
            <Badge
              className={
                order.status === "completed"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : order.status === "shipped"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : order.status === "confirmed"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : order.status === "cancelled"
                  ? "bg-destructive/20 text-destructive border-destructive/30"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
              }
            >
              {order.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground mt-1">
            {order.customer_name} • <span className="text-muted-foreground">{order.customer_email}</span> • <span className="text-primary">{order.phone_number || "No phone"}</span>
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(order.created_at).toLocaleString()}
        </span>
      </div>

      <div className="text-xs text-muted-foreground bg-secondary/30 p-2.5 rounded-lg border border-border/40">
        <span className="font-semibold text-foreground">Delivery Address: </span>
        {order.shipping_address}
      </div>

      {order.payment_screenshot_url && (
        <div className="pt-1">
          <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-accent" /> Payment Proof Screenshot:
          </p>
          <div className="relative inline-block cursor-pointer group" onClick={() => setScreenshotOpen(true)}>
            <img
              src={order.payment_screenshot_url}
              alt="Payment screenshot"
              className="h-20 w-32 rounded-lg border border-border object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 text-white" />
            </div>
          </div>

          <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle>Payment Screenshot — Order #{order.id.slice(0, 8)}</DialogTitle>
              </DialogHeader>
              <div className="p-2 flex justify-center">
                <img
                  src={order.payment_screenshot_url}
                  alt="Full payment screenshot"
                  className="max-h-[75vh] w-auto rounded-lg object-contain border border-border"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Order items list */}
      <div className="space-y-1.5 border-t border-border/60 pt-3">
        {order.order_items?.map((item: any, idx: number) => (
          <div key={item.id || idx} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
            <span className="text-foreground font-medium">
              {item.product_name} <span className="text-muted-foreground text-xs">× {item.quantity}</span>
            </span>
            <span className="text-muted-foreground">PKR {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 pt-2 flex justify-between items-center font-display">
        <span className="text-sm font-semibold text-muted-foreground">Order Total</span>
        <span className="text-lg font-bold text-primary">PKR {Number(order.total_amount).toLocaleString()}</span>
      </div>

      {/* Status Action Buttons */}
      <div className="border-t border-border/60 pt-3 flex flex-wrap gap-2">
        {!showRestore ? (
          <>
            {order.status !== "confirmed" && (
              <Button size="sm" variant="outline" className="text-xs h-8 border-purple-500/40 hover:bg-purple-500/20 text-purple-300" onClick={() => updateOrderStatus(order.id, "confirmed")}>
                Confirm Order
              </Button>
            )}
            {order.status !== "shipped" && (
              <Button size="sm" variant="outline" className="text-xs h-8 border-cyan-500/40 hover:bg-cyan-500/20 text-cyan-300" onClick={() => updateOrderStatus(order.id, "shipped")}>
                Mark Shipped
              </Button>
            )}
            {order.status !== "completed" && (
              <Button size="sm" className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={() => updateOrderStatus(order.id, "completed")}>
                Mark Completed
              </Button>
            )}
            {order.status !== "cancelled" && (
              <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => updateOrderStatus(order.id, "cancelled")}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => updateOrderStatus(order.id, "pending")}>
            <RefreshCw className="h-3 w-3 mr-1" /> Restore to Active
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn());
  const [adminUser, setAdminUser] = useState("admin");
  const [adminPass, setAdminPass] = useState("admin");
  const [loginError, setLoginError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("all");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Category form state
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Product form state
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodImagePreview, setProdImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Banner form state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods, ords, bnrs] = await Promise.all([
        getCategories(),
        getProducts(),
        getOrders(),
        getBanners(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setOrders(ords);
      setBanners(bnrs);
    } catch (e) {
      console.error("Load data error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCredentials(adminUser, adminPass)) {
      setAdminLoggedIn(true);
      setIsAdmin(true);
      setLoginError("");
      toast({ title: "Welcome Administrator", description: "Ash Vapor Manager Portal Unlocked" });
      loadData();
    } else {
      setLoginError("Invalid credentials. Use admin / admin.");
      toast({ title: "Access Denied", description: "Use admin / admin", variant: "destructive" });
    }
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setIsAdmin(false);
    toast({ title: "Logged out from Manager Portal" });
  };

  // ---------------- Category handlers ----------------
  const handleSaveCategory = async () => {
    if (!catName.trim()) return;
    if (editingCatId) {
      await modifyCategory(editingCatId, catName.trim(), catDesc.trim());
      toast({ title: "Category updated", description: catName });
      setEditingCatId(null);
    } else {
      await insertCategory(catName.trim(), catDesc.trim());
      toast({ title: "Category added", description: catName });
    }
    setCatName("");
    setCatDesc("");
    loadData();
  };

  const handleCancelCategoryEdit = () => {
    setEditingCatId(null);
    setCatName("");
    setCatDesc("");
  };

  const handleDeleteCategory = async (id: string) => {
    if (editingCatId === id) {
      handleCancelCategoryEdit();
    }
    await removeCategory(id);
    toast({ title: "Category deleted" });
    loadData();
  };

  // ---------------- Product handlers ----------------
  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.name);
      setProdSku(product.sku);
      setProdDesc(product.description || "");
      setProdPrice(String(product.price));
      setProdStock(String(product.stock));
      setProdCategory(product.category_id || "");
      setProdImageUrl(product.image_url || "");
      setProdImagePreview(product.image_url || null);
    } else {
      setEditingProduct(null);
      setProdName("");
      setProdSku(`AMP-${Date.now().toString().slice(-5)}`);
      setProdDesc("");
      setProdPrice("");
      setProdStock("20");
      setProdCategory(categories[0]?.id || "");
      setProdImageUrl("");
      setProdImagePreview(null);
    }
    setProductDialogOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setProdImagePreview(previewUrl);

    // Try Supabase Storage upload
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        setProdImageUrl(urlData.publicUrl);
        setProdImagePreview(urlData.publicUrl);
        return;
      }
    } catch (err) {
      console.warn("Storage upload failed, using data url fallback", err);
    }

    // Fallback: read as base64 Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      setProdImageUrl(url);
      setProdImagePreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const priceNum = parseFloat(prodPrice) || 0;
    if (priceNum <= 0) {
      toast({ title: "Please specify a valid price in PKR", variant: "destructive" });
      return;
    }

    await saveProduct({
      id: editingProduct ? editingProduct.id : undefined,
      name: prodName,
      sku: prodSku || `AMP-${Date.now().toString().slice(-5)}`,
      description: prodDesc,
      price: priceNum,
      stock: parseInt(prodStock) || 0,
      category_id: prodCategory || null,
      image_url: prodImageUrl || prodImagePreview || "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&auto=format&fit=crop&q=80",
    });

    toast({ title: editingProduct ? "Product updated" : "Product added to catalog" });
    setProductDialogOpen(false);
    loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    await removeProduct(id);
    toast({ title: "Product removed from catalog" });
    loadData();
  };

  // ---------------- Banner handlers ----------------
  const openBannerForm = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerTitle(banner.title);
      setBannerSubtitle(banner.subtitle || "");
      setBannerLink(banner.link_url || "");
      setBannerImageUrl(banner.image_url || "");
    } else {
      setEditingBanner(null);
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerLink("/products");
      setBannerImageUrl("");
    }
    setBannerDialogOpen(true);
  };

  const handleBannerImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `banners/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);
        setBannerImageUrl(urlData.publicUrl);
        return;
      }
    } catch (err) {
      console.warn("Banner image upload error, using fallback:", err);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) return;
    await updateBanner({
      id: editingBanner ? editingBanner.id : undefined,
      title: bannerTitle,
      subtitle: bannerSubtitle,
      link_url: bannerLink,
      image_url: bannerImageUrl || "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=1200&auto=format&fit=crop&q=80",
    });

    toast({ title: editingBanner ? "Banner updated" : "Banner created" });
    setBannerDialogOpen(false);
    loadData();
  };

  const handleDeleteBanner = async (id: string) => {
    await removeBanner(id);
    toast({ title: "Banner removed" });
    loadData();
  };

  const handleToggleBanner = async (id: string, active: boolean) => {
    await toggleBannerActive(id, active);
    loadData();
  };

  // ---------------- Order status handler ----------------
  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    await changeOrderStatus(orderId, status);
    toast({ title: `Order updated to ${status.toUpperCase()}` });
    loadData();
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCatFilter === "all" || p.category_id === selectedCatFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCatFilter]);

  // Dashboard calculations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length;
  }, [orders]);

  const totalInStock = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  }, [products]);

  // ---------------- GATE: If not authenticated ----------------
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-accent/15 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md glass-dark p-8 rounded-2xl border border-border/80 shadow-2xl space-y-6 relative z-10 glow-card">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-black/95 px-5 py-2.5 rounded-2xl border border-zinc-800 shadow-md inline-flex items-center justify-center">
                <img
                  src="/logo-badge.png"
                  alt="Ash Vapers Logo"
                  className="h-16 sm:h-20 w-auto object-contain"
                />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
              <Shield className="h-3.5 w-3.5 text-red-600" /> MANAGER PORTAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
              Ash<span className="text-red-600">Vapor</span> Admin Access
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Please enter the administrator credentials to manage products, categories, orders, and banners.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-user">Manager Username</Label>
              <Input
                id="admin-user"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin"
                required
                className="bg-secondary/40 border-border/70"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-pass">Manager Password</Label>
              <Input
                id="admin-pass"
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="admin"
                required
                className="bg-secondary/40 border-border/70"
              />
            </div>

            {loginError && (
              <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-md border border-destructive/20">
                {loginError}
              </p>
            )}

            <Button type="submit" className="w-full btn-glow h-11 text-base font-semibold">
              Unlock Manager Portal
            </Button>
          </form>

          <div className="pt-2 border-t border-border/50 text-center space-y-3">
            <div className="bg-primary/10 rounded-lg p-2.5 text-xs text-muted-foreground">
              Pre-configured admin login: <code className="text-primary font-bold">admin</code> /{" "}
              <code className="text-primary font-bold">admin</code>
            </div>
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- AUTHENTICATED MANAGER PORTAL ----------------
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
        <div className="flex items-center gap-4">
          <div className="bg-black/95 px-3 py-1.5 rounded-xl border border-zinc-800 shadow-sm flex items-center">
            <img
              src="/logo-badge.png"
              alt="Ash Vapers Logo"
              className="h-11 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 px-2 py-0.5 rounded bg-red-50 border border-red-200">Store Control Center</span>
              <span className="text-[10px] font-medium text-muted-foreground">• Live Supabase Synced</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-black tracking-tight">
              Ash<span className="text-red-600">Vapor</span> Manager Portal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage your vape pods catalog, orders, categories, and promotions in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="border-border hover:border-primary/50 text-xs">
            <Link to="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> View Storefront
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleAdminLogout} className="text-destructive hover:bg-destructive/10 text-xs">
            <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-dark p-4 rounded-xl border border-border/70 glow-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-foreground">
            PKR {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-muted-foreground">Across all valid orders</span>
        </div>

        <div className="glass-dark p-4 rounded-xl border border-border/70 glow-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Orders</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-amber-400">
            {activeOrdersCount}
          </p>
          <span className="text-[10px] text-muted-foreground">Pending, Confirmed, Shipped</span>
        </div>

        <div className="glass-dark p-4 rounded-xl border border-border/70 glow-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Vape Products</span>
            <Package className="h-4 w-4 text-accent" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {products.length}
          </p>
          <span className="text-[10px] text-muted-foreground">{totalInStock} total units in stock</span>
        </div>

        <div className="glass-dark p-4 rounded-xl border border-border/70 glow-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Categories</span>
            <ShoppingBag className="h-4 w-4 text-purple-400" />
          </div>
          <p className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {categories.length}
          </p>
          <span className="text-[10px] text-muted-foreground">Pod Kits, Salts, Disposables</span>
        </div>
      </div>

      {/* Main Management Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-secondary/60 p-1 rounded-xl border border-border/70 flex flex-wrap h-auto">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-4 rounded-lg">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-4 rounded-lg">
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-4 rounded-lg">
            Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-primary data-[state=active]:text-white text-xs sm:text-sm py-2 px-4 rounded-lg">
            Banners ({banners.length})
          </TabsTrigger>
        </TabsList>

        {/* ---------------- PRODUCTS TAB ---------------- */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 p-3 rounded-xl border border-border/50">
            <div className="flex flex-1 items-center gap-2 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Search pod name, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 bg-background/50 border-border text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedCatFilter} onValueChange={setSelectedCatFilter}>
                <SelectTrigger className="w-[170px] h-9 text-xs bg-background/50 border-border">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openProductForm()} className="h-9 btn-glow text-xs font-semibold shrink-0">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Vape Item
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display text-lg">
                      {editingProduct ? "Edit Product" : "Add New Vape Product"}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-3.5 pt-2">
                    <div>
                      <Label className="text-xs">Product Name *</Label>
                      <Input
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="e.g. Vaporesso XROS 4 Kit"
                        className="bg-secondary/40 text-sm mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">SKU Code</Label>
                        <Input
                          value={prodSku}
                          onChange={(e) => setProdSku(e.target.value)}
                          placeholder="AMP-XROS-01"
                          className="bg-secondary/40 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select value={prodCategory} onValueChange={setProdCategory}>
                          <SelectTrigger className="bg-secondary/40 text-xs mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {categories.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Price in PKR *</Label>
                        <Input
                          type="number"
                          step="50"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="e.g. 7500"
                          className="bg-secondary/40 text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Stock Quantity</Label>
                        <Input
                          type="number"
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value)}
                          placeholder="e.g. 25"
                          className="bg-secondary/40 text-sm mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Description & Vape Specs</Label>
                      <Textarea
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Device specifications, battery mAh, pod compatibility, nicotine strengths..."
                        rows={3}
                        className="bg-secondary/40 text-sm mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Product Image</Label>
                      <div className="mt-1 space-y-2">
                        <Input
                          type="text"
                          placeholder="Paste image URL (e.g. https://...)"
                          value={prodImageUrl}
                          onChange={(e) => {
                            setProdImageUrl(e.target.value);
                            setProdImagePreview(e.target.value);
                          }}
                          className="bg-secondary/40 text-xs"
                        />
                        <div className="flex items-center gap-3">
                          {prodImagePreview && (
                            <img
                              src={prodImagePreview}
                              alt="Preview"
                              className="h-16 w-16 object-cover rounded-lg border border-border"
                            />
                          )}
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg border border-dashed border-border/80">
                            <Upload className="h-4 w-4 text-primary" />
                            <span>Or upload from device</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full btn-glow mt-4" onClick={handleSaveProduct}>
                      {editingProduct ? "Update Product" : "Save to Catalog"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-xl border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
                  <tr>
                    <th className="text-left p-3.5">Product</th>
                    <th className="text-left p-3.5 hidden md:table-cell">SKU</th>
                    <th className="text-left p-3.5">Price</th>
                    <th className="text-left p-3.5">Stock</th>
                    <th className="text-left p-3.5 hidden sm:table-cell">Category</th>
                    <th className="text-right p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=100"}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border border-border/60 bg-muted shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">{p.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">SKU: {p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 hidden md:table-cell text-xs font-mono text-muted-foreground">{p.sku}</td>
                      <td className="p-3.5 font-semibold text-primary">PKR {p.price.toLocaleString()}</td>
                      <td className="p-3.5">
                        {p.stock > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {p.stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive border border-destructive/30">
                            Sold Out
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 hidden sm:table-cell text-xs text-muted-foreground">
                        {p.categories?.name || "—"}
                      </td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openProductForm(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/15" onClick={() => handleDeleteProduct(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No products match your search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ---------------- CATEGORIES TAB ---------------- */}
        <TabsContent value="categories" className="space-y-4">
          <div className="rounded-xl border border-border/80 bg-card/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {editingCatId ? "Edit Category" : "Add New Category"}
              </h2>
              {editingCatId && (
                <Button variant="ghost" size="sm" onClick={handleCancelCategoryEdit} className="text-xs text-muted-foreground">
                  Cancel Edit
                </Button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Input
                placeholder="Category name (e.g. Disposable Pods)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="bg-secondary/40 text-sm"
              />
              <Input
                placeholder="Description (optional)"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="bg-secondary/40 text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveCategory} className="btn-glow flex-1">
                  {editingCatId ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Update Category
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" /> Add Category
                    </>
                  )}
                </Button>
                {editingCatId && (
                  <Button variant="outline" onClick={handleCancelCategoryEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id).length;
              const isSelected = editingCatId === c.id;
              return (
                <div
                  key={c.id}
                  className={`flex items-center justify-between rounded-xl border p-4 glow-card transition-all ${
                    isSelected ? "border-primary bg-primary/10 shadow-lg" : "border-border/80 bg-card/70"
                  }`}
                >
                  <div className="flex-1 mr-3">
                    <p className="font-semibold text-foreground text-sm">{c.name}</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                    <span className="text-[10px] text-primary font-medium mt-1 inline-block">
                      {count} products assigned • ID: {c.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-primary"
                      title="Edit Category"
                      onClick={() => {
                        setEditingCatId(c.id);
                        setCatName(c.name);
                        setCatDesc(c.description || "");
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/15"
                      title="Delete Category"
                      onClick={() => handleDeleteCategory(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ---------------- ORDERS TAB ---------------- */}
        <TabsContent value="orders" className="space-y-4">
          <Tabs defaultValue="active">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Customer Orders ({orders.length})</h2>
              <TabsList className="bg-secondary/60 p-1">
                <TabsTrigger value="active" className="text-xs py-1.5 px-3">
                  Active ({orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs py-1.5 px-3">
                  History ({orders.filter((o) => ["completed", "cancelled"].includes(o.status)).length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="space-y-4">
              {orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-card/40 p-12 text-center text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="text-base font-semibold text-foreground">All caught up!</p>
                  <p className="text-xs mt-1">No active pending or shipped orders at the moment.</p>
                </div>
              ) : (
                orders
                  .filter((o) => !["completed", "cancelled"].includes(o.status))
                  .map((order) => (
                    <OrderCard key={order.id} order={order} updateOrderStatus={handleUpdateOrderStatus} />
                  ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {orders.filter((o) => ["completed", "cancelled"].includes(o.status)).length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-card/40 p-12 text-center text-muted-foreground">
                  No completed or archived orders yet.
                </div>
              ) : (
                orders
                  .filter((o) => ["completed", "cancelled"].includes(o.status))
                  .map((order) => (
                    <OrderCard key={order.id} order={order} updateOrderStatus={handleUpdateOrderStatus} showRestore />
                  ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ---------------- BANNERS TAB ---------------- */}
        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground">Homepage Promotions & Banners</h2>
            <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openBannerForm()} className="btn-glow text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingBanner ? "Edit Banner" : "New Promo Banner"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div>
                    <Label className="text-xs">Banner Title *</Label>
                    <Input
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      placeholder="e.g. Weekend Salt Drop - 20% OFF"
                      className="bg-secondary/40 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtitle / Tagline</Label>
                    <Input
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="e.g. Free shipping on pod bundles"
                      className="bg-secondary/40 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Target Link URL</Label>
                    <Input
                      value={bannerLink}
                      onChange={(e) => setBannerLink(e.target.value)}
                      placeholder="/products"
                      className="bg-secondary/40 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Banner Image</Label>
                    <Input
                      value={bannerImageUrl}
                      onChange={(e) => setBannerImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="bg-secondary/40 text-xs mt-1"
                    />
                    <div className="flex items-center gap-3 mt-2">
                      {bannerImageUrl && (
                        <img
                          src={bannerImageUrl}
                          alt="Banner Preview"
                          className="h-12 w-20 object-cover rounded-lg border border-border"
                        />
                      )}
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg border border-dashed border-border/80">
                        <Upload className="h-3.5 w-3.5 text-primary" />
                        <span>Upload from device</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleBannerImageFileChange} />
                      </label>
                    </div>
                  </div>
                  <Button className="w-full btn-glow mt-3" onClick={handleSaveBanner}>
                    {editingBanner ? "Update Banner" : "Create Banner"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {banners.map((b) => (
              <div key={b.id} className="flex items-center gap-4 rounded-xl border border-border/80 bg-card/70 p-4 glow-card">
                {b.image_url ? (
                  <img src={b.image_url} alt={b.title} className="h-16 w-24 object-cover rounded-lg border border-border shrink-0" />
                ) : (
                  <div className="h-16 w-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>}
                  <span className="text-[10px] font-mono text-primary">{b.link_url || "/products"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={b.is_active} onCheckedChange={(v) => handleToggleBanner(b.id, v)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => openBannerForm(b)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/15" onClick={() => handleDeleteBanner(b.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
