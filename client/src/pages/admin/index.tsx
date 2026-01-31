import { Link, useLocation, Switch, Route } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import AdminDashboard from "./dashboard";
import AdminProducts from "./products";
import AdminCategories from "./categories";
import AdminOrders from "./orders";
import AdminUsers from "./users";

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Mahsulotlar" },
  { href: "/admin/categories", icon: FolderTree, label: "Kategoriyalar" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Buyurtmalar" },
  { href: "/admin/users", icon: Users, label: "Foydalanuvchilar" },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Ruxsat yo'q</h1>
          <p className="text-muted-foreground mb-6">
            Bu sahifaga faqat adminlar kirishi mumkin
          </p>
          <Link href="/">
            <Button>Bosh sahifaga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : "w-64 border-r"}`}>
      <div className="p-4 border-b">
        <Link href="/">
          <span className="text-xl font-bold text-primary cursor-pointer flex items-center gap-2">
            <ChevronLeft className="h-5 w-5" />
            FreshMarket
          </span>
        </Link>
        <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/admin" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-primary">Admin Panel</span>
          <ThemeToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/products" component={AdminProducts} />
            <Route path="/admin/categories" component={AdminCategories} />
            <Route path="/admin/orders" component={AdminOrders} />
            <Route path="/admin/users" component={AdminUsers} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
