import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, LogOut, Search, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isAdminLoggedIn, setAdminLoggedIn, getCategories, Category } from "@/lib/store-data";

export default function Navbar() {
  const { toggleCart, itemCount } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const refreshData = async () => {
    if (isAdminLoggedIn()) {
      setIsAdmin(true);
    }
    try {
      const cats = await getCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    } catch {
      // ignore
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        if (data) setIsAdmin(true);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setAdminLoggedIn(false);
    setIsAdmin(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const count = itemCount();

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isLanding
          ? scrolled
            ? "bg-black/95 backdrop-blur-md shadow-2xl border-b border-white/10 text-white"
            : "bg-black/90 backdrop-blur-sm border-b border-white/10 text-white"
          : scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 text-black"
          : "bg-white border-b border-gray-100 text-black"
      }`}
    >
      {/* Top Announcement Bar - Omitted on landing page to maintain clean, clutter-free luxury look */}
      {!isLanding && (
        <div className="bg-black text-white py-2 px-4 text-center text-xs sm:text-sm font-medium">
          <a
            href="https://wa.me/923104703131"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline transition-all text-white"
          >
            <span>Order Online or Call or WhatsApp Us at 03104703131</span>
            <span className="font-bold text-sm">→</span>
          </a>
        </div>
      )}

      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo - Neon Sign */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className={!isLanding ? "bg-black/95 px-2.5 py-1 rounded-xl shadow-sm border border-zinc-800 flex items-center" : "flex items-center"}>
            <img
              src="/logo-neon.png"
              alt="Ash Vapor"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            to="/products"
            className={`text-xs font-bold tracking-widest uppercase transition-colors ${
              isLanding ? "text-white/80 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
          >
            New Arrivals
          </Link>
          <Link
            to="/products?cat=E-Liquids"
            className={`inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase transition-colors ${
              isLanding ? "text-white/80 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
          >
            <span>E-Liquids</span>
            <ChevronDown className={`h-3.5 w-3.5 ${isLanding ? "text-white/50" : "text-gray-500"}`} />
          </Link>
          <Link
            to="/products?cat=Pods"
            className={`inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase transition-colors ${
              isLanding ? "text-white/80 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
          >
            <span>Vapes</span>
            <ChevronDown className={`h-3.5 w-3.5 ${isLanding ? "text-white/50" : "text-gray-500"}`} />
          </Link>
          <Link
            to="/products?cat=Disposable+Vapes"
            className={`inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase transition-colors ${
              isLanding ? "text-white/80 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
          >
            <span>Disposables</span>
            <ChevronDown className={`h-3.5 w-3.5 ${isLanding ? "text-white/50" : "text-gray-500"}`} />
          </Link>
          <Link
            to="/orders"
            className={`inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase transition-colors ${
              isLanding ? "text-white/80 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
          >
            <span>Track Order</span>
          </Link>
        </div>

        {/* Right Action Icons: Search, User, Cart Bag */}
        <div className="flex items-center gap-5">
          {/* Search icon button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-1 transition-colors ${
              isLanding ? "text-white/90 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
            title="Search products"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* User Account icon */}
          {user ? (
            <button
              onClick={handleLogout}
              className={`p-1 transition-colors ${
                isLanding ? "text-white/90 hover:text-yellow-400" : "text-black hover:text-red-600"
              }`}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link
              to="/auth"
              className={`p-1 transition-colors ${
                isLanding ? "text-white/90 hover:text-yellow-400" : "text-black hover:text-red-600"
              }`}
              title="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          {/* Shopping Bag with circular badge */}
          <button
            onClick={toggleCart}
            className={`relative p-1 transition-colors ${
              isLanding ? "text-white/90 hover:text-yellow-400" : "text-black hover:text-red-600"
            }`}
            title="Cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className={`absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black shadow-sm ${
                isLanding ? "bg-yellow-400 text-black" : "bg-red-600 text-white font-bold"
              }`}>
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className={`lg:hidden p-1 ${isLanding ? "text-white" : "text-black"}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className={`border-t px-4 py-3 shadow-inner ${isLanding ? "border-white/10 bg-zinc-950" : "border-gray-100 bg-gray-50"}`}>
          <form onSubmit={handleSearchSubmit} className="container mx-auto max-w-xl flex gap-2">
            <input
              type="text"
              placeholder="Search products, brands (e.g. Caliburn, Crown Bar, Geek Bar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className={`flex-1 rounded-full px-4 py-2 text-sm focus:outline-none ${
                isLanding
                  ? "bg-zinc-900 border border-white/20 text-white placeholder:text-gray-500 focus:border-yellow-400"
                  : "bg-white border border-gray-300 text-black focus:border-red-600"
              }`}
            />
            <Button
              type="submit"
              className={`rounded-full text-xs px-5 font-bold ${
                isLanding
                  ? "bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className={`lg:hidden border-t px-6 py-5 space-y-3 shadow-2xl ${isLanding ? "bg-black border-white/10 text-white" : "bg-white border-gray-100 text-black"}`}>
          <Link
            to="/products"
            className={`block text-sm font-bold uppercase tracking-wider py-2 border-b ${
              isLanding ? "border-white/10 hover:text-yellow-400" : "border-gray-100 hover:text-red-600"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            New Arrivals
          </Link>
          <Link
            to="/products?cat=E-Liquids"
            className={`block text-sm font-bold uppercase tracking-wider py-2 border-b ${
              isLanding ? "border-white/10 hover:text-yellow-400" : "border-gray-100 hover:text-red-600"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            E-Liquids
          </Link>
          <Link
            to="/products?cat=Pods"
            className={`block text-sm font-bold uppercase tracking-wider py-2 border-b ${
              isLanding ? "border-white/10 hover:text-yellow-400" : "border-gray-100 hover:text-red-600"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Vapes
          </Link>
          <Link
            to="/products?cat=Disposable+Vapes"
            className={`block text-sm font-bold uppercase tracking-wider py-2 border-b ${
              isLanding ? "border-white/10 hover:text-yellow-400" : "border-gray-100 hover:text-red-600"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Disposables
          </Link>
          <Link
            to="/orders"
            className={`block text-sm font-bold uppercase tracking-wider py-2 border-b ${
              isLanding ? "border-white/10 hover:text-yellow-400" : "border-gray-100 hover:text-red-600"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Track Order
          </Link>
          {!user && (
            <Link
              to="/auth"
              className={`block text-sm font-bold uppercase tracking-wider py-2 ${
                isLanding ? "text-yellow-400 hover:underline" : "text-red-500"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Sign In to Account
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
