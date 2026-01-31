import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Pencil, Trash2, FolderTree, Loader2 } from "lucide-react";
import type { Category } from "@shared/schema";

const categorySchema = z.object({
  name: z.string().min(2, "Nom kamida 2 ta belgi bo'lishi kerak"),
  description: z.string().optional(),
  image: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryForm) => apiRequest("POST", "/api/admin/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategoriya qo'shildi" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Kategoriya qo'shishda xatolik", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryForm }) => 
      apiRequest("PATCH", `/api/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategoriya yangilandi" });
      setDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Kategoriya yangilashda xatolik", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategoriya o'chirildi" });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Kategoriya o'chirishda xatolik", variant: "destructive" });
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (data: CategoryForm) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCategory(null);
      form.reset();
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Kategoriyalar</h1>
          <p className="text-muted-foreground mt-1">{categories.length} ta kategoriya</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-category">
              <Plus className="h-4 w-4 mr-2" />
              Kategoriya qo'shish
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
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
                        <Input placeholder="Kategoriya nomi" {...field} data-testid="input-name" />
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
                        <Textarea placeholder="Kategoriya tavsifi" {...field} data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingCategory ? "Saqlash" : "Qo'shish"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
      ) : categories.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderTree className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Kategoriya topilmadi</h3>
          <p className="text-muted-foreground">Yangi kategoriya qo'shing</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Tavsif</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <FolderTree className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      data-testid={`button-edit-${category.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(category.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-${category.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
