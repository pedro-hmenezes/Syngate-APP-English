'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
import { useSession } from '@/hooks/useSession';
import { listarSalas, type Sala } from '@/services/salas.service';

// Definimos quantos BLOCOS (Andares) queremos mostrar por página
const BLOCOS_POR_PAGINA = 4; 

function SalasContent() {
  const { session, isLoading } = useSession();
  
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const pageParam = searchParams.get('page');
  const qParam = searchParams.get('q');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const debouncedSearch = qParam || '';

  const [inputValue, setInputValue] = useState(debouncedSearch);

  // Debounce da busca
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

  // Buscamos todas as salas de uma vez (limit: 200 é suficiente para o prédio inteiro)
  // Deixamos o backend fazer a filtragem de busca (q) para manter o padrão
  const salasQuery = useQuery({
    queryKey: ['salas-todas', debouncedSearch],
    queryFn: () => listarSalas({ page: 1, limit: 200, search: debouncedSearch }),
  });

  // Agrupa os resultados vindos do backend
  const salasPorBloco = useMemo(() => {
    const salas: Sala[] = salasQuery.data?.data ?? [];
    
    return salas.reduce<Record<string, Sala[]>>((acc, sala) => {
      const bloco = sala.bloco || 'Sem bloco';
      if (!acc[bloco]) acc[bloco] = [];
      acc[bloco].push(sala);
      return acc;
    }, {});
  }, [salasQuery.data?.data]);

  // Ordena os blocos numericamente (Andar 1, Andar 2 ... Andar 10)
  const blocosOrdenados = useMemo(() => {
    return Object.keys(salasPorBloco).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [salasPorBloco]);

  // Lógica de Paginação dos Blocos no React
  const totalPages = Math.max(1, Math.ceil(blocosOrdenados.length / BLOCOS_POR_PAGINA));
  
  // Fatiamos os blocos para exibir apenas os da página atual
  const blocosPaginados = useMemo(() => {
    const inicio = (page - 1) * BLOCOS_POR_PAGINA;
    return blocosOrdenados.slice(inicio, inicio + BLOCOS_POR_PAGINA);
  }, [blocosOrdenados, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const canAccess = session?.papel === 'GESTOR' || session?.papel === 'COORDENADOR';

  if (isLoading) return <div className="p-6 text-muted-foreground">Carregando sessão...</div>;

  if (!canAccess) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-foreground">Acesso restrito</CardTitle></CardHeader>
          <CardContent className="text-muted-foreground">Seu perfil não possui permissão para acessar as salas.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Salas</h1>
          <p className="text-sm text-muted-foreground">Cadastre, edite e organize as salas e andares do prédio.</p>
        </div>
        <Button asChild className="bg-[#f47920] hover:bg-[#e8621a] text-white">
          <Link href="/salas/nova">Nova sala</Link>
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-foreground">Salas cadastradas</CardTitle>
            <Input
              placeholder="Buscar por nome ou bloco"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {salasQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando salas...</p>
          ) : salasQuery.isError ? (
            <p className="text-sm text-destructive">Erro ao carregar salas.</p>
          ) : blocosOrdenados.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sala encontrada.</p>
          ) : (
            <>
              {blocosPaginados.map((bloco) => (
                <div key={bloco} className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {bloco === 'Sem bloco' ? bloco : `Bloco ${bloco}`}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Bloco</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salasPorBloco[bloco].map((sala) => (
                        <TableRow key={sala.id}>
                          <TableCell className="font-medium text-foreground">{sala.nome}</TableCell>
                          <TableCell className="text-muted-foreground">{sala.bloco}</TableCell>
                          <TableCell>
                            <div className="flex justify-end">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/salas/${sala.id}`}>Editar</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}

              {/* Controles de Paginação (Idênticos ao padrão do projeto) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
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

export default function SalasPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
      <SalasContent />
    </Suspense>
  );
}