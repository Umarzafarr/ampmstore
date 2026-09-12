import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, Shield, Truck, Sparkles,
  Timer, CreditCard, Flame,
  BadgeCheck, RefreshCw, ShoppingBag, Layers, ChevronLeft, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, getBanners, Product, Category, Banner } from "@/lib/store-data";

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

  const whyUs = [
    {
      icon: BadgeCheck,
      title: "Authentic Imports Only",
      desc: "Every pod kit, disposable vape, and nic-salt bottle is imported with verifiable manufacturer scratch codes. Zero counterfeit compromises.",
    },
    {
      icon: Truck,
      title: "Express Nationwide Dispatch",
      desc: "Same-day order dispatch across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and all cities across Pakistan.",
    },
    {
      icon: CreditCard,
      title: "Cash on Delivery & SadaPay",
      desc: "Pay safely with cash on arrival at your doorstep, or enjoy instant bank transfer / SadaPay checkout options.",
    },
    {
      icon: RefreshCw,
      title: "Fresh Flavors & Leak-Proof",
      desc: "Climate-controlled facilities ensure liquids never oxidize and coils arrive factory-sealed and fresh.",
    },
  ];

  const deliveryCities = [
    "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
    "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Sukkur"
  ];

  const displayedProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    const catObj = categories.find((c) => c.id === selectedCategory);
    return products.filter(
      (p) =>
        p.category_id === selectedCategory ||
        (catObj && p.categories?.name && p.categories.name.toLowerCase() === catObj.name.toLowerCase())
    );
  }, [products, selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      {/* ========== HERO SECTION (LUXURY DARK & RADIANT NEON THEME) ========== */}
      <section className="relative min-h-[75vh] sm:min-h-[82vh] flex items-center justify-center overflow-hidden bg-black text-white px-4 py-16 sm:py-24">
        {/* Cinematic atmospheric ambient lighting: radiant crimson & gold bloom */}
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[1050px] h-[580px] bg-gradient-to-b from-red-600/35 via-rose-700/20 to-transparent blur-[160px] pointer-events-none" />
        <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[450px] bg-gradient-to-b from-amber-500/25 via-yellow-500/15 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-950/20 via-black to-black pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-7">
          {/* Main Brand Logo - New Deep Radiant Red Neon Sign Logo */}
          <div className="flex justify-center mb-2">
            <img
              src="/logo-neon.png"
              alt="Ash Vapers"
              className="h-56 sm:h-68 md:h-76 lg:h-84 w-auto object-contain drop-shadow-[0_0_35px_rgba(255,20,50,0.45)] drop-shadow-[0_0_70px_rgba(250,204,21,0.3)] transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Refined Sleek Typography */}
          <div className="space-y-2">
            <h1 className="text-white block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-tight font-display drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
              FOR BLAND &amp; BORING
            </h1>
          </div>

          {/* Clean Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed font-medium">
            Curated high-puff smart disposables, authentic pod systems, and premium imported nic salts.
          </p>

          {/* Primary Call to Action Button - Radiant Red & Gold Neon CTA */}
          <div className="pt-2 sm:pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black uppercase tracking-widest px-10 sm:px-14 py-4 sm:py-5 h-13 sm:h-14 text-sm sm:text-base rounded-md shadow-[0_0_35px_rgba(239,68,68,0.65)] hover:shadow-[0_0_55px_rgba(245,158,11,0.85)] transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/products">
                ORDER NOW
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SHOP BY CATEGORY ========== */}
      <section className="container mx-auto px-4 py-16 border-t border-neutral-900">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">Curated Collections</span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white font-display">Shop by Category</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Select from imported refillable pods, long-lasting smart disposables, and premium nic-salts
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((c) => {
              const prodCount = products.filter((p) => p.category_id === c.id).length;

              return (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  className="group relative rounded-2xl border border-neutral-900 bg-[#0a0a0a] p-6 hover:border-red-600/80 hover:shadow-[0_0_35px_rgba(220,38,38,0.3)] transition-all duration-300 flex flex-col justify-between shadow-lg"
                >
                  <div className="h-12 w-12 rounded-xl bg-red-950/60 text-red-500 border border-red-900/60 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-all duration-300">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-yellow-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {c.description || `Explore genuine ${c.name} hardware`}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-red-500 group-hover:text-yellow-400 group-hover:translate-x-1 transition-transform">
                    <span>Explore ({prodCount})</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#0a0a0a] rounded-2xl border border-neutral-900">
            <Flame className="mx-auto h-7 w-7 text-red-500 animate-pulse mb-2" />
            <p className="text-xs text-zinc-400">Connecting categories from database...</p>
          </div>
        )}
      </section>

      {/* ========== TOP AUTHENTIC BRANDS TICKER ========== */}
      <section className="border-y border-neutral-900 py-8 bg-[#050505]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4">
            Popular Brands Available
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[
              "Vaporesso", "Uwell Caliburn", "Geek Bar", "OXVA", "VGOD",
              "Nasty Juice", "Voopoo", "Smok", "Lost Mary", "Tokyo Juice"
            ].map((brand) => (
              <Link
                key={brand}
                to={`/products?q=${encodeURIComponent(brand)}`}
                className="px-4 py-2 rounded-xl border border-neutral-800 bg-[#0a0a0a] hover:border-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] text-xs font-bold text-zinc-300 shadow-sm transition-all duration-200"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS CATALOG ========== */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-wider mb-1 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" /> Direct From Inventory
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-display">Featured Vape Hardware</h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Handpicked top-tier devices and imported flavors
            </p>
          </div>

          <Button variant="outline" className="hidden sm:inline-flex border-neutral-800 bg-[#0a0a0a] text-white hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.35)] text-xs font-bold" asChild>
            <Link to="/products">
              View All Catalog <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                  : "bg-[#0a0a0a] text-zinc-400 hover:text-white border border-neutral-900"
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? "bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                    : "bg-[#0a0a0a] text-zinc-400 hover:text-white border border-neutral-900"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid with dark={true} */}
        {loading ? (
          <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-neutral-900">
            <Flame className="mx-auto h-8 w-8 text-red-500 animate-pulse mb-2" />
            <p className="text-sm text-white font-semibold">Loading live products...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#0a0a0a] rounded-3xl border border-neutral-900 max-w-lg mx-auto p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-red-950/50 border border-red-900/60 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {selectedCategory !== "all"
                  ? `No products in ${categories.find((c) => c.id === selectedCategory)?.name || "selected category"} yet`
                  : "Fresh Drops Arriving Soon"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
                Stock is regularly updated. Browse our other categories to find your perfect flavor!
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button asChild className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-black h-10 px-6 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                <Link to="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} {...p} dark={true} />
            ))}
          </div>
        )}
      </section>

      {/* ========== FLASH DEALS / LIMITED DROPS ========== */}
      {products.length > 0 && (
        <section id="deals" className="container mx-auto px-4 py-12">
          <div className="rounded-3xl bg-[#080808] border border-neutral-800/80 p-6 sm:p-10 relative overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-neutral-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 text-red-400 border border-red-800/80 text-xs font-extrabold uppercase tracking-wider mb-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                  <Timer className="h-3.5 w-3.5 text-red-500" /> Limited Time Specials
                </div>
                <h2 className="text-2xl sm:text-4xl font-black uppercase text-white font-display">Daily Drops</h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">Special price drops reset tonight at midnight.</p>
              </div>

              {/* Countdown Box */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {[
                  { label: "HOURS", val: countdown.hours },
                  { label: "MINS", val: countdown.minutes },
                  { label: "SECS", val: countdown.seconds },
                ].map((t) => (
                  <div key={t.label} className="bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-center min-w-[62px]">
                    <span className="text-xl sm:text-2xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] block leading-none font-display">
                      {String(t.val).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((p) => (
                <ProductCard key={p.id} {...p} dark={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== WHY CHOOSE ASH VAPERS ========== */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-red-500 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">The Standard</span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase text-white mt-1 font-display">
            Why Ash Vapers
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2">
            Committed to genuine devices, rapid delivery, and exceptional flavor profiles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyUs.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-900 bg-[#0a0a0a] p-6 hover:border-red-600/70 hover:shadow-[0_0_30px_rgba(220,38,38,0.25)] transition-all text-left shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/50 text-red-500 border border-red-900/60 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== DELIVERY DIRECTORY ========== */}
      <section className="border-t border-neutral-900 bg-[#050505] py-10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-white mb-2">
            Nationwide Delivery Network
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl mx-auto mb-6">
            Dispatching original vape hardware and e-liquids with Cash on Delivery across all major hubs:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {deliveryCities.map((city) => (
              <span
                key={city}
                className="px-3 py-1 rounded-lg bg-[#0a0a0a] border border-neutral-800 text-xs font-bold text-zinc-300"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPLIANCE AGE WARNING ========== */}
      <section className="bg-red-950/20 border-y border-red-900/60 py-4 px-4 text-center shadow-[0_0_30px_rgba(220,38,38,0.15)]">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs sm:text-sm font-bold text-red-400 leading-relaxed drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
            ⚠️ <strong>AGE RESTRICTION:</strong> Electronic nicotine delivery systems are intended strictly for adult smokers aged 21 and older. We do not sell to minors.
          </p>
        </div>
      </section>

      {/* ========== FOOTER (CLEAN DARK THEME) ========== */}
      <footer className="bg-black border-t border-neutral-900 py-14 text-white">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-neon.png"
                  alt="Ash Vapers"
                  className="h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,20,50,0.35)]"
                />
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ash Vapers delivers genuine pod devices, high-capacity smart disposables, and imported nic salts across Pakistan.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Catalog</h4>
              <ul className="space-y-2 text-xs text-zinc-400 font-semibold">
                <li><Link to="/products" className="hover:text-red-500 transition-colors">All Hardware</Link></li>
                {categories.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link to={`/products?category=${c.id}`} className="hover:text-red-500 transition-colors">
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li><Link to="/orders" className="hover:text-red-500 transition-colors">Track Your Order</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Ordering</h4>
              <ul className="space-y-2 text-xs text-zinc-400 font-semibold">
                <li>Cash on Delivery (COD)</li>
                <li>Online Bank &amp; SadaPay Transfer</li>
                <li>Discreet Packaging</li>
                <li>Express Nationwide Dispatch</li>
              </ul>
            </div>

            {/* Official Guarantee */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Authenticity</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/logo-neon.png"
                  alt="Ash Vapers Seal"
                  className="h-16 w-16 object-contain shrink-0 drop-shadow-[0_0_15px_rgba(255,20,50,0.35)]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <BadgeCheck className="h-4 w-4" /> 100% Genuine Pods
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    <Shield className="h-4 w-4" /> 21+ Verified
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium block">Manufacturer Scratch Codes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 font-medium">
            <p>© 2026 Ash Vapers Pakistan. All rights reserved.</p>
            <span className="text-[11px] text-zinc-400">
              Strictly 21+ Adults Only • Premium Vape Co.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
