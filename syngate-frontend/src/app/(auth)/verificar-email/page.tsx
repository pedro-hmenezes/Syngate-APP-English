'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    async function validarToken() {
      try {
        // CORREÇÃO: Passando para GET e enviando o token na URL (Query Param)
        await apiFetch(`/auth/verificar-email?token=${token}`, { 
          method: 'GET',
        });
        
        setStatus('success');
        toast.success('E-mail verificado com sucesso!');
        setTimeout(() => router.push('/login'), 3000);
      } catch (error) {
        setStatus('error');
        toast.error('Token inválido ou expirado.');
      }
    }

    validarToken();
  }, [token, router]);

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Verificação de Conta</CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'loading' && <p>Validando seu e-mail, aguarde...</p>}
        {status === 'success' && <p className="text-green-600 font-medium">E-mail verificado! Redirecionando para o login...</p>}
        {status === 'error' && <p className="text-destructive font-medium">Ocorreu um erro na verificação do seu e-mail. Link inválido.</p>}
      </CardContent>
    </Card>
  );
}

export default function VerificarEmailPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30">
      <Suspense fallback={<p>Carregando parâmetros...</p>}>
        <VerificarEmailContent />
      </Suspense>
    </div>
  );
}