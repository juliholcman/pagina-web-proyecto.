/*
 * Acceso con usuario y contraseña al caso Farriplast (Vercel Routing Middleware, sin dependencias).
 *
 * - Sin sesión: muestra acceso-farriplast.html (pantalla de ingreso con el diseño de la web).
 * - El formulario hace POST a /farriplast; si los datos son correctos se guarda una cookie
 *   de sesión (12 h) y se vuelve a /farriplast, que ya muestra el caso.
 * - En el código solo quedan hashes: ni la contraseña ni el valor de la cookie se pueden
 *   leer desde el repo.
 *
 * Para cambiar la contraseña (reemplazar usuario:contraseña):
 *   HASH  = printf 'usuario:contraseña' | sha256sum
 *   TOKEN = printf 'usuario:contraseña|sesion-farriplast' | sha256sum
 *   CHECK = printf '<TOKEN>' | sha256sum
 */
export const config = {
  matcher: ['/farriplast', '/farriplast.html', '/farriplast/:path*'],
};

const HASH = '117fa02795934c58fcbcb1099631c3abdf0ba09d66617f906f7513b0062e89c7';
const CHECK = 'bbe8a96dd8a4719a472874080811a1e4cf038fba945fc98759f86eb18c58a27a';
const COOKIE = 'delta_farriplast';

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const all = request.headers.get('cookie') || '';
  const hit = all.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
}

function redirect(location, extraHeaders = {}) {
  return new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store', ...extraHeaders } });
}

export default async function middleware(request) {
  const url = new URL(request.url);

  // Ingreso: valida usuario y contraseña del formulario
  if (request.method === 'POST') {
    let user = '';
    let pass = '';
    try {
      const form = await request.formData();
      user = String(form.get('usuario') || '').trim().toLowerCase();
      pass = String(form.get('contrasena') || '');
    } catch (e) { /* formulario vacío o inválido */ }
    const pair = user + ':' + pass;
    if ((await sha256(pair)) === HASH) {
      const token = await sha256(pair + '|sesion-farriplast');
      return redirect('/farriplast', {
        'Set-Cookie': COOKIE + '=' + token + '; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Lax',
      });
    }
    return redirect('/farriplast?error=1');
  }

  // Con sesión válida: sigue a la página del caso
  const token = readCookie(request, COOKIE);
  if (token && (await sha256(token)) === CHECK) return;

  // Sin sesión: pantalla de ingreso
  const page = await fetch(new URL('/acceso-farriplast.html', url));
  return new Response(page.body, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
