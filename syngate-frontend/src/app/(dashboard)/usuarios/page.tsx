'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SoftDeleteDialog } from '@/components/usuarios/SoftDeleteDialog';
import { useSession } from '@/hooks/useSession';
import { inativarUsuario, listarUsuarios, reativarUsuario, type Usuario } from '@/services/usuarios.service';

const PAGE_SIZE = 10;

function UsuariosContent() {
  const queryClient = useQueryClient();
  const { session, isLoading } = useSession();
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const pageParam = searchParams.get('page');
  const qParam = searchParams.get('q');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const debouncedSearch = qParam || '';

  const [inputValue, setInputValue] = useState(debouncedSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (inputValue.trim()) {
        params.set('q', inputValue.trim());
      } else {
        params.delete('q');
      }
      if (inputValue.trim() !== debouncedSearch) {
        params.set('page', '1'); 
      }
      replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, pathname, replace, searchParams, debouncedSearch]);

  const usuariosQuery = useQuery({
    queryKey: ['usuarios', page, debouncedSearch],
    queryFn: () => listarUsuarios({ page, limit: PAGE_SIZE, search: debouncedSearch }),
  });

  const inativarMutation = useMutation({
    mutationFn: (id: string) => inativarUsuario(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário inativado com sucesso.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível inativar o usuário.';
      toast.error(message);
    },
  });

  const reativarMutation = useMutation({
    mutationFn: (id: string) => reativarUsuario(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuário reativado com sucesso.');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Não foi possível reativar o usuário.';
      toast.error(message);
    },
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const canAccess = session?.papel === 'GESTOR' || session?.papel === 'COORDENADOR';

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Carregando sessão...</div>;
  }

  if (!canAccess) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Seu perfil não possui permissão para acessar a gestão de usuários.
          </CardContent>
        </Card>
      </div>
    );
  }

  const usuarios: Usuario[] = usuariosQuery.data?.data ?? [];
  const totalPages = usuariosQuery.data?.meta?.totalPages ?? 1;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground">Cadastre, edite, inative e vincule cartões RFID.</p>
        </div>
        <Button asChild className="bg-[#f47920] hover:bg-[#e8621a] text-white">
          <Link href="/dashboard/usuarios/novo">Novo Usuário</Link>
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-foreground">Usuários Cadastrados</CardTitle>
            <Input
              placeholder="Buscar por nome, e-mail ou matrícula"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {usuariosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando usuários...</p>
          ) : usuariosQuery.isError ? (
            <p className="text-sm text-destructive">Erro ao carregar usuários.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell className="font-medium text-foreground">{usuario.nome}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                        <TableCell className="text-muted-foreground">{usuario.papel}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              usuario.ativo
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'border-border bg-muted text-muted-foreground'
                            }
                          >
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/dashboard/usuarios/${usuario.id}`}>Editar</Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/dashboard/usuarios/${usuario.id}/cartao`}>Cartão</Link>
                            </Button>
                            {!usuario.ativo && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={reativarMutation.isPending || inativarMutation.isPending}
                                onClick={() => reativarMutation.mutateAsync(usuario.id)}
                              >
                                Reativar
                              </Button>
                            )}
                            <SoftDeleteDialog
                              usuarioNome={usuario.nome}
                              disabled={!usuario.ativo || inativarMutation.isPending || reativarMutation.isPending}
                              onConfirm={() => inativarMutation.mutateAsync(usuario.id)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
      <UsuariosContent />
    </Suspense>
  );
}