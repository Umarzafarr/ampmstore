import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories, Product, Category } from "@/lib/store-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Flame, Sparkles } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get("category") || searchParams.get("cat") || "all";

  useEffect(() => {
    getCategories().then(setCategories);
    getProducts().then(setProducts);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        catParam === "all" ||
        p.category_id === catParam ||
        (p.categories?.name && p.categories.name.toLowerCase().includes(catParam.toLowerCase())) ||
        (categories.find(c => c.name.toLowerCase().includes(catParam.toLowerCase()))?.id === p.category_id);

      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, catParam, searchQuery, categories]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      {/* Header Banner */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
          <Flame className="h-3.5 w-3.5" /> am/pm Full Vape Catalog
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-black text-foreground tracking-tight">
          Vape Pods, Devices & E-Liquids
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Browse authentic refillable pod systems, high-puff smart disposables, replacement mesh pods, and 30ml nicotine salts.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-8 bg-secondary/30 p-3 rounded-2xl border border-border/60">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by pod model, flavor, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-background/50 border-border text-xs sm:text-sm"
          />
        </div>

        {/* Category Select */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedCategory}
            onValueChange={(v) => setSearchParams(v === "all" ? {} : { category: v })}
          >
            <SelectTrigger className="w-full sm:w-[220px] h-10 text-xs sm:text-sm bg-background/50 border-border">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
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

      {/* Products Counter */}
      <div className="flex items-center justify-between mb-6 text-xs text-muted-foreground">
        <span>Showing <strong className="text-foreground">{filteredProducts.length}</strong> authentic products</span>
        {selectedCategory !== "all" && (
          <button
            onClick={() => setSearchParams({})}
            className="text-primary hover:underline font-semibold"
          >
            Clear category filter
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 glass-dark rounded-2xl border border-border/60">
          <Sparkles className="mx-auto h-12 w-12 text-primary opacity-40 mb-3" />
          <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            We couldn't find any products matching your search. Try adjusting keywords or category filters.
          </p>
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
