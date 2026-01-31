import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { useAuth } from "@/lib/auth";
import { Package, Calendar, MapPin, Phone, ShoppingBag, ArrowRight } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "Kutilmoqda",
  processing: "Tayyorlanmoqda",
  shipped: "Jo'natildi",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

export default function Orders() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold mb-4">Tizimga kiring</h1>
          <p className="text-muted-foreground mb-8">
            Buyurtmalarni ko'rish uchun tizimga kirishingiz kerak
          </p>
          <Link href="/login">
            <Button>Tizimga kirish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Buyurtmalarim</h1>
          <p className="text-muted-foreground mt-1">
            Barcha buyurtmalaringiz tarixi
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-1/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-2">Buyurtmalar yo'q</h2>
              <p className="text-muted-foreground mb-6">
                Hali birorta buyurtma bermadingiz
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
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Buyurtma #{order.id.slice(0, 8)}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.createdAt && new Date(order.createdAt).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]} data-testid={`badge-status-${order.id}`}>
                    {statusLabels[order.status]}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{order.shippingAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.phone}</span>
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-sm text-muted-foreground">
                      Izoh: {order.notes}
                    </p>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Mahsulotlar:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.productName} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            {(parseFloat(item.price) * item.quantity).toLocaleString("uz-UZ")} so'm
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                      <span>Jami:</span>
                      <span className="text-primary" data-testid={`text-order-total-${order.id}`}>
                        {parseFloat(order.totalAmount).toLocaleString("uz-UZ")} so'm
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
