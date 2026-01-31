import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, Settings, Menu, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import type { CartItem } from "@shared/schema";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { user, logout, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <nav className="flex flex-col gap-2 mt-8">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start" data-testid="link-home-mobile">
                      Bosh sahifa
                    </Button>
                  </Link>
                  <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start" data-testid="link-products-mobile">
                      Mahsulotlar
                    </Button>
                  </Link>
                  {user && (
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="link-orders-mobile">
                        <Package className="mr-2 h-4 w-4" />
                        Buyurtmalarim
                      </Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="link-admin-mobile">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin panel
                      </Button>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            <Link href="/">
              <span className="text-xl font-bold text-primary cursor-pointer" data-testid="text-logo">
                FreshMarket
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/">
                <Button variant="ghost" data-testid="link-home">
                  Bosh sahifa
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" data-testid="link-products">
                  Mahsulotlar
                </Button>
              </Link>
            </nav>
          </div>

          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-user-menu">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium" data-testid="text-username">{user.username}</p>
                      <p className="text-xs text-muted-foreground" data-testid="text-email">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="cursor-pointer" data-testid="link-orders">
                        <Package className="mr-2 h-4 w-4" />
                        Buyurtmalarim
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer" data-testid="link-admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="button-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Chiqish
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="link-login">
                    Kirish
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="link-register">
                    Ro'yxatdan o'tish
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
