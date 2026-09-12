import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useNavigate } from "react-router-dom";

export default function CartSidebar() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const navigate = useNavigate();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex flex-col bg-white border-l border-gray-200 w-full sm:max-w-md p-6 text-black shadow-2xl">
        <SheetHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-black text-black flex items-center gap-2.5">
              <div className="bg-black/95 px-2 py-0.5 rounded-lg border border-zinc-800 flex items-center shadow-sm">
                <img src="/logo-badge.png" alt="Ash Vapers" className="h-6 w-auto object-contain" />
              </div>
              <span>Ash<span className="text-red-600">Vapor</span> Cart</span>
            </SheetTitle>
            <span className="text-xs text-gray-700 font-bold">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500">
              <ShoppingBag className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-base font-bold text-black">Your Vape Cart is Empty</p>
              <p className="text-xs text-gray-600 mt-1 max-w-xs font-medium">
                Explore our selection of genuine pod systems, smart disposables, and nicotine salts.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              onClick={() => {
                setOpen(false);
                navigate("/products");
              }}
            >
              Browse Vape Catalog
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-contain border border-gray-200 shrink-0 bg-white p-1"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-xs shrink-0 font-semibold">
                      No img
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-black truncate">{item.name}</p>
                      <p className="text-xs font-black text-red-600 mt-0.5">
                        PKR {(Number(item.price) || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 border border-gray-300 bg-white rounded-md px-1 py-0.5 shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-gray-100 text-black font-bold"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </Button>
                        <span className="text-xs font-bold w-5 text-center font-mono text-black">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-gray-100 text-black font-bold"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:bg-red-50"
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
            <div className="border-t border-gray-200 pt-4 space-y-3.5 bg-white">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-700 font-medium">
                  <span>Shipping Across Pakistan</span>
                  <span className="text-emerald-700 font-bold">Standard COD</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-1 border-t border-gray-200">
                  <span>Subtotal</span>
                  <span className="text-red-600 text-lg font-black">PKR {(Number(total()) || 0).toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white h-11 text-sm font-black flex items-center justify-center gap-2 shadow-sm"
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
                className="w-full text-xs text-gray-600 hover:text-red-600 font-bold"
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
