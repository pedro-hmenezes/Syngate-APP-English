'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { LoginPayload, JwtPayload } from '@/types';

const COOKIE_NAME = 'syngate_token';

// O backend devolve { status: "success", data: { accessToken: "..." } }
interface LoginResponse {
  status: string;
  data: {
    accessToken: string;
  };
}

export async function loginAction(email: string, senha: string) {
  try {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senhaLimpa: senha }),
    });

    const token = data?.data?.accessToken;

    if (!token) {
      throw new Error('Token não recebido do backend.');
    }

    (await cookies()).set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao realizar login.';
    console.error('Erro no loginAction:', message);
    return { success: false, error: 'Credenciais inválidas. Tente novamente.' };
  }
}

export async function getSessionAction(): Promise<JwtPayload | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;

    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64))) as JwtPayload;
  } catch {
    return null;
  }
}

export async function logoutAction() {
  (await cookies()).delete(COOKIE_NAME);
  redirect('/login');
}