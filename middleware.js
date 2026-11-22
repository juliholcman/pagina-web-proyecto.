/*
 * Clave para el caso Farriplast (Vercel Routing Middleware, sin dependencias).
 * El navegador pide usuario y contraseña antes de mostrar la página.
 * En el código solo queda el hash SHA-256 de "usuario:contraseña", no la contraseña.
 * Para cambiarla: printf 'usuario:contraseña' | sha256sum  y reemplazar HASH.
 */
export const config = {
  matcher: ['/farriplast', '/farriplast.html', '/farriplast/:path*'],
};

const HASH = '117fa02795934c58fcbcb1099631c3abdf0ba09d66617f906f7513b0062e89c7';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const PAGE = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Acceso restringido · Delta Consultora</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Inter,system-ui,sans-serif;
    background:linear-gradient(135deg,#0D47A1,#1565C0 55%,#5FCBF5);color:#fff;text-align:center;padding:24px}
  .box{max-width:420px}
  .lock{width:64px;height:64px;margin:0 auto 18px;border-radius:50%;background:rgba(255,255,255,.15);display:grid;place-items:center}
  h1{font-size:1.6rem;margin:0 0 10px}
  p{opacity:.9;line-height:1.5;margin:0 0 22px}
  a{display:inline-block;padding:12px 22px;border-radius:999px;background:#fff;color:#0D47A1;font-weight:700;text-decoration:none}
</style></head>
<body><div class="box">
  <div class="lock"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
  <h1>Caso Farriplast</h1>
  <p>Este caso tiene acceso restringido. Recargá la página e ingresá el usuario y la contraseña que te compartió el equipo.</p>
  <a href="/casos-exito">Volver a casos de éxito</a>
</div></body></html>`;

export default async function middleware(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    let pair = '';
    try { pair = atob(auth.slice(6)); } catch (e) { pair = ''; }
    if (pair && (await sha256(pair)) === HASH) return; // credenciales correctas: sigue a la página
  }
  return new Response(PAGE, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Caso Farriplast", charset="UTF-8"',
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
