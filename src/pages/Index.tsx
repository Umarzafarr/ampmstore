import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, Shield, Truck, Sparkles,
  Timer, CreditCard, Flame,
  BadgeCheck, RefreshCw, CheckCircle2, ShieldCheck, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, getBanners, Product, Category, Banner, isAdminLoggedIn } from "@/lib/store-data";

// Flash deal countdown hook
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
        minutes: Math.floor(diff / (1000 * 60)) % 60,
        seconds: Math.floor(diff / 1000) % 60,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return timeLeft;
}

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const isAdmin = isAdminLoggedIn();

  // Midnight flash deal countdown
  const midnight = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);
  const countdown = useCountdown(midnight);

  useEffect(() => {
    Promise.all([getProducts(), getCategories(), getBanners()]).then(([prods, cats, bnrs]) => {
      setProducts(prods);
      setCategories(cats);
      setBanners(bnrs);
      setLoading(false);
    });
  }, []);

  const perks = [
    { icon: Truck, title: "Same-Day Dispatch", desc: "Express delivery across Lahore, Karachi, Islamabad & nationwide" },
    { icon: CreditCard, title: "Cash on Delivery", desc: "Pay safely with cash when your package arrives at your door" },
    { icon: BadgeCheck, title: "100% Authentic Guaranteed", desc: "Zero clones. Verifiable security scratch codes on all devices" },
    { icon: Shield, title: "Discreet Stealth Packaging", desc: "Odorless, plain, tamper-evident sealed packaging" },
  ];

  const whyUs = [
    {
      icon: BadgeCheck,
      title: "Authentic Devices & Juices Only",
      desc: "Every single pod kit, disposable and nic-salt bottle is imported directly from authorized distributors with verifiable scratch verification codes.",
    },
    {
      icon: Truck,
      title: "Rapid Nationwide Delivery",
      desc: "Same-day dispatch for major cities and 2-3 business days nationwide. Track your parcel in real-time from checkout to doorstep.",
    },
    {
      icon: CreditCard,
      title: "Cash on Delivery Available",
      desc: "Order with peace of mind. Pay with cash on arrival, or enjoy instant SadaPay / JazzCash / Bank Transfer options.",
    },
    {
      icon: RefreshCw,
      title: "Fresh Juice & Leak-Proof Assurance",
      desc: "Climate-controlled storage ensures nicotine salts never oxidize, and all pod systems arrive vacuum sealed and fresh.",
    },
  ];

  const displayedProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((p) => p.category_id === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden pt-8 pb-16 md:py-24 border-b border-border/60">
        {/* Ambient Neon & Vapor Blur Blobs */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-primary/25 blur-[120px] pointer-events-none animate-float" />
        <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full bg-accent/20 blur-[130px] pointer-events-none animate-float-delayed" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Official Logo Banner in Hero */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="relative group inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />
                <img
                  src="/logo-transparent.png"
                  alt="am/pm - Same Energy, Different Hours"
                  className="relative h-36 sm:h-48 md:h-56 w-auto object-contain mx-auto drop-shadow-[0_10px_35px_rgba(139,92,246,0.5)] transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs font-semibold text-primary border border-primary/30 glow-card">
              <Flame className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span>am/pm 24/7 Vape Pod Lounge</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-accent font-mono">Pakistan Edition</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              From Day to Night, <br className="hidden sm:inline" />
              <span className="text-gradient">Pure Flavor</span> & Dense Vapor
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Pakistan's premier 24/7 destination for authentic pod systems, high-puff smart disposables, replacement coils, and top-shelf nicotine salts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white btn-glow px-7 h-12 text-sm sm:text-base font-bold" asChild>
                <Link to="/products">
                  Explore Vape Pods <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border/80 hover:border-primary/60 text-foreground bg-secondary/30 h-12 px-6 text-sm font-semibold" asChild>
                <Link to="/admin">
                  <ShieldCheck className="mr-2 h-4 w-4 text-accent" /> Manager Portal
                </Link>
              </Button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Authentic Devices
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="h-4 w-4 text-accent" /> Express Delivery Nationwide
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CreditCard className="h-4 w-4 text-primary" /> Cash on Delivery (COD)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PERKS BAR ========== */}
      <section className="border-b border-border/60 bg-secondary/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {perks.map((p) => (
              <div key={p.title} className="flex items-center gap-3.5 p-2 rounded-xl bg-card/40 border border-border/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground hidden sm:block mt-0.5 line-clamp-1">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED VAPE PODS CATALOG ========== */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Curated Pod Selection
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">Featured Vape Pods & Juices</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Live catalog connected to database</p>
          </div>

          <Button variant="outline" className="hidden sm:inline-flex border-border/80 hover:border-primary/50 text-xs font-semibold" asChild>
            <Link to="/products">
              View All Catalog <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Category Pill Filters */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === "all"
                  ? "bg-primary text-white btn-glow"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60"
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? "bg-primary text-white btn-glow"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid / Clean Empty State */}
        {loading ? (
          <div className="text-center py-20 glass-dark rounded-2xl border border-border/60">
            <Flame className="mx-auto h-8 w-8 text-primary animate-pulse mb-2" />
            <p className="text-sm text-muted-foreground">Loading products from live database...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-20 glass-dark rounded-3xl border border-border/60 max-w-lg mx-auto p-8 space-y-4 glow-card">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Catalog is Ready for Stock</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                No placeholder products are active. You can start adding your real vape pod items, prices, and stock right from the Manager Portal.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button asChild className="btn-glow text-xs font-semibold">
                <Link to="/admin">Open Manager Portal (admin/admin)</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </section>

      {/* ========== FLASH DEALS (Rendered when products exist) ========== */}
      {products.length > 0 && (
        <section id="deals" className="container mx-auto px-4 py-12">
          <div className="rounded-3xl glass-dark p-6 sm:p-8 md:p-12 relative overflow-hidden border border-primary/30 glow-card">
            <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-primary/20 blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-accent/15 blur-[90px] pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-border/50">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-bold uppercase tracking-wider mb-2">
                  <Timer className="h-3.5 w-3.5" /> Midnight Pod Drop Deals
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground">Limited Time Specials</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Discounted bundle pricing resets tonight at midnight.</p>
              </div>

              {/* Countdown Box */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {[
                  { label: "HOURS", val: countdown.hours },
                  { label: "MINS", val: countdown.minutes },
                  { label: "SECS", val: countdown.seconds },
                ].map((t) => (
                  <div key={t.label} className="bg-secondary/70 border border-border/80 rounded-xl px-3 py-2 text-center min-w-[58px]">
                    <span className="font-display text-xl sm:text-2xl font-bold text-primary block leading-none">
                      {String(t.val).padStart(2, "0")}
                    </span>
                    <span className="text-[8px] font-bold tracking-widest text-muted-foreground uppercase">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== WHY CHOOSE am/pm ========== */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Trust & Quality</span>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mt-1">
            Why Shop at am<span className="text-primary">/</span>pm?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Pakistan's trusted 24/7 vape boutique with zero counterfeit compromises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyUs.map((item) => (
            <div
              key={item.title}
              className="card-hover group rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm p-6 glow-card text-left"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <item.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== AUTHENTIC BRANDS SHOWCASE ========== */}
      <section className="border-t border-border/60 bg-secondary/15 py-12">
        <div className="container mx-auto px-4 text-center">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Authentic Manufacturer Support</span>
          <h3 className="font-display text-xl sm:text-2xl font-black text-foreground mt-1 mb-8">
            Genuine Stock Direct from Certified Global Brands
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-80">
            {["Vaporesso", "Uwell", "OXVA", "Geekvape", "Voopoo", "Elf Bar", "Nasty Juice", "VGOD"].map((brand) => (
              <div
                key={brand}
                className="px-5 py-2.5 rounded-xl bg-card/60 border border-border/60 text-xs sm:text-sm font-bold tracking-wider font-display uppercase text-foreground/80 hover:text-primary hover:border-primary/50 transition-colors"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPLIANCE AGE WARNING ========== */}
      <section className="bg-destructive/10 border-y border-destructive/25 py-4 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold text-destructive leading-relaxed">
            ⚠️ <strong>AGE RESTRICTION & HEALTH WARNING:</strong> Products sold by am/pm contain nicotine, an addictive chemical. Intended exclusively for existing adult smokers aged 21 and older. We do not sell to minors.
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-card/90 border-t border-border/60 py-14">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-transparent.png"
                  alt="am/pm Vape"
                  className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                />
                <div>
                  <div className="flex items-center leading-none">
                    <span className="font-display text-lg font-black tracking-tight text-foreground">
                      am<span className="text-primary font-light">/</span>pm
                    </span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-accent/20 text-accent">
                      Vape
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block mt-0.5">
                    Same Energy • Different Hours
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pakistan's premier 24/7 destination for authentic vape devices, smart disposables, replacement pods, and premium nic-salt e-liquids.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/products" className="hover:text-primary transition-colors">All Vape Products</Link></li>
                <li><Link to="/orders" className="hover:text-primary transition-colors">Track Your Order</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Customer Account</Link></li>
                <li><Link to="/admin" className="hover:text-primary transition-colors text-accent font-semibold">Manager Portal</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-foreground mb-4">Order Support</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>Cash on Delivery (Nationwide)</li>
                <li>SadaPay & Online Transfer</li>
                <li>Discreet & Stealth Packaging</li>
                <li>Same-Day Dispatch</li>
              </ul>
            </div>

            {/* Verification badges */}
            <div>
              <h4 className="font-display text-xs font-bold uppercase tracking-widest text-foreground mb-4">Official Guarantee</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/logo-badge-transparent.png"
                  alt="am/pm official seal"
                  className="h-16 w-16 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <BadgeCheck className="h-3.5 w-3.5" /> 100% Genuine Pods
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                    <Shield className="h-3.5 w-3.5" /> 21+ Age Verified
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Good Vibes All Day</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© 2026 am/pm Vape Store. All rights reserved. | Handcrafted for Pakistan 🇵🇰</p>
            <Link to="/admin" className="text-[11px] text-muted-foreground hover:text-primary">
              Manager Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
