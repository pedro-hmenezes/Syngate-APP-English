'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TurnoForm } from '@/components/turnos/TurnoForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { atualizarTurno, buscarTurnoPorId, type SalvarTurnoPayload } from '@/services/turnos.service';

export default function EditarTurnoPage() {
  const params = useParams<{ id: string }>();
  const turnoId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const turnoQuery = useQuery({
    queryKey: ['turno', turnoId],
    queryFn: () => buscarTurnoPorId(turnoId),
    enabled: Boolean(turnoId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: SalvarTurnoPayload) => atualizarTurno(turnoId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['turnos'] }),
        queryClient.invalidateQueries({ queryKey: ['turno', turnoId] }),
      ]);
      toast.success('Turno atualizado com sucesso.');
      router.push('/turnos');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível atualizar o turno.';
      toast.error(message);
    },
  });

  return (
    <div className="p-6 md:p-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Editar turno</CardTitle>
        </CardHeader>
        <CardContent>
          {turnoQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando turno...</p>
          ) : turnoQuery.isError || !turnoQuery.data?.data ? (
            <p className="text-sm text-destructive">Não foi possível carregar os dados do turno.</p>
          ) : (
            <TurnoForm
              modo="editar"
              valoresIniciais={turnoQuery.data.data}
              onSubmit={updateMutation.mutateAsync}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}