// JETABLE (test du message de 18h) : le programme d'effacement de fin de test, en ligne de commande.
// Le porteur utilise d'ordinaire le bouton « Tout effacer » de la page de résultats ; ce programme fait la même chose
// depuis un conteneur ponctuel chez Scalingo (« scalingo --app … run npm run effacer -- --confirmer »).
// Il vide la base, puis vérifie qu'elle est vide, et n'écrit que des nombres de lignes.

import { creerPool, toutEffacer } from '../src/base.ts';

if (!process.argv.includes('--confirmer')) {
  process.stdout.write('Rien effacé. Pour confirmer : npm run effacer -- --confirmer\n');
  process.exit(1);
}
const url = process.env.SCALINGO_POSTGRESQL_URL ?? process.env.DATABASE_URL;
if (!url) {
  process.stdout.write('Rien effacé : SCALINGO_POSTGRESQL_URL manque.\n');
  process.exit(1);
}
const pool = creerPool(url);
try {
  const etat = await toutEffacer(pool);
  const lignes = Object.entries(etat.lignes).map(([t, n]) => `${t} : ${n}`).join(', ');
  process.stdout.write(`${etat.vide ? 'Base vide : vérifié.' : 'ATTENTION : la base n’est pas vide.'} Lignes restantes — ${lignes}.`
    + (etat.tablesHorsCarte.length ? ` Tables hors carte : ${etat.tablesHorsCarte.join(', ')}.` : '') + '\n');
  process.exitCode = etat.vide ? 0 : 1;
} finally {
  await pool.end();
}
