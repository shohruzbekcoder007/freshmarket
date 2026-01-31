import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Mail, Phone, MapPin, Calendar, Shield, User } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Foydalanuvchilar</h1>
        <p className="text-muted-foreground mt-1">{users.length} ta foydalanuvchi</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Foydalanuvchilar yo'q</h3>
          <p className="text-muted-foreground">Hali hech kim ro'yxatdan o'tmagan</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foydalanuvchi</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Manzil</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Ro'yxatdan o'tgan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.role === "admin" ? (
                            <Shield className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.address ? (
                        <div className="flex items-start gap-1 text-muted-foreground max-w-xs">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{user.address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? "Admin" : "Foydalanuvchi"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="h-4 w-4" />
                        {user.createdAt && new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                      </div>
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
