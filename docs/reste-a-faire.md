# Ce qu'il reste à faire, jusqu'à l'ouverture

*À jour au 12 octobre 2026. Ce document ne décide rien : il rassemble ce que disent `docs/plan-construction.md` (« le plan »), `docs/decisions.md` (jusqu'à D-055) et les documents cités. Les montants sont des estimations de l'équipe, pas des devis ; les durées sont à faible confiance.*

## 1. En une phrase

**On est au début de la construction (étape 6 sur 7) : les trois travaux sur papier sont faits, et le premier morceau de code, le test du message de 18h, est écrit et relu ; il n'attend plus que vos démarches.**

« En ligne » veut dire deux choses, dans cet ordre :
- **d'abord un lien**, pour les premiers cercles de la bêta : on joue sur iPhone, depuis une icône posée sur l'écran d'accueil, sans rien installer (D-005, repris par D-043) ;
- **puis l'application sur l'App Store**, avant l'ouverture au public (D-043 ; l'App Store seul, sans Google Play, D-054).

## 2. Le chemin, en un tableau

Pour les travaux 5 à 13, le plan ne donne qu'une durée d'ensemble (partie 6) : **3 à 6 mois du début de l'étape 6 à l'entrée en bêta**, App Store exclu.

| N° | Ce que c'est | Ce qui le déclenche ou le bloque | Ce que vous faites | Durée | État |
|---|---|---|---|---|---|
| 1 à 3 | Les règles chiffrées, les quatre tensions jamais essayées, les exigences de protection des données, sur papier | — | — | — | **Fait** (D-052, D-053) |
| 4 | **Test du message de 18h** : une page nue sur cinq iPhone, trois soirs de suite ; on vérifie aussi la connexion Apple ou Google depuis l'icône | Code et pas-à-pas écrits et relus ; attend vos démarches et quatre proches qui prêtent leur iPhone (D-054) | Environ 4 h 30 en tout : trouver les prêteurs, ouvrir Scalingo, régler Google et Apple, donner votre feu vert écrit la veille, installer, deux minutes chaque soir, tout effacer (test-18h, partie 3) | 8 à 10 jours à partir du jour où vous commencez, au plus tôt le 13 octobre (test-18h, partie 7) | **En cours** |
| 5 | **Le serveur et la base de données** chez Scalingo, sauvegardes chiffrées, cercles cloisonnés par la base elle-même | Après le test. L'essai gratuit de Scalingo finit au 30e jour : la suite vous est présentée une semaine avant (D-055) | Comptes à votre nom : hébergeur, e-mails (Scaleway), domaine (plan, travail 5) ; réussir seul un retour à la version précédente et une restauration (plateforme, partie 1) | Comprise dans les 3 à 6 mois | À venir |
| 6 | **L'horloge du jeu** : 18h, dimanche, pause, remise à zéro du lundi, changements d'heure, compteur des 12 mois | Exigence « rien ne se calcule à 18h pile » (D-043) | Rien, sauf si les titres du dimanche ne peuvent pas être calculés d'avance (plan, travail 6) | Idem | À venir |
| 7 | **Les écrans** : les 51 écrans validés, plus ceux jamais dessinés (Réglages, code reçu par e-mail, quitter un cercle, « Qui, durée, droits », mention IA, page « iPhone seulement » pour un Android, page pour un ordinateur ou un iPad) | Maquettes finales (D-014) | Valider les nouveaux écrans ; jouer sur un lien d'aperçu (une version privée d'essai) ; vérifier sur votre iPhone le petit écran, le très grand texte et la lecture à voix haute (VoiceOver) (plan, partie 7) | Idem | À venir |
| 8 | **Le moteur de calcul** : points, titres, badges, portrait, phrases | — | Jouer une semaine en une heure, avec une horloge accélérée | Idem | À venir |
| 9 | **Comptes, invitation, messages de 18h** : Apple, Google ou e-mail avec code (D-035) | Connexion écrite par l'équipe, prestataires européens : quelques jours de plus (Back-end) | Jouer l'entrée d'un invité, du lien au compte, en moins de trois minutes | Idem | À venir |
| 10 | **La chaîne des textes** : relevé quotidien de l'Assemblée, rédaction et vérification par IA, registre public, procédure de correction ; puis une marche à blanc qui prépare d'avance 56 à 84 textes | L'égalité entre groupes (D-044) doit tenir sur les vrais votes | Valider la page « Méthode » | Idem | À venir |
| 11 | **Le juridique** : carte des données, analyse d'impact (l'étude des risques que la loi impose), consentement, conditions d'utilisation, contrats, procédures (effacement, fuite, correction) ; **première relecture de l'avocat** | Bloque la bêta (D-044). Devis présenté avant (D-042) | Choisir l'avocat sur devis ; signer l'analyse d'impact | Relecture rendue dans le mois qui suit la remise (hypothèse du plan) | À venir |
| 12 | **Surveillance** : alerte à 18h02 si les messages ne sont pas partis, relance d'un geste ; procédure d'incident d'une page | — | Ouvrir le compte de la sonde, chez un second prestataire (proposé) ; recevoir une alerte d'essai ; jouer la procédure une fois à blanc | Idem | À venir |
| 13 | **Vérification finale** : chaque phrase affichée, chaque ligne rouge écran par écran, l'accessibilité, la mention IA | — | Jouer une journée | Idem | À venir |
| 14 | **L'App Store** : fiches de confidentialité, suppression du compte dans l'application, marge pour un refus | La question de la structure, d'abord (D-042, D-043). Numéroté 14, mais placé avant l'ouverture, hors des 3 à 6 mois ; calendrier exact à fixer (proposé) | Trancher la structure | Non estimable (plan, partie 6) | À venir |
| Bêta | 8 à 12 cercles réels, 40 à 80 personnes, tous sur iPhone | Bloquée tant que manque un point de la liste « Avant la bêta » (plan, partie 5) : construction finie, textes d'avance, avocat, analyse d'impact, procédure d'incident jouée, nom vérifié, adresse et icône définitives | Recruter 4 à 6 créateurs, qui invitent leurs proches ; tenir la permanence chaque soir, dimanche compris ; donner aux agents les rapports de totaux (D-052) | 8 semaines au moins, 12 de préférence | À venir |
| Mi-bêta | Un seul lot de réglages, appuyé sur trois comptes (D-052) | Les réglages actuels reposent sur des joueurs simulés | Valider le lot | — | À venir |
| Préparation de l'ouverture | Audit de sécurité extérieur, test de charge de 18h, seconde relecture de l'avocat, analyse d'impact finale, délégué à la protection des données nommé, marque déposée, contribution libre, App Store, les huit tensions en circulation, registre public en ligne (plan, partie 5) | Tout ce bloc est bloquant | Voir la partie 3 | Non estimable (plan, partie 6) | À venir |
| Ouverture | Le jeu ouvert au public | Le bloc précédent terminé | Choisir la date (feuille de route, étape 7) | — | À venir |

Écart : le plan dit encore du travail 4 « préparé et validé » ; depuis, le code (dossier `test-18h/`) et vos pas-à-pas (`docs/etape-6/test-18h-pas-a-pas.md`) ont été écrits et relus.

## 3. Ce que vous faites, vous, dans l'ordre

**Maintenant, en parallèle**
1. **La vérification du nom par un conseil en propriété industrielle.** Elle conditionne l'adresse et l'icône définitives, figées avant la bêta (D-043, D-047). Elle est « en cours » (D-050) ; aucun résultat n'est encore consigné.
2. **Le devis de l'avocat** spécialisé en données personnelles (D-044). Vous considérez ce point comme réglé de votre côté (D-047), mais aucun nom ni devis n'est encore consigné.

**Le test du message de 18h** (au plus tôt du 13 au 21 octobre, test-18h, partie 7)
3. Trouver quatre proches majeurs qui gardent leur iPhone, et leur remettre la note d'une page.
4. Ouvrir Scalingo avec votre carte et **noter la date de fin d'essai** (D-055 ; le plan, `plateforme.md` et `test-18h.md` parlent encore de « la question de la carte », tranchée) ; régler Google et Apple (environ 2 h). Vous ne nous confiez jamais un mot de passe (D-048).
5. Donner votre feu vert écrit la veille de la mise en ligne. Cette règle vaut pour **chaque** mise en ligne (D-054), jamais de 15h à 19h ni le dimanche (D-043).
6. Installer les téléphones, regarder les résultats deux minutes par soir, tout effacer le lendemain du troisième soir ; effacer votre tableau le 20 novembre 2026.
7. Répondre si Apple ou Google refuse l'adresse de test (domaine d'environ 10 €, D-054) ou si la connexion échoue depuis l'icône (D-035).

**Pendant la construction**
8. Une semaine avant la fin de l'essai Scalingo : continuer ou tout supprimer (D-055).
9. Ouvrir à votre nom les comptes d'e-mails et de la sonde (plateforme, partie 1) ; acheter deux ou trois adresses web une fois le nom vérifié (plan, partie 6).
10. Valider chaque livrable en quelques jours, et ouvrir régulièrement des sessions d'agents, sans quoi rien n'avance (plan, partie 6).
11. Jouer à chaque travail : écrans (7), semaine accélérée (8), entrée d'un invité (9), page « Méthode » (10), journée complète (13).
12. Choisir l'avocat sur devis, signer l'analyse d'impact (11) ; jouer à blanc la procédure d'incident et une alerte (12).

**Pendant la bêta**
13. Recruter 4 à 6 créateurs, qui savent d'avance qu'un proche sur Android ne pourra pas jouer.
14. Être le seul recours humain chaque soir, dimanche compris : l'alerte de 18h02 arrive chez vous (D-043).
15. Produire les rapports de totaux que lisent les agents (D-052) ; valider le lot de réglages de mi-bêta.

**Avant l'ouverture**
16. Déposer la marque, française puis européenne dans les six mois (D-043 ; plan, partie 6).
17. Trancher la structure, puis l'App Store (D-042, D-043) ; nommer un délégué à la protection des données, qui ne peut pas être vous (D-044) ; faire faire la seconde relecture de l'avocat et l'audit de sécurité.
18. Choisir la date d'ouverture.

## 4. Les décisions qui vous reviendront encore

| Décision | Moment | D'où elle vient |
|---|---|---|
| Un domaine, si Apple ou Google refuse l'adresse de test | Pendant le test | D-054, point 2 |
| La connexion Apple ou Google, si elle échoue depuis l'icône | Après le test | D-035 ; test-18h, partie 1 |
| La suite de Scalingo : continuer ou tout supprimer | Une semaine avant la fin de l'essai | D-055 |
| Chaque dépense, avec son montant | À chaque fois | D-042 |
| Les nouveaux écrans, dont l'ordinateur et l'iPad (proposé : un code à viser pour continuer sur l'iPhone ; l'iPad non admis) | Travail 7 | D-054 ; produit, « Ce que ces décisions laissent à régler » |
| L'égalité entre groupes, si elle ne tient pas sur les vrais votes (de même si une tension manque de textes dans un sens) | Travail 10 | D-044 ; `docs/etape-6/tensions.md` |
| Les titres du dimanche, seulement s'ils ne peuvent pas être calculés d'avance | Travail 6 | Plan, travail 6 (proposé) |
| Le nom définitif, si le conseil écarte Elenchos (logo, texte du nom et adresse à refaire) | Avant la bêta | D-047 |
| Des repères chiffrés pour juger la bêta, proposés en QCM | Avant la bêta | Plan, partie 5 (esprit de D-008) |
| Le lot de réglages de mi-bêta | Mi-bêta | D-052 |
| Les critères de passage à l'App Store (lecture de l'équipe, à confirmer) | Non fixé | D-054 ; produit, « Ce que ces décisions laissent à régler » |
| La structure : rester en nom propre ou créer une société ou une association | Avant le chantier de l'App Store | D-042, D-043 |
| La forme de la contribution libre et le moment où elle se propose | Avant l'ouverture | D-042, point 3 |
| Peut-être, après la bêta : l'âge de 15 ans sur simple déclaration, le cercle à trois, le seuil des curseurs nets, Le Sans-Faute, « Tout effacer » | Après la bêta | Plan, partie 7 |
| Le nouveau venu, si sa justesse reste au niveau du hasard | Après les mesures de la bêta | D-023 |

Les voix sous le vote (E4), seul point de règle encore ouvert, sont confiées à UX et Contenu, pas à vous (`docs/etape-6/regles.md`, D-052).

## 5. L'argent

**Jusqu'à la fin de la bêta : environ 2 900 à 8 900 €** (plan, partie 6).

| Dépense | Quand | Montant |
|---|---|---|
| Conseil en propriété industrielle (recherche du nom) | Maintenant | 300 à 800 € |
| Logo | Fait (D-050) | 0 € |
| Compte développeur Apple | Déjà ouvert (D-047) | 99 € par an |
| Test du message de 18h | Octobre | 0 € si l'essai Scalingo est supprimé avant le 30e jour (D-055) ; environ 10 € si un domaine de test est nécessaire |
| Hébergement, e-mails, sonde, sur six mois | Dès le test, premier mois gratuit | 200 à 600 € (environ 26 € par mois en construction, 41 à 76 € en bêta, plateforme, annexe B) |
| Deux ou trois adresses web | Après la vérification du nom | 50 à 150 € par an |
| Chaîne des textes (environ 150 textes) | Travail 10, puis la bêta | 300 à 2 300 € |
| Avocat, première relecture | Avant la bêta | 2 000 à 5 000 € |

**Pour l'ouverture : environ 8 400 à 21 500 € de plus** (plan, partie 6).

| Dépense | Montant |
|---|---|
| Audit de sécurité | 3 000 à 10 000 € |
| Avocat, seconde relecture | 2 000 à 5 000 € |
| Délégué à la protection des données | 2 000 à 5 000 € par an |
| Marque française, puis européenne | 270 €, puis 1 050 € |
| Test de charge du pic de 18h | Quelques dizaines d'euros |

**Total jusqu'à l'ouverture : environ 11 300 à 30 400 €** (somme des deux totaux du plan, faite pour ce document).

Si vous créez une structure : environ 200 à 250 € pour la créer, puis 600 à 1 500 € de comptabilité par an (plan, partie 6).

**Ensuite, chaque mois** (plan, partie 6) :

| Poste | Montant |
|---|---|
| Chaîne des textes | 100 à 700 € |
| Hébergement, e-mails, sonde | 60 à 190 € pour 1 000 joueurs ; 150 à 400 € pour 10 000 (`plateforme.md`, annexe B, dit 150 à 300 €) |
| Délégué | 2 000 à 5 000 € par an, soit environ 170 à 420 € par mois |
| Compte Apple et adresses web | Environ 150 à 250 € par an, soit 12 à 21 € par mois |
| **Total pour 1 000 joueurs** | **environ 340 à 1 330 € par mois** (somme faite pour ce document) |

**Ce qui n'est compté nulle part :**
- votre abonnement Claude, qui paie la construction et l'entretien (deux à quatre jours d'agents par mois, Back-end) ;
- votre temps ;
- la location d'un Mac en ligne, nécessaire pour fabriquer l'application de l'App Store (plateforme, annexe A), non chiffrée ;
- l'hébergement au-delà de six mois, quelques dizaines d'euros par mois (plan, partie 6), et la chaîne des textes après la bêta ;
- la commission d'Apple sur la contribution libre payée dans l'application, de l'ordre de 15 % (de mémoire) ;
- un iPhone reconditionné, si un prêteur manque pour le test.

## 6. La durée

- **Le test du message de 18h** : 8 à 10 jours, soit au plus tôt du 13 au 21 octobre 2026 (test-18h, partie 7).
- **Jusqu'à l'entrée en bêta : 3 à 6 mois** depuis le 11 octobre, à faible confiance (plan, partie 6). Soit une entrée en bêta entre mi-janvier et mi-avril 2027 (calcul fait ici ; ni engagement ni date).
- **La bêta** : 8 à 12 semaines, donc une fin entre mi-mars et mi-juillet 2027 selon le même calcul.
- **De la fin de la bêta à l'ouverture : pas encore estimable.** Cela dépend de la structure, de la revue d'Apple et de l'audit (plan, partie 6). Avec une société, Apple demande un numéro d'entreprise (D-U-N-S) qui peut prendre jusqu'à 30 jours.

La borne basse suppose que tout réussit du premier coup. Ce qui fait glisser (plan, parties 6 et 7) :
- une consultation de la CNIL, si elle est nécessaire : 8 semaines au moins ;
- une question qui vous revient (connexion depuis l'icône, égalité entre groupes) ;
- un avocat qui fait refaire la carte de consentement ;
- une chaîne des textes qui échoue à son épreuve ;
- un conseil qui écarte le nom ;
- des validations lentes, ou des sessions d'agents trop rares.

L'équipe recalera la fourchette après le test de 18h ; ses estimations se sont déjà écartées du réel. La bêta pourrait tomber pendant la présidentielle d'avril-mai 2027 ; Juridique dira avant si cela change quelque chose (plan, partie 7).

## 7. Ce qui peut faire échouer ou dérailler

1. **Le plaisir de deviner n'est pas prouvé.** Deux essais avec des personnages simulés ont donné une justesse au niveau du hasard ; on construit avant de savoir si de vrais proches aiment se deviner (D-039). La bêta le dira, après des mois et des milliers d'euros.
2. **Le message de 18h sur iPhone.** Il n'arrive que si le joueur a posé l'icône sur son écran d'accueil (D-005). Le test couvre cinq téléphones et trois soirs, pas des inconnus non guidés ni des semaines sans ouvrir le jeu (test-18h, partie 8). Google depuis une icône d'iPhone est le risque le plus probable d'échec de la connexion.
3. **L'iPhone seulement, et les cercles à trois.** Deux téléphones sur trois en France sont des Android (D-054) ; or un cercle n'existe qu'à trois membres (D-006). Il faut donc trois proches sur iPhone. Les simulations disent déjà que le cercle de trois est fragile : il s'endort souvent (produit, « Ce que ces décisions laissent à régler »).
4. **La chaîne des textes.** Aux deux essais, aucun lot n'est sorti de sa première vérification sans correction, et le taux d'erreur restant est inconnu (D-044). Une erreur peut viser un député nommé à 18h, sous votre responsabilité éditoriale, en nom propre. L'égalité entre groupes peut aussi ne pas tenir sur les vrais votes.
5. **Le juridique.** Sans relecture de l'avocat, pas de bêta (D-044). Il peut demander de refaire la carte de consentement, ou une consultation de la CNIL. En nom propre, vous répondez des données sur vos biens personnels (D-042).
6. **Apple.** En nom propre, l'App Store est probablement fermé à une application qui garde des opinions (règle 5.1.1 (ix), D-042). Créer une structure change le responsable des données : il faudrait probablement redemander leur accord aux joueurs (avocat, à confirmer). Et Apple peut refuser l'application.
