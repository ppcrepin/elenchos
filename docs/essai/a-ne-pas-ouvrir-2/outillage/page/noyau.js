/* Noyau de la page de l'essai (outillage d'essai, D-001 tenu).
 * Second essai : copie du noyau du premier essai, plus modulo et squelette
 * (lot 1). Renvois « §n » : simulation.md, sauf mention de simulation-2.md.
 *
 * Fonctions pures, sans écran, sans stockage, sans horloge, sans hasard :
 * SHA-256 (FIPS 180-4), base64 et UTF-8 stricts, JSON canonique,
 * tirage t(clé) (simulation.md, §0), fractions exactes en BigInt (§0),
 * heure de Paris sans l'API d'internationalisation (§0, §7.5, §8.4),
 * typographie d'affichage (§7.8),
 * élisions et accords (§7.6), dates par tables (§7.9, §8.12).
 *
 * Se charge tel quel dans Node 22 et, concaténé avec les autres
 * fichiers dans le bloc de script unique de la page, dans le navigateur.
 * Les lignes entre « node-debut » et « node-fin » sont retirées à la
 * construction. Aucun des mots interdits par le contrôle 5 (simulation.md,
 * §9), même en commentaire : la vérification de la construction lit le
 * texte brut. Pas d'assertion arrière dans les expressions régulières
 * (Safari 14 au moins).
 */
'use strict';

var ElenchosNoyau = (function () {

  /* ------------------------------------------------------------------ */
  /* Erreurs                                                             */
  /* ------------------------------------------------------------------ */

  function ErreurNoyau(message) {
    var e = new Error(message);
    e.name = 'ErreurNoyau';
    return e;
  }

  /* ------------------------------------------------------------------ */
  /* SHA-256 (FIPS 180-4), synchrone                                     */
  /* ------------------------------------------------------------------ */

  var K256 = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);
  var H256 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var HEX = '0123456789abcdef';

  /** SHA-256 d'un Uint8Array, en 64 chiffres hexadécimaux minuscules. */
  function sha256(octets) {
    if (!(octets instanceof Uint8Array)) { throw ErreurNoyau('sha256 : Uint8Array attendu'); }
    var n = octets.length;
    var taille = Math.ceil((n + 9) / 64) * 64;
    var m = new Uint8Array(taille);
    m.set(octets);
    m[n] = 0x80;
    // longueur en bits, sur 64 bits, gros-boutiste (n < 2^50 ici)
    var bitsHaut = Math.floor(n / 0x20000000);
    var bitsBas = (n * 8) >>> 0;
    m[taille - 8] = (bitsHaut >>> 24) & 0xff;
    m[taille - 7] = (bitsHaut >>> 16) & 0xff;
    m[taille - 6] = (bitsHaut >>> 8) & 0xff;
    m[taille - 5] = bitsHaut & 0xff;
    m[taille - 4] = (bitsBas >>> 24) & 0xff;
    m[taille - 3] = (bitsBas >>> 16) & 0xff;
    m[taille - 2] = (bitsBas >>> 8) & 0xff;
    m[taille - 1] = bitsBas & 0xff;

    var h0 = H256[0], h1 = H256[1], h2 = H256[2], h3 = H256[3];
    var h4 = H256[4], h5 = H256[5], h6 = H256[6], h7 = H256[7];
    var w = new Uint32Array(64);
    for (var bloc = 0; bloc < taille; bloc += 64) {
      var t;
      for (t = 0; t < 16; t++) {
        var i = bloc + 4 * t;
        w[t] = ((m[i] << 24) | (m[i + 1] << 16) | (m[i + 2] << 8) | m[i + 3]) >>> 0;
      }
      for (t = 16; t < 64; t++) {
        var x = w[t - 15], y = w[t - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
      }
      var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (t = 0; t < 64; t++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K256[t] + w[t]) >>> 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e;
        e = (d + t1) >>> 0;
        d = c; c = b; b = a;
        a = (t1 + t2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }
    var mots = [h0, h1, h2, h3, h4, h5, h6, h7];
    var sortie = '';
    for (var k = 0; k < 8; k++) {
      for (var s = 28; s >= 0; s -= 4) { sortie += HEX.charAt((mots[k] >>> s) & 0xf); }
    }
    return sortie;
  }

  /** Les trois exemples de FIPS 180-4 (FIPS 180-2, annexe B), étape V1. */
  var EXEMPLES_FIPS = [
    { nom: 'abc', octets: function () { return asciiOctets('abc'); },
      attendu: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' },
    { nom: '448 bits', octets: function () { return asciiOctets('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'); },
      attendu: '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1' },
    { nom: 'un million de a', octets: function () { var o = new Uint8Array(1000000); o.fill(0x61); return o; },
      attendu: 'cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0' }
  ];

  function asciiOctets(s) {
    var o = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c > 0x7e || c < 0x20) { throw ErreurNoyau('asciiOctets : caractère hors ASCII imprimable'); }
      o[i] = c;
    }
    return o;
  }

  /** V1 : vrai si les trois exemples redonnent leur empreinte. */
  function autotestSha256() {
    for (var i = 0; i < EXEMPLES_FIPS.length; i++) {
      if (sha256(EXEMPLES_FIPS[i].octets()) !== EXEMPLES_FIPS[i].attendu) { return false; }
    }
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* base64 strict (RFC 4648, alphabet standard, « = » de fin)            */
  /* ------------------------------------------------------------------ */

  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  var B64_INVERSE = (function () {
    var t = new Int16Array(128);
    for (var i = 0; i < 128; i++) { t[i] = -1; }
    for (var j = 0; j < 64; j++) { t[B64.charCodeAt(j)] = j; }
    return t;
  })();

  /** Décode une chaîne base64 stricte ; lève une erreur sur tout écart
   *  (longueur, caractère, « = » mal placé, bits de remplissage non nuls). */
  function base64Decoder(s) {
    if (typeof s !== 'string') { throw ErreurNoyau('base64 : chaîne attendue'); }
    var n = s.length;
    if (n % 4 !== 0) { throw ErreurNoyau('base64 : longueur non multiple de 4'); }
    var rempl = 0;
    if (n > 0 && s.charAt(n - 1) === '=') { rempl = 1; }
    if (n > 1 && s.charAt(n - 2) === '=') { rempl = 2; }
    var sortie = new Uint8Array(n / 4 * 3 - rempl);
    var o = 0;
    for (var i = 0; i < n; i += 4) {
      var v = [0, 0, 0, 0];
      for (var j = 0; j < 4; j++) {
        var c = s.charCodeAt(i + j);
        if (c === 0x3d && i + 4 === n && j >= 4 - rempl) { v[j] = 0; continue; }
        if (c >= 128 || B64_INVERSE[c] < 0) { throw ErreurNoyau('base64 : caractère interdit en ' + (i + j)); }
        v[j] = B64_INVERSE[c];
      }
      var trio = (v[0] << 18) | (v[1] << 12) | (v[2] << 6) | v[3];
      if (i + 4 === n && rempl === 2) {
        if ((v[1] & 0x0f) !== 0) { throw ErreurNoyau('base64 : bits de remplissage non nuls'); }
        sortie[o++] = (trio >>> 16) & 0xff;
      } else if (i + 4 === n && rempl === 1) {
        if ((v[2] & 0x03) !== 0) { throw ErreurNoyau('base64 : bits de remplissage non nuls'); }
        sortie[o++] = (trio >>> 16) & 0xff;
        sortie[o++] = (trio >>> 8) & 0xff;
      } else {
        sortie[o++] = (trio >>> 16) & 0xff;
        sortie[o++] = (trio >>> 8) & 0xff;
        sortie[o++] = trio & 0xff;
      }
    }
    return sortie;
  }

  function base64Encoder(octets) {
    var s = '';
    for (var i = 0; i < octets.length; i += 3) {
      var a = octets[i], b = i + 1 < octets.length ? octets[i + 1] : 0, c = i + 2 < octets.length ? octets[i + 2] : 0;
      var trio = (a << 16) | (b << 8) | c;
      s += B64.charAt((trio >>> 18) & 63) + B64.charAt((trio >>> 12) & 63);
      s += i + 1 < octets.length ? B64.charAt((trio >>> 6) & 63) : '=';
      s += i + 2 < octets.length ? B64.charAt(trio & 63) : '=';
    }
    return s;
  }

  /* ------------------------------------------------------------------ */
  /* UTF-8 strict                                                        */
  /* ------------------------------------------------------------------ */

  /** Décode des octets UTF-8 ; lève une erreur sur toute suite invalide
   *  (surlongue, substitut, au-delà de U+10FFFF, tronquée). */
  function utf8Decoder(octets) {
    var unites = [];
    var morceaux = [];
    var i = 0, n = octets.length;
    while (i < n) {
      var b0 = octets[i];
      var cp, besoin, min;
      if (b0 < 0x80) { cp = b0; besoin = 0; min = 0; }
      else if (b0 >= 0xc2 && b0 <= 0xdf) { cp = b0 & 0x1f; besoin = 1; min = 0x80; }
      else if (b0 >= 0xe0 && b0 <= 0xef) { cp = b0 & 0x0f; besoin = 2; min = 0x800; }
      else if (b0 >= 0xf0 && b0 <= 0xf4) { cp = b0 & 0x07; besoin = 3; min = 0x10000; }
      else { throw ErreurNoyau('UTF-8 : octet de tête invalide en ' + i); }
      for (var j = 1; j <= besoin; j++) {
        if (i + j >= n) { throw ErreurNoyau('UTF-8 : suite tronquée en ' + i); }
        var bj = octets[i + j];
        if ((bj & 0xc0) !== 0x80) { throw ErreurNoyau('UTF-8 : octet de suite invalide en ' + (i + j)); }
        cp = (cp << 6) | (bj & 0x3f);
      }
      if (cp < min) { throw ErreurNoyau('UTF-8 : forme surlongue en ' + i); }
      if (cp >= 0xd800 && cp <= 0xdfff) { throw ErreurNoyau('UTF-8 : substitut en ' + i); }
      if (cp > 0x10ffff) { throw ErreurNoyau('UTF-8 : au-delà de U+10FFFF en ' + i); }
      if (cp >= 0x10000) {
        cp -= 0x10000;
        unites.push(0xd800 + (cp >>> 10), 0xdc00 + (cp & 0x3ff));
      } else {
        unites.push(cp);
      }
      if (unites.length >= 8192) { morceaux.push(String.fromCharCode.apply(null, unites)); unites = []; }
      i += besoin + 1;
    }
    morceaux.push(String.fromCharCode.apply(null, unites));
    return morceaux.join('');
  }

  /** Encode une chaîne en UTF-8 ; lève une erreur sur un substitut isolé. */
  function utf8Encoder(s) {
    var o = [];
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff) {
        var d = i + 1 < s.length ? s.charCodeAt(i + 1) : 0;
        if (d < 0xdc00 || d > 0xdfff) { throw ErreurNoyau('UTF-8 : substitut isolé'); }
        c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00);
        i++;
      } else if (c >= 0xdc00 && c <= 0xdfff) {
        throw ErreurNoyau('UTF-8 : substitut isolé');
      }
      if (c < 0x80) { o.push(c); }
      else if (c < 0x800) { o.push(0xc0 | (c >>> 6), 0x80 | (c & 0x3f)); }
      else if (c < 0x10000) { o.push(0xe0 | (c >>> 12), 0x80 | ((c >>> 6) & 0x3f), 0x80 | (c & 0x3f)); }
      else { o.push(0xf0 | (c >>> 18), 0x80 | ((c >>> 12) & 0x3f), 0x80 | ((c >>> 6) & 0x3f), 0x80 | (c & 0x3f)); }
    }
    return new Uint8Array(o);
  }

  /* ------------------------------------------------------------------ */
  /* JSON canonique (schema.md, partie 1.1 : RFC 8785 restreinte)        */
  /* ------------------------------------------------------------------ */

  function chaineJson(s) {
    var r = '"';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 0x22) { r += '\\"'; }
      else if (c === 0x5c) { r += '\\\\'; }
      else if (c < 0x20) {
        if (c === 0x08) { r += '\\b'; }
        else if (c === 0x09) { r += '\\t'; }
        else if (c === 0x0a) { r += '\\n'; }
        else if (c === 0x0c) { r += '\\f'; }
        else if (c === 0x0d) { r += '\\r'; }
        else { r += '\\u00' + HEX.charAt(c >>> 4) + HEX.charAt(c & 15); }
      } else { r += s.charAt(i); }
    }
    return r + '"';
  }

  /** Compare deux chaînes ASCII dans l'ordre des octets (= ordre UTF-16
   *  pour l'ASCII). */
  function comparerOctets(a, b) { return a < b ? -1 : (a > b ? 1 : 0); }

  /** Forme canonique : clés triées, entiers seulement, chaînes en NFC,
   *  aucun espace. Une Fraction s'écrit « p/q ». */
  function jsonCanonique(v) {
    if (v === null) { return 'null'; }
    if (v === true) { return 'true'; }
    if (v === false) { return 'false'; }
    if (typeof v === 'number') {
      if (!Number.isSafeInteger(v)) { throw ErreurNoyau('JSON canonique : nombre non entier ' + v); }
      return Object.is(v, -0) ? '0' : String(v);
    }
    if (typeof v === 'string') {
      if (v.normalize('NFC') !== v) { throw ErreurNoyau('JSON canonique : chaîne non NFC'); }
      return chaineJson(v);
    }
    if (v instanceof Fraction) { return chaineJson(v.toString()); }
    if (Array.isArray(v)) {
      var parts = [];
      for (var i = 0; i < v.length; i++) { parts.push(jsonCanonique(v[i])); }
      return '[' + parts.join(',') + ']';
    }
    if (typeof v === 'object') {
      var cles = Object.keys(v);
      for (var j = 0; j < cles.length; j++) {
        if (!/^[\x20-\x7e]*$/.test(cles[j])) { throw ErreurNoyau('JSON canonique : clé hors ASCII'); }
      }
      cles.sort(comparerOctets);
      var champs = [];
      for (var k = 0; k < cles.length; k++) {
        if (v[cles[k]] === undefined) { throw ErreurNoyau('JSON canonique : valeur indéfinie pour ' + cles[k]); }
        champs.push(chaineJson(cles[k]) + ':' + jsonCanonique(v[cles[k]]));
      }
      return '{' + champs.join(',') + '}';
    }
    throw ErreurNoyau('JSON canonique : type non permis');
  }

  /* ------------------------------------------------------------------ */
  /* Fractions exactes (BigInt)                                          */
  /* ------------------------------------------------------------------ */

  function pgcd(a, b) {
    if (a < 0n) { a = -a; }
    if (b < 0n) { b = -b; }
    while (b !== 0n) { var r = a % b; a = b; b = r; }
    return a;
  }

  function versBigInt(x) {
    if (typeof x === 'bigint') { return x; }
    if (typeof x === 'number') {
      if (!Number.isSafeInteger(x)) { throw ErreurNoyau('Fraction : nombre à virgule ou trop grand refusé (' + x + ')'); }
      return BigInt(x);
    }
    throw ErreurNoyau('Fraction : entier attendu');
  }

  /** Fraction p/q irréductible, q > 0. Se construit depuis deux entiers
   *  (Number sûr ou BigInt), une chaîne décimale (« 0.95 », « -2 ») ou une
   *  chaîne « p/q ». Jamais depuis un nombre à virgule. */
  function Fraction(p, q) {
    if (!(this instanceof Fraction)) { return new Fraction(p, q); }
    var num, den;
    if (typeof p === 'string' && q === undefined) {
      var md = /^(-?)([0-9]+)(?:\.([0-9]+))?$/.exec(p);
      var mf = /^(-?[0-9]+)\/([0-9]+)$/.exec(p);
      if (md) {
        var dec = md[3] || '';
        num = BigInt(md[2] + dec);
        den = 10n ** BigInt(dec.length);
        if (md[1] === '-') { num = -num; }
      } else if (mf) {
        num = BigInt(mf[1]);
        den = BigInt(mf[2]);
      } else {
        throw ErreurNoyau('Fraction : chaîne illisible « ' + p + ' »');
      }
    } else {
      num = versBigInt(p);
      den = q === undefined ? 1n : versBigInt(q);
    }
    if (den === 0n) { throw ErreurNoyau('Fraction : dénominateur nul'); }
    if (den < 0n) { num = -num; den = -den; }
    var g = pgcd(num, den);
    if (g > 1n) { num = num / g; den = den / g; } // divisions exactes par le PGCD
    this.n = num;
    this.d = den;
    Object.freeze(this);
  }

  function F(x) { return x instanceof Fraction ? x : new Fraction(x); }

  Fraction.prototype.plus = function (b) { b = F(b); return new Fraction(this.n * b.d + b.n * this.d, this.d * b.d); };
  Fraction.prototype.moins = function (b) { b = F(b); return new Fraction(this.n * b.d - b.n * this.d, this.d * b.d); };
  Fraction.prototype.fois = function (b) { b = F(b); return new Fraction(this.n * b.n, this.d * b.d); };
  Fraction.prototype.divise = function (b) {
    b = F(b);
    if (b.n === 0n) { throw ErreurNoyau('Fraction : division par zéro'); }
    return new Fraction(this.n * b.d, this.d * b.n);
  };
  Fraction.prototype.oppose = function () { return new Fraction(-this.n, this.d); };
  Fraction.prototype.abs = function () { return this.n < 0n ? this.oppose() : this; };
  /** -1, 0 ou 1, par produits croisés. */
  Fraction.prototype.cmp = function (b) {
    b = F(b);
    var g = this.n * b.d, dr = b.n * this.d;
    return g < dr ? -1 : (g > dr ? 1 : 0);
  };
  Fraction.prototype.egal = function (b) { b = F(b); return this.n === b.n && this.d === b.d; };
  Fraction.prototype.inf = function (b) { return this.cmp(b) < 0; };
  Fraction.prototype.infEgal = function (b) { return this.cmp(b) <= 0; };
  Fraction.prototype.sup = function (b) { return this.cmp(b) > 0; };
  Fraction.prototype.supEgal = function (b) { return this.cmp(b) >= 0; };
  Fraction.prototype.estZero = function () { return this.n === 0n; };
  /** Forme de str(Fraction) en Python : « p/q », ou « p » si q = 1. */
  Fraction.prototype.toString = function () { return this.d === 1n ? this.n.toString() : this.n.toString() + '/' + this.d.toString(); };
  /** Seule conversion en nombre à virgule, pour dessiner un curseur.
   *  La valeur rendue ne revient jamais dans un calcul. */
  Fraction.prototype.pourDessiner = function () { return Number(this.n) / Number(this.d); };

  Fraction.max = function (a, b) { return F(a).cmp(b) >= 0 ? F(a) : F(b); };
  Fraction.min = function (a, b) { return F(a).cmp(b) <= 0 ? F(a) : F(b); };
  Fraction.somme = function (liste) {
    var s = new Fraction(0);
    for (var i = 0; i < liste.length; i++) { s = s.plus(liste[i]); }
    return s;
  };
  Fraction.ZERO = new Fraction(0);
  Fraction.UN = new Fraction(1);

  /* ------------------------------------------------------------------ */
  /* Tirage déterministe t(clé) (simulation.md, §0)                      */
  /* ------------------------------------------------------------------ */

  var CLE_ASCII = /^[\x20-\x7e]*$/;

  /** Crée le tirage pour une graine (16 chiffres hexadécimaux minuscules).
   *  t(clé) rend {cle, n} : N, entier des 8 premiers chiffres hexadécimaux
   *  de SHA-256(graine + "|" + clé) ; t = N / 16^8. */
  function creerTirage(graine) {
    if (!/^[0-9a-f]{16}$/.test(graine)) { throw ErreurNoyau('graine invalide'); }
    var memo = Object.create(null);
    function t(cle) {
      if (typeof cle !== 'string' || !CLE_ASCII.test(cle)) { throw ErreurNoyau('clé de tirage hors ASCII : ' + cle); }
      var deja = memo[cle];
      if (deja) { return deja; }
      var chaine = graine + '|' + cle;
      var hex = sha256(asciiOctets(chaine));
      var r = { cle: cle, chaine: chaine, hex8: hex.slice(0, 8), n: parseInt(hex.slice(0, 8), 16) };
      Object.freeze(r);
      memo[cle] = r;
      return r;
    }
    /** Ordre de deux tirages : N croissant, puis clé dans l'ordre des octets. */
    function comparer(a, b) {
      if (a.n !== b.n) { return a.n < b.n ? -1 : 1; }
      return comparerOctets(a.cle, b.cle);
    }
    /** Mélange : trie les éléments par t(prefixe + élément) croissant. */
    function melanger(elements, prefixe) {
      var paires = elements.map(function (e) { return { e: e, t: t(prefixe + e) }; });
      paires.sort(function (x, y) { return comparer(x.t, y.t); });
      return paires.map(function (p) { return p.e; });
    }
    /** Élément de plus petit t(prefixe + élément). */
    function plusPetit(elements, prefixe) {
      if (elements.length === 0) { return null; }
      return melanger(elements, prefixe)[0];
    }
    return { graine: graine, t: t, comparer: comparer, melanger: melanger, plusPetit: plusPetit };
  }

  /* ------------------------------------------------------------------ */
  /* Calendrier et heure de Paris, sans le fuseau de l'appareil         */
  /* ------------------------------------------------------------------ */

  var MS_JOUR = 86400000;
  var MS_MINUTE = 60000;

  /** Nombre de jours depuis le 1970-01-01 (calendrier grégorien
   *  proleptique ; H. Hinnant, days_from_civil). */
  function joursDepuisCivil(a, m, j) {
    a -= m <= 2 ? 1 : 0;
    var ere = Math.floor(a / 400);
    var ade = a - ere * 400;
    var mp = (m + 9) % 12;
    var adj = Math.floor((153 * mp + 2) / 5) + j - 1;
    var ad = ade * 365 + Math.floor(ade / 4) - Math.floor(ade / 100) + adj;
    return ere * 146097 + ad - 719468;
  }

  function civilDepuisJours(z) {
    z += 719468;
    var ere = Math.floor(z / 146097);
    var dde = z - ere * 146097;
    var ade = Math.floor((dde - Math.floor(dde / 1460) + Math.floor(dde / 36524) - Math.floor(dde / 146096)) / 365);
    var a = ade + ere * 400;
    var adj = dde - (365 * ade + Math.floor(ade / 4) - Math.floor(ade / 100));
    var mp = Math.floor((5 * adj + 2) / 153);
    var j = adj - Math.floor((153 * mp + 2) / 5) + 1;
    var m = mp < 10 ? mp + 3 : mp - 9;
    return { annee: a + (m <= 2 ? 1 : 0), mois: m, jour: j };
  }

  /** 0 = lundi … 6 = dimanche ; le 1970-01-01 était un jeudi. */
  function jourSemaine(z) { return ((z % 7) + 7 + 3) % 7; }

  function joursDansMois(a, m) {
    if (m === 2) { return (a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0)) ? 29 : 28; }
    return (m === 4 || m === 6 || m === 9 || m === 11) ? 30 : 31;
  }

  function dernierDimanche(a, m) {
    var z = joursDepuisCivil(a, m, joursDansMois(a, m));
    return z - ((jourSemaine(z) + 1) % 7);
  }

  /** Décalage de Paris en minutes (60 ou 120) à un instant UTC (ms).
   *  Heure d'été du dernier dimanche de mars, 1 h UTC, au dernier
   *  dimanche d'octobre, 1 h UTC (règle européenne). */
  function decalageParis(msUtc) {
    var a = civilDepuisJours(Math.floor(msUtc / MS_JOUR)).annee;
    var debut = dernierDimanche(a, 3) * MS_JOUR + 3600000;
    var fin = dernierDimanche(a, 10) * MS_JOUR + 3600000;
    return (msUtc >= debut && msUtc < fin) ? 120 : 60;
  }

  function deux(n) { return (n < 10 ? '0' : '') + n; }

  /** Heure de Paris à la minute, tronquée, depuis un instant UTC (ms). */
  function paris(msUtc) {
    if (typeof msUtc !== 'number' || !isFinite(msUtc)) { throw ErreurNoyau('instant invalide'); }
    var dec = decalageParis(msUtc);
    var minutesLocales = Math.floor(msUtc / MS_MINUTE) + dec;
    var z = Math.floor(minutesLocales / 1440);
    var mJour = minutesLocales - z * 1440;
    var c = civilDepuisJours(z);
    return {
      annee: c.annee, mois: c.mois, jour: c.jour,
      heure: Math.floor(mJour / 60), minute: mJour % 60,
      minutesDuJour: mJour, numeroJour: z, jourSemaine: jourSemaine(z), decalage: dec,
      date: c.annee + '-' + deux(c.mois) + '-' + deux(c.jour),
      hhmm: deux(Math.floor(mJour / 60)) + ':' + deux(mJour % 60),
      instant: c.annee + '-' + deux(c.mois) + '-' + deux(c.jour) + 'T' + deux(Math.floor(mJour / 60)) + ':' +
        deux(mJour % 60) + '+' + deux(dec / 60) + ':00'
    };
  }

  var RE_INSTANT = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})([+-])([0-9]{2}):([0-9]{2})$/;

  /** Lit un instant « AAAA-MM-JJTHH:MM±hh:mm » ; vérifie qu'il existe à
   *  Paris avec ce décalage. Rend l'instant UTC en ms (minute pleine). */
  function lireInstant(s) {
    var m = RE_INSTANT.exec(s);
    if (!m) { throw ErreurNoyau('instant mal écrit : ' + s); }
    var a = +m[1], mo = +m[2], j = +m[3], h = +m[4], mi = +m[5];
    var dec = (m[6] === '-' ? -1 : 1) * (+m[7] * 60 + +m[8]);
    if (mo < 1 || mo > 12 || j < 1 || j > joursDansMois(a, mo) || h > 23 || mi > 59) { throw ErreurNoyau('instant inexistant : ' + s); }
    var ms = (joursDepuisCivil(a, mo, j) * 1440 + h * 60 + mi - dec) * MS_MINUTE;
    if (paris(ms).instant !== s) { throw ErreurNoyau("instant qui n'existe pas à Paris avec ce décalage : " + s); }
    return ms;
  }

  /** Lit une date « AAAA-MM-JJ » (schema.md, partie 1.2), par découpage. */
  function lireDate(s) {
    var m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(s);
    if (!m) { throw ErreurNoyau('date mal écrite : ' + s); }
    var a = +m[1], mo = +m[2], j = +m[3];
    if (mo < 1 || mo > 12 || j < 1 || j > joursDansMois(a, mo)) { throw ErreurNoyau('date inexistante : ' + s); }
    return { annee: a, mois: mo, jour: j, numeroJour: joursDepuisCivil(a, mo, j), jourSemaine: jourSemaine(joursDepuisCivil(a, mo, j)) };
  }

  /** Minutes depuis minuit d'une heure « HH:MM ». */
  function lireHeure(s) {
    var m = /^([0-9]{2}):([0-9]{2})$/.exec(s);
    if (!m || +m[1] > 23 || +m[2] > 59) { throw ErreurNoyau('heure mal écrite : ' + s); }
    return +m[1] * 60 + +m[2];
  }

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  function jourEcrit(j) { return j === 1 ? '1er' : String(j); }

  /** « {j} {mois} {aaaa} » (§7.9), en typographie simple. */
  function dateLongue(s) {
    var d = lireDate(s);
    return jourEcrit(d.jour) + ' ' + MOIS[d.mois - 1] + ' ' + d.annee;
  }

  /** « lundi 19 octobre 2026 » (§8.12), depuis la date d'un instant. */
  function dateCarnet(instant) {
    lireInstant(instant);
    var d = lireDate(instant.slice(0, 10));
    return JOURS[d.jourSemaine] + ' ' + jourEcrit(d.jour) + ' ' + MOIS[d.mois - 1] + ' ' + d.annee;
  }

  /** « 07:40 » → « 7h40 » (fiche « Qui est qui », §8.6). */
  function heureEcrite(hhmm) {
    var m = lireHeure(hhmm);
    return Math.floor(m / 60) + 'h' + deux(m % 60);
  }

  /** Jours écoulés entre deux instants : différence des dates locales de
   *  Paris (schema.md, partie 6, point 3). */
  function joursEcoules(instantAvant, instantApres) {
    lireInstant(instantAvant);
    lireInstant(instantApres);
    return lireDate(instantApres.slice(0, 10)).numeroJour - lireDate(instantAvant.slice(0, 10)).numeroJour;
  }

  /* ------------------------------------------------------------------ */
  /* Typographie à l'affichage (§7.8)                                    */
  /* ------------------------------------------------------------------ */

  var NBSP = '\u00a0';
  var FINE = '\u202f';

  function estChiffre(c) { return c >= '0' && c <= '9'; }

  /** Règle 4 (§7.8) : espaces de « {chiffre} h {deux chiffres} », jugées sur la chaîne de départ. */
  function espacesHeure(c) {
    var marques = [];
    for (var i = 0; i + 5 < c.length; i++) {
      if (estChiffre(c[i]) && c[i + 1] === ' ' && c[i + 2] === 'h' && c[i + 3] === ' ' && estChiffre(c[i + 4]) && estChiffre(c[i + 5]) &&
        (i + 6 === c.length || !estChiffre(c[i + 6]))) { marques.push(i + 1, i + 3); }
    }
    return marques;
  }

  /** Longueurs possibles d'un jour qui commence en i (« 1er », ou 1 à 31 sans zéro initial). */
  function joursEn(c, i) {
    if (i > 0 && estChiffre(c[i - 1])) { return []; }
    var l = [];
    if (c[i] === '1' && c[i + 1] === 'e' && c[i + 2] === 'r') { l.push(3); }
    if (c[i] >= '1' && c[i] <= '9') {
      l.push(1);
      if (estChiffre(c[i + 1]) && (c[i] === '1' || c[i] === '2' || (c[i] === '3' && (c[i + 1] === '0' || c[i + 1] === '1')))) { l.push(2); }
    }
    return l;
  }

  /** Règle 5 (§7.8) : espaces de « {j} {mois} {aaaa} », jugées sur la chaîne de départ. */
  function espacesDate(c) {
    var marques = [];
    for (var i = 0; i < c.length; i++) {
      joursEn(c, i).forEach(function (lj) {
        var a = i + lj;
        if (c[a] !== ' ') { return; }
        MOIS.forEach(function (mois) {
          if (c.slice(a + 1, a + 1 + mois.length).join('') !== mois) { return; }
          var b = a + 1 + mois.length;
          if (c[b] !== ' ') { return; }
          for (var d = b + 1; d < b + 5; d++) { if (!(d < c.length && estChiffre(c[d]))) { return; } }
          if (b + 5 < c.length && estChiffre(c[b + 5])) { return; }
          marques.push(a, b);
        });
      });
    }
    return marques;
  }

  /** Applique les règles 1 à 6 du §7.8, dans cet ordre, à une phrase
   *  entière (valeurs insérées, pseudo exclu). Chaque règle ne change que
   *  des espaces U+0020 encore ordinaires ; les règles 4 et 5 jugent chaque
   *  espace sur la chaîne telle qu'elle était au début de la règle.
   *  Toujours un seul argument : voir typographier13 pour le §8.13. */
  function typographier(s) { return typo(s, 6); }
  /** Règles 1 à 3 seulement (écrans hors de l'icône, §8.13). */
  function typographier13(s) { return typo(s, 3); }
  function typo(s, jusqua) {
    // 1. apostrophe
    s = s.split("'").join('’');
    var c = Array.from(s);
    var i;
    // 2. espace fine insécable avant ? ! ;
    for (i = 0; i < c.length; i++) {
      if (c[i] === ' ' && i + 1 < c.length && (c[i + 1] === '?' || c[i + 1] === '!' || c[i + 1] === ';')) { c[i] = FINE; }
    }
    // 3. espace insécable avant : » · et après « ←
    for (i = 0; i < c.length; i++) {
      if (c[i] !== ' ') { continue; }
      var apres = i + 1 < c.length ? c[i + 1] : '';
      var avant = i > 0 ? c[i - 1] : '';
      if (apres === ':' || apres === '»' || apres === '·' || avant === '«' || avant === '←') { c[i] = NBSP; }
    }
    if (jusqua <= 3) { return c.join(''); }
    // 4. heure ou durée « {h} h {mm} »
    espacesHeure(c).forEach(function (j) { if (c[j] === ' ') { c[j] = NBSP; } });
    // 5. date « {j} {mois} {aaaa} »
    espacesDate(c).forEach(function (j) { if (c[j] === ' ') { c[j] = NBSP; } });
    // 6. espace après un chiffre
    for (i = 1; i < c.length; i++) {
      if (c[i] !== ' ' || !estChiffre(c[i - 1])) { continue; }
      var tranche = i + 3 < c.length && estChiffre(c[i + 1]) && estChiffre(c[i + 2]) && estChiffre(c[i + 3]) &&
        (i + 4 === c.length || !estChiffre(c[i + 4]));
      c[i] = (tranche || c[i + 1] === '%') ? FINE : NBSP;
    }
    return c.join('');
  }

  /** Règle 1 seulement (carnet, bloc de diagnostic). */
  function apostrophes(s) { return s.split("'").join('’'); }

  /* ------------------------------------------------------------------ */
  /* Élisions, accords, listes (§7.6)                                    */
  /* ------------------------------------------------------------------ */

  /** Prénoms des personnages qui commencent par une voyelle (§7.6). */
  var ELISION_PRENOM = { Agathe: true, Nassim: false, Odile: true, Valentin: false };

  function elisionPrenom(prenom) {
    if (!Object.prototype.hasOwnProperty.call(ELISION_PRENOM, prenom)) { throw ErreurNoyau('prénom inconnu : ' + prenom); }
    return ELISION_PRENOM[prenom];
  }

  /** « de Nassim » / « d'Agathe » (typographie simple). */
  function dePrenom(prenom) { return elisionPrenom(prenom) ? "d'" + prenom : 'de ' + prenom; }
  /** « que Nassim » / « qu'Agathe ». */
  function quePrenom(prenom) { return elisionPrenom(prenom) ? "qu'" + prenom : 'que ' + prenom; }
  /** « de {nom} » / « d'{nom} » pour un député, d'après son champ elision. */
  function deDepute(depute) {
    if (typeof depute.elision !== 'boolean') { throw ErreurNoyau('elision manquante'); }
    return depute.elision ? "d'" + depute.nom : 'de ' + depute.nom;
  }

  /** « 0 point », « 1 point », « 2 points ». */
  function accordNombre(n, singulier, pluriel) { return n + ' ' + (n >= 2 ? pluriel : singulier); }
  /** « a répondu » / « ont répondu ». */
  function accordVerbe(n, singulier, pluriel) { return n >= 2 ? pluriel : singulier; }
  function mandatDepute(feminin) { return feminin ? 'députée' : 'député'; }
  function mandatSenateur(feminin) { return feminin ? 'sénatrice' : 'sénateur'; }

  /** « A », « A et B », « A, B et C ». */
  function listeEt(elements) {
    if (elements.length === 0) { return ''; }
    if (elements.length === 1) { return elements[0]; }
    return elements.slice(0, -1).join(', ') + ' et ' + elements[elements.length - 1];
  }

  /* ------------------------------------------------------------------ */
  /* Second essai : reste mathématique, squelette d'un pseudo            */
  /* ------------------------------------------------------------------ */

  /** Reste au sens mathématique, toujours dans [0, m) : en JavaScript,
   *  « % » garde le signe (-5 % 4 vaut -1). Jours négatifs de l'histoire
   *  (a-ne-pas-ouvrir-2/schema.md, partie 1.1). */
  function modulo(x, m) {
    if (!Number.isSafeInteger(x) || !Number.isSafeInteger(m) || m <= 0) { throw ErreurNoyau('modulo : entiers attendus'); }
    return ((x % m) + m) % m;
  }

  /** Squelette d'une chaîne (simulation-2.md, §8.8, « Refus du pseudo » ;
   *  UTS #39 réduit) : décomposition canonique, marques combinantes
   *  retirées, minuscules (toLowerCase ne dépend pas de la langue de
   *  l'appareil), puis chaque caractère que la table connaît remplacé par
   *  sa lettre latine de base. table : objet {caractère: lettre}, tiré de
   *  confusables.txt à la construction (lot 6) ; {} en attendant. */
  function squelette(s, table) {
    if (typeof s !== 'string') { throw ErreurNoyau('squelette : chaîne attendue'); }
    var t = table || {};
    var d = s.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
    var sortie = '';
    Array.from(d).forEach(function (c) {
      sortie += Object.prototype.hasOwnProperty.call(t, c) ? t[c] : c;
    });
    return sortie.normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();
  }

  /* ------------------------------------------------------------------ */

  return {
    ErreurNoyau: ErreurNoyau,
    sha256: sha256, autotestSha256: autotestSha256, EXEMPLES_FIPS: EXEMPLES_FIPS, asciiOctets: asciiOctets,
    base64Decoder: base64Decoder, base64Encoder: base64Encoder,
    utf8Decoder: utf8Decoder, utf8Encoder: utf8Encoder,
    jsonCanonique: jsonCanonique, comparerOctets: comparerOctets,
    Fraction: Fraction,
    creerTirage: creerTirage,
    joursDepuisCivil: joursDepuisCivil, civilDepuisJours: civilDepuisJours, jourSemaine: jourSemaine,
    decalageParis: decalageParis, paris: paris, lireInstant: lireInstant, lireDate: lireDate, lireHeure: lireHeure,
    MOIS: MOIS, JOURS: JOURS, dateLongue: dateLongue, dateCarnet: dateCarnet, heureEcrite: heureEcrite,
    joursEcoules: joursEcoules, deux: deux,
    typographier: typographier, typographier13: typographier13, apostrophes: apostrophes, NBSP: NBSP, FINE: FINE,
    dePrenom: dePrenom, quePrenom: quePrenom, deDepute: deDepute, elisionPrenom: elisionPrenom,
    accordNombre: accordNombre, accordVerbe: accordVerbe, mandatDepute: mandatDepute, mandatSenateur: mandatSenateur,
    listeEt: listeEt,
    modulo: modulo, squelette: squelette
  };
})();

/*node-debut*/
if (typeof module !== 'undefined' && module.exports) { module.exports = ElenchosNoyau; }
/*node-fin*/
