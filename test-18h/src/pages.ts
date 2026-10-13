// JETABLE (test du message de 18h) : les pages rendues par le serveur (résultats du porteur, erreurs de connexion).
// Mots relus par UX le 12 octobre 2026. Le porteur est vouvoyé sur ses pages ; la page des téléphones tutoie.
// Aucune page ne montre une adresse e-mail, un abonnement ni une empreinte (P-42).

import type { Config } from './config.ts';
import type { Depot } from './depot.ts';
import { heureParis, partiesParis } from './horloge.ts';
import { classer, heurePrevue, libelleReponse } from './mesure.ts';
import { titreDuSoir } from './planificateur.ts';

const JOUR_EN_LETTRES = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long' });

export function echapper(t: string): string {
  return t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

function gabarit(titre: string, corps: string, script = false): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${echapper(titre)}</title>
<link rel="stylesheet" href="/style.css">
${script ? '<script src="/resultats.js" defer></script>' : ''}
</head>
<body class="porteur">
<main>
${corps}
</main>
</body>
</html>
`;
}

export function pageEntree(message: string | null): string {
  return gabarit('Résultats du test', `
<h1>Résultats du test</h1>
${message ? `<p class="alerte">${echapper(message)}</p>` : ''}
<form method="post" action="/resultats/entree">
  <label for="code">Votre code d’accès</label>
  <input id="code" name="code" type="password" autocomplete="current-password" required>
  <button type="submit">Entrer</button>
</form>`);
}

export function pageMessage(titre: string, message: string, retour: string): string {
  return gabarit(titre, `
<h1>${echapper(titre)}</h1>
<p>${echapper(message)}</p>
<p><a class="bouton" href="${echapper(retour)}">Retour</a></p>`);
}

/** Une ligne prête à copier pour l'équipe : sans nom, sans adresse ; le « vu » se remplit depuis les SMS. */
export function ligneTexte(parts: string[]): string {
  return parts.join(' · ');
}

export async function pageResultats(config: Config, depot: Depot, maintenant: Date, message: string | null): Promise<string> {
  const { telephones, envois, comptes } = await depot.lireTout();
  const etiquette = (n: number) => {
    const t = telephones.find((x) => x.numero === n);
    return ligneTexte([`T${n}`, 'iPhone', t?.systeme ?? 'iOS ?']);
  };

  const lignesTableau: string[] = [];
  const lignesCopie: string[] = [];
  for (const e of envois) {
    const { resultat, ecart } = classer(e, maintenant);
    const quoi = e.nature === 'soir'
      ? `soir ${e.soir ?? '?'} (${e.soir_date ?? ''})${e.forme === 'declarative' ? ', seconde forme' : ''}`
      : 'message d’essai';
    const prevue = heureParis(heurePrevue(e));
    const envoye = heureParis(e.envoye_a);
    const reponse = libelleReponse(e.reponse_code, e.reponse_motif);
    const recu = e.recu_a ? heureParis(e.recu_a) : '—';
    const ecartTexte = ecart === null ? '—' : `${ecart} s`;
    lignesTableau.push(`<tr><td>${echapper(etiquette(e.telephone))}</td><td>${echapper(quoi)}</td><td>${prevue}</td>`
      + `<td>${envoye}</td><td>${echapper(reponse)}</td><td>${recu}</td><td>${ecartTexte}</td><td>${echapper(resultat)}</td></tr>`);
    if (e.nature === 'soir') {
      lignesCopie.push(ligneTexte([
        etiquette(e.telephone), `soir ${e.soir ?? '?'}${e.forme === 'declarative' ? ' (seconde forme)' : ''}`,
        `envoyé ${envoye}`, reponse, `reçu ${recu}`, `écart ${ecartTexte}`, resultat, 'vu : ___',
      ]));
    }
  }

  const lignesTelephones = [1, 2, 3, 4, 5].map((n) => {
    const t = telephones.find((x) => x.numero === n);
    const etat = !t ? 'pas encore inscrit' : t.abonne ? 'abonné (Apple)' : 'abonnement perdu : à noter, ne rien refaire avant le bilan';
    return `<tr><td>T${n}</td><td>${echapper(etat)}</td>
<td><form method="post" action="/resultats/systeme" class="ligne"><input type="hidden" name="telephone" value="${n}">
<input name="systeme" value="${echapper(t?.systeme ?? '')}" placeholder="iOS 18.5" pattern="iOS [0-9]{1,2}(\\.[0-9]{1,2}){0,2}" aria-label="Version d’iOS de T${n}">
<button type="submit">Noter</button></form></td>
<td><form method="post" action="/resultats/essai"><input type="hidden" name="telephone" value="${n}"><button type="submit"${t?.abonne ? '' : ' disabled'}>Message d’essai</button></form></td>
<td><form method="post" action="/resultats/effacer-ligne" data-confirmer="Effacer tout ce qui concerne T${n} ? C’est définitif."><input type="hidden" name="telephone" value="${n}"><button type="submit" class="danger"${t ? '' : ' disabled'}>Effacer sa ligne</button></form></td></tr>`;
  });

  const lignesComptes = comptes.map((c) => `<tr><td>compte ${c.numero}</td><td>${c.fournisseur === 'apple' ? 'Apple' : 'Google'}</td>
<td>adresse e-mail reçue : ${c.email_recu ? 'oui' : 'non'} (jamais gardée)</td>
<td><form method="post" action="/resultats/effacer-compte" data-confirmer="Effacer le compte ${c.numero} ?"><input type="hidden" name="numero" value="${c.numero}"><button type="submit" class="danger">Effacer</button></form></td></tr>`);

  const aujourdHui = partiesParis(maintenant).dateISO;
  const calendrier = (config.soirs ?? []).map((s) => {
    const qui = s.telephones.length === 5 ? 'tous les téléphones' : s.telephones.map((n) => `T${n}`).join(', ');
    const marque = s.dateISO === aujourdHui ? ' (aujourd’hui)' : '';
    return `<li>${s.dateISO}${marque} : « ${echapper(titreDuSoir(s.numero))} » à 18h00, ${echapper(qui)}${s.numero === 3 ? ' ; seconde forme à 18h10 sur T1' : ''}</li>`;
  });

  const reglages = config.manquants.length === 0
    ? '<p>Tous les réglages sont en place.</p>'
    : `<p class="alerte">Réglages absents ou illisibles chez Scalingo : ${config.manquants.map(echapper).join(', ')}.</p>`;

  return gabarit('Résultats du test', `
<h1>Résultats du test</h1>
${message ? `<p class="info">${echapper(message)}</p>` : ''}
<p>Heure de Paris : ${heureParis(maintenant)}, le ${JOUR_EN_LETTRES.format(maintenant)}. L’écart se compte depuis 18h00 (18h10 pour la seconde forme).</p>

<h2>Mesures</h2>
<div class="defile"><table>
<thead><tr><th>Téléphone</th><th>Quoi</th><th>Prévu</th><th>Envoyé</th><th>Réponse du service</th><th>Reçu</th><th>Écart</th><th>Résultat</th></tr></thead>
<tbody>${lignesTableau.join('\n') || '<tr><td colspan="8">Aucun envoi pour l’instant.</td></tr>'}</tbody>
</table></div>

<h2>À copier pour l’équipe</h2>
<p>Sans nom ni adresse. Après les avoir collées, remplacez « ___ » selon le SMS du soir : « vu à 18h03 » donne « à l’heure », « vu à 18h20 » donne « plus tard », « rien vu » reste « rien vu ». Pour « éteint », effacez « ___ » sans rien écrire.</p>
<textarea id="copie" readonly rows="8">${echapper(lignesCopie.join('\n'))}</textarea>
<p><button type="button" id="copier">Copier</button></p>

<h2>Téléphones</h2>
<div class="defile"><table>
<thead><tr><th>N°</th><th>État</th><th>Version d’iOS</th><th></th><th></th></tr></thead>
<tbody>${lignesTelephones.join('\n')}</tbody>
</table></div>
<form method="post" action="/resultats/essai"><input type="hidden" name="telephone" value="tous"><button type="submit">Message d’essai à tous les téléphones abonnés</button></form>

<h2>Connexions</h2>
<p>Le compte Google de test doit garder un seul numéro, sur tous les téléphones. Un second numéro « Google » signale un échec. Le numéro « Apple » de votre iPhone est normal.</p>
<div class="defile"><table><tbody>${lignesComptes.join('\n') || '<tr><td>Aucune connexion pour l’instant.</td></tr>'}</tbody></table></div>

<h2>Calendrier des envois (réglage SOIRS)</h2>
<ul>${calendrier.join('\n') || '<li>Aucun soir réglé : rien ne partira à 18h.</li>'}</ul>

<h2>Réglages</h2>
${reglages}

<h2>Tout effacer</h2>
<p>Le lendemain du dernier soir, après avoir copié les lignes ci-dessus. Le bouton vide la base, puis vérifie qu’elle est vide.</p>
<form method="post" action="/resultats/tout-effacer">
  <label for="confirmation">Tapez EFFACER pour confirmer</label>
  <input id="confirmation" name="confirmation" autocomplete="off" required>
  <button type="submit" class="danger">Tout effacer</button>
</form>

<form method="post" action="/resultats/sortie"><button type="submit">Sortir</button></form>
`, true);
}
