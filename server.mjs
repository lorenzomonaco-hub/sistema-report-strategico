// ─── Server statico con cancello di accesso ───
// Serve la build statica (out/) SOLO dopo il login: senza il cookie firmato
// nessun file viene servito. La password sta in ACCESSO_PASSWORD (variabile
// Railway); cambiandola si invalidano anche le sessioni già aperte.
// Se ACCESSO_PASSWORD non è impostata (es. in locale) il cancello è spento.

import { createHmac, timingSafeEqual } from 'node:crypto'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'

const PORTA = Number(process.env.PORT ?? 8000)
const RADICE = resolve('out')
const PASSWORD = process.env.ACCESSO_PASSWORD ?? ''
const COOKIE = 'accesso-report'
const GIORNI_SESSIONE = 30

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.webmanifest': 'application/manifest+json',
}

// Il valore del cookie dipende solo dalla password: cambiando la password
// dal pannello Railway, tutte le sessioni aperte decadono da sole.
const firma = () => createHmac('sha256', `sale-report-strategico|${PASSWORD}`).update('ok').digest('hex')

const uguali = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

const cookieValido = (req) => {
  const riga = req.headers.cookie ?? ''
  const voce = riga.split(';').map((v) => v.trim()).find((v) => v.startsWith(`${COOKIE}=`))
  return voce ? uguali(voce.slice(COOKIE.length + 1), firma()) : false
}

// Anti forza-bruta: massimo 10 tentativi per IP ogni 10 minuti.
const tentativi = new Map()
const bloccato = (ip) => {
  const ora = Date.now()
  const voce = tentativi.get(ip)
  if (!voce || ora - voce.inizio > 10 * 60_000) return false
  return voce.conta >= 10
}
const registraTentativo = (ip) => {
  const ora = Date.now()
  const voce = tentativi.get(ip)
  if (!voce || ora - voce.inizio > 10 * 60_000) tentativi.set(ip, { inizio: ora, conta: 1 })
  else voce.conta += 1
}

const paginaLogin = (dopo, errore) => `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Accesso — Sistema Report Strategico</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #F8F6F1; color: #1F3A3D;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    background-image: radial-gradient(rgba(31,58,61,.06) 1px, transparent 1px);
    background-size: 22px 22px; padding: 24px;
  }
  .carta {
    width: 100%; max-width: 400px; background: #FFFFFF; border: 1px solid rgba(31,58,61,.12);
    border-radius: 20px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(31,58,61,.08);
  }
  .filo { height: 4px; border-radius: 99px; background: #D97706; width: 56px; margin-bottom: 20px; }
  h1 { font-size: 22px; letter-spacing: -0.02em; }
  p.sotto { margin-top: 6px; font-size: 14px; color: rgba(31,58,61,.55); line-height: 1.5; }
  label { display: block; margin-top: 22px; font-size: 12px; font-weight: 600; color: rgba(31,58,61,.6); }
  input[type=password] {
    width: 100%; margin-top: 6px; padding: 11px 13px; font-size: 15px;
    border: 1px solid rgba(31,58,61,.18); border-radius: 12px; background: #FDFCFA; color: inherit;
  }
  input[type=password]:focus { outline: 2px solid #1F6E70; border-color: transparent; }
  button {
    width: 100%; margin-top: 18px; padding: 12px; font-size: 15px; font-weight: 700;
    color: #fff; background: #1F6E70; border: 0; border-radius: 12px; cursor: pointer;
  }
  button:hover { background: #17595B; }
  .errore {
    margin-top: 16px; padding: 10px 12px; font-size: 13px; border-radius: 10px;
    background: #FDF2F2; border: 1px solid #F5C6C6; color: #9B1C1C;
  }
  .piede { margin-top: 22px; text-align: center; font-size: 12px; color: rgba(31,58,61,.4); }
</style>
</head>
<body>
  <main class="carta">
    <div class="filo"></div>
    <h1>Sistema Report Strategico</h1>
    <p class="sotto">Area riservata al team. Inserisci la password di accesso per continuare.</p>
    ${errore ? `<div class="errore">${errore}</div>` : ''}
    <form method="post" action="/accesso">
      <input type="hidden" name="dopo" value="${dopo.replaceAll('"', '')}">
      <label for="password">Password di accesso</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
      <button type="submit">Entra</button>
    </form>
    <p class="piede">L&rsquo;accesso resta attivo ${GIORNI_SESSIONE} giorni su questo browser.</p>
  </main>
</body>
</html>`

const rispondiLogin = (res, dopo, errore = '', codice = 401) => {
  res.writeHead(codice, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
  res.end(paginaLogin(dopo, errore))
}

const inviaFile = (res, percorso) => {
  const tipo = MIME[extname(percorso).toLowerCase()] ?? 'application/octet-stream'
  const immutabile = percorso.includes(`${sep}_next${sep}`)
  res.writeHead(200, {
    'content-type': tipo,
    'content-length': statSync(percorso).size,
    'cache-control': immutabile ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  createReadStream(percorso).pipe(res)
}

// Risoluzione stile "serve": file esatto → cartella/index.html → percorso.html → 404.html
const risolvi = (pathname) => {
  const pulito = normalize(decodeURIComponent(pathname)).replaceAll('\\', '/')
  const base = resolve(join(RADICE, pulito))
  if (base !== RADICE && !base.startsWith(RADICE + sep)) return null
  const candidati = [base, join(base, 'index.html'), `${base}.html`]
  for (const c of candidati) {
    if (existsSync(c) && statSync(c).isFile()) return c
  }
  return null
}

const leggiCorpo = (req) =>
  new Promise((ok, no) => {
    let corpo = ''
    req.on('data', (pezzo) => {
      corpo += pezzo
      if (corpo.length > 10_000) no(new Error('corpo troppo grande'))
    })
    req.on('end', () => ok(corpo))
    req.on('error', no)
  })

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://interno')
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '').split(',')[0].trim()
  const sicuro = (req.headers['x-forwarded-proto'] ?? '') === 'https'

  // Uscita: cancella il cookie e torna al login.
  if (url.pathname === '/esci') {
    res.writeHead(302, {
      'set-cookie': `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      location: '/',
    })
    return res.end()
  }

  // Login.
  if (PASSWORD && url.pathname === '/accesso' && req.method === 'POST') {
    if (bloccato(ip)) return rispondiLogin(res, '/', 'Troppi tentativi: riprova tra qualche minuto.', 429)
    let dati
    try {
      dati = new URLSearchParams(await leggiCorpo(req))
    } catch {
      return rispondiLogin(res, '/', 'Richiesta non valida.', 400)
    }
    const dopo = (dati.get('dopo') ?? '/').startsWith('/') ? (dati.get('dopo') ?? '/') : '/'
    if (uguali(dati.get('password') ?? '', PASSWORD)) {
      tentativi.delete(ip)
      res.writeHead(302, {
        'set-cookie': `${COOKIE}=${firma()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${GIORNI_SESSIONE * 86400}${sicuro ? '; Secure' : ''}`,
        location: dopo,
      })
      return res.end()
    }
    registraTentativo(ip)
    return rispondiLogin(res, dopo, 'Password sbagliata.')
  }

  // Cancello: senza cookie valido si vede solo la pagina di accesso.
  if (PASSWORD && !cookieValido(req)) {
    return rispondiLogin(res, url.pathname)
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' })
    return res.end()
  }

  const file = risolvi(url.pathname)
  if (file) return inviaFile(res, file)

  const pagina404 = join(RADICE, '404.html')
  if (existsSync(pagina404)) {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    return createReadStream(pagina404).pipe(res)
  }
  res.writeHead(404)
  res.end('Non trovato')
})

server.listen(PORTA, () => {
  console.log(
    `Sito su :${PORTA} — cancello di accesso ${PASSWORD ? 'ATTIVO' : 'SPENTO (ACCESSO_PASSWORD non impostata)'}`
  )
})
