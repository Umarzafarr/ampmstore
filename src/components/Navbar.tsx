import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Shield, Menu, X, Flame } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const refreshData = async () => {
    // Check local admin state
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

  const count = itemCount();

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200" : "bg-white border-b border-gray-200"}`}>
      {/* Top VapeMall-style announcement bar */}
      <div className="bg-red-600 text-white py-1.5 px-3 text-center text-xs font-semibold flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        <a
          href="https://wa.me/923104703131"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-bold text-white hover:underline transition-all"
        >
          <Flame className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
          <span>Order Online or WhatsApp Us: 03104703131</span>
        </a>
        <span className="text-white/60 hidden sm:inline">•</span>
        <span className="hidden sm:inline">⚡ Same-Day Express Dispatch Across Pakistan</span>
        <span className="text-white/60">•</span>
        <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Cash on Delivery</span>
        <span className="text-white/60 hidden md:inline">•</span>
        <span className="hidden md:inline font-bold">21+ Adults Only</span>
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
        {/* Brand Logo - Keep user logo, rename store Ash Vapor */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/logo-transparent.png"
            alt="Ash Vapor"
            className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <div className="flex items-center leading-none">
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-black">
                Ash<span className="text-red-600">Vapor</span>
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-red-100 text-red-600 border border-red-200">
                Shop
              </span>
            </div>
            <span className="text-[10px] tracking-wide text-gray-800 uppercase font-semibold">
              Best Vape Price in Pakistan
            </span>
          </div>
        </Link>

        {/* Desktop Product Links - Pure Black Font */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-bold text-black hover:text-red-600 transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-bold text-black hover:text-red-600 transition-colors">
            All Vapes
          </Link>
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="text-sm font-bold text-black hover:text-red-600 transition-colors whitespace-nowrap"
            >
              {c.name}
            </Link>
          ))}
          <Link to="/orders" className="text-sm font-bold text-black hover:text-red-600 transition-colors">
            Track Order
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCart}
            className="relative border-gray-300 hover:border-red-600 hover:text-red-600 text-black font-bold h-10 px-3 bg-gray-50 flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4 text-black" />
            <span className="text-xs hidden sm:inline text-black font-bold">Cart</span>
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </Button>

          {user ? (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-700 hover:text-red-600 h-9 w-9" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="border-gray-300 text-black hover:border-red-600 hover:text-red-600 font-bold text-xs h-10 px-3 hidden sm:inline-flex bg-white" asChild>
              <Link to="/auth">
                <User className="h-3.5 w-3.5 mr-1 text-red-600" /> Sign In
              </Link>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button variant="outline" size="icon" className="md:hidden h-10 w-10 border-gray-300 text-black" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3 shadow-lg">
          <Link to="/" className="block text-sm font-bold text-black hover:text-red-600 py-1" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="block text-sm font-bold text-black hover:text-red-600 py-1" onClick={() => setMenuOpen(false)}>
            All Vapes
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="block text-sm font-bold text-black hover:text-red-600 py-1"
              onClick={() => setMenuOpen(false)}
            >
              {c.name}
            </Link>
          ))}
          <Link to="/orders" className="block text-sm font-bold text-black hover:text-red-600 py-1" onClick={() => setMenuOpen(false)}>
            Track Order
          </Link>
          {!user && (
            <Link to="/auth" className="block text-sm font-bold text-red-600 py-1" onClick={() => setMenuOpen(false)}>
              Customer Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
