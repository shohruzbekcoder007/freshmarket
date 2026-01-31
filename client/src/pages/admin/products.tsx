import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, Package, Loader2, Search } from "lucide-react";
import type { Product, Category } from "@shared/schema";

const productSchema = z.object({
  name: z.string().min(2, "Nom kamida 2 ta belgi bo'lishi kerak"),
  description: z.string().optional(),
  price: z.string().min(1, "Narxni kiriting"),
  image: z.string().optional(),
  categoryId: z.string().optional(),
  stock: z.string().min(1, "Zaxirani kiriting"),
  unit: z.string().default("dona"),
  isActive: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image: "",
      categoryId: "",
      stock: "0",
      unit: "dona",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductForm) => apiRequest("POST", "/api/admin/products", {
      ...data,
      price: data.price,
      stock: parseInt(data.stock),
      categoryId: data.categoryId || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Mahsulot qo'shildi" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Mahsulot qo'shishda xatolik", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductForm }) => apiRequest("PATCH", `/api/admin/products/${id}`, {
      ...data,
      price: data.price,
      stock: parseInt(data.stock),
      categoryId: data.categoryId || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Mahsulot yangilandi" });
      setDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Mahsulot yangilashda xatolik", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Mahsulot o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Mahsulot o'chirishda xatolik", variant: "destructive" });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: product.image || "",
      categoryId: product.categoryId || "",
      stock: product.stock.toString(),
      unit: product.unit || "dona",
      isActive: product.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingProduct(null);
      form.reset();
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Mahsulotlar</h1>
          <p className="text-muted-foreground mt-1">{products.length} ta mahsulot</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-product">
              <Plus className="h-4 w-4 mr-2" />
              Mahsulot qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomi</FormLabel>
                      <FormControl>
                        <Input placeholder="Mahsulot nomi" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tavsif</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mahsulot tavsifi" {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Narx (so'm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zaxira</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} data-testid="input-stock" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategoriya</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birlik</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-unit">
                              <SelectValue placeholder="Tanlang" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dona">Dona</SelectItem>
                            <SelectItem value="kg">Kilogramm</SelectItem>
                            <SelectItem value="litr">Litr</SelectItem>
                            <SelectItem value="pachka">Pachka</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rasm URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-image" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Faol</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Mahsulot foydalanuvchilarga ko'rinadimi
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-active" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingProduct ? "Saqlash" : "Qo'shish"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Mahsulot topilmadi</h3>
          <p className="text-muted-foreground">Yangi mahsulot qo'shing</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mahsulot</TableHead>
                  <TableHead>Kategoriya</TableHead>
                  <TableHead>Narx</TableHead>
                  <TableHead>Zaxira</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {categories.find(c => c.id === product.categoryId)?.name || "-"}
                    </TableCell>
                    <TableCell>{parseFloat(product.price).toLocaleString("uz-UZ")} so'm</TableCell>
                    <TableCell>{product.stock} {product.unit}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Faol" : "Nofaol"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(product.id)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
