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
    var w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 1) {
        // un <br> est un retour à la ligne voulu : il entre dans le texte du bloc comme « \n »
        if (n.tagName === 'BR' && visible(n.parentElement)) {
          var bb = blocParent(n);
          if (bb) { if (!parBloc.has(bb)) { parBloc.set(bb, []); ordre.push(bb); } parBloc.get(bb).push({ br: true }); }
        }
        continue;
      }
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
    var texte = noeuds.map(function (n) { return n.br ? '\n' : n.nodeValue; }).join('');
    if (!/\S/.test(texte.replace(/[\u00a0\u202f]/g, 'x'))) { return; }
    var zone = zoneDe(b);
    blocs.push({ texte: texte, zone: zone });
    // coupures automatiques : position verticale de chaque caractère
    var pre = getComputedStyle(b).whiteSpace;
    var cars = [];
    noeuds.forEach(function (n) {
      if (n.br) { cars.push({ c: '\n', top: null, h: 0, w: 0 }); return; }
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
  // cibles du téléphone, rognées à ce qui s'en voit (défilement de l'écran, contour du téléphone)
  var telCibles = [];
  var tel = document.querySelector('.telephone');
  var rt = tel && !tel.hidden ? tel.getBoundingClientRect() : null;
  document.querySelectorAll('.telephone button, .telephone a, .telephone input').forEach(function (b) {
    if (!rt) { return; }
    var r = b.getBoundingClientRect();
    var g = Math.max(r.left, rt.left), d = Math.min(r.right, rt.right), hh = Math.max(r.top, rt.top), bb = Math.min(r.bottom, rt.bottom);
    for (var e = b.parentElement; e && e !== tel; e = e.parentElement) {
      var ov = getComputedStyle(e).overflowY;
      if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') { var rc = e.getBoundingClientRect(); hh = Math.max(hh, rc.top); bb = Math.min(bb, rc.bottom); g = Math.max(g, rc.left); d = Math.min(d, rc.right); }
    }
    // une feuille ouverte (2.2, « Relire ») couvre le bas de l'écran : ce qui est dessous ne se touche pas
    var feuille = document.querySelector('.telephone .feuille');
    if (feuille && !feuille.contains(b)) { bb = Math.min(bb, feuille.getBoundingClientRect().top); }
    if (d - g > 0 && bb - hh > 0 && getComputedStyle(b).visibility !== 'hidden') { telCibles.push({ x: g, y: hh, l: d - g, h: bb - hh }); }
  });
  // boîte d'encre d'un texte d'une seule ligne (dessin des lettres, pas la boîte de la ligne), d'après la police calculée
  var toile = document.createElement('canvas').getContext('2d');
  function encre(el) {
    var n = el.firstChild;
    while (n && n.nodeType !== 3) { n = n.nextSibling; }
    if (!n) { return null; }
    var cs = getComputedStyle(el);
    toile.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    var t = toile.measureText(n.data.trim());
    var r = document.createRange(); r.selectNodeContents(n);
    var rr = r.getBoundingClientRect();
    var base = rr.top + t.fontBoundingBoxAscent;
    return { x: rr.left - t.actualBoundingBoxLeft, d: rr.left + t.actualBoundingBoxRight, y: base - t.actualBoundingBoxAscent, b: base + t.actualBoundingBoxDescent, base: base };
  }
  function rect(r) { return { x: r.left, y: r.top, l: r.width, h: r.height, b: r.bottom, d: r.right }; }
  // révélations (§8.1) : croix, rangée de points, double filet
  var revelation = null;
  var croix = document.querySelector('.telephone .tel-ecran > .croix');
  var ecr = croix && croix.parentElement;
  var points = ecr && ecr.querySelector('.corps > .dots');
  if (croix && points && croix.getClientRects().length) { // téléphone affiché (pas sous une page du cadre)
    var re = ecr.getBoundingClientRect();
    var corps = ecr.querySelector('.corps');
    var ronds = points.querySelectorAll('i');
    var u = null;
    Array.prototype.forEach.call(ronds, function (i) {
      var r = i.getBoundingClientRect();
      u = u ? { x: Math.min(u.x, r.left), y: Math.min(u.y, r.top), d: Math.max(u.d, r.right), b: Math.max(u.b, r.bottom) } : { x: r.left, y: r.top, d: r.right, b: r.bottom };
    });
    var bandeau = corps.querySelector(':scope > .band');
    var filet = null;
    if (bandeau) { var rb = bandeau.getBoundingClientRect(); filet = { x: rb.left, d: rb.right, y: rb.top, b: rb.top + parseFloat(getComputedStyle(bandeau).borderTopWidth) }; }
    var suivant = points.nextElementSibling;
    // lignes de texte du contenu qui passeraient sous le dessin de la croix
    var dessin = encre(croix);
    var sous = [];
    var parcours = document.createTreeWalker(corps, NodeFilter.SHOW_TEXT);
    for (var nt = parcours.nextNode(); nt; nt = parcours.nextNode()) {
      if (!nt.data.trim()) { continue; }
      var pe = nt.parentElement;
      if (getComputedStyle(pe).visibility === 'hidden') { continue; } // place réservée, invisible (carte fermée)
      var rg = document.createRange(); rg.selectNodeContents(nt);
      Array.prototype.forEach.call(rg.getClientRects(), function (l) {
        if (dessin && l.right > dessin.x && l.left < dessin.d && l.bottom > dessin.y && l.top < dessin.b) { sous.push(nt.data.trim().slice(0, 40)); }
      });
    }
    revelation = {
      ecran: { x: re.left + ecr.clientLeft, y: re.top + ecr.clientTop, d: re.left + ecr.clientLeft + ecr.clientWidth },
      croix: rect(croix.getBoundingClientRect()), dessin: dessin, points: u, filet: filet,
      suivant: suivant ? rect(suivant.getBoundingClientRect()) : null, defile: corps.scrollTop, sous: sous
    };
  }
  // sous-onglets de Moi : ligne de base de chacun
  var sousOnglets = [];
  document.querySelectorAll('.telephone .subtabs > *').forEach(function (o) {
    var en = encre(o);
    if (en) { sousOnglets.push({ texte: o.textContent, base: en.base }); }
  });
  // rangées d'action de la bande : place de chaque bouton, dans l'ordre du texte
  var actions = [];
  document.querySelectorAll('.bande .actions').forEach(function (a) {
    var cs = getComputedStyle(a);
    var boutons = [];
    Array.prototype.forEach.call(a.children, function (b) {
      var r = b.getBoundingClientRect();
      var bs = getComputedStyle(b);
      var rg = document.createRange(); rg.selectNodeContents(b);
      var lignes = [];
      Array.prototype.forEach.call(rg.getClientRects(), function (l) { if (l.width && !lignes.some(function (y) { return Math.abs(y - l.top) < 2; })) { lignes.push(l.top); } });
      var texte = rg.getBoundingClientRect().width;
      boutons.push({ texte: b.textContent, x: r.left, y: r.top, l: r.width, h: r.height, lignes: lignes.length,
        naturelle: texte + parseFloat(bs.paddingLeft) + parseFloat(bs.paddingRight) + parseFloat(bs.borderLeftWidth) + parseFloat(bs.borderRightWidth) });
    });
    actions.push({ x: a.getBoundingClientRect().left, largeur: a.clientWidth, ecart: parseFloat(cs.columnGap) || 0, boutons: boutons });
  });
  // textes qui débordent de leur boîte (contrôle 14 h) : chaque ligne de texte doit tenir dans chaque boîte qui la contient,
  // jusqu'à la zone qui défile ; dans le téléphone, aussi dans la boîte de contenu de .corps, .bas ou .feuille (marges de 14 px).
  // En hauteur, la tolérance est la demi-différence entre la hauteur des caractères de la police et la hauteur de ligne
  // (une hauteur de ligne serrée, voulue, laisse dépasser les jambages de la police sans que rien ne déborde).
  var debords = [];
  function noter(texte, ou) { if (debords.length < 12) { debords.push({ texte: texte.slice(0, 40), ou: ou }); } }
  [document.getElementById('app'), document.getElementById('vue-seule'), document.querySelector('.vue-couchee')].forEach(function (racine) {
    if (!racine || !racine.getClientRects().length || getComputedStyle(racine).display === 'none') { return; }
    var parcours = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
    for (var nt = parcours.nextNode(); nt; nt = parcours.nextNode()) {
      var texte = nt.data.trim();
      if (!texte) { continue; }
      var pe = nt.parentElement;
      var cs0 = getComputedStyle(pe);
      if (cs0.visibility === 'hidden' || !pe.getClientRects().length) { continue; }
      var rg = document.createRange(); rg.selectNodeContents(nt);
      var lignesTexte = Array.prototype.filter.call(rg.getClientRects(), function (x) { return x.width > 0 && x.height > 0; });
      if (!lignesTexte.length) { continue; }
      var hl = parseFloat(cs0.lineHeight);
      var tolH = function (x) { return 0.5 + (isNaN(hl) ? 0 : Math.max(0, (x.height - hl) / 2)); };
      var zone = pe.closest('.tel-ecran .corps, .tel-ecran .bas, .tel-ecran .feuille');
      if (zone) {
        var rz = zone.getBoundingClientRect(), cz = getComputedStyle(zone);
        var g = rz.left + zone.clientLeft + parseFloat(cz.paddingLeft), d = rz.left + zone.clientLeft + zone.clientWidth - parseFloat(cz.paddingRight);
        if (lignesTexte.some(function (x) { return x.left < g - 0.5 || x.right > d + 0.5; })) { noter(texte, 'marge de 14 px de l’écran du jeu'); continue; }
      }
      for (var an = pe; an && an !== racine.parentElement; an = an.parentElement) {
        var cs = getComputedStyle(an);
        if (cs.display === 'inline' || cs.display === 'contents') { continue; }
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { break; } // zone qui défile ou qui rogne : son contenu peut la dépasser
        var b = an.getBoundingClientRect();
        var hors = lignesTexte.some(function (x) { return x.left < b.left - 0.5 || x.right > b.right + 0.5 || x.top < b.top - tolH(x) || x.bottom > b.bottom + tolH(x); });
        if (hors) { noter(texte, (an.className && typeof an.className === 'string' ? '.' + an.className.trim().split(/\s+/).join('.') : an.tagName.toLowerCase())); break; }
      }
    }
  });
  // lignes de liste (contrôle 14 h) : hauteur de leur contenu, 7 px au-dessus et au-dessous, 44 px au moins si elles se touchent
  var lignesListe = [];
  document.querySelectorAll('.listrow').forEach(function (l) {
    if (!l.getClientRects().length || !l.children.length) { return; }
    var r = l.getBoundingClientRect(), cs = getComputedStyle(l);
    var u = null;
    Array.prototype.forEach.call(l.children, function (c) {
      var rc = c.getBoundingClientRect();
      u = u ? { y: Math.min(u.y, rc.top), b: Math.max(u.b, rc.bottom) } : { y: rc.top, b: rc.bottom };
    });
    lignesListe.push({ texte: l.textContent.slice(0, 40), touchable: l.tagName === 'BUTTON', h: r.height,
      dessus: u.y - r.top - parseFloat(cs.borderTopWidth), dessous: r.bottom - parseFloat(cs.borderBottomWidth) - u.b, deborde: l.scrollHeight > l.clientHeight + 1 });
  });
  // ce que porte la bande : note, confirmation de « Jour suivant », nombre de boutons (couverture du contrôle 14 h)
  var bandeContenu = { note: !!document.querySelector('.bande .note:not(.confirmation)'), confirmation: !!document.querySelector('.bande .note.confirmation'),
    boutons: document.querySelectorAll('.bande button').length };
  return {
    revelation: revelation, sousOnglets: sousOnglets, actions: actions, bandeContenu: bandeContenu, debords: debords, lignesListe: lignesListe,
    fenetre: { l: window.innerWidth, h: window.innerHeight },
    defilement: { hauteur: doc.scrollHeight, visible: doc.clientHeight, largeur: doc.scrollWidth, visibleL: doc.clientWidth, haut: doc.scrollTop },
    barre: boite('.barre'), bande: boite('.bande'), milieu: boite('.milieu'), telephone: boite('.telephone'),
    ecran: boite('.telephone .tel-ecran'), cadre: boite('.cadre-milieu'), couchee: boite('.vue-couchee'), app: boite('#app'),
    planche: !!(window.matchMedia && window.matchMedia('(min-width: 600px) and (min-height: 900px)').matches),
    cibles: cibles, telCibles: telCibles
  };
}

module.exports = { releverEcran, mesurerDisposition };
