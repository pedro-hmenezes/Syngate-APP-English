'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuarioForm } from '@/components/usuarios/UsuarioForm';
import { buscarUsuarioPorId } from '@/services/usuarios.service';

export default function EditarUsuarioPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const usuarioQuery = useQuery({
    queryKey: ['usuario', userId],
    queryFn: () => buscarUsuarioPorId(userId),
    enabled: Boolean(userId),
  });

  return (
    <div className="p-6 md:p-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Editar Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          {usuarioQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando usuário...</p>
          ) : usuarioQuery.isError || !usuarioQuery.data?.data ? (
            <p className="text-sm text-destructive">Não foi possível carregar os dados do usuário.</p>
          ) : (
            <UsuarioForm
              modo="editar"
              usuarioId={userId}
              valoresIniciais={usuarioQuery.data.data}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}