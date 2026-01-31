import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import type { CartItemWithProduct } from "@shared/schema";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Manzilni to'liq kiriting"),
  phone: z.string().min(9, "Telefon raqamni kiriting"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      phone: user?.phone || "",
      notes: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setOrderId(data.id);
      setOrderComplete(true);
      toast({
        title: "Buyurtma qabul qilindi",
        description: "Buyurtmangiz muvaffaqiyatli qabul qilindi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Xatolik",
        description: error.message || "Buyurtma berishda xatolik yuz berdi",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Tizimga kiring</h1>
          <p className="text-muted-foreground mb-8">
            Buyurtma berish uchun tizimga kirishingiz kerak
          </p>
          <Link href="/login">
            <Button>Tizimga kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto text-center p-8">
            <CardContent>
              <CheckCircle className="h-24 w-24 mx-auto text-primary mb-6" />
              <h1 className="text-3xl font-bold mb-4" data-testid="text-order-success">
                Buyurtma qabul qilindi!
              </h1>
              <p className="text-muted-foreground mb-6">
                Buyurtmangiz #{orderId?.slice(0, 8)} muvaffaqiyatli qabul qilindi. 
                Tez orada siz bilan bog'lanamiz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/orders">
                  <Button variant="outline" data-testid="button-view-orders">
                    Buyurtmalarni ko'rish
                  </Button>
                </Link>
                <Link href="/products">
                  <Button data-testid="button-continue-shopping">
                    Xaridni davom ettirish
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);

  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Savatcha bo'sh</h1>
          <p className="text-muted-foreground mb-8">
            Buyurtma berish uchun savatchaga mahsulot qo'shing
          </p>
          <Link href="/products">
            <Button>Mahsulotlarni ko'rish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/cart">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Savatchaga qaytish
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8" data-testid="text-page-title">
          Buyurtmani rasmiylashtirish
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Yetkazib berish ma'lumotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon raqam</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+998 90 123 45 67"
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Yetkazib berish manzili</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Shahar, tuman, ko'cha, uy raqami..."
                              rows={3}
                              {...field}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qo'shimcha izohlar (ixtiyoriy)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Qo'shimcha ma'lumotlar..."
                              rows={2}
                              {...field}
                              data-testid="input-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-submit-order"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buyurtma berilmoqda...
                        </>
                      ) : (
                        "Buyurtmani tasdiqlash"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Buyurtma xulosasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>
                        {(parseFloat(item.product.price) * item.quantity).toLocaleString("uz-UZ")} so'm
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mahsulotlar</span>
                    <span>{totalAmount.toLocaleString("uz-UZ")} so'm</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground">Yetkazib berish</span>
                    <span className="text-primary">Bepul</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Jami</span>
                    <span className="text-primary" data-testid="text-total">
                      {totalAmount.toLocaleString("uz-UZ")} so'm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
