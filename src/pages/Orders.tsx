import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, Order } from "@/lib/store-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Clock, ArrowRight, Truck } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      (o.phone_number && o.phone_number.includes(q))
    );
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Track Orders
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            View order status, shipment tracking, and purchase summaries.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild className="border-border/80 text-xs">
          <Link to="/products">
            Continue Shopping <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Filter / Search by Order ID or phone */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by Order ID (e.g. ord-9821), email, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-secondary/30 border-border/70 text-xs sm:text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Loading order records...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-dark rounded-2xl border border-border/70 p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-secondary/50 border border-border mx-auto flex items-center justify-center text-muted-foreground">
            <Package className="h-7 w-7 text-primary/60" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? "No orders match your search query." : "You haven't placed any orders yet."}
            </p>
          </div>
          <Button asChild className="btn-glow text-xs">
            <Link to="/products">Explore Vape Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border/70 bg-card/70 backdrop-blur-md p-5 space-y-4 glow-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-bold text-base text-foreground">
                    #{order.id.slice(0, 8)}
                  </span>
                  <Badge
                    className={
                      order.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs"
                        : order.status === "shipped"
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs"
                        : order.status === "confirmed"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
                        : order.status === "cancelled"
                        ? "bg-destructive/20 text-destructive border-destructive/30 text-xs"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs"
                    }
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    via {order.payment_method === "online" ? "Online Transfer" : "Cash on Delivery"}
                  </span>
                </div>

                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Order items */}
              <div className="space-y-2">
                {order.order_items?.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-medium text-foreground">
                      {item.product_name} <span className="text-muted-foreground text-xs font-mono">× {item.quantity}</span>
                    </span>
                    <span className="text-muted-foreground font-mono">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-border/50 pt-3 text-xs">
                <div className="text-muted-foreground truncate max-w-sm">
                  <span className="font-semibold text-foreground">Deliver to: </span>
                  {order.customer_name} ({order.shipping_address})
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto font-display">
                  <span className="text-muted-foreground text-xs">Total:</span>
                  <span className="text-base font-bold text-primary">
                    PKR {Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
