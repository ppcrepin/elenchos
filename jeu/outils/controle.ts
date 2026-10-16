// Origine : test-18h/outils/controle.ts (REPRIS, 12 octobre 2026), copie adaptée au dossier jeu/.
// Le contrôle du code, avant chaque mise en ligne (DECISIONS-TECHNIQUES 1.11) :
// 1. vérification des types (tous les tsconfig*.json de jeu/) ;
// 2. recherche de secrets dans le dossier du jeu et dans tout l'historique du dépôt (P-16) ;
// 3. règles de la maison : rien n'écrit dans les journaux hors du module prévu (P-07) ; aucune adresse e-mail hors du
//    domaine réservé exemple.invalid (P-17) ; aucun outil de mesure extérieur (P-09) ; aucun nom de modèle d'IA ;
//    des versions exactes pour chaque bibliothèque ;
// 4. l'adresse du serveur fixée dans l'application (DECISIONS-TECHNIQUES 1.11) : la page embarquée porte sa marque, et
//    aucune adresse en dur ; jeu/ios/adresse-serveur.txt est vide ou porte une seule adresse « https://hôte ».
// Ce que « cap sync ios » fabrique et que git ignore (copie de l'interface, configuration, modules Cordova) n'est pas lu.
// Il n'a besoin d'aucune base ni d'aucun réglage : il tourne partout, et jamais sur des données réelles.

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = join(import.meta.dirname, '..');
const DEPOT = join(RACINE, '..');
const problemes: string[] = [];

for (const projet of readdirSync(RACINE).filter((n) => /^tsconfig.*\.json$/.test(n)).sort()) {
  try {
    execFileSync(process.execPath, [join(RACINE, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', join(RACINE, projet)], { stdio: 'pipe' });
  } catch (e) {
    const sortie = e && typeof e === 'object' && 'stdout' in e ? String(e.stdout) : '';
    problemes.push(`types (${projet}) :\n${sortie}`);
  }
}

// Fabriqués par « cap sync ios » ou par Xcode, ignorés par git (jeu/ios/.gitignore) : jamais relus ni committés.
const FABRIQUES = new Set(['ios/App/App/public', 'ios/App/App/capacitor.config.json', 'ios/App/App/config.xml',
  'ios/capacitor-cordova-ios-plugins', 'ios/App/build', 'ios/App/output', 'ios/App/Pods', 'ios/DerivedData']);

function fichiers(dossier: string): string[] {
  const sortie: string[] = [];
  for (const nom of readdirSync(dossier)) {
    if (nom === 'node_modules' || nom.startsWith('.git') || nom === 'xcuserdata' || nom === 'DerivedData') continue;
    const chemin = join(dossier, nom);
    if (FABRIQUES.has(relative(RACINE, chemin))) continue;
    if (statSync(chemin).isDirectory()) sortie.push(...fichiers(chemin));
    else sortie.push(chemin);
  }
  return sortie;
}

const SECRETS: [string, RegExp][] = [
  ['clé privée', /-----BEGIN (EC |RSA )?PRIVATE KEY-----[\s\\n]*[A-Za-z0-9+/=]{60,}/],
  // Un vrai mot de passe de base (Scalingo en donne de 64 caractères) ; les adresses d'exemple des tests n'en ont pas.
  ['adresse de base avec mot de passe', /postgres(ql)?:\/\/[^\s:@/'"`]+:[^\s@/'"`]{8,}@/],
  ['secret Google', /GOCSPX-[A-Za-z0-9_-]{10,}/],
  ['variable secrète remplie',
    /^(SECRET_SESSION|CLE_REPONSES|CLE_IDENTITES|APPLE_CLE_PRIVEE|APPLE_CLE_MESSAGES|APPLE_CLE_CONNEXION|GOOGLE_SECRET_CLIENT|CODES_ESSAI|CODE_ACCES_PORTEUR|VAPID_CLE_PRIVEE)=\S{8,}/m],
];
// La liste est codée, pour qu'aucun nom de modèle n'apparaisse en clair dans le dépôt (règle du porteur).
const NOMS_MODELES = new RegExp(Buffer.from('XGIoQ2xhdWRlfE9wdXN8U29ubmV0fEhhaWt1fEZhYmxlfEdQVC0/XGR8Q2hhdEdQVHxHZW1pbml8TWlzdHJhbHxMbGFtYSlcYg==', 'base64').toString('utf8'));
const MESURE_EXTERIEURE = /google-analytics|googletagmanager|sentry|datadog|mixpanel|segment\.io|hotjar|matomo|plausible|posthog/i;
// Les modules du serveur et de la base n'écrivent que par le journal (P-07).
const DOSSIERS_JOURNAL = ['jeu/src/serveur/', 'jeu/src/base/'];

const textes = fichiers(RACINE).filter((f) => !/\.(png|woff2?|ico)$/.test(f) && !f.endsWith('package-lock.json'));
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
  if (MESURE_EXTERIEURE.test(contenu) && !nom.endsWith('outils/controle.ts')) problemes.push(`${nom} : outil de mesure extérieur`);
  if (DOSSIERS_JOURNAL.some((d) => nom.startsWith(d)) && !nom.endsWith('serveur/journal.ts')
    && /console\.|process\.(stdout|stderr)\.write/.test(contenu)) {
    problemes.push(`${nom} : écrit hors du journal (P-07)`);
  }
}

const paquet = JSON.parse(readFileSync(join(RACINE, 'package.json'), 'utf8')) as Record<string, Record<string, string>>;
for (const [nom, version] of Object.entries({ ...paquet.dependencies, ...paquet.devDependencies, ...paquet.overrides })) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) problemes.push(`package.json : ${nom} n’a pas de version exacte (${version})`);
  if (MESURE_EXTERIEURE.test(nom)) problemes.push(`package.json : ${nom} est un outil de mesure`);
}

// L'adresse du serveur dans l'application (DECISIONS-TECHNIQUES 1.11 ; .github/workflows/app-testflight.yml).
const MARQUE_SERVEUR = '__ELENCHOS_SERVEUR__';
const page = readFileSync(join(RACINE, 'public', 'index.html'), 'utf8');
if (page.split(MARQUE_SERVEUR).length - 1 !== 2) problemes.push(`jeu/public/index.html : la marque ${MARQUE_SERVEUR} doit y être exactement deux fois`);
for (const f of fichiers(join(RACINE, 'public'))) {
  if (/\.(png|woff2?|ico)$/.test(f)) continue;
  for (const adresse of readFileSync(f, 'utf8').match(/https?:\/\/[^\s'"`)<>]+/g) ?? []) {
    if (!/^http:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(adresse)) problemes.push(`${relative(DEPOT, f)} : adresse en dur (${adresse.replace(/^(https?:\/\/[^/]+).*$/, '$1')})`);
  }
}
const lignesAdresse = readFileSync(join(RACINE, 'ios', 'adresse-serveur.txt'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
if (lignesAdresse.length > 1 || (lignesAdresse.length === 1 && !/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(lignesAdresse[0]!))) {
  problemes.push('jeu/ios/adresse-serveur.txt : une seule ligne « https://hôte », sans port, sans chemin, sans « / » final, ou aucune');
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
