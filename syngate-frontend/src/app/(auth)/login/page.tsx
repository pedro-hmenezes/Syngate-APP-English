"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShieldCheck, Layers, Activity } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha muito curta'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: ShieldCheck, label: 'Gestão Segura',      desc: 'Controle de acessos rigoroso e auditável.' },
  { icon: Layers,      label: 'Ambiente Integrado', desc: 'Tudo o que você precisa em uma única tela.' },
  { icon: Activity,    label: 'Alta Performance',   desc: 'Relatórios e métricas em tempo real.' },
];

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  });

  async function onSubmit(data: LoginForm) {
  const result = await loginAction(data.email, data.senha);
  if (result.success) router.push('/dashboard');
  else toast.error(result.error);
}

  return (
    // bg-background cobre light (#fff) e dark (#0d1117)
    <div className="relative flex h-screen w-full overflow-hidden bg-background">

      {/* ── PAINEL ESQUERDO (decorativo) ─────────────────────────── */}
      <div className="relative hidden w-[52%] shrink-0 lg:block">
        <div className="absolute inset-0 bg-gradient-to-b from-[#003d7d] to-[#002a5a]" />

        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-0 h-full w-[65%]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0 100%)',
            background: 'linear-gradient(100deg, #f47920 0%, #e8621a 8%, transparent 76%)',
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-14">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span className="text-2xl font-bold tracking-tight text-white">Syngate.</span>
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-bold leading-tight tracking-tight text-white"
            >
              Controle de<br />
              acesso<br />
              inteligente.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="mt-5 max-w-xs text-base text-white/85 leading-relaxed"
            >
              Plataforma centralizada para gestão acadêmica e controle de acesso físico via IoT.
            </motion.p>

            <div className="mt-10 space-y-5">
              {features.map(({ icon: Icon, label, desc }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.12, duration: 0.5 }}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-white/75 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="text-xs text-white/60"
          >
            © 2026 Senac Pernambuco. Todos os direitos reservados.
          </motion.p>
        </div>
      </div>

      {/* ── PAINEL DIREITO (formulário) ───────────────────────────── */}
      {/* bg-background + text-foreground cobrem light e dark */}
      <div className="flex flex-1 items-center justify-center bg-background px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[360px]"
        >
          <div className="mb-9">
            <p className="text-xs font-bold uppercase tracking-widest text-[#f47920]">
              Portal de acesso
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Entrar
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Bem-vindo(a) de volta. Insira seus dados.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[11px] font-bold uppercase tracking-wider text-foreground"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors hover:border-[#004a99] focus-visible:border-[#004a99] focus-visible:ring-1 focus-visible:ring-[#004a99] focus-visible:ring-offset-0"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="senha"
                className="text-[11px] font-bold uppercase tracking-wider text-foreground"
              >
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground transition-colors hover:border-[#004a99] focus-visible:border-[#004a99] focus-visible:ring-1 focus-visible:ring-[#004a99] focus-visible:ring-offset-0"
                {...register('senha')}
              />
              {errors.senha && (
                <p className="text-xs text-red-500">{errors.senha.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full rounded-lg bg-[#004a99] text-sm font-bold text-white transition-all hover:bg-[#003d7d] active:scale-[0.98]"
            >
              {isSubmitting ? 'Verificando...' : 'Acessar Sistema'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button className="text-sm text-muted-foreground transition-colors hover:text-[#f47920]">
              Problemas com o acesso?
            </button>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Senac PE · 2026</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}