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
      toast({ title: "Manager Authenticated", description: "Logged in as Administrator (Ash Vapor)" });
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
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 bg-white text-black">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo-transparent.png"
              alt="Ash Vapor Logo"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
            <Flame className="h-3.5 w-3.5" /> Ash Vapor Pakistan
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
            {isLogin ? "Sign In to Your Account" : "Create Customer Account"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 font-medium">
            {isLogin ? "Access your saved vape orders and track shipments." : "Join Ash Vapor for fastest checkout and stock updates."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-black">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ahmed Khan"
                required
                className="bg-white border-gray-300 text-black text-sm"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-black">Email or Username</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin or customer@email.com"
              required
              className="bg-white border-gray-300 text-black text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-bold text-black">Password</Label>
              {isLogin && (
                <span className="text-[11px] text-gray-600 font-medium">
                  Manager: <code className="text-red-600 font-bold">admin</code> / <code className="text-red-600 font-bold">admin</code>
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
              className="bg-white border-gray-300 text-black text-sm"
            />
          </div>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-base font-bold shadow-sm" disabled={loading}>
            {loading ? "Authenticating..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-700 space-y-3 font-medium">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-red-600 font-bold hover:underline">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-600 border-t border-gray-200 pt-3">
            <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
            <span>Strictly 21+ adults only. Delivery across all cities of Pakistan.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
