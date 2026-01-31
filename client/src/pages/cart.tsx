import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import type { CartItemWithProduct } from "@shared/schema";

export default function Cart() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return apiRequest("PATCH", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Miqdorni yangilashda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "O'chirildi",
        description: "Mahsulot savatchadan o'chirildi",
      });
    },
    onError: () => {
      toast({
        title: "Xatolik",
        description: "Mahsulotni o'chirishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Tozalandi",
        description: "Savatcha tozalandi",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Tizimga kiring</h1>
          <p className="text-muted-foreground mb-8">
            Savatchani ko'rish uchun tizimga kirishingiz kerak
          </p>
          <Link href="/login">
            <Button data-testid="button-login">Tizimga kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Savatcha</h1>
            <p className="text-muted-foreground mt-1">
              {cartItems.length} ta mahsulot
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={() => clearCartMutation.mutate()}
              disabled={clearCartMutation.isPending}
              data-testid="button-clear-cart"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Tozalash
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Skeleton className="h-24 w-24 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Savatcha bo'sh</h2>
              <p className="text-muted-foreground mb-6">
                Hali hech narsa qo'shmagansiz
              </p>
              <Link href="/products">
                <Button data-testid="button-shop">
                  Xarid qilishni boshlash
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} data-testid={`card-cart-item-${item.id}`}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Link href={`/products/${item.product.id}`}>
                      <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0 cursor-pointer">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold truncate cursor-pointer hover:text-primary" data-testid={`text-item-name-${item.id}`}>
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-primary font-medium" data-testid={`text-item-price-${item.id}`}>
                        {parseFloat(item.product.price).toLocaleString("uz-UZ")} so'm
                      </p>
                      <p className="text-sm text-muted-foreground">
                        /{item.product.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantityMutation.mutate({ 
                            id: item.id, 
                            quantity: item.quantity - 1 
                          })}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 min-w-[2rem] text-center" data-testid={`text-quantity-${item.id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantityMutation.mutate({ 
                            id: item.id, 
                            quantity: item.quantity + 1 
                          })}
                          disabled={item.quantity >= item.product.stock || updateQuantityMutation.isPending}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemMutation.mutate(item.id)}
                        disabled={removeItemMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="font-bold" data-testid={`text-item-total-${item.id}`}>
                        {(parseFloat(item.product.price) * item.quantity).toLocaleString("uz-UZ")} so'm
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Buyurtma xulosasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mahsulotlar ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
                    <span>{totalAmount.toLocaleString("uz-UZ")} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yetkazib berish</span>
                    <span className="text-primary">Bepul</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Jami</span>
                      <span className="text-primary" data-testid="text-total-amount">
                        {totalAmount.toLocaleString("uz-UZ")} so'm
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setLocation("/checkout")}
                    data-testid="button-checkout"
                  >
                    Buyurtma berish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
