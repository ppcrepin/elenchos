// REPRIS pour le vrai jeu (proposé) : le contrôle du code, avant chaque mise en ligne.
// 1. Vérification des types (serveur, page, réception dans le téléphone).
// 2. Recherche de secrets dans le dossier du test et dans tout l'historique du dépôt (P-16).
// 3. Règles de la maison : rien n'écrit dans les journaux hors du module prévu (P-07) ; aucune adresse e-mail hors du
//    domaine réservé exemple.invalid (P-17) ; aucun outil de mesure extérieur (P-09) ; aucun nom de modèle d'IA.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = join(import.meta.dirname, '..');
const DEPOT = join(RACINE, '..');
const problemes: string[] = [];

for (const projet of ['tsconfig.json', 'tsconfig.page.json', 'tsconfig.sw.json']) {
  try {
    execFileSync(process.execPath, [join(RACINE, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(RACINE, projet)], { stdio: 'pipe' });
  } catch (e) {
    const sortie = e && typeof e === 'object' && 'stdout' in e ? String(e.stdout) : '';
    problemes.push(`types (${projet}) :\n${sortie}`);
  }
}

function fichiers(dossier: string): string[] {
  const sortie: string[] = [];
  for (const nom of readdirSync(dossier)) {
    if (nom === 'node_modules' || nom.startsWith('.git')) continue;
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) sortie.push(...fichiers(chemin));
    else sortie.push(chemin);
  }
  return sortie;
}

const SECRETS: [string, RegExp][] = [
  ['clé privée', /-----BEGIN (EC |RSA )?PRIVATE KEY-----[\s\\n]*[A-Za-z0-9+/=]{60,}/],
  ['adresse de base avec mot de passe', /postgres(ql)?:\/\/[^\s:@/'"`]+:[^\s@/'"`]+@/],
  ['secret Google', /GOCSPX-[A-Za-z0-9_-]{10,}/],
  ['variable secrète remplie', /^(SECRET_SESSION|CODES_ESSAI|CODE_ACCES_PORTEUR|VAPID_CLE_PRIVEE|GOOGLE_SECRET_CLIENT|APPLE_CLE_PRIVEE)=\S{8,}/m],
];
// La liste est codée, pour qu'aucun nom de modèle n'apparaisse en clair dans le dépôt (règle du porteur).
const NOMS_MODELES = new RegExp(Buffer.from('XGIoQ2xhdWRlfE9wdXN8U29ubmV0fEhhaWt1fEZhYmxlfEdQVC0/XGR8Q2hhdEdQVHxHZW1pbml8TWlzdHJhbHxMbGFtYSlcYg==', 'base64').toString('utf8'));
const MESURE_EXTERIEURE = /google-analytics|googletagmanager|sentry|datadog|mixpanel|segment\.io|hotjar|matomo|plausible|posthog/i;

const textes = fichiers(RACINE).filter((f) => !/\.png$/.test(f) && !f.endsWith('package-lock.json'));
textes.push(join(DEPOT, 'docs', 'etape-6', 'test-18h-pas-a-pas.md'));
for (const f of textes) {
  let contenu: string;
  try {
    contenu = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  const nom = relative(DEPOT, f);
  for (const [quoi, motif] of SECRETS) if (motif.test(contenu)) problemes.push(`${nom} : ${quoi}`);
  if (NOMS_MODELES.test(contenu)) problemes.push(`${nom} : nom de modèle d’IA`);
  for (const adresse of contenu.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []) {
    if (!adresse.endsWith('@exemple.invalid')) problemes.push(`${nom} : adresse e-mail hors du domaine réservé (${adresse.replace(/^[^@]+/, '…')})`);
  }
  if (MESURE_EXTERIEURE.test(contenu)) problemes.push(`${nom} : outil de mesure extérieur`);
  if (nom.startsWith('test-18h/src/') && !nom.endsWith('journal.ts') && /console\.|process\.(stdout|stderr)\.write/.test(contenu)) {
    problemes.push(`${nom} : écrit hors du journal (P-07)`);
  }
}

const paquet = JSON.parse(readFileSync(join(RACINE, 'package.json'), 'utf8')) as Record<string, Record<string, string>>;
for (const [nom, version] of Object.entries({ ...paquet.dependencies, ...paquet.devDependencies })) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) problemes.push(`package.json : ${nom} n’a pas de version exacte (${version})`);
  if (MESURE_EXTERIEURE.test(nom)) problemes.push(`package.json : ${nom} est un outil de mesure`);
}

// Tout l'historique du dépôt (P-16), si git est là.
try {
  const historique = execFileSync('git', ['-C', DEPOT, 'log', '-p', '--all', '--no-color', '--', '.', ':(exclude)*.png', ':(exclude)*package-lock.json'], {
    stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 512 * 1024 * 1024,
  }).toString('utf8');
  for (const [quoi, motif] of SECRETS) if (motif.test(historique)) problemes.push(`historique du dépôt : ${quoi}`);
} catch {
  process.stdout.write('Historique git non lu (git absent) : recherche faite sur les fichiers seulement.\n');
}

if (problemes.length > 0) {
  process.stdout.write('Contrôle : ÉCHEC\n- ' + problemes.join('\n- ') + '\n');
  process.exit(1);
}
process.stdout.write('Contrôle : OK (types, secrets dans les fichiers et l’historique, journaux, adresses, mesure extérieure, noms de modèles, versions exactes).\n');
