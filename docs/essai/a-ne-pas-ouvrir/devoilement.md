# Textes du dévoilement (à ne pas ouvrir avant la fin de l'essai)

*Textes d'UX, 5 octobre 2026, pour le §8.6 de `docs/essai/simulation.md`. Cadre de l'essai, en « vous » ; mise en page des pages du cadre (§8.1). Gabarits en typographie simple ; à l'affichage, règles 1 à 6 du §7.8, sauf l'empreinte, la graine et le fichier scellé. Sources : `profils.md` (profils, contraintes, corrigé de F1) ; fichier scellé (`personnages`, `reponses`, `reponses_atypiques`, `absences`) ; F1 du porteur ; cartes calculées de sa manche (`places`).*

## Place
Page du cadre « Le dévoilement » (c'est aussi son titre, affiché en tête, §8.1 ; recommandation d'UX du 6 octobre 2026), ouverte par « Voir le dévoilement » (§7.4, point 7 ; §8.10). Un seul défilement. Dans la bande : « Tout effacer » (§8.9), à bordure neutre. Rouverte, la page revient ici (§8.10). Pour le lecteur d'écran, chaque prénom est un titre de section.

## Panneaux, dans cet ordre

**1. Ouverture**
« Voici ce que la page vous cachait : le profil de chaque personnage, ses réponses données exprès contre ce profil et ses jours sans jouer. Tout en bas, « Pour le contrôle » : l'empreinte à comparer avec celle publiée dans la conversation. »
Si F1 a été rempli (`f1` non nul, cases vides comprises), dessous :
« Où vous placiez chacun : {x} cases justes sur 16. Au hasard, environ 5. »
{x} : cases dont le choix est égal au corrigé. Accords : « 0 case juste », « 1 case juste », « 2 cases justes ».

**2. Comment lire** (titre du panneau)
« Chaque personnage avait un profil fixé avant l'essai. Pour chaque tension, une place de 0 à 100 : 0 pour la première valeur (Sécurité), 100 pour la seconde (Liberté individuelle) ; de 41 à 59, au milieu. Et une fermeté : plus elle était forte, plus ses réponses s'éloignaient de Neutre, jusqu'à « Très ». »
« Les réponses de chacun découlaient de son profil, sauf {trois} par personnage, données exprès contre ce profil pour que rien ne se devine à coup sûr. Toutes ont été calculées par des règles fixes, écrites et scellées avant l'essai, sans rien savoir des vôtres. »
« « Jour 5 » : le texte auquel vous avez répondu le jour 5, deviné le jour 6, révélé le jour 7. Un jour sans jouer : ni réponse, ni devinette. »
{trois} vaut « deux », « trois » ou « quatre » : la longueur des tableaux `reponses_atypiques`, la même pour tous.

**3. Un panneau par personnage**, dans l'ordre Agathe, Nassim, Odile, Valentin
- Titre (600) : « {Prénom}, {âge} ans · {métier}, {ville} », comme la fiche du §1.
- Phrase fixe, tirée des « Contraintes » de `profils.md` :
  - Agathe : « Faite pour ressembler à Nassim, sauf entre local et national. »
  - Nassim : « Fait pour ressembler à Agathe, sauf entre local et national. »
  - Odile : « Tranchée : loin du milieu et fermeté forte, sur les quatre tensions. »
  - Valentin : « Des valeurs que sa vie ne laisse pas deviner. »
- Quatre lignes, dans l'ordre S, P, T, L :
  « {Pôle 0} ou {Pôle 1} : {lecture} ({p} sur 100, fermeté {fermeté}).[ Vous : {juste | choix}.] »
  - {lecture} : le corrigé de `profils.md`, soit « au milieu » si 41 ≤ p ≤ 59, sinon le pôle du côté de p.
  - {p} : `position` ; {fermeté} : « faible », « moyenne » ou « forte ».
  - Pôles écrits comme sur F1 : Sécurité, Liberté individuelle ; Précaution, Innovation ; Tradition, Changement ; Local, National.
  - « Vous : … » seulement si F1 a été rempli. « Vous : juste. » si le choix est égal à la lecture. Sinon « Vous : {Pôle 0 | au milieu | Pôle 1}. ». Pour une case vide : « Vous : pas de choix. »
- « Réponses contre son profil : » (600). Puis, pour chaque élément de `reponses_atypiques`, dans l'ordre des textes :
  « Jour {n} · {titre} »
  « {Position} · « {raison} » » ou « {Position} · aucune des quatre raisons » (forme de carte du §4.5, ponctuation de fin de ligne du §4.6)
  [« Son profil donnait Neutre. »][ « Vous l'aviez à deviner le jour {n+1}. »]
  Ces deux phrases vont sur une même ligne, chacune seulement s'il y a lieu :
  - la première si `cote_tire` n'est pas nul ;
  - la seconde si la réponse de ce personnage (auteur d'origine) figure dans `places` de la manche du porteur à la séance n+1, et si cette séance a été atteinte.
- « Jours sans jouer : {liste}. », avec la règle de liste du §8.12 (« 3 et 10 ») ; sinon « Jours sans jouer : aucun. »

**4. Pour le contrôle** : partie repliée du §8.6, inchangée.

**5. Fin**
« Les règles complètes, les profils et les textes sont dans le dossier « a-ne-pas-ouvrir » du dépôt : vous pouvez maintenant l'ouvrir. »
« Une fois votre carnet copié, vous pouvez tout effacer. » (§8.9)

## Règles
- Après un arrêt, tout est montré, textes jamais joués compris. Le compte de F1 et les « Vous : … » ne s'affichent que si F1 a été rempli (§8.10). « Vous l'aviez à deviner » ne s'affiche que pour une séance atteinte.
- « juste » est un mot, sans couleur, coche ni croix : dans le cadre, la coche marque déjà un choix retenu (§8.1). Aucun mot pour un écart : la ligne donne la lecture, puis votre choix.
- Rien de cette page n'entre dans le carnet.
- Contrôle 11 : ces chaînes sont comparées à ce fichier.

## Exemple (profil réel d'Agathe ; choix de F1, texte et ligne « Vous l'aviez à deviner » inventés)
Agathe, 46 ans · sage-femme, Rennes
Faite pour ressembler à Nassim, sauf entre local et national.
Sécurité ou Liberté individuelle : Liberté individuelle (65 sur 100, fermeté moyenne). Vous : juste.
Précaution ou Innovation : Innovation (68 sur 100, fermeté moyenne). Vous : au milieu.
Tradition ou Changement : au milieu (58 sur 100, fermeté faible). Vous : Changement.
Local ou National : Local (25 sur 100, fermeté moyenne). Vous : juste.
Réponses contre son profil :
Jour {n} · {titre}
Favorable · « {raison}. »
Son profil donnait Neutre. Vous l'aviez à deviner le jour {n+1}.
Jours sans jouer : aucun.
