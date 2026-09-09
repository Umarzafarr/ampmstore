import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, Order } from "@/lib/store-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Clock, ArrowRight } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl bg-white text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-black">
            Track Orders
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium">
            View order status, shipment tracking, and purchase summaries.
          </p>
        </div>

        <Button variant="outline" size="sm" asChild className="border-gray-300 text-black hover:border-red-600 hover:text-red-600 text-xs font-bold bg-white">
          <Link to="/products">
            Continue Shopping <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Filter / Search by Order ID or phone */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Filter by Order ID (e.g. ord-9821), email, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 bg-white border-gray-300 text-black text-xs sm:text-sm focus:border-red-600"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-600 font-medium text-sm">
          Loading order records...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-200 mx-auto flex items-center justify-center text-red-600">
            <Package className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-base text-black">No orders found</h3>
            <p className="text-xs text-gray-600 mt-1">
              {searchQuery ? "No orders match your search query." : "You haven't placed any orders yet."}
            </p>
          </div>
          <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
            <Link to="/products">Explore Vape Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base text-black">
                    #{order.id.slice(0, 8)}
                  </span>
                  <Badge
                    className={
                      order.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-xs font-bold"
                        : order.status === "shipped"
                        ? "bg-blue-50 text-blue-700 border-blue-300 text-xs font-bold"
                        : order.status === "confirmed"
                        ? "bg-purple-50 text-purple-700 border-purple-300 text-xs font-bold"
                        : order.status === "cancelled"
                        ? "bg-red-50 text-red-700 border-red-300 text-xs font-bold"
                        : "bg-amber-50 text-amber-700 border-amber-300 text-xs font-bold"
                    }
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-gray-600 font-medium hidden sm:inline">
                    via {order.payment_method === "online" ? "Online Transfer" : "Cash on Delivery"}
                  </span>
                </div>

                <span className="text-xs text-gray-600 font-semibold flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Order items */}
              <div className="space-y-2">
                {order.order_items?.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-bold text-black">
                      {item.product_name} <span className="text-gray-500 text-xs font-semibold">× {item.quantity}</span>
                    </span>
                    <span className="text-black font-mono font-bold">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-200 pt-3 text-xs">
                <div className="text-gray-700 truncate max-w-sm font-medium">
                  <span className="font-bold text-black">Deliver to: </span>
                  {order.customer_name} ({order.shipping_address})
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-gray-600 font-semibold text-xs">Total:</span>
                  <span className="text-base font-black text-red-600">
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
