import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, Product } from "@/lib/store-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Flame, Sparkles, MessageCircle } from "lucide-react";
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
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Flame className="h-8 w-8 text-red-600 animate-pulse" />
          <p className="text-sm text-black font-semibold">Loading vape product specifications...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-10 max-w-6xl bg-white text-black">
      <Button
        variant="ghost"
        className="mb-6 text-xs text-black hover:text-red-600 border border-gray-300 bg-white font-bold"
        size="sm"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Product Image Stage */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 relative shadow-sm flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-contain p-6"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                No Preview Image
              </div>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Sparkles className="h-3 w-3" /> 100% Authentic
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Includes manufacturer scratch verification code on original packaging.</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {product.categories?.name && (
                <Link to={`/products?category=${product.category_id || encodeURIComponent(product.categories.name)}`}>
                  <Badge variant="secondary" className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer font-bold transition-colors">
                    {product.categories.name}
                  </Badge>
                </Link>
              )}
              <span className="text-xs font-mono text-gray-600 font-semibold">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center gap-4 py-2 border-y border-gray-200">
              <span className="text-2xl sm:text-3xl font-black text-black">
                PKR <span className="text-red-600">{Number(product.price).toLocaleString()}</span>
              </span>

              {product.stock > 0 ? (
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold px-2.5 py-1">
                  In Stock ({product.stock} units available)
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs font-bold px-2.5 py-1">
                  Sold Out
                </Badge>
              )}
            </div>

            {/* Description / Vape Specs */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-extrabold text-black text-sm uppercase tracking-wider">
                  Product Overview & Specs
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200 font-medium">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Quantity Controls & Purchase Buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center border border-gray-300 bg-gray-50 rounded-xl overflow-hidden self-start shadow-sm">
                <button
                  className="px-4 py-2.5 text-black hover:bg-gray-200 transition-colors font-bold text-base"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="px-4 py-2.5 font-bold text-black text-sm min-w-[3rem] text-center font-mono">
                  {quantity}
                </span>
                <button
                  className="px-4 py-2.5 text-black hover:bg-gray-200 transition-colors font-bold text-base"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  +
                </button>
              </div>

              <div className="flex gap-2.5 flex-1">
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11 text-sm font-black shadow-sm"
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                >
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 h-11 text-sm font-black bg-black hover:bg-gray-800 text-white shadow-sm"
                  disabled={product.stock <= 0}
                  onClick={handleBuyNow}
                >
                  Instant Checkout
                </Button>
              </div>
            </div>

            {/* WhatsApp Quick Order for this product */}
            <div>
              <a
                href={`https://wa.me/923104703131?text=${encodeURIComponent(`Hello Ash Vapor! I want to order: ${product.name} (PKR ${product.price.toLocaleString()})`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <MessageCircle className="h-4 w-4" /> Order this item on WhatsApp (03104703131)
              </a>
            </div>

            {/* Guarantee badges */}
            <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <ShieldCheck className="h-4 w-4 text-red-600 mb-1" />
                <span className="text-[11px] font-bold text-black">100% Genuine</span>
                <span className="text-[9px] text-gray-600 font-medium">Direct import</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <Truck className="h-4 w-4 text-black mb-1" />
                <span className="text-[11px] font-bold text-black">Same-Day Dispatch</span>
                <span className="text-[9px] text-gray-600 font-medium">COD available</span>
              </div>
              <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                <Flame className="h-4 w-4 text-emerald-600 mb-1" />
                <span className="text-[11px] font-bold text-black">Fresh Stock</span>
                <span className="text-[9px] text-gray-600 font-medium">Leak-proof sealed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
