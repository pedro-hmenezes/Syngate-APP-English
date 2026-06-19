'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatarDiasSemana } from '@/components/turnos/DiasSemanaSelector';
import { useSession } from '@/hooks/useSession';
import { listarTurnos, type Turno } from '@/services/turnos.service';
import { minutesToTime } from '@/utils/time';

const PAGE_SIZE = 10;

export default function TurnosPage() {
  const { session, isLoading } = useSession();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const turnosQuery = useQuery({
    queryKey: ['turnos', page, debouncedSearch],
    queryFn: () => listarTurnos({ page, limit: PAGE_SIZE, search: debouncedSearch }),
  });

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
            Seu perfil não possui permissão para acessar os turnos.
          </CardContent>
        </Card>
      </div>
    );
  }

  const turnos: Turno[] = turnosQuery.data?.data ?? [];
  const totalPages = turnosQuery.data?.meta?.totalPages ?? 1;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Turnos</h1>
          <p className="text-sm text-muted-foreground">Configure horários e dias da semana de cada turno.</p>
        </div>
        <Button asChild className="bg-[#f47920] hover:bg-[#e8621a] text-white">
          <Link href="/turnos/novo">Novo turno</Link>
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-foreground">Turnos cadastrados</CardTitle>
            <Input
              placeholder="Buscar por nome"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {turnosQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando turnos...</p>
          ) : turnosQuery.isError ? (
            <p className="text-sm text-destructive">Erro ao carregar turnos.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {turnos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        Nenhum turno encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    turnos.map((turno) => (
                      <TableRow key={turno.id}>
                        <TableCell className="font-medium text-foreground">{turno.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {minutesToTime(turno.horaInicio)} – {minutesToTime(turno.horaFim)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{formatarDiasSemana(turno.diasSemana)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/turnos/${turno.id}`}>Editar</Link>
                            </Button>
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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