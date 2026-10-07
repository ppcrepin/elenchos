/* Commit de gh-pages préparé pour la publication, lu dans les objets Git (§9, contrôle 5, dernière phrase ;
 * contrôle 13 ; « Correctif » ; §8.8, les trois fichiers de gh-pages). Rien n'est écrit dans le dépôt.
 *
 *   node harnais/commit-gh-pages.js --depot DEPOT --commit-gh-pages SHA --construction V1 --sortie RAPPORT.txt
 *        [--parent REF] [--page-test SHA] [--remplacer]
 *
 * Vérifie :
 * - l'arbre du commit ne contient que .nojekyll, essai/index.html et essai/apple-touch-icon.png (fichiers ordinaires) ;
 * - l'objet essai/index.html est identique octet pour octet à porteur/index.html de la construction V1, et diffère de
 *   temoin/index.html (jamais la version témoin) ;
 * - l'icône est identique octet pour octet à celle du commit de la page-test v2 (b5d7d00) ;
 * - le commit part de REF (par défaut origin/gh-pages : son premier parent en est le sommet) et ne change que
 *   essai/index.html (« Correctif » : un nouveau commit, jamais une réécriture, qui ne change que la page).
 * --remplacer : une fois l'égalité vérifiée, porteur/index.html de la construction V1 est réécrit avec les octets de
 * l'objet Git ; le rejeu et les contrôles 12 à 14 lisent alors, sans autre changement de commande, la version du
 * porteur depuis le commit (octets identiques : rien d'autre ne change).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const O = require('./outils.js');

const PAGE_TEST = 'b5d7d00767ccd682dc791ef139ff48f450b1a8d6'; // « Publier la page-test de l'icône (version 2) »
const ATTENDUS = ['100644 blob .nojekyll', '100644 blob essai/apple-touch-icon.png', '100644 blob essai/index.html'];

function git(depot, args, binaire) {
  return execFileSync('git', ['-C', depot].concat(args), { maxBuffer: 1 << 28, encoding: binaire ? null : 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function essai(f) { try { return f(); } catch (e) { return null; } }

function main() {
  const a = O.argumentsCli(process.argv.slice(2));
  const depot = a.depot, commit = a['commit-gh-pages'], refParent = a.parent || 'origin/gh-pages', pageTest = a['page-test'] || PAGE_TEST;
  const lignes = [];
  let faux = 0;
  const ok = (quoi, juste, detail) => { if (!juste) { faux++; } lignes.push((juste ? 'juste : ' : 'FAUX : ') + quoi + (detail ? ' — ' + detail : '')); };
  lignes.push('Commit de gh-pages préparé pour la publication : ' + commit + ' (dépôt ' + depot + ')', '');
  const complet = essai(() => git(depot, ['rev-parse', '--verify', '-q', commit + '^{commit}']).trim());
  ok('le commit est dans le dépôt', !!complet, complet || 'introuvable');
  if (!complet) { return fin(a, lignes, faux); }
  // arbre
  const arbre = git(depot, ['ls-tree', '-r', '--full-tree', complet]).split('\n').filter(Boolean)
    .map(l => { const [meta, chemin] = l.split('\t'); const [mode, type] = meta.split(' '); return mode + ' ' + type + ' ' + chemin; }).sort();
  ok('arbre : exactement .nojekyll, essai/index.html et essai/apple-touch-icon.png, fichiers ordinaires', O.canonique(arbre) === O.canonique(ATTENDUS), arbre.join(' ; '));
  // la page : version du porteur de la construction V1, jamais la version témoin
  const page = essai(() => git(depot, ['cat-file', 'blob', complet + ':essai/index.html'], true));
  const porteur = fs.readFileSync(path.join(a.construction, 'porteur', 'index.html'));
  const temoin = essai(() => fs.readFileSync(path.join(a.construction, 'temoin', 'index.html')));
  const sha = b => b ? O.sha256Octets(new Uint8Array(b)) : 'absent';
  lignes.push('  SHA-256 de l’objet essai/index.html : ' + sha(page) + ' ; porteur/index.html de la construction : ' + sha(porteur));
  const egal = !!page && Buffer.compare(page, porteur) === 0;
  ok('essai/index.html identique octet pour octet à porteur/index.html de la construction (' + a.construction + ')', egal);
  ok('essai/index.html n’est pas la version témoin', !!page && (!temoin || Buffer.compare(page, temoin) !== 0), temoin ? '' : 'temoin/index.html absent de la construction');
  // l'icône de la page-test
  const icone = essai(() => git(depot, ['rev-parse', '--verify', '-q', complet + ':essai/apple-touch-icon.png']).trim());
  const iconeTest = essai(() => git(depot, ['rev-parse', '--verify', '-q', pageTest + ':essai/apple-touch-icon.png']).trim());
  const octetsIcone = icone ? git(depot, ['cat-file', 'blob', icone], true) : null, octetsTest = iconeTest ? git(depot, ['cat-file', 'blob', iconeTest], true) : null;
  ok('essai/apple-touch-icon.png identique octet pour octet à celle de la page-test v2 (' + pageTest.slice(0, 7) + ')',
    !!octetsIcone && !!octetsTest && Buffer.compare(octetsIcone, octetsTest) === 0, 'SHA-256 ' + sha(octetsIcone) + ' ; page-test ' + sha(octetsTest));
  // parent et changement
  const parentAttendu = essai(() => git(depot, ['rev-parse', '--verify', '-q', refParent + '^{commit}']).trim());
  const parents = git(depot, ['rev-list', '--parents', '-n', '1', complet]).trim().split(' ').slice(1);
  ok('le commit part de ' + refParent + ' (un seul parent, son sommet)', parents.length === 1 && parents[0] === parentAttendu, 'parents ' + (parents.join(', ') || 'aucun') + ' ; ' + refParent + ' ' + (parentAttendu || 'introuvable'));
  if (parents.length === 1) {
    const changes = git(depot, ['diff-tree', '--no-commit-id', '-r', '--name-status', parents[0], complet]).split('\n').filter(Boolean);
    ok('le commit ne change que essai/index.html', changes.length === 1 && /^M\tessai\/index\.html$/.test(changes[0]), changes.join(' ; ') || 'aucun changement');
  }
  // version du porteur lue depuis le commit
  if (a.remplacer) {
    if (egal && faux === 0) {
      fs.writeFileSync(path.join(a.construction, 'porteur', 'index.html'), page);
      lignes.push('', 'porteur/index.html de la construction réécrit avec les octets de l’objet Git ' + git(depot, ['rev-parse', complet + ':essai/index.html']).trim() +
        ' du commit ' + complet + ' : le rejeu et les contrôles 12 à 14 rejouent la version du porteur lue depuis ce commit.');
    } else {
      ok('--remplacer : version du porteur lue depuis le commit', false, 'refusé : une vérification est fausse');
    }
  }
  return fin(a, lignes, faux);
}

function fin(a, lignes, faux) {
  lignes.push('', faux ? faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes.');
  const texte = lignes.join('\n') + '\n';
  if (a.sortie) { O.ecrireTexte(a.sortie, texte); }
  process.stdout.write(texte);
  process.exitCode = faux ? 1 : 0;
}

main();
