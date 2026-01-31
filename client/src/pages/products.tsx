import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/header";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import type { Category, ProductWithCategory } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Products() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(searchString);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "");
  const [priceRange, setPriceRange] = useState(searchParams.get("price") || "");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", { category: selectedCategory, search: searchQuery, sort: sortBy, price: priceRange }],
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy) params.set("sort", sortBy);
    if (priceRange) params.set("price", priceRange);
    
    const queryString = params.toString();
    setLocation(queryString ? `/products?${queryString}` : "/products", { replace: true });
  }, [searchQuery, selectedCategory, sortBy, priceRange, setLocation]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("");
    setPriceRange("");
  };

  const hasFilters = searchQuery || selectedCategory || sortBy || priceRange;

  const filteredProducts = products.filter((product) => {
    let matches = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = product.name.toLowerCase().includes(query) || 
                (product.description?.toLowerCase().includes(query) ?? false);
    }
    if (selectedCategory && product.categoryId !== selectedCategory) {
      matches = false;
    }
    if (priceRange) {
      const price = parseFloat(product.price);
      switch (priceRange) {
        case "0-50000":
          matches = matches && price <= 50000;
          break;
        case "50000-100000":
          matches = matches && price > 50000 && price <= 100000;
          break;
        case "100000+":
          matches = matches && price > 100000;
          break;
      }
    }
    return matches;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Mahsulotlar</h1>
          <p className="text-muted-foreground">
            Barcha mahsulotlarni ko'ring va xarid qiling
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Mahsulot qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px]" data-testid="select-category">
              <SelectValue placeholder="Kategoriya" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha kategoriyalar</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange || "all"} onValueChange={(v) => setPriceRange(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[180px]" data-testid="select-price">
              <SelectValue placeholder="Narx oralig'i" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha narxlar</SelectItem>
              <SelectItem value="0-50000">50,000 so'mgacha</SelectItem>
              <SelectItem value="50000-100000">50,000 - 100,000 so'm</SelectItem>
              <SelectItem value="100000+">100,000 so'mdan yuqori</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" data-testid="button-sort">
                <Filter className="h-4 w-4 mr-2" />
                Saralash
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("")}>
                Standart
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price-asc")}>
                Narx: Arzondan qimmotga
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("price-desc")}>
                Narx: Qimmotdan arzonga
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                Nom: A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                Nom: Z-A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} data-testid="button-clear-filters">
              <X className="h-4 w-4 mr-2" />
              Tozalash
            </Button>
          )}
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Qidiruv: {searchQuery}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.id === selectedCategory)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} />
              </Badge>
            )}
            {priceRange && (
              <Badge variant="secondary" className="gap-1">
                {priceRange === "0-50000" ? "50,000 so'mgacha" : 
                 priceRange === "50000-100000" ? "50,000 - 100,000 so'm" : 
                 "100,000 so'mdan yuqori"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange("")} />
              </Badge>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-muted-foreground mb-6" data-testid="text-results-count">
          {filteredProducts.length} ta mahsulot topildi
        </p>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-square" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Mahsulot topilmadi</h3>
              <p className="text-muted-foreground mb-4">
                Qidiruv so'rovingizga mos mahsulot topilmadi
              </p>
              {hasFilters && (
                <Button onClick={clearFilters}>
                  Filtrlarni tozalash
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
