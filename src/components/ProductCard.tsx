import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  sku: string;
  image_url?: string | null;
  stock: number;
  categories?: { name: string } | null;
  dark?: boolean;
}

export default function ProductCard({ id, name, price, sku, image_url, stock, categories, dark = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdd = () => {
    const numericPrice = Number(price) || 0;
    addItem({ id, name, price: numericPrice, image_url: image_url || null, sku });
    toast({ title: "Added to Cart", description: `${name} (PKR ${numericPrice.toLocaleString()})` });
  };

  const handleBuyNow = () => {
    addItem({ id, name, price, image_url: image_url || null, sku });
    navigate("/checkout");
  };

  if (dark) {
    return (
      <div
        className="group card-hover rounded-xl border border-neutral-900 bg-[#0a0a0a] overflow-hidden shadow-md hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:border-red-600/80 cursor-pointer flex flex-col justify-between transition-all duration-300"
        onClick={() => navigate(`/product/${id}`)}
      >
        <div className="aspect-square overflow-hidden bg-black relative border-b border-neutral-900 flex items-center justify-center p-4">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-600 font-semibold text-xs">
              No Image
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {categories?.name && (
              <span className="bg-black/90 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-sm border border-neutral-800">
                {categories.name}
              </span>
            )}
            {stock <= 3 && stock > 0 && (
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-[0_0_12px_rgba(239,68,68,0.6)]">
                Only {stock} left!
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <span className="bg-emerald-950/70 text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-800/70 flex items-center gap-0.5 shadow-sm">
              <Check className="h-2.5 w-2.5" /> Authentic
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white line-clamp-2 text-xs sm:text-sm group-hover:text-yellow-400 transition-colors leading-snug">
              {name}
            </h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 font-semibold">SKU: {sku}</p>
          </div>

          <div className="pt-1">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-zinc-400 mr-1">PKR</span>
                <span className="text-base sm:text-lg font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.35)]">
                  {(Number(price) || 0).toLocaleString()}
                </span>
              </div>
              {stock > 0 ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                  In Stock
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-800/60 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  Sold Out
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs h-9 font-black rounded shadow-[0_0_15px_rgba(239,68,68,0.45)] hover:shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all"
                size="sm"
                disabled={stock <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs h-9 bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-400 font-black rounded shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all"
                size="sm"
                disabled={stock <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuyNow();
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Light theme (used everywhere else)
  return (
    <div
      className="group card-hover rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-red-600 cursor-pointer flex flex-col justify-between transition-all duration-200"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="aspect-square overflow-hidden bg-gray-50 relative border-b border-gray-100 flex items-center justify-center p-3">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 font-semibold text-xs">
            No Image
          </div>
        )}

        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {categories?.name && (
            <span className="bg-white/95 text-[10px] font-bold text-black px-2 py-0.5 rounded shadow-sm border border-gray-200">
              {categories.name}
            </span>
          )}
          {stock <= 3 && stock > 0 && (
            <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
              Only {stock} left!
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5">
            <Check className="h-2.5 w-2.5" /> Authentic
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-black line-clamp-2 text-xs sm:text-sm group-hover:text-red-600 transition-colors leading-snug">
            {name}
          </h3>
          <p className="text-[10px] text-gray-600 font-mono mt-0.5 font-semibold">SKU: {sku}</p>
        </div>

        <div className="pt-1">
          <div className="flex items-baseline justify-between mb-2.5">
            <div>
              <span className="text-xs font-bold text-gray-700 mr-1">PKR</span>
              <span className="text-base sm:text-lg font-black text-black">
                {(Number(price) || 0).toLocaleString()}
              </span>
            </div>
            {stock > 0 ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                In Stock
              </span>
            ) : (
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                Sold Out
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs h-8 sm:h-9 font-bold rounded shadow-sm"
              size="sm"
              disabled={stock <= 0}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs h-8 sm:h-9 bg-black hover:bg-gray-800 text-white border-black font-bold rounded shadow-sm"
              size="sm"
              disabled={stock <= 0}
              onClick={(e) => {
                e.stopPropagation();
                handleBuyNow();
              }}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
