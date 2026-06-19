'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buscarUsuarioPorId, vincularCartaoUsuario } from '@/services/usuarios.service';

export default function VincularCartaoPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const queryClient = useQueryClient();

  const [uid, setUid] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const usuarioQuery = useQuery({
    queryKey: ['usuario', userId],
    queryFn: () => buscarUsuarioPorId(userId),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    const currentCard = usuarioQuery.data?.data?.cartaoId;
    if (typeof currentCard === 'string') setUid(currentCard);
  }, [usuarioQuery.data?.data?.cartaoId]);

  useEffect(() => {
    let active = true;

    async function generateQrCode() {
      const normalized = uid.trim();
      if (!normalized) { setQrCodeDataUrl(null); return; }
      try {
        const code = await QRCode.toDataURL(normalized, { width: 240, margin: 1 });
        if (active) setQrCodeDataUrl(code);
      } catch {
        if (active) setQrCodeDataUrl(null);
      }
    }

    generateQrCode();
    return () => { active = false; };
  }, [uid]);

  const vinculoMutation = useMutation({
    mutationFn: (cartaoId: string | null) => vincularCartaoUsuario(userId, cartaoId),
    onSuccess: async (_, cartaoId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
        queryClient.invalidateQueries({ queryKey: ['usuario', userId] }),
      ]);
      toast.success(cartaoId ? 'Cartão vinculado com sucesso.' : 'Cartão desvinculado com sucesso.');
      if (cartaoId === null) setUid('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar vínculo do cartão.';
      toast.error(message);
    },
  });

  const handleVincular = async () => {
    const normalized = uid.trim();
    if (!normalized) { toast.error('Informe o UID do cartão para continuar.'); return; }
    await vinculoMutation.mutateAsync(normalized);
  };

  const handleDesvincular = async () => {
    await vinculoMutation.mutateAsync(null);
  };

  return (
    <div className="p-6 md:p-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Vínculo de Cartão RFID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {usuarioQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando usuário...</p>
          ) : usuarioQuery.isError || !usuarioQuery.data?.data ? (
            <p className="text-sm text-destructive">Não foi possível carregar os dados do usuário.</p>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Usuário</p>
                <p className="font-semibold text-foreground">{usuarioQuery.data.data.nome}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="uid-cartao">
                  UID do Cartão RFID
                </label>
                <Input
                  id="uid-cartao"
                  placeholder="Ex: RFID-ALUN-002"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                />
              </div>

              {qrCodeDataUrl && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">QR Code do UID</p>
                  <Image
                    src={qrCodeDataUrl}
                    alt="QR Code do UID"
                    width={240}
                    height={240}
                    unoptimized
                    className="h-auto w-auto rounded-lg"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleVincular}
                  disabled={vinculoMutation.isPending}
                  className="bg-[#004a99] hover:bg-[#003d7d] text-white"
                >
                  {vinculoMutation.isPending ? 'Salvando...' : 'Vincular cartão'}
                </Button>
                <Button variant="outline" onClick={handleDesvincular} disabled={vinculoMutation.isPending}>
                  Desvincular cartão
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/usuarios">Voltar</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}