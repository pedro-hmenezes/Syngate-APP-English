"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportsFilter } from "@/components/reports/ReportsFilter";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { reportsService } from "@/services/reports.service";
import { useSession } from "@/hooks/useSession";
import { ReportFilters } from "@/types";

function ReportsContent() {
  const searchParams = useSearchParams();
  const { session, isLoading: isSessionLoading } = useSession();

  const filters: ReportFilters = {
    dataInicio: searchParams.get("dataInicio") || undefined,
    dataFim: searchParams.get("dataFim") || undefined,
    status: searchParams.get("status") || undefined,
    usuarioId: searchParams.get("usuarioId") || undefined,
    dispositivoId: searchParams.get("dispositivoId") || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "dashboard", filters],
    queryFn: () => reportsService.getDashboard(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const canAccess =
    session?.papel === "GESTOR" || session?.papel === "COORDENADOR";

  if (isSessionLoading) {
    return (
      <div className="p-6 text-muted-foreground">Carregando sessão...</div>
    );
  }

  if (!canAccess) {
    return (
      <div className="p-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Seu perfil não possui permissão para acessar os relatórios.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleExportCSV = async () => {
    try {
      await reportsService.exportCSV(filters);
    } catch {
      toast.error("Não foi possível exportar o CSV.");
    }
  };

  const logs = data?.data?.detalhes ?? [];

  return (
    <div className="p-6 md:p-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Relatórios de Acesso
          </h1>
          <p className="text-sm text-muted-foreground">
            Filtre e exporte os logs de acesso registrados pelo sistema.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-[#f47920] hover:bg-[#e8621a] text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <ReportsFilter />

      {data?.data?.resumo && (
        <div className="mb-4 flex flex-wrap gap-3">
          <span className="text-sm text-muted-foreground">
            Total:{" "}
            <strong className="text-foreground">
              {data.data.resumo.totalAcessos}
            </strong>{" "}
            acessos
          </span>
          {data.data.resumo.porStatus.map((s) => (
            <span key={s.status} className="text-sm text-muted-foreground">
              {s.status}:{" "}
              <strong className="text-foreground">{s._count}</strong>
            </span>
          ))}
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando registros...</span>
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive py-6">
          Erro ao carregar os relatórios.
        </p>
      ) : (
        <ReportsTable logs={logs} />
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}
    >
      <ReportsContent />
    </Suspense>
  );
}
