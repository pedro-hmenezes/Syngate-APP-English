'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RoomForm } from '@/components/salas/RoomForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { atualizarSala, buscarSalaPorId, type SalvarSalaPayload } from '@/services/salas.service';

function getSalaErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (
    message.includes('duplic') ||
    message.includes('ja existe') ||
    (message.includes('nome') && message.includes('bloco'))
  ) {
    return 'Já existe uma sala com esse nome nesse bloco.';
  }
  return 'Não foi possível atualizar a sala.';
}

export default function EditarSalaPage() {
  const params = useParams<{ id: string }>();
  const salaId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const salaQuery = useQuery({
    queryKey: ['sala', salaId],
    queryFn: () => buscarSalaPorId(salaId),
    enabled: Boolean(salaId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: SalvarSalaPayload) => atualizarSala(salaId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['salas'] }),
        queryClient.invalidateQueries({ queryKey: ['sala', salaId] }),
      ]);
      toast.success('Sala atualizada com sucesso.');
      router.push('/salas');
    },
    onError: (error) => {
      toast.error(getSalaErrorMessage(error));
    },
  });

  return (
    <div className="p-6 md:p-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Editar sala</CardTitle>
        </CardHeader>
        <CardContent>
          {salaQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando sala...</p>
          ) : salaQuery.isError || !salaQuery.data?.data ? (
            <p className="text-sm text-destructive">Não foi possível carregar os dados da sala.</p>
          ) : (
            <RoomForm
              modo="editar"
              valoresIniciais={salaQuery.data.data}
              onSubmit={updateMutation.mutateAsync}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}