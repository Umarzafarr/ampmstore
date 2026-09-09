import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Shield, Menu, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isAdminLoggedIn, setAdminLoggedIn } from "@/lib/store-data";

export default function Navbar() {
  const { toggleCart, itemCount } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const refreshAuth = async () => {
    // Check local admin state
    if (isAdminLoggedIn()) {
      setIsAdmin(true);
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
    refreshAuth();
    const interval = setInterval(refreshAuth, 2000);
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
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-xl border-b border-border/70" : "bg-background/80 backdrop-blur-md border-b border-border/40"}`}>
      {/* Top micro bar for age disclaimer & shipping */}
      <div className="bg-primary/10 border-b border-primary/20 py-1 px-3 text-center text-[10px] sm:text-xs font-medium text-foreground/80 flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1 font-bold text-primary">
          <Flame className="h-3 w-3 text-primary animate-pulse" /> 21+ ADULTS ONLY
        </span>
        <span className="hidden sm:inline text-muted-foreground">•</span>
        <span className="hidden sm:inline text-muted-foreground">Authentic Pods & Nic Salts</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-foreground">⚡ Same-Day Dispatch Across Pakistan</span>
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/logo-transparent.png"
            alt="am/pm Vape Pod Store"
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(139,92,246,0.35)]"
          />
          <div className="flex flex-col">
            <div className="flex items-center leading-none">
              <span className="font-display text-lg sm:text-xl font-black tracking-tight text-foreground">
                am<span className="text-primary font-light">/</span>pm
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
                Vape
              </span>
            </div>
            <span className="text-[9px] tracking-wider text-muted-foreground uppercase font-sans font-medium">
              Same Energy • Different Hours
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="story-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <span>Home</span>
          </Link>
          <Link to="/products" className="story-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <span>Pods & Salts</span>
          </Link>
          <Link to="/orders" className="story-link text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <span>Track Order</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cart button */}
          <Button variant="ghost" size="icon" onClick={toggleCart} className="relative hover:text-primary hover-scale h-9 w-9 sm:h-10 sm:w-10 border border-border/50 bg-secondary/30">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary text-[9px] sm:text-[11px] font-bold text-white glow-purple">
                {count}
              </span>
            )}
          </Button>

          {/* Manager portal badge button */}
          <Button
            variant={isAdmin ? "default" : "outline"}
            size="sm"
            asChild
            className={`h-9 px-2.5 text-xs font-semibold ${
              isAdmin
                ? "bg-primary text-primary-foreground btn-glow border-none"
                : "border-border/60 hover:border-primary/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link to="/admin" title="Manager Portal">
              <Shield className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">{isAdmin ? "Manager Portal" : "Manager"}</span>
            </Link>
          </Button>

          {user || isAdmin ? (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:text-destructive hover-scale h-9 w-9" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" className="bg-secondary hover:bg-secondary/80 text-foreground border border-border/70 text-xs h-9 px-3 hidden sm:inline-flex" asChild>
              <Link to="/auth">
                <User className="h-3.5 w-3.5 mr-1 text-primary" /> Sign In
              </Link>
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 border border-border/50" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-border px-4 py-4 space-y-3 animate-fade-in">
          <Link to="/" className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/products" className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>
            Pods & Salts
          </Link>
          <Link to="/orders" className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>
            Track Order
          </Link>
          <Link to="/admin" className="block text-sm font-medium text-primary hover:underline" onClick={() => setMenuOpen(false)}>
            Manager Portal ({isAdmin ? "Logged In" : "Sign In"})
          </Link>
          {!user && !isAdmin && (
            <Link to="/auth" className="block text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(false)}>
              Customer Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
