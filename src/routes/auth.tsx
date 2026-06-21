import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — CropCare" }] }),
  component: AuthPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  password: z.string().min(6).max(72),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const parsed = loginSchema.parse({ email: fd.get("email"), password: fd.get("password") });
      const { error } = await supabase.auth.signInWithPassword(parsed);
      if (error) throw error;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      const parsed = signupSchema.parse({
        name: fd.get("name"), email: fd.get("email"),
        phone: fd.get("phone") || undefined, password: fd.get("password"),
      });
      const { error } = await supabase.auth.signUp({
        email: parsed.email, password: parsed.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { name: parsed.name, phone: parsed.phone },
        },
      });
      if (error) throw error;
      toast.success("Account created. You can now sign in.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-lg bg-primary-foreground/10 grid place-items-center"><Leaf className="size-6"/></div>
          <span className="text-xl font-semibold">CropCare</span>
        </div>
        <div className="space-y-4 relative z-10">
          <h1 className="text-4xl font-bold leading-tight">Grow smarter. Harvest better.</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Manage every plant from seed to harvest with automated watering, pesticide, and growth schedules.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/60">Smart Crop Management System</div>
        <div aria-hidden className="absolute -right-32 -bottom-32 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Sign in or create your farm account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4 pt-4">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="lemail">Email</Label>
                    <Input id="lemail" name="email" type="email" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lpass">Password</Label>
                    <Input id="lpass" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>Sign in</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4 pt-4">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
                  <div className="space-y-1.5"><Label htmlFor="semail">Email</Label><Input id="semail" name="email" type="email" required /></div>
                  <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" /></div>
                  <div className="space-y-1.5"><Label htmlFor="spass">Password</Label><Input id="spass" name="password" type="password" minLength={6} required /></div>
                  <Button type="submit" className="w-full" disabled={loading}>Create account</Button>
                </form>
              </TabsContent>
            </Tabs>
            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
            </div>
            <Button variant="outline" className="w-full" disabled={loading} onClick={handleGoogle}>
              Continue with Google
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              <Link to="/" className="hover:underline">Back home</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
