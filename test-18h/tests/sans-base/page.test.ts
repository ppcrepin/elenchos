// JETABLE (la page du test) ; REPRIS (proposé) : le relevé statique de P-09 et P-10.
// La page et ce qu'elle charge : rien d'ailleurs (P-09, P-10), installable sur l'écran d'accueil, non référencée,
// aucun texte du jeu ni contenu politique (condition de Juridique), mots marqués relus par UX.

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { CSP } from '../../src/serveur.ts';

const PUBLIC = join(import.meta.dirname, '..', '..', 'public');
const texte = (f: string) => readFileSync(join(PUBLIC, f), 'utf8');
const TEXTES = readdirSync(PUBLIC).filter((f) => /\.(html|js|css|webmanifest)$/.test(f));

test('aucune ressource chargée ailleurs : aucune adresse externe dans la page, ses scripts, ses styles', () => {
  for (const f of TEXTES) {
    const contenu = texte(f);
    const adresses = contenu.match(/(https?:)?\/\/[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];
    assert.deepEqual(adresses, [], `${f} contient une adresse externe`);
    assert.ok(!/apple\.com|google\.com|googleapis|gstatic|appleid/i.test(contenu), `${f} cite un domaine d’Apple ou de Google`);
  }
  const index = texte('index.html');
  assert.ok(index.includes('href="/connexion/apple"') && index.includes('href="/connexion/google"'), 'les boutons sont de simples liens');
  assert.ok(!/<script[^>]+src="(?!\/)/.test(index) && !/<iframe/i.test(index));
});

test('la politique de sécurité refuse tout chargement venu d’ailleurs', () => {
  assert.match(CSP, /default-src 'none'/);
  for (const d of ['script-src', 'style-src', 'img-src', 'connect-src', 'manifest-src', 'worker-src', 'form-action']) {
    assert.match(CSP, new RegExp(`${d} 'self'(;|$)`));
  }
  assert.match(CSP, /frame-ancestors 'none'/);
});

test('installable sur l’écran d’accueil d’un iPhone : manifeste, icônes du logo, demande de non-référencement', () => {
  const m = JSON.parse(texte('manifest.webmanifest'));
  assert.equal(m.display, 'standalone');
  assert.equal(m.start_url, '/');
  assert.equal(m.name, 'Test 18h');
  const index = texte('index.html');
  assert.match(index, /<link rel="manifest" href="\/manifest.webmanifest">/);
  assert.match(index, /<link rel="apple-touch-icon" href="\/apple-touch-icon.png">/);
  assert.match(index, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(index, /<meta name="apple-mobile-web-app-title" content="Test 18h">/);
  const tailles: Record<string, number> = { 'apple-touch-icon.png': 180, 'icone-192.png': 192, 'icone-512.png': 512 };
  for (const [f, n] of Object.entries(tailles)) {
    const png = readFileSync(join(PUBLIC, f));
    assert.equal(png.subarray(1, 4).toString('latin1'), 'PNG');
    assert.equal(png.readUInt32BE(16), n);
    assert.equal(png.readUInt32BE(20), n);
    // Dans le dépôt complet seulement : chez Scalingo, seul le dossier test-18h est présent (PROJECT_DIR).
    const source = join(import.meta.dirname, '..', '..', '..', 'docs', 'identite', 'logo', 'png',
      f === 'apple-touch-icon.png' ? f : f.replace('icone-', 'elenchos-icone-'));
    if (existsSync(source)) assert.deepEqual(png, readFileSync(source), `${f} est l’icône du logo`);
  }
});

test('la page dit seulement trois choses, en « tu », sans adresse e-mail, et ses mots sont marqués relus par UX', () => {
  const index = texte('index.html');
  for (const l of ['Ouverte depuis l’icône', 'Messages de 18h', 'Connexion']) assert.ok(index.includes(l));
  assert.equal((index.match(/<li>/g) ?? []).length, 3);
  for (const b of ['Recevoir le message de 18h', 'Continuer avec Apple', 'Continuer avec Google']) assert.ok(index.includes(b));
  for (const f of ['index.html', 'app.js', 'preparer.html', 'preparer.js', 'resultats.js']) assert.ok(texte(f).includes('Mots relus par UX le 12 octobre 2026'), f);
  assert.ok(!TEXTES.some((f) => texte(f).includes('provisoires')));
  // Ordre des gestes : Google, puis Recevoir, puis Apple (caché hors de T1).
  assert.ok(index.indexOf('id="google"') < index.indexOf('id="recevoir"') && index.indexOf('id="recevoir"') < index.indexOf('id="apple"'));
  assert.match(index, /id="apple" href="\/connexion\/apple" hidden>/);
  assert.ok(!/e-?mail|courriel|@/i.test(index));
  assert.ok(!/\bvous\b/i.test(index + texte('app.js').replace(/\/\/.*$/gm, '')), 'la page des téléphones tutoie');
});

test('aucun contenu politique ni texte du jeu sur la page ou dans les messages', () => {
  const tout = TEXTES.map(texte).join('\n') + readFileSync(join(import.meta.dirname, '..', '..', 'src', 'planificateur.ts'), 'utf8');
  for (const mot of ['Assemblée', 'député', 'loi', 'vote', 'parti', 'favorable', 'défavorable', 'cercle', 'proche', 'gauche', 'droite', 'amendement']) {
    assert.ok(!new RegExp(`\\b${mot}\\b`, 'i').test(tout), `mot interdit : ${mot}`);
  }
});
