/* Contrôle 5, partie mécanique, sur les octets construits (§9, contrôle 5 ;
 * §8.8). Refait à part de la construction, qui fait déjà les mêmes
 * vérifications avant d'écrire : ici, on relit les fichiers écrits.
 *
 *   node harnais/controle5.js --construction DOSSIER --scelle F --page-test SOURCE_PAGE_TEST.html
 *        [--sortie RAPPORT.txt]
 *
 * Ce qui relève de la relecture du code (ce que le moteur lit, ordre des
 * accès à la mémoire, réponses des personnages indépendantes de celles du
 * porteur) est listé dans le rapport comme « relecture », avec l'endroit
 * du code ; ce programme ne le décide pas.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const N = require('../noyau.js');
const O = require('./outils.js');
const V = require('../polices/verifier-202f.js');

const TETE = ['<!doctype html>', '<html lang="fr">', '<head>', '<meta charset="utf-8">',
  '<meta http-equiv="Content-Security-Policy" content="{csp}">', '<meta name="referrer" content="no-referrer">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', '<meta name="robots" content="noindex, nofollow">',
  '<meta name="apple-mobile-web-app-capable" content="yes">', '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="Essai">', '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
  '<meta name="color-scheme" content="light dark">', '<meta name="theme-color" content="#EEF0EE" media="(prefers-color-scheme: light)">',
  '<meta name="theme-color" content="#141516" media="(prefers-color-scheme: dark)">', '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
  '<link rel="icon" type="image/png" href="apple-touch-icon.png">', '<title>Essai</title>'];

const LIGNE_LICENCE = 'Polices réduites ; glyphe vide U+202F (espace fine insécable) ajouté à chaque face.';

/** Motifs interdits dans les scripts (contrôle 5), avec leur raison. */
const INTERDITS = [
  [/Math\.random/, 'hasard du navigateur'], [/crypto\./, 'hasard du navigateur'], [/\beval\s*\(/, 'évaluation de code'],
  [/\bFunction\s*\(/, 'évaluation de code'], [/setTimeout\s*\(\s*['"]/, 'évaluation de code'], [/setInterval\s*\(\s*['"]/, 'évaluation de code'],
  [/\.clear\s*\(/, 'effacement global du stockage'], [/\bIntl\b/, 'formatage selon la langue'], [/toLocale/, 'formatage selon la langue'],
  [/new Date\b/, 'Date pour lire une date'], [/Date\.parse/, 'Date pour lire une date'], [/Date\.UTC/, 'Date pour lire une date'],
  [/getTimezoneOffset|getHours|getMinutes|getDate\(|getDay\(|getMonth|getFullYear/, 'heure de l’appareil'],
  [/innerHTML|outerHTML|insertAdjacentHTML|document\.write/, 'HTML écrit par le script'],
  [/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|\bimport\s*\(|importScripts/, 'requête'],
  [/sessionStorage|indexedDB|\bcaches\b|serviceWorker|document\.cookie|\bcookie\b/, 'mémoire interdite (§8.8)'],
  [/new Image|createElement\(\s*['"]img/, 'image hors data:'], [/window\.open|postMessage|location\.href\s*=|location\.assign|location\.replace/, 'navigation ou message'],
  [/setAttribute\(\s*['"]style/, 'attribut style écrit'], [/theme-color/, 'theme-color changé par le script'],
  [/manifest/, 'manifeste']
];

function blocs(html, balise) {
  const re = new RegExp('<' + balise + '>([\\s\\S]*?)</' + balise + '>', 'g');
  const r = []; let m;
  while ((m = re.exec(html))) { r.push(m[1]); }
  return r;
}
function empreinteCsp(texte) { return "'sha256-" + crypto.createHash('sha256').update(Buffer.from(texte, 'utf8')).digest('base64') + "'"; }

function controler(a) {
  const res = [];
  const ok = (quoi, vrai, detail) => res.push({ quoi, juste: !!vrai, detail: detail || '' });
  const porteurOctets = fs.readFileSync(path.join(a.construction, 'porteur', 'index.html'));
  const temoinOctets = fs.readFileSync(path.join(a.construction, 'temoin', 'index.html'));
  const porteur = N.utf8Decoder(new Uint8Array(porteurOctets));
  const temoin = N.utf8Decoder(new Uint8Array(temoinOctets));
  const scelleOctets = new Uint8Array(fs.readFileSync(a.scelle));

  // Encodage et balises de tête (§8.8)
  ok('déclaration d’encodage dans les 1 024 premiers octets', porteurOctets.subarray(0, 1024).includes(Buffer.from('<meta charset="utf-8">')));
  const lignes = porteur.split('\n');
  const csp = (porteur.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  const teteOk = TETE.every((l, i) => lignes[i] === l.replace('{csp}', csp));
  ok('balises du §8.8 en tête, dans leur ordre', teteOk);

  // Blocs et politique de sécurité
  const scripts = blocs(porteur, 'script'), styles = blocs(porteur, 'style');
  ok('version du porteur : un seul bloc de script et un seul bloc de style', scripts.length === 1 && styles.length === 1, scripts.length + ' script(s), ' + styles.length + ' style(s)');
  const cspAttendue = "default-src 'none'; script-src " + empreinteCsp(scripts[0]) + '; style-src ' + empreinteCsp(styles[0]) +
    "; font-src data:; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'";
  ok('politique de sécurité : empreintes des deux seuls blocs', csp === cspAttendue);
  const scriptsT = blocs(temoin, 'script');
  const cspT = (temoin.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1] || '';
  ok('version témoin : deux blocs de script, empreintes des deux', scriptsT.length === 2 &&
    cspT === "default-src 'none'; script-src " + empreinteCsp(scriptsT[0]) + ' ' + empreinteCsp(scriptsT[1]) + '; style-src ' + empreinteCsp(blocs(temoin, 'style')[0]) +
    "; font-src data:; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'");
  // Témoin = porteur + bloc + son empreinte
  if (scriptsT.length === 2) {
    const bloc = '<script>' + scriptsT[0] + '</script>\n';
    const sans = temoin.replace(bloc, '').replace('script-src ' + empreinteCsp(scriptsT[0]) + ' ', 'script-src ');
    ok('les deux versions ne diffèrent que par le bloc témoin et son empreinte', sans === porteur && scriptsT[1] === scripts[0]);
  }
  ok('aucune fonction de trace dans la version du porteur', !/ElenchosTrace|ElenchosTemoin|traceMoteur|assembler\b/.test(porteur));
  // HTML : ni attribut style, ni gestionnaire
  const horsBlocs = porteur.replace(/<script>[\s\S]*?<\/script>|<style>[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '');
  ok('aucun attribut style ni gestionnaire écrit dans le HTML', !/\sstyle\s*=/.test(horsBlocs) && !/\son[a-z]+\s*=/i.test(horsBlocs));
  // Scripts : motifs interdits
  for (const [motif, raison] of INTERDITS) {
    const t = scriptsT.map(s => s.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '')).join('\n');
    const m = t.match(motif);
    ok('scripts : rien de « ' + raison + ' » (' + motif.source + ')', !m, m ? m[0] : '');
  }
  // Mémoire : clés
  const script = scripts[0];
  const cles = [...script.matchAll(/['"](elenchos-essai:[^'"]*)['"]/g)].map(m => m[1]);
  ok('clés de mémoire : toutes sous « elenchos-essai: »', cles.length > 0 && cles.every(c => c.indexOf('elenchos-essai:') === 0), Array.from(new Set(cles)).join(', '));
  ok('la clé de la page-test n’est jamais nommée (seul « Tout effacer » l’efface, par le préfixe)', script.indexOf('sonde-icone') < 0);
  ok('localStorage : seulement getItem, setItem, removeItem, key, length', [...script.matchAll(/localStorage\.([A-Za-z]+)/g)].every(m => ['getItem', 'setItem', 'removeItem', 'key', 'length'].indexOf(m[1]) >= 0));
  ok('adresse de la page : seulement location.origin (diagnostic affiché) et location.reload (« Reprendre ici »)',
    [...script.matchAll(/location\.([A-Za-z]+)/g)].every(m => ['origin', 'reload'].indexOf(m[1]) >= 0));
  // Détection du contexte identique à la page-test v2
  if (a['page-test']) {
    const pt = O.lireTexte(a['page-test']).replace(/"/g, "'");
    const debut = pt.indexOf('var ua = navigator.userAgent;');
    const fin = pt.indexOf('var autreNavigateur');
    const bloc = pt.slice(debut, pt.indexOf('\n', fin));
    ok('détection du contexte identique à celle de la page-test v2 (guillemets mis à part)', debut >= 0 && script.indexOf(bloc) >= 0);
  }
  // Fichier scellé embarqué : une fois, identique
  const m = script.match(/\/\*elenchos-scelle\*\/"([A-Za-z0-9+/=]*)"/);
  ok('fichier scellé embarqué : repère présent une fois', (script.match(/\/\*elenchos-scelle\*\//g) || []).length === 1 && !!m);
  if (m) { ok('fichier scellé embarqué : octets identiques au fichier scellé', Buffer.from(m[1], 'base64').equals(Buffer.from(scelleOctets))); }
  // Polices (§8.8) : U+202F lu dans les octets de la page, commentaire de licence
  const faces = [...styles[0].matchAll(/@font-face\{font-family:"([^"]+)";font-style:(normal|italic);font-weight:(\d+);font-display:block;src:url\(data:font\/woff2;base64,([A-Za-z0-9+/=]+)\) format\("woff2"\)\}/g)];
  ok('six faces embarquées', faces.length === 6, faces.length + ' faces');
  for (const f of faces) {
    const fichier = (V.FACES.find(x => x[0] === f[1] && x[1] === f[2] && x[2] === +f[3]) || [])[3];
    if (!fichier) { ok('face inattendue ' + f[1] + ' ' + f[2] + ' ' + f[3], false); continue; }
    const r = V.verifierFace(Buffer.from(f[4], 'base64'), V.CHASSES_202F[fichier]);
    ok('police ' + fichier + ' : glyphe vide relié à U+202F, chasse ' + V.CHASSES_202F[fichier] + ' millièmes', r.ok, r.message);
  }
  const commentaire = (porteur.match(/<!--\n([\s\S]*?)\n-->/) || [])[1] || '';
  ok('commentaire : ligne de licence des polices', commentaire.split('\n').indexOf(LIGNE_LICENCE) >= 0);
  for (const nom of ['OFL-alegreya.txt', 'OFL-alegreyasans.txt']) {
    const t = O.lireTexte(path.join(__dirname, '..', 'polices', nom)).replace(/^\n+|\n+$/g, '');
    ok('commentaire : texte complet de ' + nom + ' (licence et mentions de copyright)', commentaire.indexOf(t) >= 0);
  }
  ok('commentaire : pied de page (hébergeur, source)', commentaire.indexOf('hébergée par GitHub, Inc., 88 Colin P. Kelly Jr. Street') >= 0 && commentaire.indexOf('Source des textes, votes, auteurs et arguments') >= 0);
  // Textes affichés : tous dans le bloc de script, sauf la vue de secours
  const corps = (horsBlocs.match(/<body>([\s\S]*)<\/body>/) || [])[1] || '';
  const texteHtml = corps.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  ok('HTML : seule la vue de secours porte du texte', /^La page n’a pas pu démarrer\./.test(texteHtml) && texteHtml.indexOf('Essai') < texteHtml.length, texteHtml.slice(0, 80));
  return res;
}

if (require.main === module) {
  const a = O.argumentsCli(process.argv.slice(2));
  const r = controler(a);
  const lignes = ['Contrôle 5, partie mécanique, sur ' + a.construction, ''];
  for (const x of r) { lignes.push((x.juste ? 'juste : ' : 'FAUX : ') + x.quoi + (x.detail ? ' — ' + x.detail : '')); }
  const faux = r.filter(x => !x.juste).length;
  lignes.push('', faux ? faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes (' + r.length + ').');
  lignes.push('', 'Relecture du code (non décidé par ce programme) : le moteur ne lit ni l’écran, ni la mémoire, ni l’horloge, ni le hasard (moteur.js) ;',
    'aucun accès à la mémoire avant la détection du contexte et hors de l’icône (interface.js, demarrer) ; réponses des personnages lues dans les',
    'données scellées, indépendantes de celles du porteur, sélection sans les profils cachés (moteur.js, calculerManche) ; compte simulé (1.8, 1.9).');
  const texte = lignes.join('\n') + '\n';
  if (a.sortie) { O.ecrireTexte(a.sortie, texte); }
  process.stdout.write(texte);
  process.exitCode = faux ? 1 : 0;
}

module.exports = { controler };
