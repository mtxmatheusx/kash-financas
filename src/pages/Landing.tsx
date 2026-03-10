import React from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight, BarChart3, Shield, Zap, TrendingUp, PieChart,
  Target, CalendarRange, Crown, Check, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingChat } from "@/components/FloatingChat";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
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

/* Floating particles component */
const Particles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/30"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30 - Math.random() * 40, 0],
          x: [0, (Math.random() - 0.5) * 20, 0],
          opacity: [0.2, 0.6, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 4 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* Grid overlay */
const GridOverlay: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

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
      {/* Nav - glassmorphism */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-foreground tracking-tight">Kash</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="shadow-lg shadow-primary/25">
                Começar grátis
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex items-center">
        <GridOverlay />
        <Particles />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 -right-20 w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, hsl(258 60% 52% / 0.1), transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, hsl(152 69% 41% / 0.08), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-xs font-medium text-primary mb-8 shadow-lg shadow-primary/5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-[hsl(258,60%,52%)]">
              clareza.
            </span>
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
              <Button size="lg" className="text-base px-8 h-12 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-shadow">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 backdrop-blur-sm bg-background/50 border-border/50">
                Já tenho conta
              </Button>
            </Link>
          </motion.div>

          {/* Glow line */}
          <motion.div
            {...fadeUp(0.5)}
            className="mt-16 h-px w-full max-w-md mx-auto"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.5), transparent)",
            }}
          />
        </div>
      </section>

      {/* Stats - glass cards */}
      <section className="py-16 px-6 relative">
        <GridOverlay />
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUp(i * 0.1)}
              className="text-center p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:bg-card/80 transition-all duration-300"
            >
              <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features - glass cards with glow */}
      <section className="py-24 px-6 relative">
        <Particles />
        <div className="max-w-6xl mx-auto relative">
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
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
              >
                {/* Subtle corner glow on hover */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{f.title}</h3>
                    {f.premium && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - glass with gradients */}
      <section className="py-24 px-6 relative">
        <GridOverlay />
        <div className="max-w-3xl mx-auto relative">
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
              className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-8"
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
                <Button variant="outline" className="w-full backdrop-blur-sm">Começar grátis</Button>
              </Link>
            </motion.div>

            <motion.div
              {...fadeUp(0.2)}
              className="relative rounded-2xl p-8 overflow-hidden"
            >
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-[hsl(258,60%,52%)]/10" />
              <div className="absolute inset-px rounded-[15px] bg-card/90 backdrop-blur-xl" />

              <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-lg shadow-primary/30 z-10">
                Popular
              </div>
              <div className="relative">
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
                  <Button className="w-full shadow-lg shadow-primary/25">
                    <Crown className="h-4 w-4 mr-2" /> Assinar Premium
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 px-6 relative">
        <Particles />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div {...fadeUp()}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Segurança em primeiro lugar
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Seus dados são protegidos com criptografia de ponta e infraestrutura
              de nível empresarial. Nunca compartilhamos suas informações.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Criptografia AES-256", "Autenticação segura", "Dados isolados por usuário", "Backups automáticos"].map(s => (
                <span key={s} className="px-4 py-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm text-sm text-muted-foreground hover:border-primary/20 hover:text-foreground transition-all duration-300">
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
          className="max-w-3xl mx-auto text-center rounded-3xl p-12 sm:p-16 relative overflow-hidden"
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(258 60% 52%), hsl(var(--primary)))",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
          <GridOverlay />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight mb-4">
              Comece a controlar suas finanças hoje
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Junte-se a milhares de pessoas que já transformaram sua relação com dinheiro.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-base px-8 h-12 shadow-xl hover:shadow-2xl transition-shadow">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 px-6 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-md shadow-primary/20">
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
      {isPremium && <FloatingChat />}
    </div>
  );
};

export default Landing;
