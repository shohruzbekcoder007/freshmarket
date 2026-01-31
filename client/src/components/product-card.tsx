import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { ProductWithCategory } from "@shared/schema";

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/cart", { productId: product.id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Savatchaga qo'shildi",
        description: `${product.name} savatchaga qo'shildi`,
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

  const inStock = product.stock > 0;
  const price = parseFloat(product.price);

  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-200" data-testid={`card-product-${product.id}`}>
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative overflow-hidden bg-muted cursor-pointer">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="secondary">Mavjud emas</Badge>
            </div>
          )}
          {product.category && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              {product.category.name}
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg truncate cursor-pointer hover:text-primary transition-colors" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            {price.toLocaleString("uz-UZ")} so'm
          </span>
          <span className="text-sm text-muted-foreground">
            /{product.unit}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {inStock ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid={`button-decrease-${product.id}`}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-3 min-w-[2rem] text-center" data-testid={`text-quantity-${product.id}`}>{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                data-testid={`button-increase-${product.id}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Qo'shish
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full" disabled>
            Mavjud emas
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
