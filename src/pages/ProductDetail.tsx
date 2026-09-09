import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, Product } from "@/lib/store-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Flame, Sparkles, Check } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    getProductById(id).then((data) => {
      if (!data) {
        navigate("/products");
      } else {
        setProduct(data);
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || null,
        sku: product.sku,
      });
    }
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} (PKR ${(product.price * quantity).toLocaleString()})`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || null,
        sku: product.sku,
      });
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Flame className="h-8 w-8 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading vape product specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6 text-xs text-muted-foreground hover:text-foreground border border-border/50 bg-secondary/20"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Product Image Stage */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden border border-border/80 bg-card/70 glass-dark relative glow-card flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No Preview Image
              </div>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="bg-primary/20 backdrop-blur-md text-primary text-xs font-bold px-2.5 py-1 rounded-lg border border-primary/40 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Authentic Guaranteed
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Includes manufacturer scratch verification code on box packaging.</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {product.categories?.name && (
                <Badge variant="secondary" className="bg-secondary/70 text-foreground border-border">
                  {product.categories.name}
                </Badge>
              )}
              <span className="text-xs font-mono text-muted-foreground">SKU: {product.sku}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center gap-4 py-2 border-y border-border/50">
              <span className="text-2xl sm:text-3xl font-display font-black text-foreground">
                PKR <span className="text-primary">{Number(product.price).toLocaleString()}</span>
              </span>

              {product.stock > 0 ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
                  In Stock ({product.stock} units available)
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-1">
                  Sold Out
                </Badge>
              )}
            </div>

            {/* Description / Vape Specs */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  Product Overview & Specs
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line bg-secondary/20 p-4 rounded-xl border border-border/40">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Quantity Controls & Purchase Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center border border-border/80 bg-secondary/40 rounded-xl overflow-hidden self-start">
                <button
                  className="px-3.5 py-2.5 text-foreground hover:bg-secondary transition-colors font-bold"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="px-4 py-2.5 font-bold text-foreground text-sm min-w-[3rem] text-center font-mono">
                  {quantity}
                </span>
                <button
                  className="px-3.5 py-2.5 text-foreground hover:bg-secondary transition-colors font-bold"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>

              <div className="flex gap-2.5 flex-1">
                <Button
                  className="flex-1 btn-glow h-11 text-sm font-bold"
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 h-11 text-sm font-bold bg-secondary hover:bg-secondary/80 border border-border/70"
                  disabled={product.stock <= 0}
                  onClick={handleBuyNow}
                >
                  Instant Checkout
                </Button>
              </div>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-border/50">
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-secondary/20 border border-border/40">
                <ShieldCheck className="h-4 w-4 text-primary mb-1" />
                <span className="text-[11px] font-bold text-foreground">100% Genuine</span>
                <span className="text-[9px] text-muted-foreground">Direct import</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-secondary/20 border border-border/40">
                <Truck className="h-4 w-4 text-accent mb-1" />
                <span className="text-[11px] font-bold text-foreground">Same-Day Dispatch</span>
                <span className="text-[9px] text-muted-foreground">COD available</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-secondary/20 border border-border/40">
                <Flame className="h-4 w-4 text-emerald-400 mb-1" />
                <span className="text-[11px] font-bold text-foreground">Fresh Stock</span>
                <span className="text-[9px] text-muted-foreground">Leak-proof sealed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
