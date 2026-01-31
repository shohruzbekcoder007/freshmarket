import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak"),
  email: z.string().email("To'g'ri email kiriting"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Parollar mos kelmaydi",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: data.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Ro'yxatdan o'tish muvaffaqiyatsiz");
      }

      login(result.token, result.user);
      toast({
        title: "Muvaffaqiyatli",
        description: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            Ro'yxatdan o'tish
          </CardTitle>
          <CardDescription>
            Yangi hisob yarating yoki{" "}
            <Link href="/login" className="text-primary hover:underline" data-testid="link-login">
              tizimga kiring
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foydalanuvchi nomi</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="foydalanuvchi123"
                        {...field}
                        data-testid="input-username"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon (ixtiyoriy)</FormLabel>
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manzil (ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Toshkent, Chilonzor tumani..."
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Parolingiz"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parolni tasdiqlash</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Parolni qayta kiriting"
                        {...field}
                        data-testid="input-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ro'yxatdan o'tilmoqda...
                  </>
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
