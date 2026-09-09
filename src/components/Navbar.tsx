import { Link, useNavigate } from "react-router-dom";
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
  const { toast } = useToast();

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
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white border-b border-gray-100"}`}>
      {/* Top Black Announcement Bar (Matching VapeMall) */}
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

      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo - Left Aligned */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <img
            src="/logo-transparent.png"
            alt="Ash Vapor"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links with Dropdown Carets */}
        <div className="hidden lg:flex items-center gap-7">
          <Link to="/products" className="text-sm font-semibold text-black hover:text-[#F8BE67] transition-colors">
            New Arrivals
          </Link>
          <Link to="/products?cat=E-Liquids" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#F8BE67] transition-colors">
            <span>E-Liquids</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </Link>
          <Link to="/products?cat=Pods" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#F8BE67] transition-colors">
            <span>Vapes</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </Link>
          <Link to="/products?cat=Disposable+Vapes" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#F8BE67] transition-colors">
            <span>Disposables</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </Link>
          <Link to="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#F8BE67] transition-colors">
            <span>Accessories</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </Link>
          <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:text-[#F8BE67] transition-colors">
            <span>Locations</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
          </Link>
        </div>

        {/* Right Action Icons: Search, User, Cart Bag */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Search icon button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-black hover:text-[#F8BE67] transition-colors p-1"
            title="Search products"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* User Account icon */}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-black hover:text-red-600 transition-colors p-1"
              title="Sign Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <Link
              to="/auth"
              className="text-black hover:text-[#F8BE67] transition-colors p-1"
              title="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          )}

          {/* Shopping Bag with black circular badge */}
          <button
            onClick={toggleCart}
            className="relative p-1 text-black hover:text-[#F8BE67] transition-colors"
            title="Cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-1 text-black"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="container mx-auto max-w-xl flex gap-2">
            <input
              type="text"
              placeholder="Search products, brands (e.g. Caliburn, Crown Bar, Geek Bar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:outline-none focus:border-[#F8BE67]"
            />
            <Button type="submit" className="rounded-full bg-black hover:bg-gray-800 text-white text-xs px-5 font-bold">
              Search
            </Button>
          </form>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-3 shadow-lg">
          <Link
            to="/products"
            className="block text-base font-bold text-black hover:text-[#F8BE67] py-1 border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            New Arrivals
          </Link>
          <Link
            to="/products?cat=E-Liquids"
            className="block text-base font-bold text-black hover:text-[#F8BE67] py-1 border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            E-Liquids
          </Link>
          <Link
            to="/products?cat=Pods"
            className="block text-base font-bold text-black hover:text-[#F8BE67] py-1 border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Vapes
          </Link>
          <Link
            to="/products?cat=Disposable+Vapes"
            className="block text-base font-bold text-black hover:text-[#F8BE67] py-1 border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Disposables
          </Link>
          <Link
            to="/orders"
            className="block text-base font-bold text-black hover:text-[#F8BE67] py-1 border-b border-gray-100"
            onClick={() => setMenuOpen(false)}
          >
            Track Order & Locations
          </Link>
          {!user && (
            <Link
              to="/auth"
              className="block text-base font-bold text-[#F8BE67] py-1"
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
