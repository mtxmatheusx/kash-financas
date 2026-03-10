import React from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight, Shield, Zap, MessageCircle, Brain, TrendingUp,
  Crown, Check, ChevronRight, Sparkles, AudioLines,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Animations ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

/* ── Floating particles ── */
const Particles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: i % 3 === 0 ? "hsl(160 100% 50% / 0.4)" : "hsl(217 91% 60% / 0.3)",
        }}
        animate={{
          y: [0, -30 - Math.random() * 40, 0],
          opacity: [0.1, 0.5, 0.1],
          scale: [1, 1.8, 1],
        }}
        transition={{
          duration: 5 + Math.random() * 5,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ── Grid overlay ── */
const GridOverlay: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(160 100% 50%) 1px, transparent 1px),
          linear-gradient(90deg, hsl(160 100% 50%) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
  </div>
);

/* ── Stats ── */
const stats = [
  { value: "10k+", label: "Usuários ativos" },
  { value: "R$ 2B+", label: "Gerenciados" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Avaliação" },
];

/* ── Steps ── */
const steps = [
  {
    num: "01",
    icon: MessageCircle,
    title: "Fale no WhatsApp",
    desc: "Manda um áudio: \"Gastei 50 reais de gasolina agora\". Ou digita, ou manda foto do recibo. Simples assim.",
    accent: "hsl(160 100% 50%)",
  },
  {
    num: "02",
    icon: Brain,
    title: "IA Categoriza Tudo",
    desc: "Nossa IA categoriza, ajusta o saldo e injeta no seu dashboard em milissegundos. Zero trabalho manual.",
    accent: "hsl(217 91% 60%)",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Receba Estratégias",
    desc: "A IA cruza seus dados e sugere onde cortar gastos ou onde investir para lucrar mais amanhã.",
    accent: "hsl(348 100% 64%)",
  },
];

/* ── WhatsApp icon SVG ── */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Landing: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,2%)]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(160,100%,50%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-dark noise-texture min-h-screen overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-[hsl(0,0%,2%)/0.8] border-b border-[hsl(0,0%,12%)/0.5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[hsl(160,100%,50%)] flex items-center justify-center shadow-lg shadow-[hsl(160,100%,50%)/0.3]">
              <span className="text-[hsl(0,0%,2%)] font-bold text-sm">K</span>
            </div>
            <span className="font-semibold tracking-tight text-white">Kash</span>
          </Link>
          <div className="flex items-center gap-3 relative z-10">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-[hsl(0,0%,70%)] hover:text-white hover:bg-[hsl(0,0%,10%)]">
                Entrar
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white cta-glow border-0">
                Ativar Copiloto
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 min-h-[90vh] flex items-center">
        <GridOverlay />
        <Particles />

        {/* Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[500px] sm:h-[700px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, hsl(160 100% 50% / 0.08), transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 -right-20 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.08), transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, hsl(348 100% 64% / 0.06), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(160,100%,50%)/0.2] bg-[hsl(160,100%,50%)/0.05] backdrop-blur-sm text-xs font-medium text-[hsl(160,100%,50%)] mb-8 neon-box-glow">
              <WhatsAppIcon className="w-3.5 h-3.5" />
              Novo: Copiloto por WhatsApp
              <ChevronRight className="h-3 w-3" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
          >
            <span className="text-white">O Controle Financeiro</span>
            <br />
            <span className="text-white">Que Vive </span>
            <span className="neon-glow text-[hsl(160,100%,50%)]">
              Onde Você Já Está.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...fadeUp(0.2)}
            className="text-base sm:text-lg lg:text-xl text-[hsl(0,0%,55%)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Chega de planilhas abandonadas no segundo mês. Envie um áudio no WhatsApp.
            A Kash organiza, categoriza e te dá estratégias para{" "}
            <span className="text-[hsl(160,100%,50%)]">lucrar mais</span>.
            Sem baixar apps. Sem curva de aprendizado.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-base px-8 h-13 bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Ativar Meu Copiloto (30 Dias Grátis)
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="outline" className="text-base px-8 h-13 border-[hsl(160,100%,50%)/0.3] text-[hsl(160,100%,50%)] hover:bg-[hsl(160,100%,50%)/0.05] bg-transparent w-full sm:w-auto">
                Ver como funciona
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          {/* Glow line */}
          <motion.div
            {...fadeUp(0.5)}
            className="mt-16 h-px w-full max-w-md mx-auto"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(160 100% 50% / 0.4), transparent)",
            }}
          />
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.p {...fadeUp()} className="text-center text-[hsl(0,0%,40%)] text-sm uppercase tracking-[0.2em] mb-8 font-medium">
            Confiado por milhares de brasileiros
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp(i * 0.1)}
                className="text-center p-5 sm:p-6 rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,4%)] hover:border-[hsl(160,100%,50%)/0.2] transition-all duration-300"
              >
                <p className="text-2xl sm:text-4xl font-bold text-white tracking-tight font-mono-fin">{s.value}</p>
                <p className="text-xs sm:text-sm text-[hsl(0,0%,45%)] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 STEPS ═══ */}
      <section id="como-funciona" className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <Particles />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-14 sm:mb-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[hsl(160,100%,50%)] mb-4">
              Esforço Zero
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
              3 passos. Nenhum esforço.
            </h2>
            <p className="text-[hsl(0,0%,50%)] text-base sm:text-lg max-w-xl mx-auto">
              Enquanto outros apps pedem que você abra planilhas, a Kash vive no seu WhatsApp.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp(i * 0.15)}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,4%)] p-6 sm:p-8 hover:border-[hsl(160,100%,50%)/0.2] transition-all duration-300"
              >
                {/* Corner glow */}
                <div
                  className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${step.accent}15, transparent 50%)` }}
                />
                <div className="relative">
                  <span className="text-xs font-mono-fin font-bold text-[hsl(0,0%,25%)] tracking-widest mb-4 block">
                    {step.num}
                  </span>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                    style={{ backgroundColor: `${step.accent}15` }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.accent }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-[hsl(0,0%,50%)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* WhatsApp simulation */}
          <motion.div
            {...fadeUp(0.3)}
            className="mt-12 sm:mt-16 max-w-md mx-auto rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,4%)] p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center">
                <WhatsAppIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Kash Copiloto</p>
                <p className="text-[10px] text-[hsl(0,0%,40%)]">online</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-end">
                <div className="bg-[hsl(142,40%,18%)] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
                  <div className="flex items-center gap-2 text-sm text-[hsl(0,0%,85%)]">
                    <AudioLines className="w-4 h-4 text-[hsl(160,100%,50%)]" />
                    <span className="text-xs">"Gastei 50 reais de gasolina"</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[hsl(0,0%,10%)] rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                  <p className="text-sm text-[hsl(0,0%,85%)]">
                    ✅ <span className="font-semibold">R$ 50,00</span> registrado em{" "}
                    <span className="text-[hsl(160,100%,50%)]">Transporte</span>.
                    Você já gastou R$ 320 nessa categoria este mês — 15% acima do mês passado.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <GridOverlay />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
              Quanto custa ter dois consultores?
            </h2>
            <p className="text-[hsl(0,0%,50%)] text-base sm:text-lg max-w-xl mx-auto mb-3">
              Consultor financeiro + consultor de vendas ={" "}
              <span className="line-through text-[hsl(0,0%,35%)]">R$ 5.000/mês</span>
            </p>
            <p className="text-[hsl(160,100%,50%)] font-semibold text-lg">
              Com a Kash, a partir de R$ 0.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 mt-10 sm:mt-14">
            {/* Free */}
            <motion.div
              {...fadeUp(0.1)}
              className="rounded-2xl border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,4%)] p-7 sm:p-8"
            >
              <h3 className="text-xl font-bold text-white mb-1">Gratuito</h3>
              <p className="text-sm text-[hsl(0,0%,45%)] mb-5">Registre e organize seus gastos</p>
              <p className="text-4xl sm:text-5xl font-bold text-white mb-6 font-mono-fin">
                R$ 0<span className="text-sm font-normal text-[hsl(0,0%,40%)]">/mês</span>
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Dashboard inteligente",
                  "Controle de receitas e despesas",
                  "Categorização automática",
                  "Registro por WhatsApp",
                ].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[hsl(0,0%,70%)]">
                    <Check className="h-4 w-4 text-[hsl(160,100%,50%)] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full h-12 text-base bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow">
                  Começar Teste de 30 Dias
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div
              {...fadeUp(0.2)}
              className="relative rounded-2xl overflow-hidden"
            >
              {/* Neon border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(160,100%,50%)/0.2] via-[hsl(217,91%,60%)/0.1] to-[hsl(160,100%,50%)/0.05]" />
              <div className="absolute inset-px rounded-[15px] bg-[hsl(0,0%,4%)]" />

              <div className="absolute -top-px right-6 bg-[hsl(160,100%,50%)] text-[hsl(0,0%,2%)] text-xs font-bold px-3 py-1.5 rounded-b-lg shadow-lg shadow-[hsl(160,100%,50%)/0.3] z-10 uppercase tracking-wider">
                Recomendado
              </div>

              <div className="relative p-7 sm:p-8">
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[hsl(45,100%,60%)]" /> Premium
                </h3>
                <p className="text-sm text-[hsl(0,0%,45%)] mb-5">Consultor de Vendas IA ativado</p>
                <p className="text-4xl sm:text-5xl font-bold text-white mb-6 font-mono-fin">
                  R$ 29<span className="text-lg">,90</span>
                  <span className="text-sm font-normal text-[hsl(0,0%,40%)]">/mês</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Tudo do gratuito",
                    "Consultor de Vendas IA",
                    "Estratégias personalizadas",
                    "Acompanhamento de investimentos",
                    "Metas e planejamento financeiro",
                    "Suporte prioritário",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[hsl(0,0%,70%)]">
                      <Check className="h-4 w-4 text-[hsl(160,100%,50%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className="w-full h-12 text-base border border-[hsl(160,100%,50%)/0.3] bg-[hsl(160,100%,50%)/0.1] hover:bg-[hsl(160,100%,50%)/0.2] text-[hsl(160,100%,50%)] neon-box-glow">
                    <Crown className="h-4 w-4 mr-2" /> Assinar Premium
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <Particles />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp()}>
            <div className="w-16 h-16 rounded-2xl bg-[hsl(160,100%,50%)/0.1] flex items-center justify-center mx-auto mb-6 neon-box-glow">
              <Shield className="h-8 w-8 text-[hsl(160,100%,50%)]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Segurança de nível bancário
            </h2>
            <p className="text-[hsl(0,0%,50%)] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Seus dados são protegidos com criptografia de ponta e infraestrutura
              enterprise. Nunca compartilhamos suas informações.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Criptografia AES-256", "Autenticação 2FA", "Dados isolados", "Backups diários"].map(s => (
                <span key={s} className="px-4 py-2 rounded-full border border-[hsl(0,0%,12%)] bg-[hsl(0,0%,4%)] text-sm text-[hsl(0,0%,55%)] hover:border-[hsl(160,100%,50%)/0.2] hover:text-white transition-all duration-300">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <motion.div
          {...fadeUp()}
          className="max-w-3xl mx-auto text-center rounded-3xl p-10 sm:p-16 relative overflow-hidden"
        >
          {/* Animated gradient */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, hsl(160 100% 50% / 0.15), hsl(217 91% 60% / 0.1), hsl(160 100% 50% / 0.15))",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[hsl(0,0%,3%)/0.6] backdrop-blur-xl" />
          <div className="absolute inset-px rounded-[23px] border border-[hsl(160,100%,50%)/0.1]" />

          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <Zap className="h-10 w-10 text-[hsl(160,100%,50%)]" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Seu Copiloto Financeiro Está Esperando
            </h2>
            <p className="text-[hsl(0,0%,55%)] text-base sm:text-lg mb-8 max-w-lg mx-auto">
              30 dias grátis. Sem cartão. Cancele quando quiser.
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-base px-8 h-13 bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow hover:scale-105 transition-all duration-200">
                <Sparkles className="mr-2 h-4 w-4" />
                Ativar Meu Copiloto Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[hsl(0,0%,8%)] py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[hsl(160,100%,50%)] flex items-center justify-center shadow-md shadow-[hsl(160,100%,50%)/0.2]">
              <span className="text-[hsl(0,0%,2%)] font-bold text-xs">K</span>
            </div>
            <span className="font-semibold text-sm text-white">Kash</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[hsl(0,0%,40%)]">
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Criar conta</Link>
            <Link to="/upgrade" className="hover:text-white transition-colors">Planos</Link>
          </div>
          <p className="text-xs text-[hsl(0,0%,30%)]">
            © {new Date().getFullYear()} Kash. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
