import { ShoppingCart, Zap, Check } from "lucide-react";
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
}

export default function ProductCard({ id, name, price, sku, image_url, stock, categories }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAdd = () => {
    addItem({ id, name, price, image_url: image_url || null, sku });
    toast({ title: "Added to Cart", description: `${name} (PKR ${price.toLocaleString()})` });
  };

  const handleBuyNow = () => {
    addItem({ id, name, price, image_url: image_url || null, sku });
    navigate("/checkout");
  };

  return (
    <div
      className="group card-hover rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md overflow-hidden glow-card cursor-pointer flex flex-col justify-between"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="aspect-square overflow-hidden bg-secondary/40 relative">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}

        {/* Badges on image */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {categories?.name && (
            <span className="bg-background/80 backdrop-blur-md text-[10px] font-semibold text-foreground px-2 py-0.5 rounded-md border border-border/50">
              {categories.name}
            </span>
          )}
          {stock <= 3 && stock > 0 && (
            <span className="bg-destructive/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Only {stock} left!
            </span>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <span className="bg-primary/20 backdrop-blur-md text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-primary/30 flex items-center gap-0.5">
            <Check className="h-2.5 w-2.5" /> 100% Genuine
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-foreground truncate text-xs sm:text-sm group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">SKU: {sku}</p>
        </div>

        <div className="pt-1">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-sm sm:text-base font-display font-black text-foreground">
                PKR <span className="text-primary">{price.toLocaleString()}</span>
              </span>
            </div>
            {stock > 0 ? (
              <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                In Stock
              </span>
            ) : (
              <span className="text-[9px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                Sold Out
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
            <Button
              className="flex-1 btn-glow text-xs h-8 sm:h-8.5 font-semibold"
              size="sm"
              disabled={stock <= 0}
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
            >
              <ShoppingCart className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" /> Add
            </Button>
            <Button
              variant="secondary"
              className="flex-1 text-xs h-8 sm:h-8.5 bg-secondary/70 hover:bg-secondary border border-border/60"
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
