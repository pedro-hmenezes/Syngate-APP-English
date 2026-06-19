'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Plus, KeySquare, Edit, RotateCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DevicesService } from '@/services/devices.service';

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'ATIVO':      return <Badge className="bg-emerald-500 text-white">ATIVO</Badge>;
    case 'INATIVO':    return <Badge className="bg-slate-400 text-white">INATIVO</Badge>;
    case 'MANUTENCAO': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">MANUTENÇÃO</Badge>;
    default:           return <Badge variant="outline">{status}</Badge>;
  }
}

function DevicesContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const pageParam = searchParams.get('page');
  const qParam = searchParams.get('q');

  const page = pageParam ? parseInt(pageParam, 10) : 1;
  const debouncedSearch = qParam || '';

  const [inputValue, setInputValue] = useState(debouncedSearch);

  // Lógica de debounce para a barra de busca
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

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['devices', page, debouncedSearch],
    queryFn: () => DevicesService.listar({ page, limit: PAGE_SIZE, search: debouncedSearch }),
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const devices = data?.data ?? [];
  const totalPages = data?.meta?.totalPages ?? 1;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dispositivos IoT</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os leitores e catracas conectados.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Recarregar"
          >
            <RotateCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild className="bg-[#f47920] hover:bg-[#e8621a] text-white">
            <Link href="/devices/new">
              <Plus className="h-4 w-4 mr-2" /> Novo Dispositivo
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Erro ao carregar dispositivos</p>
          <p className="text-sm">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Lista de Equipamentos</h2>
          <Input
            placeholder="Buscar por nome ou MAC..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f47920]" />
              <p className="mt-2 text-muted-foreground">Carregando dispositivos...</p>
            </div>
          </div>
        ) : devices.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Nenhum dispositivo encontrado.</p>
              <Button asChild className="bg-[#f47920] hover:bg-[#e8621a] text-white">
                <Link href="/devices/new">
                  <Plus className="h-4 w-4 mr-2" /> Cadastrar Novo
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium text-foreground">{device.nome}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {device.tipo === 'CATRACA' ? 'Catraca' : 'Leitor de Cartão'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{device.enderecoMac}</TableCell>
                    <TableCell><StatusBadge status={device.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="icon-sm" title="Editar">
                          <Link href={`/devices/${device.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="icon-sm" className="text-[#004a99]" title="Provisionar Chave">
                          <Link href={`/devices/${device.id}/provision`}>
                            <KeySquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-t border-border">
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
      </div>
    </div>
  );
}

export default function DevicesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
      <DevicesContent />
    </Suspense>
  );
}