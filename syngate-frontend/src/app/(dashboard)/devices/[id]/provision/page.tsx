'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KeySquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DevicesService } from '@/services/devices.service';
import { RawKeyDisplay } from '@/components/devices/RawKeyDisplay';

export default function ProvisionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!confirm('Gerar uma nova chave invalidará a chave atual do dispositivo. Tem certeza?')) return;

    setIsGenerating(true);
    try {
      const response = await DevicesService.provisionar(id as string);
      setRawKey(response.data.rawKey);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao gerar chave.';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setRawKey(null);
    router.push('/devices');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Provisionar Segurança</h1>

      {rawKey ? (
        <RawKeyDisplay rawKey={rawKey} onClose={handleClose} />
      ) : (
        <div className="bg-card p-8 rounded-xl border border-border shadow-sm max-w-2xl text-center space-y-4">
          <div className="mx-auto bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <KeySquare className="h-8 w-8 text-[#004a99]" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Gerar Nova Chave IoT</h2>
          <p className="text-muted-foreground">
            Esta ação criará uma credencial única para a placa ESP32 autenticar na API.
            A chave anterior deixará de funcionar imediatamente.
          </p>
          <div className="pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#f47920] hover:bg-[#e8621a] text-white"
            >
              {isGenerating ? 'Gerando...' : 'Confirmar e Gerar Chave'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}