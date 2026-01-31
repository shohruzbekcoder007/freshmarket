import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, MapPin, Phone, Calendar } from "lucide-react";
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

export default function AdminOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/admin/orders/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Buyurtma yangilandi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Buyurtma yangilashda xatolik", variant: "destructive" });
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Buyurtmalar</h1>
        <p className="text-muted-foreground mt-1">{orders.length} ta buyurtma</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Buyurtmalar yo'q</h3>
          <p className="text-muted-foreground">Hali hech kim buyurtma bermagan</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} data-testid={`card-order-${order.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Buyurtma #{order.id.slice(0, 8)}
                      </h3>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.createdAt && new Date(order.createdAt).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {order.phone}
                      </span>
                    </div>
                    <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{order.shippingAddress}</span>
                    </div>
                    {order.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Izoh: {order.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Jami summa</p>
                      <p className="text-xl font-bold text-primary">
                        {parseFloat(order.totalAmount).toLocaleString("uz-UZ")} so'm
                      </p>
                    </div>
                    <Select
                      value={order.status}
                      onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="w-40" data-testid={`select-status-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Kutilmoqda</SelectItem>
                        <SelectItem value="processing">Tayyorlanmoqda</SelectItem>
                        <SelectItem value="shipped">Jo'natildi</SelectItem>
                        <SelectItem value="delivered">Yetkazildi</SelectItem>
                        <SelectItem value="cancelled">Bekor qilindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Mahsulotlar</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahsulot</TableHead>
                        <TableHead className="text-center">Miqdor</TableHead>
                        <TableHead className="text-right">Narx</TableHead>
                        <TableHead className="text-right">Summa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {parseFloat(item.price).toLocaleString("uz-UZ")} so'm
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(parseFloat(item.price) * item.quantity).toLocaleString("uz-UZ")} so'm
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
