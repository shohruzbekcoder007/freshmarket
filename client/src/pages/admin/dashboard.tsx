import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import type { Order, Product, User, Category } from "@shared/schema";

export default function AdminDashboard() {
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === "delivered") {
      return sum + parseFloat(order.totalAmount);
    }
    return sum;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const processingOrders = orders.filter(o => o.status === "processing").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;

  const isLoading = productsLoading || ordersLoading || usersLoading || categoriesLoading;

  const stats = [
    {
      title: "Jami daromad",
      value: `${totalRevenue.toLocaleString("uz-UZ")} so'm`,
      icon: DollarSign,
      description: "Yetkazilgan buyurtmalardan",
      color: "text-green-600",
    },
    {
      title: "Mahsulotlar",
      value: products.length.toString(),
      icon: Package,
      description: `${categories.length} ta kategoriyada`,
      color: "text-blue-600",
    },
    {
      title: "Buyurtmalar",
      value: orders.length.toString(),
      icon: ShoppingCart,
      description: `${pendingOrders} kutilmoqda`,
      color: "text-purple-600",
    },
    {
      title: "Foydalanuvchilar",
      value: users.length.toString(),
      icon: Users,
      description: "Ro'yxatdan o'tganlar",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Umumiy ko'rinish va statistika
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-stat-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.title}</span>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold" data-testid={`text-stat-value-${index}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Buyurtmalar holati
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kutilmoqda</span>
                  <span className="font-medium text-yellow-600">{pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tayyorlanmoqda</span>
                  <span className="font-medium text-blue-600">{processingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Yetkazilgan</span>
                  <span className="font-medium text-green-600">{deliveredOrders}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-medium">Jami</span>
                  <span className="font-bold">{orders.length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              So'nggi buyurtmalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Hali buyurtmalar yo'q
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt && new Date(order.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <span className="font-medium">
                      {parseFloat(order.totalAmount).toLocaleString("uz-UZ")} so'm
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
