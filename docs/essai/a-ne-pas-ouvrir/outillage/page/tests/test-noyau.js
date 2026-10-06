/* Tests du noyau (lot 2). Lancer : node --test tests/
 * Oracles : node:crypto (SHA-256, base64) et Intl (heure de Paris), dans
 * les tests seulement ; la page n'emploie ni l'un ni l'autre. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const N = require('../noyau.js');

const SCELLE = process.env.ELENCHOS_SCELLE || path.join(__dirname, '../../scellement/candidat/fichier-scelle-candidat.json');
const NB = N.NBSP, FI = N.FINE;

function octetsDeterministes(n, graine) {
  const o = new Uint8Array(n);
  let x = graine >>> 0;
  for (let i = 0; i < n; i++) { x = (Math.imul(x, 1103515245) + 12345) >>> 0; o[i] = x >>> 24; }
  return o;
}

test('SHA-256 : les trois exemples de FIPS 180-4 et l’autotest V1', () => {
  for (const ex of N.EXEMPLES_FIPS) { assert.equal(N.sha256(ex.octets()), ex.attendu, ex.nom); }
  assert.equal(N.sha256(new Uint8Array(0)), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(N.autotestSha256(), true);
});

test('SHA-256 : égal à node:crypto sur 0 à 1100 octets', () => {
  for (let n = 0; n <= 1100; n++) {
    const o = octetsDeterministes(n, n + 7);
    assert.equal(N.sha256(o), crypto.createHash('sha256').update(o).digest('hex'), 'longueur ' + n);
  }
});

test('Graine : dérivée du commit de la spécification (§0)', () => {
  const h = N.sha256(N.utf8Encoder('elenchos-essai|graine|7f4d367278ecf07b01ebad883b7ec75cf7840820'));
  assert.equal(h.slice(0, 16), '23e3ee6ccdc3fb38');
});

test('Fichier candidat : octets, base64, UTF-8, JSON canonique, vecteurs de test', () => {
  const octets = new Uint8Array(fs.readFileSync(SCELLE));
  const b64 = Buffer.from(octets).toString('base64');
  assert.equal(N.base64Encoder(octets), b64);
  const relus = N.base64Decoder(b64);
  assert.deepEqual(Buffer.from(relus), Buffer.from(octets));
  assert.equal(N.sha256(relus), crypto.createHash('sha256').update(octets).digest('hex'));
  const texte = N.utf8Decoder(relus);
  assert.equal(texte, Buffer.from(octets).toString('utf8'));
  assert.deepEqual(Buffer.from(N.utf8Encoder(texte)), Buffer.from(octets));
  const d = JSON.parse(texte);
  assert.equal(N.jsonCanonique(d), texte, 'le fichier est déjà en forme canonique');
  assert.equal(d.format, 'elenchos-essai-scelle');
  assert.equal(d.version, 4);
  const tir = N.creerTirage(d.graine);
  assert.equal(d.vecteurs_test.length, 3);
  assert.deepEqual(d.vecteurs_test.map(v => v.cle), ['raison|Odile|E2|3', 'hasard|Nassim|12|porteur', 'surprise-semaine|2|11']);
  for (const v of d.vecteurs_test) {
    const t = tir.t(v.cle);
    assert.equal(t.chaine, v.chaine);
    assert.equal(t.hex8, v.hex8);
    assert.equal(t.n, v.n);
  }
});

test('base64 strict : refus', () => {
  for (const s of ['abc', 'ab=c', '====', 'YQ=', 'YR==', 'YWJ=', 'YW I=', 'YW-_', 'Y===', '=YQ=', 'YQ==YQ==', 'YWI\n']) {
    assert.throws(() => N.base64Decoder(s), Error, s);
  }
  assert.deepEqual([...N.base64Decoder('YWI=')], [0x61, 0x62]);
  assert.deepEqual([...N.base64Decoder('YQ==')], [0x61]);
  assert.deepEqual([...N.base64Decoder('')], []);
  for (let n = 0; n < 70; n++) {
    const o = octetsDeterministes(n, 99 + n);
    const b = Buffer.from(o).toString('base64');
    assert.equal(N.base64Encoder(o), b);
    assert.deepEqual(Buffer.from(N.base64Decoder(b)), Buffer.from(o));
  }
});

test('UTF-8 strict : refus et acceptations', () => {
  const refus = [[0xc0, 0x80], [0xc1, 0xbf], [0xe0, 0x80, 0x80], [0xe0, 0x9f, 0xbf], [0xed, 0xa0, 0x80], [0xed, 0xbf, 0xbf],
    [0xf0, 0x80, 0x80, 0x80], [0xf0, 0x8f, 0xbf, 0xbf], [0xf4, 0x90, 0x80, 0x80], [0xf5, 0x80, 0x80, 0x80], [0xf8], [0xff],
    [0x80], [0xbf], [0xe2, 0x82], [0xc3], [0x61, 0xc3], [0xe2, 0x28, 0xa1], [0xc3, 0x28]];
  for (const r of refus) { assert.throws(() => N.utf8Decoder(new Uint8Array(r)), Error, JSON.stringify(r)); }
  const s = 'é€  𝄞«»’œ';
  assert.equal(N.utf8Decoder(N.utf8Encoder(s)), s);
  assert.deepEqual(Buffer.from(N.utf8Encoder(s)), Buffer.from(s, 'utf8'));
  assert.equal(N.utf8Decoder(new Uint8Array([0xef, 0xbf, 0xbf])), '￿');
  assert.equal(N.utf8Decoder(new Uint8Array([0xf4, 0x8f, 0xbf, 0xbf])), '􏿿');
  assert.throws(() => N.utf8Encoder('a\ud800'));
  assert.throws(() => N.utf8Encoder('\udc00b'));
  const long = 'éa'.repeat(20000);
  assert.equal(N.utf8Decoder(N.utf8Encoder(long)), long);
});

test('JSON canonique (schema.md, partie 1.1)', () => {
  assert.equal(N.jsonCanonique({ '2': 1, '10': 2, '9': 3, E1: 4, Valentin: 5, porteur: 6 }),
    '{"10":2,"2":1,"9":3,"E1":4,"Valentin":5,"porteur":6}');
  assert.equal(N.jsonCanonique({ a: 'x"y\\z\n\t\u0001/é' }), '{"a":"x\\"y\\\\z\\n\\t\\u0001/é"}');
  assert.equal(N.jsonCanonique([null, true, false, -0, 37, N.Fraction(3, 20)]), '[null,true,false,0,37,"3/20"]');
  assert.throws(() => N.jsonCanonique({ a: 1.5 }));
  assert.throws(() => N.jsonCanonique({ a: 'é' }), Error, 'non NFC');
  assert.throws(() => N.jsonCanonique({ a: undefined }));
});

test('Fractions exactes (§0, « Calcul exact »)', () => {
  const F = N.Fraction;
  assert.equal(F('0.95').toString(), '19/20');
  assert.equal(F('0.37').toString(), '37/100');
  assert.equal(F('0.07').toString(), '7/100');
  assert.equal(F('-2').toString(), '-2');
  assert.equal(F('-1/2').toString(), '-1/2');
  assert.equal(F(3, -6).toString(), '-1/2');
  assert.equal(F(0).toString(), '0');
  assert.equal(F(0, -5).toString(), '0');
  assert.equal(F(4, 2).toString(), '2');
  assert.equal(F(7n, 2n).toString(), '7/2');
  assert.throws(() => F(0.5));
  assert.throws(() => F(2 ** 60));
  assert.throws(() => F(1, 0));
  assert.throws(() => F('0,95'));
  assert.throws(() => F('.5'));
  assert.equal(F(1, 3).plus(F(1, 6)).toString(), '1/2');
  assert.equal(F(1, 3).moins(F(1, 2)).toString(), '-1/6');
  assert.equal(F(2, 3).fois(F(9, 4)).toString(), '3/2');
  assert.equal(F(2, 3).divise(F(4, 9)).toString(), '3/2');
  assert.equal(F(-3, 4).abs().toString(), '3/4');
  assert.equal(F(1, 3).cmp(F(2, 6)), 0);
  assert.equal(F(1, 3).cmp(F(1, 2)), -1);
  assert.equal(F(-1, 3).cmp(F(-1, 2)), 1);
  assert.ok(F(1, 3).egal(F(2, 6)));
  // §5.2 : un arbitrage net vu donne c = 3/5 ; un penchant, c = 5/9 (règles, §3, point 2)
  const centre = (sw, swp) => F(2).plus(swp).divise(F(4).plus(sw));
  assert.equal(centre(F(1), F(1)).toString(), '3/5');
  assert.equal(centre(F(1), F(0)).toString(), '2/5');
  assert.equal(centre(F(1, 2), F(1, 2)).toString(), '5/9');
  const largeur = sw => N.Fraction.max(F('0.95').moins(F('0.07').fois(sw)), F('0.25'));
  assert.equal(largeur(F(0)).toString(), '19/20');
  assert.equal(largeur(F(10)).toString(), '1/4');
  assert.equal(largeur(F(20)).toString(), '1/4');
  const q = l => F('0.95').moins(l).divise(F('0.70'));
  assert.equal(q(largeur(F(0))).toString(), '0');
  assert.equal(q(largeur(F(10))).toString(), '1');
  assert.equal(F(1, 3).pourDessiner(), 1 / 3);
});

test('Tirage : ordre par N, puis par clé ; refus hors ASCII', () => {
  const tir = N.creerTirage('23e3ee6ccdc3fb38');
  const a = tir.t('ordre|porteur|5|Agathe');
  assert.equal(a.hex8, N.sha256(N.asciiOctets('23e3ee6ccdc3fb38|ordre|porteur|5|Agathe')).slice(0, 8));
  assert.equal(a.n, parseInt(a.hex8, 16));
  assert.equal(tir.comparer({ n: 5, cle: 'b' }, { n: 5, cle: 'a' }), 1);
  assert.equal(tir.comparer({ n: 4, cle: 'b' }, { n: 5, cle: 'a' }), -1);
  assert.throws(() => tir.t('raison|Élise|1|2'));
  const m = tir.melanger(['Agathe', 'Nassim', 'Odile', 'Valentin'], 'devine|porteur|3|');
  const attendu = ['Agathe', 'Nassim', 'Odile', 'Valentin'].map(c => [c, tir.t('devine|porteur|3|' + c).n]).sort((x, y) => x[1] - y[1]).map(x => x[0]);
  assert.deepEqual(m, attendu);
  assert.throws(() => N.creerTirage('23E3EE6CCDC3FB38'));
});

test('Heure de Paris : 25 octobre 2026 et 29 mars 2026', () => {
  const ms = s => Date.parse(s); // oracle de test seulement
  assert.equal(N.paris(ms('2026-10-25T00:30:59Z')).instant, '2026-10-25T02:30+02:00');
  assert.equal(N.paris(ms('2026-10-25T00:59:59.999Z')).instant, '2026-10-25T02:59+02:00');
  assert.equal(N.paris(ms('2026-10-25T01:00:00Z')).instant, '2026-10-25T02:00+01:00');
  assert.equal(N.paris(ms('2026-10-25T01:30:00Z')).instant, '2026-10-25T02:30+01:00');
  assert.equal(N.paris(ms('2026-03-29T00:59:00Z')).instant, '2026-03-29T01:59+01:00');
  assert.equal(N.paris(ms('2026-03-29T01:00:00Z')).instant, '2026-03-29T03:00+02:00');
  assert.equal(N.lireInstant('2026-10-25T02:30+02:00'), ms('2026-10-25T00:30:00Z'));
  assert.equal(N.lireInstant('2026-10-25T02:30+01:00'), ms('2026-10-25T01:30:00Z'));
  for (const s of ['2026-03-29T02:30+01:00', '2026-03-29T02:30+02:00', '2026-10-25T03:30+02:00', '2026-10-25T01:30+01:00',
    '2026-10-19T09:05+01:00', '2026-12-01T10:00+02:00', '2026-10-19T24:00+02:00', '2026-02-29T10:00+01:00', '2026-10-19T9:05+02:00']) {
    assert.throws(() => N.lireInstant(s), Error, s);
  }
  const p = N.paris(ms('2026-10-25T01:30:00Z'));
  assert.equal(p.hhmm, '02:30');
  assert.equal(p.minutesDuJour, 150);
  assert.equal(p.decalage, 60);
  assert.equal(N.paris(ms('2026-12-31T23:30:00Z')).instant, '2027-01-01T00:30+01:00');
  assert.equal(N.paris(ms('2026-10-19T07:05:59Z')).hhmm, '09:05', 'tronquée, jamais arrondie');
});

test('Heure de Paris : égale à Intl (oracle) chaque heure et demie de 2024 à 2031', () => {
  const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'longOffset' });
  const debut = Date.parse('2024-01-01T00:00:00Z'), fin = Date.parse('2031-12-31T23:00:00Z');
  for (let t = debut; t <= fin; t += 1800000 + 17000) {
    const parts = Object.fromEntries(fmt.formatToParts(t).map(x => [x.type, x.value]));
    const dec = parts.timeZoneName.replace('UTC', '');
    const attendu = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}${dec}`;
    assert.equal(N.paris(t).instant, attendu, new Date(t).toISOString());
  }
});

test('Dates par tables (§7.9, §8.12) et jours écoulés', () => {
  assert.equal(N.dateLongue('2025-03-01'), '1er mars 2025');
  assert.equal(N.dateLongue('2024-10-09'), '9 octobre 2024');
  assert.equal(N.dateLongue('2024-12-03'), '3 décembre 2024');
  assert.equal(N.dateLongue('2024-02-29'), '29 février 2024');
  assert.throws(() => N.lireDate('2025-02-29'));
  assert.throws(() => N.lireDate('2025-04-31'));
  assert.throws(() => N.lireDate('20250301'));
  assert.throws(() => N.lireDate('2025-3-01'));
  assert.equal(N.dateCarnet('2026-10-19T09:05+02:00'), 'lundi 19 octobre 2026');
  assert.equal(N.dateCarnet('2026-10-25T02:30+01:00'), 'dimanche 25 octobre 2026');
  assert.equal(N.dateCarnet('2026-11-01T00:10+01:00'), 'dimanche 1er novembre 2026');
  assert.equal(N.dateCarnet('2026-10-06T08:00+02:00'), 'mardi 6 octobre 2026');
  assert.equal(N.joursEcoules('2026-10-24T23:59+02:00', '2026-10-25T00:01+02:00'), 1);
  assert.equal(N.joursEcoules('2026-10-25T02:30+02:00', '2026-10-25T02:30+01:00'), 0);
  assert.equal(N.joursEcoules('2026-10-19T09:00+02:00', '2026-10-22T08:00+02:00'), 3);
  assert.equal(N.joursEcoules('2026-12-31T22:00+01:00', '2027-01-01T01:00+01:00'), 1);
  assert.equal(N.heureEcrite('07:40'), '7h40');
  assert.equal(N.heureEcrite('21:05'), '21h05');
  assert.equal(N.heureEcrite('00:00'), '0h00');
  assert.equal(N.lireHeure('23:20'), 1400);
  assert.throws(() => N.lireHeure('24:00'));
});

test('Typographie à l’affichage (§7.8) : exemples de la spécification', () => {
  const T = N.typographier;
  assert.equal(T('12 000 euros'), '12' + FI + '000' + NB + 'euros');
  assert.equal(T('15 %'), '15' + FI + '%');
  assert.equal(T('300 personnes'), '300' + NB + 'personnes');
  assert.equal(T('Ça alors !'), 'Ça alors' + FI + '!');
  assert.equal(T('Et Agathe ? Sa réponse ?'), 'Et Agathe' + FI + '? Sa réponse' + FI + '?');
  assert.equal(T("Et l'Assemblée ?"), 'Et l’Assemblée' + FI + '?');
  assert.equal(T('Le 9 octobre 2024. Le Sénat devait encore voter.'), 'Le 9' + NB + 'octobre' + NB + '2024. Le Sénat devait encore voter.');
  assert.equal(T('Le 1er janvier 2027, tout change'), 'Le 1er' + NB + 'janvier' + NB + '2027, tout change');
  assert.equal(T('Révélation dans 0 h 01'), 'Révélation dans 0' + NB + 'h' + NB + '01');
  assert.equal(T('Nouveau texte dans 24 h 00'), 'Nouveau texte dans 24' + NB + 'h' + NB + '00');
  assert.equal(T('« Aucun enfant ne devrait sauter le déjeuner. »'), '«' + NB + 'Aucun enfant ne devrait sauter le déjeuner.' + NB + '»');
  assert.equal(T('← Retour'), '←' + NB + 'Retour');
  assert.equal(T('Défavorable · aucune des quatre raisons'), 'Défavorable' + NB + '· aucune des quatre raisons');
  assert.equal(T('Sa raison : aucune des quatre.'), 'Sa raison' + NB + ': aucune des quatre.');
  assert.equal(T('jusqu’à 1 500 euros'), 'jusqu’à 1' + FI + '500' + NB + 'euros');
  assert.equal(T('1 500 000 habitants'), '1' + FI + '500' + FI + '000' + NB + 'habitants');
  assert.equal(T('moins de 1 000'), 'moins de 1' + FI + '000');
  assert.equal(T('le 3 000e'), 'le 3' + FI + '000e');
  assert.equal(T('12 3456'), '12' + NB + '3456');
  assert.equal(T('12 34'), '12' + NB + '34');
  assert.equal(T('Le CO2 capté'), 'Le CO2' + NB + 'capté');
  assert.equal(T('15 ?'), '15' + FI + '?');
  assert.equal(T('12 : x'), '12' + NB + ': x');
  assert.equal(T('pentes de 20 % et plus'), 'pentes de 20' + FI + '% et plus');
  assert.equal(T('Défi d\'Agathe · Texte 1 sur 3'), 'Défi d’Agathe' + NB + '· Texte 1' + NB + 'sur 3');
  assert.equal(T('2 sur 3'), '2' + NB + 'sur 3');
  assert.equal(T("Aujourd'hui, tu as penché vers le changement."), 'Aujourd’hui, tu as penché vers le changement.');
  assert.equal(N.apostrophes("J'aurais pu trouver"), 'J’aurais pu trouver');
  // exemple de schema.md, partie 4.5
  assert.deepEqual(['Et l\'Assemblée ?', 'Texte adopté.', 'Le 9 octobre 2024. Le Sénat devait encore voter.'].map(T),
    ['Et l’Assemblée ?', 'Texte adopté.', 'Le 9 octobre 2024. Le Sénat devait encore voter.']);
});

test('Élisions, accords, listes (§7.6)', () => {
  assert.equal(N.dePrenom('Agathe'), "d'Agathe");
  assert.equal(N.dePrenom('Odile'), "d'Odile");
  assert.equal(N.dePrenom('Nassim'), 'de Nassim');
  assert.equal(N.quePrenom('Agathe'), "qu'Agathe");
  assert.equal(N.quePrenom('Valentin'), 'que Valentin');
  assert.throws(() => N.dePrenom('Marie'));
  assert.equal(N.deDepute({ nom: 'Ian Boucard', elision: false }), 'de Ian Boucard');
  assert.equal(N.deDepute({ nom: 'Hubert Ott', elision: true }), "d'Hubert Ott");
  assert.throws(() => N.deDepute({ nom: 'X' }));
  assert.equal(N.accordNombre(0, 'point', 'points'), '0 point');
  assert.equal(N.accordNombre(1, 'point', 'points'), '1 point');
  assert.equal(N.accordNombre(2, 'point', 'points'), '2 points');
  assert.equal(N.accordVerbe(1, 'a répondu', 'ont répondu'), 'a répondu');
  assert.equal(N.accordVerbe(3, 'a répondu', 'ont répondu'), 'ont répondu');
  assert.equal(N.mandatDepute(true), 'députée');
  assert.equal(N.mandatSenateur(false), 'sénateur');
  assert.equal(N.listeEt(['A']), 'A');
  assert.equal(N.listeEt(['A', 'B']), 'A et B');
  assert.equal(N.listeEt(['A', 'B', 'C']), 'A, B et C');
  assert.equal(N.listeEt(['A', 'B', 'C', 'D']), 'A, B, C et D');
});

test('Typographie : règles 4 et 5 par la forme, suites qui se chevauchent (§7.8, réponse à Q-F2)', () => {
  const T = N.typographier, v = s => T(s).replace(/ /g, '⍽').replace(/ /g, 'ʼ');
  assert.equal(v('1 h 22 h 33'), '1⍽h⍽22⍽h⍽33', 'deux suites qui se partagent « 22 »');
  assert.equal(v('ouvert 24 h 24'), 'ouvert 24⍽h⍽24');
  assert.equal(v('Révélation dans 2 h 05'), 'Révélation dans 2⍽h⍽05');
  assert.equal(v('2 h 5 et 2 h 055'), '2⍽h 5⍽et 2⍽h 055', 'deux chiffres exactement après « h » (règle 6 après « 5 »)');
  assert.equal(v('le 31 février 2026'), 'le 31⍽février⍽2026', 'la date n’est pas vérifiée');
  assert.equal(v('le 01 mars 2026'), 'le 01⍽mars 2026', 'zéro initial : seule la règle 6 joue');
  assert.equal(v('le 32 mars 2026'), 'le 32⍽mars 2026');
  assert.equal(v('le 21er mars 2026'), 'le 21er mars 2026', '« 1er » précédé d’un chiffre');
  assert.equal(v('x9 mars 2026'), 'x9⍽mars⍽2026');
  assert.equal(v('9 mars 20261'), '9⍽mars 20261', 'quatre chiffres exactement');
  assert.equal(v('dès le 1er janvier 2027'), 'dès le 1er⍽janvier⍽2027');
  assert.equal(v('le 9 Octobre 2024'), 'le 9⍽Octobre 2024', 'mois écrit exactement');
  assert.equal(v('le 9 octobre 2024 2 h 05'), 'le 9⍽octobre⍽2024⍽2⍽h⍽05');
  assert.equal(N.typographier13('Il a 12 000 euros ? Oui : « x »').replace(/ /g, '⍽').replace(/ /g, 'ʼ'), 'Il a 12 000 eurosʼ? Oui⍽: «⍽x⍽»');
  assert.deepEqual(['1 h 05', '2 h 05'].map(s => T(s)), ['1 h 05', '2 h 05']);
});
