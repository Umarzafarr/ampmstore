import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Flame } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useNavigate } from "react-router-dom";

export default function CartSidebar() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col bg-card/95 backdrop-blur-2xl border-l border-border/80 w-full sm:max-w-md p-6">
        <SheetHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-lg font-black text-foreground flex items-center gap-2.5">
              <img src="/logo-transparent.png" alt="am/pm" className="h-6 w-auto object-contain" />
              <span>am<span className="text-primary font-light">/</span>pm Vape Cart</span>
            </SheetTitle>
            <span className="text-xs text-muted-foreground font-mono">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-secondary/50 border border-border/70 flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-8 w-8 text-primary/60" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">Your Vape Cart is Empty</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Explore our selection of premium pod systems, disposables, and nicotine salts.
              </p>
            </div>
            <Button
              size="sm"
              className="btn-glow text-xs"
              onClick={() => {
                setOpen(false);
                navigate("/products");
              }}
            >
              Browse Vape Pods
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border/70 bg-secondary/30 p-3 glow-card"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover border border-border shrink-0 bg-muted"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground text-xs shrink-0">
                      No img
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs font-bold text-primary font-display mt-0.5">
                        PKR {item.price.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5 border border-border/70 bg-background/60 rounded-md px-1 py-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-secondary text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="text-xs font-bold w-5 text-center font-mono">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-secondary text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/15"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Summary */}
            <div className="border-t border-border/80 pt-4 space-y-3.5 bg-card/60">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Across Pakistan</span>
                  <span className="text-emerald-400 font-semibold">Standard COD</span>
                </div>
                <div className="flex justify-between text-base font-display font-bold text-foreground pt-1 border-t border-border/40">
                  <span>Subtotal</span>
                  <span className="text-primary text-lg">PKR {total().toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full btn-glow h-11 text-sm font-bold flex items-center justify-center gap-2"
                onClick={() => {
                  setOpen(false);
                  navigate("/checkout");
                }}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
