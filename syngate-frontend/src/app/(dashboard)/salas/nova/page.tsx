'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RoomForm } from '@/components/salas/RoomForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { criarSala, type SalvarSalaPayload } from '@/services/salas.service';

function getSalaErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (
    message.includes('duplic') ||
    message.includes('ja existe') ||
    (message.includes('nome') && message.includes('bloco'))
  ) {
    return 'Já existe uma sala com esse nome nesse bloco.';
  }
  return 'Não foi possível criar a sala.';
}

export default function NovaSalaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: SalvarSalaPayload) => criarSala(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salas'] });
      toast.success('Sala criada com sucesso.');
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
          <CardTitle className="text-foreground">Nova sala</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomForm
            modo="criar"
            onSubmit={createMutation.mutateAsync}
            isSubmitting={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}