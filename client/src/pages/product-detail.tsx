import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Plus, Minus, ArrowLeft, Package, Truck, Shield } from "lucide-react";
import type { ProductWithCategory } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery<ProductWithCategory>({
    queryKey: ["/api/products", id],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", { productId: id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Savatchaga qo'shildi",
        description: `${product?.name} savatchaga qo'shildi`,
      });
      setQuantity(1);
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Mahsulotni qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user || !token) {
      toast({
        title: "Kirish talab qilinadi",
        description: "Savatchaga qo'shish uchun tizimga kiring",
        variant: "destructive",
      });
      return;
    }
    addToCartMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Mahsulot topilmadi</h1>
          <p className="text-muted-foreground mb-8">
            Kechirasiz, bu mahsulot mavjud emas
          </p>
          <Link href="/products">
            <Button>Mahsulotlarga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const price = parseFloat(product.price);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/products">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Mahsulotlarga qaytish
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Mavjud emas
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            
            <h1 className="text-3xl font-bold" data-testid="text-product-name">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary" data-testid="text-product-price">
                {price.toLocaleString("uz-UZ")} so'm
              </span>
              <span className="text-muted-foreground">/{product.unit}</span>
            </div>

            {product.description && (
              <p className="text-muted-foreground text-lg" data-testid="text-product-description">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span className={inStock ? "text-green-600" : "text-red-600"}>
                {inStock ? `Mavjud: ${product.stock} ${product.unit}` : "Mavjud emas"}
              </span>
            </div>

            {inStock && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 py-2 min-w-[3rem] text-center text-lg" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    data-testid="button-increase"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Savatchaga qo'shish
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Truck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Bepul yetkazish</p>
                    <p className="text-xs text-muted-foreground">24 soat ichida</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Sifat kafolati</p>
                    <p className="text-xs text-muted-foreground">100% toza</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Qaytarish</p>
                    <p className="text-xs text-muted-foreground">3 kun ichida</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
