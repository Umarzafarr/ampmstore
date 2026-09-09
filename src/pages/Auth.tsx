import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { verifyAdminCredentials, setAdminLoggedIn } from "@/lib/store-data";
import { ShieldCheck, Flame } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check manager portal admin credentials: admin / admin
    if (isLogin && verifyAdminCredentials(email, password)) {
      setAdminLoggedIn(true);
      toast({ title: "Manager Authenticated", description: "Logged in as Administrator (am/pm)" });
      setLoading(false);
      navigate("/manager");
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: isAdmin } = await supabase.rpc("has_role", {
            _user_id: session.user.id,
            _role: "admin",
          });
          if (isAdmin) setAdminLoggedIn(true);
          toast({ title: "Welcome back!" });
          navigate(isAdmin ? "/manager" : (redirectTo || "/"));
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "You can now sign in." });
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Sign in error", description: err.message || "Invalid credentials. Try admin / admin for manager portal.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Vapor glow circles */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 glass-dark p-8 rounded-2xl border border-border/80 glow-card">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo-transparent.png"
              alt="am/pm Logo"
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.45)]"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
            <Flame className="h-3.5 w-3.5" /> 24/7 Vape Pod Lounge
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {isLogin ? "Sign In to Your Account" : "Create Customer Account"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isLogin ? "Access your saved vape orders and exclusive member drops." : "Join am/pm for fastest checkout and pod restock alerts."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmed Khan"
                required
                className="bg-secondary/40 border-border/70"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email or Username</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin or customer@email.com"
              required
              className="bg-secondary/40 border-border/70"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <span className="text-[11px] text-muted-foreground">
                  Manager: <code className="text-primary font-bold">admin</code> / <code className="text-primary font-bold">admin</code>
                </span>
              )}
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-secondary/40 border-border/70"
            />
          </div>
          <Button type="submit" className="w-full btn-glow h-11 text-base font-semibold" disabled={loading}>
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-muted-foreground space-y-3">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-semibold hover:underline">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80 border-t border-border/50 pt-3">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            <span>Strictly 21+ adults only. Verification applied at checkout.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
