import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — CropCare" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState<{ name: string; email: string; phone: string }>({ name: "", email: "", phone: "" });
  const [roles, setRoles] = useState<string[]>([]);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (p) setProfile({ name: p.name ?? "", email: p.email ?? user.email ?? "", phone: p.phone ?? "" });
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setRoles((r ?? []).map((x: any) => x.role));
    })();
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ name: profile.name, phone: profile.phone }).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><SettingsIcon className="size-7 text-primary"/> Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}/></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={profile.email} disabled/></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}/></div>
          <div className="space-y-1.5"><Label>Roles</Label><div className="flex gap-2">{roles.map(r => <Badge key={r} className="capitalize">{r}</Badge>)}</div></div>
          <Button onClick={save}>Save changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><div className="font-medium">Dark mode</div><div className="text-xs text-muted-foreground">Switch theme</div></div>
            <Switch checked={dark} onCheckedChange={setDark}/>
          </div>
          <div className="flex items-center justify-between">
            <div><div className="font-medium">Email notifications</div><div className="text-xs text-muted-foreground">Coming soon</div></div>
            <Switch disabled/>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Future IoT integration</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>ESP32 sensor endpoints will be available at:</p>
          <code className="block bg-muted p-2 rounded text-xs">GET /api/public/sensor-data</code>
          <code className="block bg-muted p-2 rounded text-xs">POST /api/public/start-pump</code>
          <code className="block bg-muted p-2 rounded text-xs">POST /api/public/stop-pump</code>
        </CardContent>
      </Card>
    </div>
  );
}
