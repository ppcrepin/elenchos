// Le planificateur, sans base : le texte du message de 18h (E1, les six textes de `MESSAGES_18H`, celui de l'étape 1),
// son contenu (`MessageApns`), les créneaux (18h–18h30 pour le message, 4h–17h30 pour le ménage, changements d'heure
// compris), et « le soir même » de la révélation (proposé, à confirmer par Game design).

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MESSAGES_18H } from '../../src/contrat.ts';
import { instantParis } from '../../src/serveur/horloge.ts';
import { FIN_DU_SOIR_MEME_HEURE, ouverteLeSoirMeme } from '../../src/serveur/mesures.ts';
import {
  creneauDuMenage, creneauDuSoir, messageDu18h, rienNAttendEncore, texteDuMessage18h,
} from '../../src/serveur/planificateur.ts';

test('le texte du message de 18h : un des six, selon ce qui attend (E1) ; à l’étape 1, « La question d’aujourd’hui »', async () => {
  const vus = new Set<string>();
  for (const cartes of [true, false]) {
    for (const vote of [true, false]) {
      for (const titres of [true, false]) {
        const t = texteDuMessage18h({ avaitDesCartes: cartes, avaitReponduAuTexteRevele: vote, titresCeSoir: titres });
        assert.ok((MESSAGES_18H as readonly string[]).includes(t));
        assert.equal(t.includes('Qui avait dit quoi'), cartes);
        assert.equal(t.includes('Le vote'), !cartes && vote);
        assert.equal(t.endsWith('les titres de la semaine.'), titres);
        vus.add(t);
      }
    }
  }
  assert.equal(vus.size, 6);
  assert.equal(texteDuMessage18h(await rienNAttendEncore('8f3c0000-0000-4000-8000-000000000001', '2026-10-25')),
    '18h. La question d’aujourd’hui t’attend.');
});

test('le contenu du message : titre, texte, son, mutable-content, numéro d’envoi ; rien d’autre', () => {
  const m = messageDu18h(MESSAGES_18H[0], '8f3c0000-0000-4000-8000-000000000002');
  assert.deepEqual(m, {
    aps: { alert: { title: 'Elenchos', body: MESSAGES_18H[0] }, sound: 'default', 'mutable-content': 1 },
    envoi: '8f3c0000-0000-4000-8000-000000000002',
  });
});

test('le créneau du message : de 18h00 à 18h30 exclu, heure de Paris, été comme hiver', () => {
  for (const jour of ['2026-10-24', '2026-10-25', '2026-10-26', '2027-03-28']) {
    const h18 = instantParis(jour, 18, 0).getTime();
    assert.equal(creneauDuSoir(new Date(h18 - 1000)), null, jour);
    assert.equal(creneauDuSoir(new Date(h18)), jour);
    assert.equal(creneauDuSoir(new Date(h18 + 30_000)), jour);
    assert.equal(creneauDuSoir(new Date(h18 + 30 * 60_000 - 1)), jour);
    assert.equal(creneauDuSoir(new Date(h18 + 30 * 60_000)), null);
  }
});

test('le créneau du ménage : de 4h00 à 17h30 exclu, jamais de 17h30 à 18h30 (P-31)', () => {
  const jour = '2026-10-25'; // jour du passage à l'heure d'hiver
  assert.equal(creneauDuMenage(instantParis(jour, 3, 59)), null);
  assert.equal(creneauDuMenage(instantParis(jour, 4, 0)), jour);
  assert.equal(creneauDuMenage(instantParis(jour, 17, 29)), jour);
  for (const [h, mn] of [[17, 30], [18, 0], [18, 29], [23, 0], [0, 0]] as const) {
    assert.equal(creneauDuMenage(instantParis(jour, h, mn)), null, `${h}:${mn}`);
  }
});

test('« le soir même » : de 18h à minuit, heure de Paris, le jour de la révélation (proposé, à confirmer par Game design)', () => {
  assert.equal(FIN_DU_SOIR_MEME_HEURE, 24);
  const jour = '2026-10-24';
  assert.equal(ouverteLeSoirMeme(instantParis(jour, 17, 59), jour), false);
  assert.equal(ouverteLeSoirMeme(instantParis(jour, 18, 0), jour), true);
  assert.equal(ouverteLeSoirMeme(instantParis(jour, 23, 59), jour), true);
  assert.equal(ouverteLeSoirMeme(instantParis('2026-10-25', 0, 0), jour), false);
  // La nuit du changement d'heure (25 octobre 2026) ne change rien au soir du 24.
  assert.equal(ouverteLeSoirMeme(new Date(instantParis('2026-10-25', 0, 0).getTime() - 1), jour), true);
});
