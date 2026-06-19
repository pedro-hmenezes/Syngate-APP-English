'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuarioForm } from '@/components/usuarios/UsuarioForm';

export default function NovoUsuarioPage() {
  return (
    <div className="p-6 md:p-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <UsuarioForm modo="criar" />
        </CardContent>
      </Card>
    </div>
  );
}