import React, { useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight, Shield, Zap, Brain, TrendingUp,
  Crown, Check, ChevronRight, Sparkles, AudioLines, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Referral capture hook ── */
const useReferralCapture = () => {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("kash_referral_code", ref);
    }
  }, [searchParams]);
};

/* ── Animations ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

/* ── Particles ── */
const Particles: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 16 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          backgroundColor: i % 3 === 0 ? "hsl(160 100% 50% / 0.35)" : "hsl(217 91% 60% / 0.25)",
        }}
        animate={{ y: [0, -30 - Math.random() * 40, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 1.8, 1] }}
        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 3, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ── Grid overlay ── */
const GridOverlay: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(hsl(160 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 100% 50%) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }}
    />
  </div>
);

/* ── WhatsApp SVG ── */
const WhatsAppIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── iPhone Mockup placeholder ── */
const IPhoneMockup: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, x: 40, rotateY: -8 }}
    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
    className="relative flex items-center justify-center"
  >
    {/* Glow behind phone */}
    <div className="absolute w-[280px] h-[400px] sm:w-[320px] sm:h-[500px] rounded-full blur-[80px] bg-[hsl(160,100%,50%)/0.08]" />

    {/* Phone frame */}
    <div className="relative w-[260px] h-[520px] sm:w-[290px] sm:h-[580px] rounded-[40px] border-2 border-[hsl(0,0%,15%)] bg-[hsl(0,0%,6%)] shadow-2xl shadow-[hsl(0,0%,0%)/0.6] overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[hsl(0,0%,2%)] rounded-b-2xl z-20" />

      {/* Screen content — WhatsApp dark simulation */}
      <div className="absolute inset-[3px] rounded-[37px] overflow-hidden bg-[hsl(200,5%,8%)]">
        {/* WA header */}
        <div className="bg-[hsl(200,8%,12%)] px-4 pt-10 pb-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[hsl(160,100%,50%)/0.15] flex items-center justify-center">
            <span className="text-[hsl(160,100%,50%)] text-xs font-bold">K</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white">Kash Copiloto</p>
            <p className="text-[9px] text-[hsl(160,100%,50%)]">online</p>
          </div>
        </div>

        {/* Chat bubbles */}
        <div className="p-3 space-y-2.5 mt-2">
          {/* User audio */}
          <div className="flex justify-end">
            <div className="bg-[hsl(142,40%,18%)] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%]">
              <div className="flex items-center gap-2 text-[11px] text-[hsl(0,0%,85%)]">
                <AudioLines className="w-3.5 h-3.5 text-[hsl(160,100%,50%)]" />
                <span>"Gastei 50 de gasolina"</span>
              </div>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:32</p>
            </div>
          </div>

          {/* Bot response */}
          <div className="flex justify-start">
            <div className="bg-[hsl(0,0%,12%)] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
              <p className="text-[11px] text-[hsl(0,0%,85%)] leading-relaxed">
                ✅ <span className="font-semibold">R$ 50,00</span> →{" "}
                <span className="text-[hsl(160,100%,50%)]">Transporte</span><br />
                Gasto 15% acima do mês passado nessa categoria. 📊
              </p>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:32</p>
            </div>
          </div>

          {/* User text */}
          <div className="flex justify-end">
            <div className="bg-[hsl(142,40%,18%)] rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
              <p className="text-[11px] text-[hsl(0,0%,85%)]">Onde posso cortar?</p>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:33</p>
            </div>
          </div>

          {/* Bot strategy */}
          <div className="flex justify-start">
            <div className="bg-[hsl(0,0%,12%)] rounded-2xl rounded-tl-sm px-3 py-2 max-w-[90%]">
              <p className="text-[11px] text-[hsl(0,0%,85%)] leading-relaxed">
                💡 Delivery: R$ 380 (+40%). Cozinhar 3x/semana economiza ~R$ 250/mês.
                Quer que eu crie uma meta?
              </p>
              <p className="text-[8px] text-[hsl(0,0%,50%)] text-right mt-0.5">10:33</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Steps data ── */
const steps = [
  {
    num: "01",
    icon: WhatsAppIcon,
    isCustomIcon: true,
    title: "O Gatilho",
    desc: "Você manda um áudio: \"Gastei 50 reais de gasolina agora\".",
    accent: "hsl(160 100% 50%)",
  },
  {
    num: "02",
    icon: Cpu,
    isCustomIcon: false,
    title: "A Máquina",
    desc: "Nossa IA categoriza e atualiza seu dashboard financeiro em milissegundos.",
    accent: "hsl(217 91% 60%)",
  },
  {
    num: "03",
    icon: TrendingUp,
    isCustomIcon: false,
    title: "O Consultor",
    desc: "A IA cruza seus dados e sugere onde investir para aumentar suas vendas amanhã.",
    accent: "hsl(348 100% 64%)",
  },
];

/* ── Stats ── */
const stats = [
  { value: "10k+", label: "Usuários ativos" },
  { value: "R$ 2B+", label: "Gerenciados" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Avaliação" },
];

/* ════════════════════════════════════════════════════════════ */
const Landing: React.FC = () => {
  const { user, loading } = useAuth();
  useReferralCapture();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(0,0%,2%)]">
        <div className="animate-spin h-8 w-8 border-4 border-[hsl(160,100%,50%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const signupLink = "/signup" + (localStorage.getItem("kash_referral_code") ? `?ref=${localStorage.getItem("kash_referral_code")}` : "");

  return (
    <div className="landing-dark noise-texture min-h-screen overflow-x-hidden font-['DM_Sans']">
      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-2xl bg-[hsl(0,0%,2%)/0.85] border-b border-[hsl(0,0%,12%)/0.4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-[hsl(160,100%,50%)] flex items-center justify-center shadow-lg shadow-[hsl(160,100%,50%)/0.3]">
              <span className="text-[hsl(0,0%,2%)] font-extrabold text-sm">K</span>
            </div>
            <span className="font-bold tracking-tight text-white text-lg">Kash</span>
          </Link>
          <div className="flex items-center gap-3 relative z-10">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-[hsl(0,0%,60%)] hover:text-white hover:bg-[hsl(0,0%,10%)]">
                Entrar
              </Button>
            </Link>
            <Link to={signupLink}>
              <Button size="sm" className="bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white cta-glow border-0 font-semibold">
                Ativar Copiloto
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO — 50/50 Split ═══ */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 min-h-[92vh] flex items-center">
        <GridOverlay />
        <Particles />

        {/* Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 left-1/4 w-[500px] sm:w-[700px] h-[400px] sm:h-[600px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, hsl(160 100% 50% / 0.07), transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, hsl(348 100% 64% / 0.05), transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.div {...fadeUp(0)}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(160,100%,50%)/0.2] bg-[hsl(160,100%,50%)/0.05] backdrop-blur-sm text-xs font-semibold text-[hsl(160,100%,50%)] mb-6 neon-box-glow">
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Copiloto por WhatsApp
                <ChevronRight className="h-3 w-3" />
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp(0.1)}
              className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5"
            >
              <span className="text-white">O Controle Financeiro</span>
              <br />
              <span className="text-white">Que Vive </span>
              <span className="neon-glow text-[hsl(160,100%,50%)]">Onde Você Já Está.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.2)}
              className="text-base sm:text-lg text-[hsl(0,0%,50%)] max-w-lg mb-8 leading-relaxed"
            >
              Chega de planilhas abandonadas no segundo mês. Envie um áudio no WhatsApp.
              A Kash organiza, categoriza e te dá estratégias de vendas para{" "}
              <span className="text-[hsl(160,100%,50%)] font-semibold">lucrar mais</span>.
              Sem baixar apps. Sem curva de aprendizado.
            </motion.p>

            <motion.div {...fadeUp(0.3)}>
              <Link to={signupLink}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Button size="lg" className="text-base px-8 h-14 bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow font-bold w-full sm:w-auto">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Ativar Meu Copiloto (30 Dias Grátis)
                  </Button>
                </motion.div>
              </Link>
              <p className="text-xs text-[hsl(0,0%,35%)] mt-3">
                Apenas R$ 29,90/mês após o teste. Indique um sócio e ganhe +60 dias.
              </p>
            </motion.div>
          </div>

          {/* Right — iPhone Mockup */}
          <div className="hidden lg:flex justify-center">
            <IPhoneMockup />
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.p {...fadeUp()} className="text-center text-[hsl(0,0%,35%)] text-[11px] uppercase tracking-[0.25em] mb-8 font-semibold">
            Confiado por milhares de brasileiros
          </motion.p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp(i * 0.08)}
                className="text-center p-5 rounded-2xl border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,4%)] hover:border-[hsl(160,100%,50%)/0.15] transition-all duration-300"
              >
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono-fin">{s.value}</p>
                <p className="text-[11px] text-[hsl(0,0%,40%)] mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 STEPS — "Controle em 3 Segundos" ═══ */}
      <section id="como-funciona" className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <Particles />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-14 sm:mb-20">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-[hsl(160,100%,50%)] mb-4">
              Esforço Zero
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Controle em 3 Segundos.
            </h2>
          </motion.div>

          <div className="space-y-4 sm:space-y-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                {...fadeUp(i * 0.12)}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
                className="group relative flex items-start sm:items-center gap-5 sm:gap-6 rounded-2xl border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,3%)] p-5 sm:p-7 hover:border-[hsl(160,100%,50%)/0.15] transition-all duration-300 overflow-hidden"
              >
                {/* Glow edge */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(180deg, transparent, ${step.accent}, transparent)` }}
                />

                <div
                  className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ backgroundColor: `${step.accent}12` }}
                >
                  {step.isCustomIcon ? (
                    <WhatsAppIcon className="w-6 h-6" style={{ color: step.accent } as React.CSSProperties} />
                  ) : (
                    <step.icon className="w-6 h-6" style={{ color: step.accent }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono-fin font-bold text-[hsl(0,0%,22%)] tracking-widest">{step.num}</span>
                    <h3 className="text-lg font-extrabold text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[hsl(0,0%,48%)] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <GridOverlay />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div {...fadeUp()} className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-4">
              Quanto custa ter dois consultores?
            </h2>
            <p className="text-[hsl(0,0%,45%)] text-base sm:text-lg max-w-xl mx-auto mb-2">
              Consultor financeiro + consultor de vendas ={" "}
              <span className="line-through text-[hsl(0,0%,30%)]">R$ 5.000/mês</span>
            </p>
            <p className="text-[hsl(160,100%,50%)] font-bold text-lg">
              Com a Kash, a partir de R$ 0.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 mt-10 sm:mt-14">
            {/* Free */}
            <motion.div {...fadeUp(0.1)} className="rounded-2xl border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,3%)] p-7 sm:p-8">
              <h3 className="text-xl font-extrabold text-white mb-1">Gratuito</h3>
              <p className="text-sm text-[hsl(0,0%,42%)] mb-5">Registre e organize seus gastos</p>
              <p className="text-5xl font-extrabold text-white mb-6 font-mono-fin">
                R$ 0<span className="text-sm font-normal text-[hsl(0,0%,35%)]">/mês</span>
              </p>
              <ul className="space-y-3 mb-8">
                {["Dashboard inteligente", "Controle de receitas e despesas", "Categorização automática", "Registro por WhatsApp"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[hsl(0,0%,65%)]">
                    <Check className="h-4 w-4 text-[hsl(160,100%,50%)] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={signupLink}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Button className="w-full h-13 text-base bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow font-bold">
                    Começar Teste de 30 Dias
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div {...fadeUp(0.2)} className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(160,100%,50%)/0.15] via-[hsl(217,91%,60%)/0.08] to-transparent" />
              <div className="absolute inset-px rounded-[15px] bg-[hsl(0,0%,3%)]" />

              <div className="absolute -top-px right-6 bg-[hsl(160,100%,50%)] text-[hsl(0,0%,2%)] text-[10px] font-extrabold px-3 py-1.5 rounded-b-lg shadow-lg shadow-[hsl(160,100%,50%)/0.3] z-10 uppercase tracking-[0.15em]">
                Recomendado
              </div>

              <div className="relative p-7 sm:p-8">
                <h3 className="text-xl font-extrabold text-white mb-1 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[hsl(45,100%,60%)]" /> Premium
                </h3>
                <p className="text-sm text-[hsl(0,0%,42%)] mb-5">Consultor de Vendas IA ativado</p>
                <p className="text-5xl font-extrabold text-white mb-6 font-mono-fin">
                  R$ 29<span className="text-lg">,90</span>
                  <span className="text-sm font-normal text-[hsl(0,0%,35%)]">/mês</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {["Tudo do gratuito", "Consultor de Vendas IA", "Estratégias personalizadas", "Acompanhamento de investimentos", "Metas e planejamento", "Suporte prioritário"].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[hsl(0,0%,65%)]">
                      <Check className="h-4 w-4 text-[hsl(160,100%,50%)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={signupLink}>
                  <Button className="w-full h-13 text-base border border-[hsl(160,100%,50%)/0.3] bg-[hsl(160,100%,50%)/0.08] hover:bg-[hsl(160,100%,50%)/0.15] text-[hsl(160,100%,50%)] neon-box-glow font-bold">
                    <Crown className="h-4 w-4 mr-2" /> Assinar Premium
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp()}>
            <div className="w-14 h-14 rounded-2xl bg-[hsl(160,100%,50%)/0.08] flex items-center justify-center mx-auto mb-6 neon-box-glow">
              <Shield className="h-7 w-7 text-[hsl(160,100%,50%)]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Segurança de nível bancário
            </h2>
            <p className="text-[hsl(0,0%,45%)] text-base sm:text-lg max-w-xl mx-auto mb-8">
              Criptografia de ponta, infraestrutura enterprise. Seus dados nunca são compartilhados.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {["AES-256", "2FA", "Dados isolados", "Backups diários"].map(s => (
                <span key={s} className="px-4 py-2 rounded-full border border-[hsl(0,0%,10%)] bg-[hsl(0,0%,3%)] text-xs font-semibold text-[hsl(0,0%,50%)] hover:border-[hsl(160,100%,50%)/0.15] hover:text-white transition-all duration-300">
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
          <motion.div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, hsl(160 100% 50% / 0.1), hsl(217 91% 60% / 0.06), hsl(160 100% 50% / 0.1))", backgroundSize: "200% 200%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-[hsl(0,0%,2%)/0.7] backdrop-blur-xl" />
          <div className="absolute inset-px rounded-[23px] border border-[hsl(160,100%,50%)/0.08]" />

          <div className="relative z-10">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="inline-block mb-6">
              <Zap className="h-10 w-10 text-[hsl(160,100%,50%)]" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Seu Copiloto Financeiro Está Esperando
            </h2>
            <p className="text-[hsl(0,0%,48%)] text-base sm:text-lg mb-8 max-w-lg mx-auto">
              30 dias grátis. Sem cartão. Cancele quando quiser.
            </p>
            <Link to={signupLink}>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="inline-block">
                <Button size="lg" className="text-base px-8 h-14 bg-[hsl(348,100%,64%)] hover:bg-[hsl(348,100%,58%)] text-white border-0 cta-glow font-bold">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Ativar Meu Copiloto Grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[hsl(0,0%,7%)] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[hsl(160,100%,50%)] flex items-center justify-center shadow-md shadow-[hsl(160,100%,50%)/0.2]">
              <span className="text-[hsl(0,0%,2%)] font-extrabold text-xs">K</span>
            </div>
            <span className="font-bold text-sm text-white">Kash</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[hsl(0,0%,35%)]">
            <Link to="/login" className="hover:text-white transition-colors">Entrar</Link>
            <Link to={signupLink} className="hover:text-white transition-colors">Criar conta</Link>
            <Link to="/upgrade" className="hover:text-white transition-colors">Planos</Link>
          </div>
          <p className="text-[10px] text-[hsl(0,0%,25%)]">
            © {new Date().getFullYear()} Kash. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
