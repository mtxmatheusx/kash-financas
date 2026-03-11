import React, { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Save } from "lucide-react";
import { toast } from "sonner";

const Perfil: React.FC = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setWhatsapp(profile.whatsapp_number || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
      console.error(error);
    } else {
      toast.success("Perfil atualizado!");
      await refreshProfile();
    }
    setSaving(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Meu Perfil
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">Gerencie suas informações</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Mail className="w-3.5 h-3.5" /> E-mail
            </label>
            <Input value={profile?.email || ""} disabled className="bg-muted/50" />
            <p className="text-[10px] text-muted-foreground mt-1">O e-mail não pode ser alterado</p>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5" /> Nome
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              maxLength={100}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Phone className="w-3.5 h-3.5" /> WhatsApp
            </label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 5511999999999"
              maxLength={20}
              inputMode="tel"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Número com código do país (ex: 55 para Brasil) — será usado para o agente IA via WhatsApp
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </div>

        {profile?.referral_code && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Código de indicação</p>
            <p className="text-sm font-mono font-bold text-primary">{profile.referral_code}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Compartilhe e ganhe +60 dias premium por indicação</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Perfil;
