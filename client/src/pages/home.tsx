import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/product-card";
import { Header } from "@/components/header";
import { ShoppingBag, Truck, Shield, ArrowRight, Leaf } from "lucide-react";
import type { Category, ProductWithCategory } from "@shared/schema";

export default function Home() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", { limit: 8 }],
  });

  const features = [
    {
      icon: Leaf,
      title: "Toza mahsulotlar",
      description: "Faqat yangi va sifatli mahsulotlar",
    },
    {
      icon: Truck,
      title: "Tez yetkazib berish",
      description: "24 soat ichida yetkazib beramiz",
    },
    {
      icon: Shield,
      title: "Xavfsiz to'lov",
      description: "Barcha to'lovlar himoyalangan",
    },
    {
      icon: ShoppingBag,
      title: "Keng tanlash",
      description: "Minglab mahsulotlar bir joyda",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">
              Tez va sifatli xizmat
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
              Yangi va toza{" "}
              <span className="text-primary">oziq-ovqat</span>{" "}
              mahsulotlari
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
              Uyingizga qulay tarzda eng sifatli va toza mahsulotlarni yetkazib beramiz. 
              Vaqtingizni tejab, sog'lom ovqatlanishni tanlang.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" data-testid="button-shop-now">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Xarid qilish
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" size="lg" data-testid="button-view-products">
                  Mahsulotlarni ko'rish
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-20">
          <div className="w-full h-full bg-gradient-to-bl from-primary to-transparent rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-elevate" data-testid={`card-feature-${index}`}>
                <CardContent className="pt-6">
                  <feature.icon className="h-10 w-10 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-categories-title">
                Kategoriyalar
              </h2>
              <p className="text-muted-foreground mt-1">
                O'zingizga kerakli kategoriyani tanlang
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost" data-testid="link-all-categories">
                Barchasi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/products?category=${category.id}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-category-${category.id}`}>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center h-32">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-12 w-12 object-contain mb-2"
                        />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-primary mb-2" />
                      )}
                      <h3 className="font-medium" data-testid={`text-category-name-${category.id}`}>
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" data-testid="text-featured-title">
                Mashhur mahsulotlar
              </h2>
              <p className="text-muted-foreground mt-1">
                Eng ko'p sotilgan mahsulotlarimiz
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost" data-testid="link-all-products">
                Barchasi
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">FreshMarket</h3>
              <p className="text-muted-foreground">
                Yangi va toza oziq-ovqat mahsulotlarini uyingizga yetkazib beramiz.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Havolalar</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary">Mahsulotlar</Link></li>
                <li><Link href="/products" className="hover:text-primary">Kategoriyalar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yordam</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><span className="hover:text-primary cursor-pointer">Bog'lanish</span></li>
                <li><span className="hover:text-primary cursor-pointer">Savollar</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bog'lanish</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Telefon: +998 90 123 45 67</li>
                <li>Email: info@freshmarket.uz</li>
                <li>Manzil: Toshkent, O'zbekiston</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 FreshMarket. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
