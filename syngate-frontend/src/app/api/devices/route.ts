import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOKEN_COOKIE = 'syngate_token';

function buildTargetUrl(req: NextRequest) {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) throw new Error('API_URL não configurada.');
  const cleanedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const target = new URL(`${cleanedBase}/devices`);
  req.nextUrl.searchParams.forEach((value, key) => target.searchParams.set(key, value));
  return target.toString();
}

async function handle(req: NextRequest) {
  try {
    const token = (await cookies()).get(TOKEN_COOKIE)?.value;
    const targetUrl = buildTargetUrl(req);
    const headers: HeadersInit = { Accept: 'application/json' };
    const contentType = req.headers.get('content-type');
    if (contentType) headers['Content-Type'] = contentType;
    if (token) headers.Authorization = `Bearer ${token}`;

    const method = req.method.toUpperCase();
    const hasBody = !['GET', 'HEAD'].includes(method);

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: hasBody ? await req.text() : undefined,
      cache: 'no-store',
    });

    const responseText = await response.text();
    const nextHeaders = new Headers();
    const ct = response.headers.get('content-type');
    if (ct) nextHeaders.set('content-type', ct);

    return new NextResponse(responseText, { status: response.status, headers: nextHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado no proxy de devices.';
    return NextResponse.json({ status: 'error', message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }