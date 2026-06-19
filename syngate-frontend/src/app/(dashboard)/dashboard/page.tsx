'use client';

import { Activity, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { AccessFeed } from '@/components/dashboard/AccessFeed';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function DashboardPage() {
  return (
    // bg-background → #fff light / #0d1117 dark
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 md:p-8 bg-background min-h-screen"
    >
      {/* ── BARRA DE STATUS ─────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="mb-8 relative overflow-hidden rounded-2xl bg-[#002a5a] border border-blue-900/30 shadow-lg shadow-blue-900/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#004a99] to-[#002a5a] opacity-90" />
        <div
          className="absolute -right-20 -top-20 w-96 h-96 rounded-full opacity-[0.15] pointer-events-none blur-[100px]"
          style={{ background: '#f47920' }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between p-6 md:p-8 text-white gap-6">
          <div className="flex items-start md:items-center gap-5">
            <div className="relative p-3.5 bg-white/5 rounded-xl backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.2)] shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f47920]/20 to-transparent rounded-xl opacity-50" />
              <Activity className="h-7 w-7 text-[#f47920] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h2 className="font-bold text-xl md:text-2xl tracking-tight text-white drop-shadow-sm">
                  Sistema Syngate Ativo
                </h2>
              </div>
              <p className="text-blue-100/70 text-sm md:text-base font-medium max-w-lg leading-relaxed">
                Monitoramento em tempo real operando com{' '}
                <span className="text-white">latência mínima</span> nos pontos de acesso.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-6 lg:gap-8 lg:border-l border-white/10 lg:pl-8 pt-4 lg:pt-0 mt-2 lg:mt-0">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#f47920] mb-1.5 drop-shadow-sm">
                Integridade
              </span>
              <span className="text-emerald-400 font-semibold text-sm flex items-center gap-1.5 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20">
                <CheckCircle2 className="w-4 h-4" /> Excelente
              </span>
            </div>

            <div className="w-px h-12 bg-white/10 hidden md:block" />

            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 mb-0.5">
                Uptime Global
              </span>
              <div className="flex items-baseline gap-0.5 justify-end">
                <span className="block text-4xl font-black tracking-tighter text-white drop-shadow-md">
                  99.9
                </span>
                <span className="text-xl font-bold text-white/50">%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── STATS CARDS ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="mb-8">
        <StatsCards />
      </motion.div>

      {/* ── GRID PRINCIPAL ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Feed de Acessos */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            {/* text-foreground → #0f172a light / #e2e8f0 dark */}
            <h3 className="text-lg font-bold text-foreground tracking-tight">Fluxo de Acessos</h3>
            <button className="text-xs font-bold text-[#004a99] flex items-center gap-1 hover:text-[#f47920] transition-colors">
              Ver Relatório <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          {/* border-border e bg-card respondem ao dark mode */}
          <Card className="border-border shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-card p-5">
                <AccessFeed />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Painel lateral */}
        <div className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4 text-[#004a99]">
              <ShieldCheck className="h-6 w-6" />
              <h3 className="font-bold tracking-tight text-foreground">Auditoria</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Acompanhe a integridade dos acessos e realize varreduras nos logs do sistema.
            </p>
            <button className="w-full py-2.5 bg-[#f47920] hover:bg-[#e8621a] text-white rounded-lg text-sm font-bold transition-all active:scale-[0.98] shadow-sm shadow-orange-900/20">
              Executar Varredura
            </button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card rounded-xl border border-border shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5 text-[#004a99]">
              <Cpu className="h-6 w-6" />
              <h3 className="font-bold tracking-tight text-foreground">Infraestrutura</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Servidor API' },
                { label: 'Banco de Dados' },
              ].map((item, i) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm">
                    {/* text-muted-foreground → #64748b light / #8b949e dark */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {item.label}
                    </div>
                    <span className="font-semibold text-emerald-600">Online</span>
                  </div>
                  {i === 0 && <div className="w-full h-px bg-border mt-4" />}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}