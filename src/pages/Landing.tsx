import React from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight, BarChart3, Shield, Zap, TrendingUp, PieChart,
  Target, CalendarRange, Crown, Check, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const features = [
  { icon: TrendingUp, title: "Receitas & Despesas", desc: "Controle completo de entradas e saídas com categorização inteligente." },
  { icon: PieChart, title: "Investimentos", desc: "Acompanhe sua carteira e veja o retorno de cada aplicação.", premium: true },
  { icon: Target, title: "Metas Financeiras", desc: "Defina objetivos e acompanhe seu progresso em tempo real.", premium: true },
  { icon: CalendarRange, title: "Visão Mensal", desc: "Comparativo mês a mês para entender suas tendências.", premium: true },
  { icon: BarChart3, title: "DRE & EBITDA", desc: "Relatórios empresariais completos para tomada de decisão.", premium: true },
  { icon: Zap, title: "Consultor IA", desc: "Assistente inteligente para dúvidas financeiras e de vendas.", premium: true },
];

const stats = [
  { value: "10k+", label: "Usuários ativos" },
  { value: "R$ 2B+", label: "Gerenciados" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Avaliação" },
];

const Landing: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-foreground tracking-tight">Kash</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Começar grátis
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-primary/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Novo: Consultor IA integrado
              <ChevronRight className="h-3 w-3" />
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
          >
            Finanças com
            <br />
            <span className="text-primary">clareza.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Kash é a plataforma financeira que simplifica o controle das suas receitas,
            despesas e investimentos — pessoal ou empresarial.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-base px-8 h-12">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8 h-12">
                Já tenho conta
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border/50 bg-card/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.1)} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Do básico ao avançado, Kash tem as ferramentas certas para cada etapa da sua jornada financeira.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(i * 0.08)}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  {f.premium && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 px-6 bg-card/50 border-y border-border/50">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Simples e transparente
            </h2>
            <p className="text-muted-foreground text-lg">
              Comece grátis, evolua quando quiser.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-2xl border border-border bg-background p-8"
            >
              <h3 className="text-xl font-bold mb-1">Gratuito</h3>
              <p className="text-sm text-muted-foreground mb-4">Para começar a organizar</p>
              <p className="text-4xl font-bold mb-6">R$ 0<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              <ul className="space-y-3 mb-8">
                {["Dashboard", "Receitas", "Despesas"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button variant="outline" className="w-full">Começar grátis</Button>
              </Link>
            </motion.div>

            <motion.div
              {...fadeUp(0.2)}
              className="rounded-2xl border-2 border-primary bg-background p-8 relative"
            >
              <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" /> Premium
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Acesso completo</p>
              <p className="text-4xl font-bold mb-6">R$ 29,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              <ul className="space-y-3 mb-8">
                {["Tudo do gratuito", "Investimentos & Metas", "Visão Mensal", "DRE & EBITDA", "Consultor IA", "Suporte prioritário"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full">
                  <Crown className="h-4 w-4 mr-2" /> Assinar Premium
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Segurança em primeiro lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Seus dados são protegidos com criptografia de ponta e infraestrutura
              de nível empresarial. Nunca compartilhamos suas informações.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Criptografia AES-256", "Autenticação segura", "Dados isolados por usuário", "Backups automáticos"].map(s => (
                <span key={s} className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <motion.div
          {...fadeUp()}
          className="max-w-3xl mx-auto text-center rounded-3xl bg-primary p-12 sm:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight mb-4">
              Comece a controlar suas finanças hoje
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Junte-se a milhares de pessoas que já transformaram sua relação com dinheiro.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-base px-8 h-12">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">K</span>
            </div>
            <span className="font-semibold text-sm text-foreground">Kash</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Entrar</Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">Criar conta</Link>
            <Link to="/upgrade" className="hover:text-foreground transition-colors">Planos</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kash. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
