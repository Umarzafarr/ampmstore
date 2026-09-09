import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, CreditCard, Truck, User, UserX, ShieldCheck, Flame, CheckCircle2 } from "lucide-react";
import { addOrder } from "@/lib/store-data";

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setEmail(session.user.email || "");
        setName(session.user.user_metadata?.full_name || "");
      }
      setCheckingAuth(false);
    });
  }, []);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      toast({ title: "Please fill all required shipping fields", variant: "destructive" });
      return;
    }
    if (!ageConfirmed) {
      toast({ title: "Age confirmation required", description: "You must be 21 or older to order vape products.", variant: "destructive" });
      return;
    }
    if (paymentMethod === "online" && !screenshotPreview && !screenshotFile) {
      toast({ title: "Payment screenshot required", description: "Please upload proof of transfer for SadaPay.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let screenshotUrl: string | null = screenshotPreview;

      // Attempt Supabase storage upload if reachable
      if (paymentMethod === "online" && screenshotFile) {
        try {
          const ext = screenshotFile.name.split(".").pop();
          const filePath = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("payment-screenshots")
            .upload(filePath, screenshotFile);
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from("payment-screenshots")
              .getPublicUrl(filePath);
            if (urlData?.publicUrl) screenshotUrl = urlData.publicUrl;
          }
        } catch {
          // fallback to base64 preview
        }
      }

      // Record order into resilient store-data
      const orderItems = items.map((item) => ({
        id: `item-${crypto.randomUUID().slice(0, 6)}`,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      const createdOrder = await addOrder({
        user_id: user?.id || null,
        customer_name: name,
        customer_email: email,
        phone_number: phone,
        shipping_address: address,
        total_amount: total(),
        status: "pending",
        payment_method: paymentMethod,
        payment_screenshot_url: screenshotUrl,
        order_items: orderItems,
      });

      // Background attempt to invoke Supabase Edge functions if available
      try {
        if (!user) {
          await supabase.functions.invoke("place-guest-order", {
            body: {
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
              address,
              paymentMethod,
              paymentScreenshotUrl: screenshotUrl,
              items: items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, sku: i.sku })),
              totalAmount: total(),
            },
          });
        }
        await supabase.functions.invoke("send-order-email", {
          body: {
            orderId: createdOrder.id,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            items,
            total: total(),
            address,
            paymentMethod,
            paymentScreenshotUrl: screenshotUrl,
          },
        });
      } catch {
        // silent fallback
      }

      setOrderSuccess({
        id: createdOrder.id,
        customerName: name,
        phone,
        address,
        total: total(),
        paymentMethod,
        items: [...items],
      });
      clearCart();
      toast({
        title: "Order Placed! 🛒",
        description: `Order #${createdOrder.id.slice(0, 8)} recorded.`,
      });
    } catch (err: any) {
      toast({ title: "Order error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // If order was placed successfully
  if (orderSuccess) {
    const whatsappMsg = encodeURIComponent(
      `Hello am/pm Vape Store! ⚡\n\nI just placed an order on your website:\n` +
      `📦 Order ID: #${orderSuccess.id.slice(0, 8)}\n` +
      `👤 Name: ${orderSuccess.customerName}\n` +
      `📞 Phone: ${orderSuccess.phone}\n` +
      `📍 Delivery Address: ${orderSuccess.address}\n` +
      `💳 Payment Method: ${orderSuccess.paymentMethod === "online" ? "Online Transfer" : "Cash on Delivery"}\n` +
      `💰 Total: PKR ${orderSuccess.total.toLocaleString()}\n\n` +
      `Items:\n` +
      orderSuccess.items.map((it: any) => `• ${it.name} (x${it.quantity})`).join("\n") +
      `\n\nPlease confirm dispatch!`
    );

    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <div className="glass-dark rounded-3xl border border-border/80 p-6 sm:p-8 text-center space-y-5 glow-card">
          <div className="flex justify-center">
            <img
              src="/logo-transparent.png"
              alt="am/pm Logo"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            />
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Order Confirmed</span>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
              Order #{orderSuccess.id.slice(0, 8)} Received!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Thank you, <strong className="text-foreground">{orderSuccess.customerName}</strong>. Your order is queued for our dispatch team.
            </p>
          </div>

          {/* Quick summary box */}
          <div className="bg-secondary/30 rounded-2xl p-4 border border-border/50 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <span className="font-semibold text-foreground">
                {orderSuccess.paymentMethod === "online" ? "Online Transfer" : "Cash on Delivery (COD)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping To:</span>
              <span className="font-semibold text-foreground truncate max-w-[200px]">{orderSuccess.address}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2 font-display">
              <span className="text-muted-foreground font-semibold">Total:</span>
              <span className="font-bold text-primary text-sm">PKR {orderSuccess.total.toLocaleString()}</span>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Button */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/923104703131?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all"
            >
              💬 Confirm via WhatsApp (03104703131)
            </a>
            <p className="text-[11px] text-muted-foreground">
              Send your order to our packaging department for express same-day dispatch.
            </p>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs border-border/70" onClick={() => navigate("/orders")}>
                View My Orders
              </Button>
              <Button variant="ghost" className="flex-1 text-xs" onClick={() => navigate("/products")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-secondary/50 border border-border mx-auto flex items-center justify-center text-muted-foreground mb-4">
          <Flame className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground mt-2 mb-6">
          Add some vape pods or nicotine salts before heading to checkout.
        </p>
        <Button className="btn-glow text-xs" onClick={() => navigate("/products")}>
          Browse Vape Catalog
        </Button>
      </div>
    );
  }

  // Show auth choice if not logged in and hasn't chosen guest
  if (!user && !isGuest && !checkingAuth) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <div className="glass-dark p-8 rounded-2xl border border-border/80 glow-card space-y-6">
          <div className="text-center space-y-1">
            <h1 className="font-display text-2xl font-black text-foreground">Checkout Setup</h1>
            <p className="text-xs text-muted-foreground">
              Sign in to save your order to your account, or continue instantly as guest.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-12 text-sm font-semibold btn-glow"
              onClick={() => navigate("/auth?redirect=/checkout")}
            >
              <User className="h-4 w-4 mr-2" /> Sign In to Existing Account
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-sm font-semibold border-border/80 hover:border-primary/50"
              onClick={() => setIsGuest(true)}
            >
              <UserX className="h-4 w-4 mr-2 text-accent" /> Continue as Guest (Fastest)
            </Button>
          </div>

          <div className="border-t border-border/50 pt-4 text-center text-[11px] text-muted-foreground">
            Fast nationwide shipping with Cash on Delivery available for all customers.
          </div>
        </div>
      </div>
    );
  }

  if (checkingAuth) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-6 space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
          Checkout & Shipping
        </h1>
        <p className="text-xs text-muted-foreground">
          Enter your delivery details. All shipments are packed in discreet, tamper-proof packaging.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Order Details Form (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleOrder} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Khan"
                required
                className="bg-secondary/40 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="bg-secondary/40 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Phone (WhatsApp) *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-secondary/40 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs">Complete Shipping Address *</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Apartment #, Street, Phase / Block, City (e.g. Lahore, Karachi, Islamabad)"
                required
                rows={3}
                className="bg-secondary/40 text-sm"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs">Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all text-left ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/10 shadow-lg glow-card"
                      : "border-border/70 hover:border-muted-foreground bg-secondary/20"
                  }`}
                >
                  <Truck className={`h-5 w-5 mt-0.5 ${paymentMethod === "cod" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-bold text-xs text-foreground">Cash on Delivery</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Pay in cash on doorstep</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all text-left ${
                    paymentMethod === "online"
                      ? "border-primary bg-primary/10 shadow-lg glow-card"
                      : "border-border/70 hover:border-muted-foreground bg-secondary/20"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 mt-0.5 ${paymentMethod === "online" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-bold text-xs text-foreground">Online Transfer</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">SadaPay / Bank instant</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Online Payment Box */}
            {paymentMethod === "online" && (
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3.5 glow-card">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Bank / SadaPay Details
                  </h3>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-mono font-bold">
                    Direct Transfer
                  </span>
                </div>

                <div className="space-y-1.5 text-xs bg-card/60 p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Provider:</span>
                    <span className="font-bold text-foreground">SadaPay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account / IBAN:</span>
                    <span className="font-mono font-bold text-accent">03104703131</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Title:</span>
                    <span className="font-bold text-foreground">Umar Zafar</span>
                  </div>
                  <div className="flex justify-between border-t border-border/40 pt-1.5 font-display">
                    <span className="text-muted-foreground">Amount to send:</span>
                    <span className="font-bold text-primary">PKR {total().toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Upload Transfer Screenshot *</Label>
                  <div className="mt-1.5 space-y-2">
                    {screenshotPreview && (
                      <img
                        src={screenshotPreview}
                        alt="Preview screenshot"
                        className="max-h-40 rounded-lg border border-border object-contain mx-auto bg-black/40"
                      />
                    )}
                    <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-border/80 hover:border-primary p-3 transition-colors text-xs text-muted-foreground hover:text-foreground">
                      <Upload className="h-4 w-4 text-primary" />
                      <span>{screenshotFile ? screenshotFile.name : "Click to select payment screenshot"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Age Confirmation Checkbox */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs">
              <input
                type="checkbox"
                id="age-confirm"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-primary h-4 w-4 rounded"
                required
              />
              <label htmlFor="age-confirm" className="cursor-pointer text-muted-foreground leading-snug">
                I confirm that I am at least <strong>21 years of age</strong> and legally permitted to purchase electronic nicotine delivery systems in my region.
              </label>
            </div>

            <Button type="submit" className="w-full btn-glow h-12 text-sm font-bold" disabled={loading}>
              {loading ? "Confirming Order..." : `Place Order • PKR ${total().toLocaleString()}`}
            </Button>
          </form>
        </div>

        {/* Order Summary Column (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card/70 glass-dark p-5 space-y-4 glow-card sticky top-24">
            <h3 className="font-display font-bold text-sm text-foreground uppercase tracking-wider">
              Order Summary ({items.length})
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-border/40">
              {items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-start text-xs gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-muted-foreground text-[10px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-primary font-bold whitespace-nowrap">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="text-emerald-400 font-semibold">Standard COD</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Discreet Stealth Box</span>
                <span className="text-foreground">Free</span>
              </div>
              <div className="flex justify-between font-display font-bold text-base text-foreground pt-2 border-t border-border/60">
                <span>Total Amount</span>
                <span className="text-primary text-lg">PKR {total().toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1 text-foreground font-semibold">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                <span>Buyer Protection</span>
              </div>
              <p>Authenticity verified. Inspect package and test device upon delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
