'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TurnoForm } from '@/components/turnos/TurnoForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { criarTurno, type SalvarTurnoPayload } from '@/services/turnos.service';

export default function NovoTurnoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: SalvarTurnoPayload) => criarTurno(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['turnos'] });
      toast.success('Turno criado com sucesso.');
      router.push('/turnos');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível criar o turno.';
      toast.error(message);
    },
  });

  return (
    <div className="p-6 md:p-8">
      <Card className="bg-card border-border min-h-[520px]">
        <CardHeader>
          <CardTitle className="text-foreground">Novo turno</CardTitle>
        </CardHeader>
        <CardContent>
          <TurnoForm
            modo="criar"
            onSubmit={createMutation.mutateAsync}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}