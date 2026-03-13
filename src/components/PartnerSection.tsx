import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heart, Send, X, Check, UserPlus, Unlink } from "lucide-react";
import { toast } from "sonner";

interface SharedAccount {
  id: string;
  owner_id: string;
  partner_id: string;
}

interface Invite {
  id: string;
  inviter_id: string;
  invitee_email: string;
  status: string;
  expires_at: string;
}

export const PartnerSection: React.FC = () => {
  const { user } = useAuth();
  const { t } = usePreferences();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sharedAccount, setSharedAccount] = useState<SharedAccount | null>(null);
  const [partnerEmail, setPartnerEmail] = useState<string | null>(null);
  const [sentInvite, setSentInvite] = useState<Invite | null>(null);
  const [receivedInvites, setReceivedInvites] = useState<Invite[]>([]);
  const [inviterEmails, setInviterEmails] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    if (!user) return;

    // Check existing shared account
    const { data: shared } = await supabase
      .from("shared_accounts")
      .select("*")
      .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`)
      .limit(1)
      .single();

    if (shared) {
      setSharedAccount(shared as SharedAccount);
      const partnerId = shared.owner_id === user.id ? shared.partner_id : shared.owner_id;
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("user_id", partnerId)
        .single();
      setPartnerEmail(partnerProfile?.display_name || partnerProfile?.email || partnerId);
    } else {
      setSharedAccount(null);
      setPartnerEmail(null);
    }

    // Check sent invites
    const { data: sent } = await supabase
      .from("account_invites")
      .select("*")
      .eq("inviter_id", user.id)
      .eq("status", "pending")
      .limit(1)
      .single();
    setSentInvite(sent as Invite | null);

    // Check received invites
    const { data: received } = await supabase
      .from("account_invites")
      .select("*")
      .eq("invitee_email", user.email)
      .eq("status", "pending");
    
    const validInvites = (received || []).filter(
      (inv: any) => new Date(inv.expires_at) > new Date()
    ) as Invite[];
    setReceivedInvites(validInvites);

    // Get inviter emails
    if (validInvites.length > 0) {
      const inviterIds = validInvites.map(i => i.inviter_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, display_name")
        .in("user_id", inviterIds);
      const emailMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        emailMap[p.user_id] = p.display_name || p.email || p.user_id;
      });
      setInviterEmails(emailMap);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSendInvite = async () => {
    if (!user || !email.trim()) return;
    setSending(true);
    const { error } = await supabase.from("account_invites").insert({
      inviter_id: user.id,
      invitee_email: email.trim().toLowerCase(),
    } as any);
    if (error) {
      toast.error(t("partner.inviteError"));
      console.error(error);
    } else {
      toast.success(t("partner.inviteSent"));
      setEmail("");
      await loadData();
    }
    setSending(false);
  };

  const handleCancelInvite = async () => {
    if (!sentInvite) return;
    await supabase.from("account_invites").delete().eq("id", sentInvite.id);
    setSentInvite(null);
    toast.success("OK");
  };

  const handleAcceptInvite = async (invite: Invite) => {
    if (!user) return;
    // Update invite status
    await supabase.from("account_invites").update({ status: "accepted" } as any).eq("id", invite.id);
    // Create shared account link
    await supabase.from("shared_accounts").insert({
      owner_id: invite.inviter_id,
      partner_id: user.id,
    } as any);
    toast.success(t("partner.accepted"));
    await loadData();
  };

  const handleRejectInvite = async (invite: Invite) => {
    await supabase.from("account_invites").update({ status: "rejected" } as any).eq("id", invite.id);
    toast.success(t("partner.rejected"));
    await loadData();
  };

  const handleUnlink = async () => {
    if (!sharedAccount || !confirm(t("partner.unlinkConfirm"))) return;
    await supabase.from("shared_accounts").delete().eq("id", sharedAccount.id);
    toast.success(t("partner.unlinkSuccess"));
    await loadData();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-pink-500" />
        <h3 className="text-sm font-semibold text-foreground">{t("partner.title")}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground">{t("partner.subtitle")}</p>

      {/* Already linked */}
      {sharedAccount && (
        <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
          <div>
            <p className="text-xs font-medium text-foreground">{t("partner.linkedWith")}</p>
            <p className="text-sm font-bold text-primary">{partnerEmail}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleUnlink} className="text-destructive hover:text-destructive">
            <Unlink className="w-4 h-4 mr-1" /> {t("partner.unlink")}
          </Button>
        </div>
      )}

      {/* Received invites */}
      {!sharedAccount && receivedInvites.map((invite) => (
        <div key={invite.id} className="flex items-center justify-between bg-accent/50 rounded-lg p-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("partner.youHaveInvite")}</p>
            <p className="text-sm font-medium text-foreground">{inviterEmails[invite.inviter_id] || invite.inviter_id}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleAcceptInvite(invite)} className="gap-1">
              <Check className="w-3.5 h-3.5" /> {t("partner.accept")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleRejectInvite(invite)} className="gap-1">
              <X className="w-3.5 h-3.5" /> {t("partner.reject")}
            </Button>
          </div>
        </div>
      ))}

      {/* Pending sent invite */}
      {!sharedAccount && sentInvite && (
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
          <div>
            <p className="text-xs text-muted-foreground">{t("partner.pendingInvite")}</p>
            <p className="text-sm font-medium text-foreground">{sentInvite.invitee_email}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCancelInvite} className="text-destructive">
            <X className="w-4 h-4 mr-1" /> {t("partner.cancelInvite")}
          </Button>
        </div>
      )}

      {/* Send invite form */}
      {!sharedAccount && !sentInvite && (
        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("partner.emailPlaceholder")}
            type="email"
            className="flex-1"
          />
          <Button onClick={handleSendInvite} disabled={sending || !email.trim()} className="gap-1.5">
            {sending ? (
              <>{t("partner.sending")}</>
            ) : (
              <><UserPlus className="w-4 h-4" /> {t("partner.sendInvite")}</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
