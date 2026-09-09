import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, Product, Category } from "@/lib/store-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Flame, Sparkles, MessageCircle, X } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // Read query params
  const rawCat = searchParams.get("category") || searchParams.get("cat") || "all";
  const rawQuery = searchParams.get("q") || "";

  useEffect(() => {
    if (rawQuery) {
      setSearchQuery(rawQuery);
    }
  }, [rawQuery]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error("Products load error:", err);
      }
    };
    load();
  }, []);

  // Match category by ID or name
  const matchedCategory = useMemo(() => {
    if (!rawCat || rawCat === "all") return null;
    return (
      categories.find(
        (c) =>
          c.id === rawCat ||
          c.name.toLowerCase() === rawCat.toLowerCase() ||
          c.name.toLowerCase().includes(rawCat.toLowerCase())
      ) || null
    );
  }, [categories, rawCat]);

  const activeCatId = matchedCategory ? matchedCategory.id : (rawCat === "all" ? "all" : rawCat);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        activeCatId === "all" ||
        p.category_id === activeCatId ||
        p.category_id === rawCat ||
        (p.categories?.name && p.categories.name.toLowerCase().includes(rawCat.toLowerCase()));

      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.categories?.name && p.categories.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [products, activeCatId, rawCat, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catId === "all") {
      nextParams.delete("category");
      nextParams.delete("cat");
    } else {
      nextParams.set("category", catId);
      nextParams.delete("cat");
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl bg-white text-black">
      {/* Header Banner */}
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
          <Flame className="h-3.5 w-3.5" /> Ash Vapor Official Vape Catalog
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
          {matchedCategory ? matchedCategory.name : "All Vape Pods & Nic Salts"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-700 max-w-2xl font-medium">
          {matchedCategory?.description ||
            "Browse authentic pod systems, rechargeable smart disposables, replacement coils, and imported nic salts at best prices in Pakistan."}
        </p>
      </div>

      {/* Category Pills / Dynamic Tabs from Live DB */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <button
          onClick={() => handleSelectCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
            activeCatId === "all"
              ? "bg-red-600 text-white border-red-600 shadow-sm"
              : "bg-white text-black hover:text-red-600 hover:bg-gray-50 border-gray-300"
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map((c) => {
          const count = products.filter((p) => p.category_id === c.id).length;
          const isActive = activeCatId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleSelectCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-black hover:text-red-600 hover:bg-gray-50 border-gray-300"
              }`}
            >
              {c.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8 bg-gray-50 p-3 rounded-2xl border border-gray-200">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search flavor, brand, pod model (e.g. Caliburn, Xros, Mango)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white border-gray-300 text-black text-xs sm:text-sm focus:border-red-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-3">
          <Select value={activeCatId} onValueChange={handleSelectCategory}>
            <SelectTrigger className="w-full sm:w-[220px] h-10 text-xs sm:text-sm bg-white border-gray-300 text-black font-semibold">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-black">
              <SelectItem value="all">All Categories ({products.length})</SelectItem>
              {categories.map((c) => {
                const count = products.filter((p) => p.category_id === c.id).length;
                return (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Status Bar */}
      <div className="flex items-center justify-between mb-6 text-xs text-gray-700 font-medium">
        <span>
          Showing <strong className="text-black">{filteredProducts.length}</strong> products
          {matchedCategory ? ` in ${matchedCategory.name}` : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </span>
        {(activeCatId !== "all" || searchQuery) && (
          <button
            onClick={handleClearFilters}
            className="text-red-600 hover:underline font-bold flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Reset all filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 max-w-md mx-auto p-8 space-y-4 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-black">
              {matchedCategory
                ? `No products in ${matchedCategory.name} yet`
                : "No matching products found"}
            </h3>
            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
              New shipments arrive weekly. You can ask our team directly on WhatsApp for live stock and custom flavor requests!
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="text-xs w-full sm:w-auto border-gray-300 text-black hover:border-red-600"
            >
              View All Products
            </Button>
            <Button
              asChild
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold w-full sm:w-auto shadow-sm"
            >
              <a
                href="https://wa.me/923104703131?text=Hello%20Ash%20Vapor!%20Do%20you%20have%20stock%20for%20this?"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" /> WhatsApp Us (03104703131)
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
