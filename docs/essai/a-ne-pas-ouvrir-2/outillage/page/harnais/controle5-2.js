/* Contrôle 5 du second essai (simulation-2.md, §9, contrôle 5 : « En plus du premier essai »),
 * sur les octets construits et sur les sources. Reprend la partie mécanique du premier essai
 * (harnais/controle5.js) et y ajoute les vérifications du second ; deux vérifications du premier
 * sont relues pour le second (détection du contexte, clé de la page-test).
 *
 *   node harnais/controle5-2.js --construction DOSSIER --scelle F --page-test SOURCE_PAGE_TEST_V2.html [--sortie RAPPORT.txt]
 *
 * Ce qui relève de la relecture du code est écrit « relecture », avec l'endroit du code et ce
 * qui a été lu ; ce programme ne le décide pas. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const O = require('./outils.js');
const C5 = require('./controle5.js');

const ICI = path.join(__dirname, '..');
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
const sansChaines = (s) => s.replace(/(["'])(?:\\.|(?!\1)[^\\\n])*\1/g, '""');
const source = (n) => fs.readFileSync(path.join(ICI, n), 'utf8');

function controler(a) {
  const base = C5.controler(a).filter(x => !/^la clé de la page-test|^détection du contexte/.test(x.quoi));
  const res = base.slice();
  const ok = (quoi, vrai, detail) => res.push({ quoi, juste: !!vrai, detail: detail || '' });
  const porteur = fs.readFileSync(path.join(a.construction, 'porteur', 'index.html'), 'utf8');
  const script = (porteur.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
  const code = sansCommentaires(script);

  // Relus pour le second essai.
  ok('la clé de la page-test n’est nommée qu’en commentaire ; elle part avec l’ancienne partie, par le préfixe (§8.8)', code.indexOf('sonde-icone') < 0);
  if (a['page-test']) {
    const norm = (s) => s.replace(/"/g, "'").replace(/\bW\./g, '').replace(/\bwindow\./g, '').replace(/\s+/g, ' ');
    const pt = fs.readFileSync(a['page-test'], 'utf8');
    const bloc = pt.slice(pt.indexOf('var ua = navigator.userAgent;'), pt.indexOf('\n', pt.indexOf('var autreNavigateur')));
    const instr = bloc.split('\n').map(l => l.trim()).filter(Boolean).join(' ').split(/;\s*/).map(x => norm(x).trim()).filter(x => x && !/^var tactile/.test(x));
    const socle = norm(sansCommentaires(source('socle.js')));
    const manquantes = instr.filter(x => socle.indexOf(x) < 0);
    ok('détection du contexte : chaque instruction de la page-test v2 dans socle.js (window. et guillemets mis à part ; « tactile », inutilisée, omise)', manquantes.length === 0, manquantes.join(' | '));
  }

  // En plus du premier essai (§9, contrôle 5).
  const mem = sansCommentaires(source('memoire.js'));
  const lectures = [...mem.matchAll(/getItem\(([^)]*)\)/g)].map(m => m[1].trim());
  ok('anciennes clés repérées par la seule liste des clés : getItem seulement sur partie-2 et verif-2', lectures.every(x => x === 'CLE' || x === 'CLE_VERIF'), lectures.join(', '));
  const ecritures = [...mem.matchAll(/setItem\(([^,]*),/g)].map(m => m[1].trim());
  ok('aucune écriture hors de partie-2 et verif-2', ecritures.every(x => x === 'CLE' || x === 'CLE_VERIF'), ecritures.join(', '));
  const effacements = [...mem.matchAll(/removeItem\(([^)]*)\)/g)].map(m => m[1].trim());
  ok('effacements : verif-2, et les seules clés « elenchos-essai: » de l’ancienne partie ou de « Tout effacer »', effacements.every(x => ['CLE_VERIF', 'c'].indexOf(x) >= 0), effacements.join(', '));
  const autresFichiers = ['noyau.js', 'calendrier.js', 'journal.js', 'etat.js', 'moteur.js', 'textes.js', 'carnet.js', 'socle.js', 'interface.js']
    .filter(n => /localStorage\.|getItem|setItem|removeItem/.test(sansCommentaires(source(n)).replace(/W\.localStorage;/, '')));
  ok('aucun accès à la mémoire hors de memoire.js (socle.js ne fait que la passer)', autresFichiers.length === 0, autresFichiers.join(', '));
  const socle = sansCommentaires(source('socle.js'));
  ok('état à l’arrivée gelé en profondeur, jamais écrit en mémoire (socle.js, verifierHistoire : gelerProfond ; Me.ecrire ne reçoit que l’état)',
    /arrivee = gelerProfond\(a\)/.test(socle) && !/ecrire\([^)]*arrivee/.test(socle));
  const moteur = sansCommentaires(source('moteur.js'));
  ok('facteur et longueur de la barre lus dans le fichier (reglage.facteur, reglage.barre)', /reglage\.facteur/.test(moteur) && /reglage\.barre/.test(moteur));
  const nombres = {};
  ['calendrier.js', 'journal.js', 'etat.js', 'memoire.js', 'moteur.js', 'socle.js', 'carnet.js', 'textes.js', 'interface.js'].forEach(n => {
    const s = sansChaines(sansCommentaires(source(n)));
    const m = s.match(/(^|[^0-9A-Za-z_.\/#-])-?(14|15|16|91)(?![0-9])/g) || [];
    // journal.js : numéros des règles 14 et 15 du schéma, et longueur d'une graine (hex16) — pas des nombres du calendrier
    const reste = n === 'journal.js' ? m.filter(x => !/^\(1[45]$|^\{16$/.test(x)) : m;
    if (reste.length) { nombres[n] = reste; }
  });
  ok('aucun 14, 15, 16 ni 91 écrit en dur (schéma, partie 7.1), hors commentaires et chaînes', Object.keys(nombres).length === 0, JSON.stringify(nombres));
  const inter = sansCommentaires(source('interface.js'));
  const voie = (inter.match(/function voie\([^)]*\) \{[\s\S]*?\n {4}\}/) || [''])[0];
  ok('boutons de 1.8 : des boutons, sans lien, requête ni ressource venue d’ailleurs', /h\('button'/.test(voie) && !/href|src|fetch/.test(voie));
  ok('aucun champ d’e-mail : le seul champ saisissable est le pseudo (1.8b affiche une adresse dessinée)', (inter.match(/h\('input'/g) || []).length === 1 && /id: 'champ-pseudo'/.test(inter) && !/type: 'email'/.test(inter));
  ok('graphique, barre et frise faits d’éléments HTML : ni canvas, ni svg, ni image', !/canvas|createElementNS|'svg'|h\('img'/.test(inter));
  return res;
}

if (require.main === module) {
  const a = O.argumentsCli(process.argv.slice(2));
  const r = controler(a);
  const lignes = ['Contrôle 5 du second essai, sur ' + a.construction, ''];
  for (const x of r) { lignes.push((x.juste ? 'juste : ' : 'FAUX : ') + x.quoi + (x.detail ? ' — ' + x.detail : '')); }
  const faux = r.filter(x => !x.juste).length;
  lignes.push('', faux ? faux + ' vérification(s) fausse(s)' : 'Toutes les vérifications sont justes (' + r.length + ').');
  lignes.push('', 'Relecture du code (non décidé par ce programme) :',
    '- le moteur ne lit ni l’écran, ni la mémoire, ni l’horloge, ni le hasard : moteur.js n’appelle ni document, ni localStorage, ni Date, ni Math.random (vérifié par les motifs ci-dessus) ;',
    '- réponses des personnages lues dans le fichier scellé (moteur.js, contexte.reponse), indépendantes de celles du porteur ; sélection sans les profils cachés : calculerManche ne lit que les réponses et les curseurs ; les profils ne servent qu’au côté attendu des personnages devineurs (règles 1 §3.2) ;',
    '- cartes du porteur indépendantes de ses coups : M.cartesServies ne reçoit pas le journal (tests/test-calculer.js, deux joueurs) ;',
    '- aucun accès à la mémoire avant la détection du contexte, ni hors de l’icône : socle.js, demarrer (contexte, puis V1 à V6, puis Me.memoireMarche) ;',
    '- ancienne partie : la page d’effacement s’affiche avant toute écriture (socle.js, demarrer : releverCles, puis ecrans.ancienne, « rien n’est écrit ») ;',
    '- compte simulé : 1.8, 1.8b et 1.9 ne font que E.terminerCompte (interface.js, actions compte-*, code-*).');
  const texte = lignes.join('\n') + '\n';
  if (a.sortie) { O.ecrireTexte(a.sortie, texte); }
  process.stdout.write(texte);
  process.exitCode = faux ? 1 : 0;
}
module.exports = { controler };
