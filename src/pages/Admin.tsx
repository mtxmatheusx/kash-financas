import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageTransition, fadeIn } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Download, ShieldCheck, Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

interface ExportUser {
  email: string;
  display_name: string;
  full_name: string;
  phone: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { t } = usePreferences();

  // Check admin role
  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ["admin-role", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const [users, setUsers] = useState<ExportUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-export-users");
      if (error) throw error;
      setUsers(data.users || []);
      toast.success(`${data.users?.length || 0} usuários carregados`);
    } catch (err: any) {
      toast.error("Erro ao carregar usuários: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!users.length) return;
    const headers = ["email", "display_name", "full_name", "phone", "city", "state", "zip_code", "created_at"];
    const rows = users.map((u) =>
      headers.map((h) => `"${(u[h as keyof ExportUser] || "").replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faciliten-users-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado com sucesso!");
  };

  if (checkingRole) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageTransition>
      <div className="space-y-5">
        <motion.div {...fadeIn(0)} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Painel Admin</h1>
            <p className="text-xs text-muted-foreground">Exportar dados de cadastro para campanhas de Ads</p>
          </div>
        </motion.div>

        <motion.div {...fadeIn(0.1)} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {users.length > 0 ? `${users.length} usuários` : "Clique para carregar"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Users className="w-4 h-4 mr-1" />}
                Carregar dados
              </Button>
              <Button size="sm" onClick={exportCSV} disabled={!users.length}>
                <Download className="w-4 h-4 mr-1" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 px-2 text-muted-foreground font-medium">Email</th>
                    <th className="py-2 px-2 text-muted-foreground font-medium">Nome</th>
                    <th className="py-2 px-2 text-muted-foreground font-medium hidden md:table-cell">Telefone</th>
                    <th className="py-2 px-2 text-muted-foreground font-medium hidden lg:table-cell">Cidade/UF</th>
                    <th className="py-2 px-2 text-muted-foreground font-medium hidden lg:table-cell">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-1.5 px-2 text-foreground">{u.email}</td>
                      <td className="py-1.5 px-2 text-foreground">{u.full_name || u.display_name}</td>
                      <td className="py-1.5 px-2 text-muted-foreground hidden md:table-cell">{u.phone || "—"}</td>
                      <td className="py-1.5 px-2 text-muted-foreground hidden lg:table-cell">
                        {u.city && u.state ? `${u.city}/${u.state}` : "—"}
                      </td>
                      <td className="py-1.5 px-2 text-muted-foreground hidden lg:table-cell">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Admin;
