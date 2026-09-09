import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, Shield, Truck, Sparkles,
  Timer, CreditCard, Flame,
  BadgeCheck, RefreshCw, CheckCircle2, ShoppingBag, MessageCircle, Layers, PhoneCall
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
    {
      icon: Truck,
      title: "Fast Delivery in Pakistan",
      desc: "Express courier to Karachi, Lahore, Islamabad & all major cities nationwide",
    },
    {
      icon: CreditCard,
      title: "Cash on Delivery (COD)",
      desc: "Pay conveniently in cash at your doorstep upon receiving your parcel",
    },
    {
      icon: BadgeCheck,
      title: "100% Authentic Guarantee",
      desc: "Only genuine products with verifiable manufacturer scratch security codes",
    },
    {
      icon: MessageCircle,
      title: "24/7 WhatsApp Support",
      desc: "Direct support & fast order booking via WhatsApp at 03104703131",
    },
  ];

  const whyUs = [
    {
      icon: BadgeCheck,
      title: "100% Authentic Brands",
      desc: "Every pod kit, disposable vape, and nic-salt bottle is imported directly from authorized distributors with verifiable scratch codes. Zero clones.",
    },
    {
      icon: Truck,
      title: "Fast Nationwide Delivery",
      desc: "Express shipping across Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, and every corner of Pakistan.",
    },
    {
      icon: CreditCard,
      title: "Cash on Delivery & SadaPay",
      desc: "Order with absolute confidence. Pay with cash on arrival, or use instant SadaPay, JazzCash, or online bank transfer.",
    },
    {
      icon: RefreshCw,
      title: "Fresh Flavors & Leak-Proof",
      desc: "Properly stored in temperature-controlled facilities ensuring e-liquids remain fresh, smooth, and leak-free.",
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
    <div className="min-h-screen bg-white text-black selection:bg-red-100 selection:text-red-900">
      {/* ========== HERO BANNER (VAPEMALL PK STYLE) ========== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-white pt-8 pb-14 border-b border-gray-200">
        <div className="container relative mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            {/* User Logo Display */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="relative group inline-block">
                <img
                  src="/logo-transparent.png"
                  alt="Ash Vapor"
                  className="h-32 sm:h-44 md:h-52 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
                />
              </div>
            </div>

            {/* Top Red Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 border border-red-200 shadow-sm">
              <Flame className="h-4 w-4 text-red-600 animate-pulse" />
              <span>Ash Vapor • Pakistan's #1 Online Vape Store</span>
              <span className="text-gray-400">•</span>
              <span className="text-black font-semibold">Cash on Delivery Available</span>
            </div>

            {/* Main Headline - Bold Black Font */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-black leading-[1.1]">
              Best Vape Price <span className="text-red-600">in Pakistan</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed font-medium">
              Buy authentic pod kits, smart rechargeable disposables, replacement coils, and imported premium nic-salt e-liquids at the most competitive prices in Pakistan.
            </p>

            {/* CTA Buttons - VapeMall Style */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-black px-8 h-12 text-sm sm:text-base shadow-md transition-all duration-200 hover:shadow-lg" asChild>
                <Link to="/products">
                  Shop All Vapes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gray-300 hover:border-red-600 hover:text-red-600 text-black bg-white font-bold h-12 px-6 text-sm shadow-sm" asChild>
                <Link to="/products?cat=Disposable+Vapes">
                  <Flame className="mr-2 h-4 w-4 text-red-600" /> Disposables
                </Link>
              </Button>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 text-sm shadow-md transition-all duration-200" asChild>
                <a href="https://wa.me/923104703131" target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Order
                </a>
              </Button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-gray-800 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Authentic Guaranteed
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-red-600" /> Same-Day Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-black" /> Cash on Delivery (COD)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 4 TRUST PILLARS / PERKS (VAPEMALL PK STYLE) ========== */}
      <section className="border-b border-gray-200 bg-gray-50 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {perks.map((p) => (
              <div key={p.title} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-red-500 transition-colors">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <p.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-black leading-tight">{p.title}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SHOP BY CATEGORY (VAPEMALL PK STYLE) ========== */}
      <section className="container mx-auto px-4 py-12 border-b border-gray-200">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">Explore Catalog</span>
          <h2 className="text-2xl sm:text-3xl font-black text-black">Shop by Category</h2>
          <p className="text-xs sm:text-sm text-gray-700">
            Browse authentic refillable pod systems, smart disposable vapes, and imported nic-salts
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => {
              const prodCount = products.filter((p) => p.category_id === c.id).length;

              return (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  className="group relative rounded-2xl border border-gray-200 bg-white p-5 hover:border-red-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-200">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-sm sm:text-base group-hover:text-red-600 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2">
                      {c.description || `Browse authentic ${c.name} gear at best prices`}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">
                    <span>Explore ({prodCount})</span> <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200">
            <Flame className="mx-auto h-7 w-7 text-red-600 animate-pulse mb-2" />
            <p className="text-xs text-gray-700">Connecting live categories from database...</p>
          </div>
        )}
      </section>

      {/* ========== TOP AUTHENTIC BRANDS TICKER ========== */}
      <section className="border-b border-gray-200 py-8 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-black font-extrabold mb-4">
            Top Genuine Brands Stocked Across Pakistan
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[
              "Vaporesso", "Uwell Caliburn", "Geek Bar", "OXVA", "VGOD",
              "Nasty Juice", "Voopoo", "Smok", "Lost Mary", "Tokyo Juice"
            ].map((brand) => (
              <Link
                key={brand}
                to={`/products?q=${encodeURIComponent(brand)}`}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:border-red-600 hover:text-red-600 text-xs font-bold text-black shadow-sm transition-all duration-200"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS CATALOG ========== */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" /> Direct From Live Inventory
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">Featured Vape Pods & E-Liquids</h2>
            <p className="text-xs sm:text-sm text-gray-700 mt-1">
              Order online with Cash on Delivery or online transfer across Pakistan
            </p>
          </div>

          <Button variant="outline" className="hidden sm:inline-flex border-gray-300 text-black hover:border-red-600 hover:text-red-600 text-xs font-bold bg-white" asChild>
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
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === "all"
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-black hover:text-red-600 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === c.id
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-black hover:text-red-600 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
            <Flame className="mx-auto h-8 w-8 text-red-600 animate-pulse mb-2" />
            <p className="text-sm text-black font-semibold">Loading products from live inventory...</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 max-w-lg mx-auto p-8 space-y-4 shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">
                {selectedCategory !== "all"
                  ? `No products in ${categories.find((c) => c.id === selectedCategory)?.name || "selected category"} yet`
                  : "New Vape Drops Arriving Daily"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-sm mx-auto">
                {selectedCategory !== "all"
                  ? "Fresh stock is arriving weekly. Chat with us on WhatsApp for exact flavor availability and custom reservations!"
                  : "Our team is actively stocking fresh shipments of pod kits and nicotine salts. Order directly on WhatsApp for immediate dispatch!"}
              </p>
            </div>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              {selectedCategory !== "all" && (
                <Button
                  onClick={() => setSelectedCategory("all")}
                  variant="outline"
                  className="text-xs h-10 border-gray-300 text-black hover:border-red-600"
                >
                  View All Products ({products.length})
                </Button>
              )}
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-5 shadow-sm">
                <a href="https://wa.me/923104703131" target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp Order (03104703131)
                </a>
              </Button>
              <Button variant="outline" asChild className="text-xs h-10 border-gray-300 text-black hover:border-red-600">
                <Link to="/products">Browse All Pods</Link>
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

      {/* ========== FLASH DEALS / SPECIALS (VAPEMALL PK STYLE) ========== */}
      {products.length > 0 && (
        <section id="deals" className="container mx-auto px-4 py-12">
          <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-sm">
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Timer className="h-3.5 w-3.5 text-red-600" /> Limited Time Specials
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-black">Ash Vapor Daily Deals</h2>
                <p className="text-xs sm:text-sm text-gray-700 mt-1">Special bundle discounts reset tonight at midnight.</p>
              </div>

              {/* Countdown Box */}
              <div className="flex items-center gap-2 self-start md:self-auto">
                {[
                  { label: "HOURS", val: countdown.hours },
                  { label: "MINS", val: countdown.minutes },
                  { label: "SECS", val: countdown.seconds },
                ].map((t) => (
                  <div key={t.label} className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-center min-w-[60px] shadow-sm">
                    <span className="text-xl sm:text-2xl font-black text-red-600 block leading-none">
                      {String(t.val).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-black uppercase">{t.label}</span>
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

      {/* ========== WHY CHOOSE ASH VAPOR ========== */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Guaranteed Quality</span>
          <h2 className="text-2xl sm:text-3xl font-black text-black mt-1">
            Why Shop at Ash Vapor?
          </h2>
          <p className="text-xs sm:text-sm text-gray-700 mt-2">
            Pakistan's trusted destination for authentic vape hardware with zero counterfeit compromises.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {whyUs.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-red-600 hover:shadow-md transition-all text-left"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-black mb-1.5">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== VAPEMALL STYLE DELIVERY COVERAGE DIRECTORY ========== */}
      <section className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-lg sm:text-xl font-black text-black mb-2">
            Express Vape Delivery Across Pakistan
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 max-w-2xl mx-auto mb-6">
            We deliver original vapes, pod systems, coils, and e-liquids with fast Cash on Delivery across all major cities:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {deliveryCities.map((city) => (
              <span
                key={city}
                className="px-3 py-1 rounded-lg bg-white border border-gray-300 text-xs font-bold text-black shadow-sm"
              >
                Vape in {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPLIANCE AGE WARNING ========== */}
      <section className="bg-red-50 border-y border-red-200 py-4 px-4 text-center">
        <div className="container mx-auto max-w-3xl">
          <p className="text-xs sm:text-sm font-bold text-red-800 leading-relaxed">
            ⚠️ <strong>AGE RESTRICTION & HEALTH WARNING:</strong> Products sold by Ash Vapor contain nicotine, an addictive chemical. Intended exclusively for adult smokers aged 21 and older. We strictly do not sell to minors.
          </p>
        </div>
      </section>

      {/* ========== FOOTER (VAPEMALL PK STYLE) ========== */}
      <footer className="bg-white border-t border-gray-200 py-14 text-black">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-transparent.png"
                  alt="Ash Vapor"
                  className="h-12 w-auto object-contain"
                />
                <div>
                  <div className="flex items-center leading-none">
                    <span className="text-xl font-black tracking-tight text-black">
                      Ash<span className="text-red-600">Vapor</span>
                    </span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600">
                      PK
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-800 uppercase tracking-wider block mt-0.5 font-bold">
                    Best Vape Price in Pakistan
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                Ash Vapor is Pakistan's premier online vape store offering authentic pod systems, disposable vapes, replacement coils, and imported nic-salt e-liquids with Cash on Delivery nationwide.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs text-gray-700 font-semibold">
                <li><Link to="/products" className="text-black hover:text-red-600 transition-colors">All Vape Hardware</Link></li>
                {categories.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <Link to={`/products?category=${c.id}`} className="text-black hover:text-red-600 transition-colors">
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li><Link to="/orders" className="text-black hover:text-red-600 transition-colors">Track Your Order</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black mb-4">Help & Ordering</h4>
              <ul className="space-y-2 text-xs text-gray-700 font-semibold">
                <li>
                  <a href="https://wa.me/923104703131" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp: 03104703131
                  </a>
                </li>
                <li>Cash on Delivery (All Pakistan)</li>
                <li>SadaPay & Direct Bank Transfer</li>
                <li>Discreet & Stealth Packaging</li>
                <li>Same-Day Express Dispatch</li>
              </ul>
            </div>

            {/* Official Guarantee */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-black mb-4">Official Guarantee</h4>
              <div className="flex items-center gap-3">
                <img
                  src="/logo-badge-transparent.png"
                  alt="Ash Vapor Official Seal"
                  className="h-16 w-16 object-contain shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" /> 100% Genuine Pods
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                    <Shield className="h-4 w-4" /> 21+ Age Verified
                  </div>
                  <span className="text-[11px] text-gray-800 font-semibold block">Authentic Scratch Codes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-700 font-medium">
            <p>© 2026 Ash Vapor Pakistan. All rights reserved. | Best Vape Price in Pakistan</p>
            <span className="text-[11px] text-gray-800 font-semibold">
              Strictly 21+ Adults Only • Express Delivery Across Pakistan
            </span>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Order Button (VapeMall style) */}
      <a
        href="https://wa.me/923104703131?text=Hello%20Ash%20Vapor!%20I%20would%20like%20to%20place%20an%20order."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-3 px-4 sm:px-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border border-emerald-500"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
        <span className="font-sans">Order on WhatsApp</span>
      </a>
    </div>
  );
}
