import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, CreditCard, Truck, User, UserX, ShieldCheck, Flame, CheckCircle2, ArrowRight } from "lucide-react";
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
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 1200);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          setEmail(session.user.email || "");
          setName(session.user.user_metadata?.full_name || "");
        }
      })
      .catch((e) => {
        console.warn("Auth check error:", e);
      })
      .finally(() => {
        clearTimeout(timer);
        setCheckingAuth(false);
      });

    return () => clearTimeout(timer);
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
      `Hello Ash Vapor! ⚡\n\nI just placed an order on your website:\n` +
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
      <div className="container mx-auto px-4 py-16 max-w-lg bg-white text-black">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 text-center space-y-5 shadow-lg">
          <div className="flex justify-center">
            <div className="bg-black/95 px-5 py-2.5 rounded-2xl border border-zinc-800 shadow-md inline-flex items-center justify-center">
              <img
                src="/logo-badge.png"
                alt="Ash Vapers Logo"
                className="h-14 sm:h-16 w-auto object-contain"
              />
            </div>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Order Confirmed</span>
            <h1 className="text-2xl sm:text-3xl font-black text-black">
              Order #{orderSuccess.id.slice(0, 8)} Received!
            </h1>
            <p className="text-xs sm:text-sm text-gray-700">
              Thank you, <strong className="text-black">{orderSuccess.customerName}</strong>. Your order is queued for our dispatch team.
            </p>
          </div>

          {/* Quick summary box */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Payment Method:</span>
              <span className="font-bold text-black">
                {orderSuccess.paymentMethod === "online" ? "Online Transfer" : "Cash on Delivery (COD)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Shipping To:</span>
              <span className="font-bold text-black truncate max-w-[200px]">{orderSuccess.address}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-700 font-bold">Total:</span>
              <span className="font-black text-red-600 text-sm">PKR {orderSuccess.total.toLocaleString()}</span>
            </div>
          </div>

          {/* WhatsApp Direct Dispatch Button */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/923104703131?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
            >
              💬 Confirm via WhatsApp (03104703131)
            </a>
            <p className="text-[11px] text-gray-600 font-medium">
              Send your order to our packaging department for express same-day dispatch.
            </p>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-xs border-gray-300 text-black hover:border-red-600 font-bold" onClick={() => navigate("/orders")}>
                View My Orders
              </Button>
              <Button variant="ghost" className="flex-1 text-xs text-black hover:text-red-600 font-bold" onClick={() => navigate("/products")}>
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
      <div className="container mx-auto px-4 py-24 text-center max-w-md bg-white text-black">
        <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-200 mx-auto flex items-center justify-center text-red-600 mb-4">
          <Flame className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-black text-black">Your cart is empty</h2>
        <p className="text-xs text-gray-600 mt-2 mb-6 font-medium">
          Add some vape pods or nicotine salts before heading to checkout.
        </p>
        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs" onClick={() => navigate("/products")}>
          Browse Vape Catalog
        </Button>
      </div>
    );
  }

  // Show auth choice if not logged in and hasn't chosen guest
  if (!user && !isGuest && !checkingAuth) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 bg-white text-black">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-black">Checkout Setup</h1>
            <p className="text-xs text-gray-600 font-medium">
              Sign in to save your order to your account, or continue instantly as guest.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-12 text-sm font-bold bg-red-600 hover:bg-red-700 text-white"
              onClick={() => navigate("/auth?redirect=/checkout")}
            >
              <User className="h-4 w-4 mr-2" /> Sign In to Existing Account
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-mono">
                <span className="bg-white px-2 text-gray-500 font-bold">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-sm font-bold border-gray-300 text-black hover:border-red-600 hover:text-red-600"
              onClick={() => setIsGuest(true)}
            >
              <UserX className="h-4 w-4 mr-2 text-red-600" /> Continue as Guest (Fastest)
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4 text-center text-[11px] text-gray-600 font-medium">
            Fast nationwide shipping with Cash on Delivery available for all customers across Pakistan.
          </div>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white text-black">
        <div className="flex flex-col items-center gap-3">
          <Flame className="h-8 w-8 text-red-600 animate-pulse" />
          <p className="text-sm font-semibold text-black">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12 bg-white text-black">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-black">
          Checkout & Shipping
        </h1>
        <p className="text-xs text-gray-700 font-medium">
          Enter your delivery details. All shipments are packed in discreet, tamper-proof packaging.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {/* Order Details Form (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleOrder} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-bold text-black">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmed Khan"
                required
                className="bg-white border-gray-300 text-black text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-bold text-black">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="bg-white border-gray-300 text-black text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-bold text-black">Phone (WhatsApp) *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="03XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-white border-gray-300 text-black text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs font-bold text-black">Complete Shipping Address *</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Apartment #, Street, Phase / Block, City (e.g. Lahore, Karachi, Islamabad)"
                required
                rows={3}
                className="bg-white border-gray-300 text-black text-sm"
              />
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold text-black">Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all text-left ${
                    paymentMethod === "cod"
                      ? "border-red-600 bg-red-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  <Truck className={`h-5 w-5 mt-0.5 ${paymentMethod === "cod" ? "text-red-600" : "text-gray-400"}`} />
                  <div>
                    <p className={`font-bold text-xs ${paymentMethod === "cod" ? "text-red-600" : "text-black"}`}>
                      Cash on Delivery
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5 font-medium">Pay in cash on doorstep</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all text-left ${
                    paymentMethod === "online"
                      ? "border-red-600 bg-red-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 mt-0.5 ${paymentMethod === "online" ? "text-red-600" : "text-gray-400"}`} />
                  <div>
                    <p className={`font-bold text-xs ${paymentMethod === "online" ? "text-red-600" : "text-black"}`}>
                      Online Transfer
                    </p>
                    <p className="text-[10px] text-gray-600 mt-0.5 font-medium">SadaPay / Bank instant</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Online Payment Box */}
            {paymentMethod === "online" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-red-900 uppercase tracking-wider">
                    Bank / SadaPay Details
                  </h3>
                  <span className="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded font-mono font-bold">
                    Direct Transfer
                  </span>
                </div>

                <div className="space-y-1.5 text-xs bg-white p-3 rounded-lg border border-red-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Account Provider:</span>
                    <span className="font-bold text-black">SadaPay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Account / Mobile #:</span>
                    <span className="font-mono font-bold text-red-600">03104703131</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Account Title:</span>
                    <span className="font-bold text-black">Umar Zafar</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1.5">
                    <span className="text-gray-700 font-bold">Amount to send:</span>
                    <span className="font-black text-red-600">PKR {total().toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-black">Upload Transfer Screenshot *</Label>
                  <div className="mt-1.5 space-y-2">
                    {screenshotPreview && (
                      <img
                        src={screenshotPreview}
                        alt="Preview screenshot"
                        className="max-h-40 rounded-lg border border-gray-200 object-contain mx-auto bg-white p-1"
                      />
                    )}
                    <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-red-600 bg-white p-3 transition-colors text-xs text-gray-700 hover:text-black">
                      <Upload className="h-4 w-4 text-red-600" />
                      <span className="font-semibold">{screenshotFile ? screenshotFile.name : "Click to select payment screenshot"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Age Confirmation Checkbox */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <input
                type="checkbox"
                id="age-confirm"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 accent-red-600 h-4 w-4 rounded"
                required
              />
              <label htmlFor="age-confirm" className="cursor-pointer text-gray-700 font-medium leading-snug">
                I confirm that I am at least <strong className="text-black">21 years of age</strong> and legally permitted to purchase electronic nicotine delivery systems in my region.
              </label>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-sm font-black shadow-md" disabled={loading}>
              {loading ? "Confirming Order..." : `Place Order • PKR ${total().toLocaleString()}`}
            </Button>
          </form>
        </div>

        {/* Order Summary Column (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm sticky top-24">
            <h3 className="font-black text-sm text-black uppercase tracking-wider">
              Order Summary ({items.length})
            </h3>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-start text-xs gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-black truncate">{item.name}</p>
                    <p className="text-gray-500 text-[10px] font-semibold">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-red-600 font-bold whitespace-nowrap">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Estimated Shipping</span>
                <span className="text-emerald-700 font-bold">Standard COD</span>
              </div>
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Discreet Stealth Box</span>
                <span className="text-black font-bold">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base text-black pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span className="text-red-600 text-lg font-black">PKR {total().toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-700 space-y-1">
              <div className="flex items-center gap-1 text-black font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
                <span>Buyer Protection</span>
              </div>
              <p className="font-medium">Authenticity verified. Inspect package and test device upon delivery.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
