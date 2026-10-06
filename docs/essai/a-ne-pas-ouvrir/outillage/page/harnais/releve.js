/* Relevé de ce que la page affiche (contrôles 10, 11 et 14 h), lu dans le
 * DOM par l'outil, sans rien modifier ni ajouter à la page.
 *
 * releverEcran() s'exécute dans la page (page.evaluate) et rend :
 *   { blocs: [{ texte, zone }], coupures: [{ avant, apres, bloc, zone }],
 *     dispositions: {...} }
 * - Un bloc est un élément affiché dont la boîte n'est pas « inline » ; son
 *   texte est celui de ses nœuds texte visibles qui n'appartiennent pas à
 *   un bloc plus profond (« tel que la maquette l'écrit d'un tenant »).
 * - zone : « tel » (téléphone), « barre », « bande », « cadre » (page du
 *   cadre), « seule » (vue seule, arrêts et écrans hors de l'icône),
 *   « exclue » (zone du carnet, empreinte, graine, fichier scellé : contrôle
 *   11, « Ne sont pas concernés »).
 * - Coupures automatiques de ligne : entre deux caractères d'un même bloc
 *   dont les boîtes ne sont pas sur la même ligne, sans retour voulu.
 */
'use strict';

/* eslint-disable no-undef */
function releverEcran() {
  var BLOCS_INLINE = { inline: true, contents: true };
  function visible(el) {
    if (!el || el.nodeType !== 1) { return true; }
    for (var e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (e.hidden) { return false; }
      var cs = getComputedStyle(e);
      if (cs.display === 'none') { return false; }
    }
    var cs2 = getComputedStyle(el);
    return cs2.visibility !== 'hidden' && cs2.visibility !== 'collapse';
  }
  function estBloc(el) { return !BLOCS_INLINE[getComputedStyle(el).display]; }
  function zoneDe(el) {
    if (el.closest('#zone-carnet, .code-brut')) { return 'exclue'; }
    if (el.closest('.telephone')) { return 'tel'; }
    if (el.closest('.barre')) { return 'barre'; }
    if (el.closest('.bande')) { return 'bande'; }
    if (el.closest('.cadre-milieu')) { return 'cadre'; }
    if (el.closest('#vue-seule, #vue-secours, .vue-couchee')) { return 'seule'; }
    return 'autre';
  }
  var blocs = [];
  var coupures = [];
  var racines = Array.prototype.slice.call(document.body.children);
  function blocParent(n) {
    var e = n.parentElement;
    while (e && !estBloc(e)) { e = e.parentElement; }
    return e;
  }
  // nœuds texte, groupés par bloc, dans l'ordre du document
  var parBloc = new Map();
  var ordre = [];
  racines.forEach(function (r) {
    var w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (!n.nodeValue) { continue; }
      if (n.parentElement && (n.parentElement.tagName === 'SCRIPT' || n.parentElement.tagName === 'STYLE')) { continue; }
      if (!visible(n.parentElement)) { continue; }
      var b = blocParent(n);
      if (!b) { continue; }
      if (!parBloc.has(b)) { parBloc.set(b, []); ordre.push(b); }
      parBloc.get(b).push(n);
    }
  });
  ordre.forEach(function (b) {
    var noeuds = parBloc.get(b);
    var texte = noeuds.map(function (n) { return n.nodeValue; }).join('');
    if (!/\S/.test(texte.replace(/[\u00a0\u202f]/g, 'x'))) { return; }
    var zone = zoneDe(b);
    blocs.push({ texte: texte, zone: zone });
    // coupures automatiques : position verticale de chaque caractère
    var pre = getComputedStyle(b).whiteSpace;
    var cars = [];
    noeuds.forEach(function (n) {
      for (var i = 0; i < n.nodeValue.length; i++) {
        var c = n.nodeValue.charAt(i);
        var r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1);
        var rects = r.getClientRects();
        var rect = rects.length ? rects[0] : null;
        cars.push({ c: c, top: rect ? rect.top : null, h: rect ? rect.height : 0, w: rect ? rect.width : 0 });
      }
    });
    var precedent = null; // dernier caractère visible (non blanc) avec sa boîte
    var blancsEntre = '';
    for (var k = 0; k < cars.length; k++) {
      var x = cars[k];
      if (x.c === '\n') { precedent = null; blancsEntre = ''; continue; } // retour voulu
      if (/\s/.test(x.c) && x.c !== '\u00a0' && x.c !== '\u202f') { blancsEntre += x.c; continue; }
      if (x.top === null || x.w === 0 && x.h === 0) { continue; }
      if (precedent && x.top > precedent.top + Math.max(4, precedent.h / 2)) {
        coupures.push({ avant: precedent.c, apres: x.c, blanc: blancsEntre, bloc: texte.slice(0, 120), zone: zone, pre: pre });
      }
      precedent = x; blancsEntre = '';
    }
  });
  return { blocs: blocs, coupures: coupures };
}

/** Mesures de mise en page (contrôle 14 h). */
function mesurerDisposition() {
  function boite(sel) {
    var e = document.querySelector(sel);
    if (!e || e.hidden || getComputedStyle(e).display === 'none') { return null; }
    var r = e.getBoundingClientRect();
    return { x: r.left, y: r.top, l: r.width, h: r.height, b: r.bottom, d: r.right };
  }
  var doc = document.scrollingElement || document.documentElement;
  var cibles = [];
  document.querySelectorAll('.barre button, .bande button').forEach(function (b) {
    var r = b.getBoundingClientRect();
    if (r.width && r.height) { cibles.push({ zone: 'cadre', texte: b.textContent, x: r.left, y: r.top, l: r.width, h: r.height }); }
  });
  var telCibles = [];
  document.querySelectorAll('.telephone button, .telephone a, .telephone input').forEach(function (b) {
    var r = b.getBoundingClientRect();
    if (r.width && r.height) { telCibles.push({ x: r.left, y: r.top, l: r.width, h: r.height }); }
  });
  return {
    fenetre: { l: window.innerWidth, h: window.innerHeight },
    defilement: { hauteur: doc.scrollHeight, visible: doc.clientHeight, largeur: doc.scrollWidth, visibleL: doc.clientWidth, haut: doc.scrollTop },
    barre: boite('.barre'), bande: boite('.bande'), milieu: boite('.milieu'), telephone: boite('.telephone'),
    ecran: boite('.telephone .tel-ecran'), cadre: boite('.cadre-milieu'), couchee: boite('.vue-couchee'), app: boite('#app'),
    planche: !!(window.matchMedia && window.matchMedia('(min-width: 600px) and (min-height: 900px)').matches),
    cibles: cibles, telCibles: telCibles
  };
}

module.exports = { releverEcran, mesurerDisposition };
