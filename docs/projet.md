# Projet : « Tu crois connaître tes proches »

*Document de passation — état au 3 octobre 2026. À coller en début de nouvelle conversation.*

---

## 0. Comment travailler sur ce projet

- **Vision d'abord, détails ensuite.** Proposer une vision d'ensemble et un parcours utilisateur, puis ne faire trancher que les choix importants. Ne jamais poser une question de détail sans dire d'où elle vient et dans quoi elle s'insère.
- **Questions en QCM, avec l'option recommandée marquée** et une ligne de justification.
- **Rigueur maximale** : relire l'ensemble des décisions ci-dessous avant toute proposition ; signaler explicitement toute décision antérieure qu'une proposition modifie ; aucune contradiction.
- **Français clair et pédagogique**, exemples concrets plutôt que principes abstraits.
- Si ce niveau n'est pas atteignable sur un point, le dire franchement.

Méthode en 6 étapes validée : (1) promesse ✅ → (2) parcours utilisateur ✅ (en cours de reprise sur l'onboarding) → (3) écrans → (4) règles → (5) prototype manuel avec de vraies personnes → (6) construction (technique, marque, juridique, lancement).

---

## 1. La promesse

**Le jeu ne demande pas ce que tu penses. Il demande qui, dans ton cercle, a pensé ça.**

Chaque jour, un vrai texte examiné à l'Assemblée nationale, traduit en trois lignes, auteur masqué. Chacun donne son avis. Puis on devine les réponses de ses proches. Chaque jour à 18h, révélation commune : qui a pensé quoi, ce qu'a décidé l'Assemblée, qui avait déposé le texte.

La politique est le prétexte ; le sujet, ce sont les gens. Le produit ne dit jamais pour qui voter, ne range personne dans un camp, ne sort jamais du cercle.

Objectif : application **grand public**, usage **quotidien**, ludique.

---

## 2. La boucle quotidienne (validée)

Deux écrans successifs, ~90 secondes, à n'importe quelle heure.

**Écran 1 — Deviner** (texte de la veille)
- 3 réponses anonymes de membres du cercle (jamais la sienne) : position + considération choisie.
- On les attribue à une personne. Sur l'une des trois, la considération est aussi masquée : on devine qui *et* pourquoi.
- Sélection : 2 réponses atypiques (où la personne s'écarte de son profil) + 1 au hasard.
- 1 point par attribution juste, tous les points égaux. Passer est possible, sans pénalité.

**Écran 2 — Déposer** (texte du jour)
- Trois lignes, sans auteur ni groupe.
- Position sur 5 niveaux : très défavorable / défavorable / neutre / favorable / très favorable. « Neutre » est une réponse comme une autre.
- « Qu'est-ce qui a le plus pesé ? » : 4 considérations concrètes, qui sont des arguments réels de députés, anonymisés.
- Réponse définitive.

**Rythme**
- Le texte du jour s'ouvre à 18h. La manche d'attribution sur un texte est ouverte de 18h à 18h le lendemain.
- **Révélation commune à 18h** : attributions justes/fausses, résultat du vote à l'Assemblée, auteur du texte, auteur de l'argument choisi.
- Rien n'est rattrapable. Ouvrir l'app tard = on joue quand même, la manche reste ouverte jusqu'au lendemain 18h.
- Un seul message quotidien, à 18h : « la révélation d'hier, et la question d'aujourd'hui ». *(arbitré)*

---

## 3. Le cercle (validé)

- 3 à 10 membres. On peut appartenir à plusieurs cercles (famille, amis…), recoupements autorisés.
- Une seule réponse quotidienne, valable dans tous les cercles ; une manche par cercle, jouées l'une après l'autre. Une personne présente dans deux cercles n'est proposée qu'une fois par jour.
- N'importe quel membre peut inviter.
- Un membre inactif est simplement ignoré, le cercle continue.
- Départ d'un membre : ses réponses disparaissent ; scores et titres déjà attribués restent figés.
- Cercle tombé à 2 : mis en sommeil (plus de manche ni de titres) ; dépôt, portrait et archives continuent. *(arbitré)*
- Identification par **pseudo libre**.
- v1 : cercles intimes uniquement ; cercles « collègues » à visibilité réduite reportés. *(arbitré)*

---

## 4. Badges (validés, à trois étages)

**Titres hebdomadaires** — un seul titulaire, calculés du lundi au dimanche, décernés le dimanche à 18h, affichés toute la semaine :
- **Le Devin** — meilleur total d'attributions de la semaine
- **Le Mystère** — celui sur qui le cercle s'est le plus trompé (ratio ; accessible dès la 1re semaine)
- **Le Fidèle** — a déposé les 7 jours

**Tempéraments** — permanents, descriptifs, plusieurs titulaires possibles, évoluent dans le temps :
- **L'Original** — le plus souvent seul de son avis
- **Le Pont** — le plus souvent au centre sur les tensions où le cercle est le plus divisé (défini par tension, pas en moyenne globale)
- **Le Mesuré** — répond souvent au centre *(nom proposé pour remplacer « L'Indécis », à confirmer)*
- **Le Tranché** — répond souvent aux extrêmes

**Rares** — déclenchés par un événement, annoncés au cercle :
- **Le Sans-Faute** — une semaine complète sans erreur d'attribution
- **Le Pas de Côté** — répondre à l'inverse de son propre curseur sur une tension déjà nette

Plus : **la surprise de la semaine** (texte où le cercle s'est le plus trompé), onglet statistiques (palmarès, historique des titres et tempéraments).

---

## 5. Le portrait de valeurs

**8 tensions** (chaque texte est étiqueté par une seule tension principale) :
1. Sécurité ↔ Liberté individuelle
2. Égalité ↔ Mérite
3. Solidarité collective ↔ Responsabilité individuelle
4. Précaution ↔ Innovation
5. Tradition ↔ Changement
6. Souveraineté ↔ Ouverture
7. État ↔ Marché
8. Local ↔ National

Écartés volontairement : laïcité (trop inflammable en famille), Ordre ↔ Justice (recoupe le 1).

**Calcul** : le profil vient des arbitrages (textes où deux considérations s'opposent et où la réponse en sacrifie une), pas du comptage.

**Représentation** : une pile de curseurs, un par tension. Chaque curseur commence comme une zone floue large et se resserre à chaque réponse (le flou = incertitude réelle). Pile ordonnée du plus net au plus flou. Superposition avec un proche, curseur par curseur.

**Rythme de dévoilement** : chaque jour une ligne factuelle (« aujourd'hui tu as fait passer la sécurité avant la liberté ») ; chaque semaine une phrase sur une tension devenue assez nette. Portrait solide sur 3-4 dimensions ≈ 3 mois de jeu.

Les options visibles parlent de situations concrètes ; le lien option → tension reste caché à l'utilisateur.

Le profil sert aussi de **moteur de difficulté** : il permet de servir les réponses atypiques.

---

## 6. Navigation (validée)

Trois onglets : **Aujourd'hui** · **Le Cercle** · **Moi**
- *Aujourd'hui* : les deux écrans de la boucle, puis compte à rebours jusqu'à 18h et qui a joué.
- *Le Cercle* : une barre par tension avec la position de chacun ; titulaires des titres ; surprise de la semaine ; statistiques. Clic sur un visage → **écran personne** (ses curseurs superposés aux siens, taux de lecture de cette personne dans le temps, désaccords passés à plat).
- *Moi* : curseurs, tempéraments, palmarès, accès aux **archives** (historique complet de ses réponses ; textes anciens jouables hors compétition pour préciser un curseur).

---

## 7. Onboarding (proposition v2, en attente de validation)

Principe : **l'invitant ne fait rien de plus que sa propre entrée ; c'est l'invité qui devine.**

À la création d'un cercle, le système fixe **3 textes d'archive clivants**, identiques pour tous ceux qui rejoindront ce cercle.

**Créateur (Thomas), ~3 min** : connexion Google/Apple → pseudo → nom du cercle → répond aux 3 textes → révélation immédiate (Assemblée, auteur du texte, auteur de son argument) → esquisse floue → invitation pré-écrite (« il faut être trois pour lancer le cercle »). En attendant, la question du jour est déjà ouverte : il dépose et a sa révélation solo chaque soir.

**Invitée (Marie), ~3 min** : message « Tu crois me connaître ? J'ai répondu à 3 questions. Devine ce que j'ai dit. » → connexion **Google ou Apple obligatoire** avant de jouer → 3 textes à l'aveugle → devine les 3 positions de Thomas → révélation immédiate (réponse de Thomas, vote de l'Assemblée, auteur du texte, auteur de son argument) → score (« 2 sur 3, il va le savoir ») et esquisse → entrée dans le cercle → si une manche est ouverte, elle la joue tout de suite.

Thomas est notifié à chaque arrivée : « Marie t'a deviné 2 fois sur 3 » *(exception au message unique de 18h, à valider)*.

Les 3 textes d'entrée comptent pour les curseurs, jamais pour les scores ni les titres.

Indicateurs : part d'invités qui finissent les 3 textes ; part de créateurs qui envoient au moins 2 invitations.

---

## 8. Production du contenu

- **Source** : open data de l'Assemblée nationale (scrutins publics, comptes rendus, amendements, exposés des motifs). Sénat à envisager. On prend tous les scrutins (pas seulement les lois), traduits en langage clair, en écartant les procéduraux inintelligibles.
- **Volume** : largement suffisant (plusieurs milliers de scrutins publics par an dans la législature actuelle) ; ~40-65 lois promulguées par an.
- **Fenêtre** : textes récents (direct + archive récente sur une durée réaliste) ; pas de textes trop anciens ni abrogés.
- **Équilibre thématique** : quotas par commission saisie au fond (taxonomie officielle de l'Assemblée), publiés.
- **Production entièrement automatisée** (choix du porteur), avec un système d'agents :
  - chaîne **aveugle aux partis** : les arguments sont extraits de débats anonymisés, le groupe est réattaché mécaniquement ensuite ;
  - 4 considérations issues de 4 groupes différents (sinon reprise) ;
  - vérificateurs sur un autre fournisseur de modèle : symétrie de force, fidélité au propos, orientation (l'issue du vote ne doit pas se deviner), adversaire (rédige l'accusation de biais la plus forte) ; 3 échecs = texte remplacé ;
  - suivi statistique : répartition cumulée des arguments par groupe, taux de choix par option, taux de « aucune de ces raisons » ;
  - ordre des options tiré une fois par texte, identique pour tous.
- **Transparence différée** : avant 18h, seul le lien vers le scrutin officiel ; à 18h, auteurs et extraits sourcés ; registre public permanent hors du jeu (sources, méthode, statistiques).
- Limites assumées : biais partagés entre modèles ; stock d'arguments inégal selon les groupes.

---

## 9. Lignes rouges (non négociables)

- Jamais de proximité partisane cumulée (« ton parti le plus proche »), révélation des auteurs texte par texte uniquement.
- Aucun chiffre public sur ce que pensent « les joueurs » (risque de manipulation, non représentatif).
- Aucun taux d'accord global entre deux personnes.
- Aucun classement permanent.
- Aucune mise en scène du désaccord (« tu as voté l'inverse de ton frère »).
- Rien ne sort du cercle (seule exception envisagée : un Portrait de l'année personnel, partageable car il ne parle que de soi).
- Recommandation : engagement public à ne jamais vendre ni exploiter les données ; pas de publicité.

---

## 10. Écarté (et pourquoi)

- Comparateur candidats type Elyze : neutralité intenable.
- Budget sous contrainte : tout modèle macro est biaisé.
- Suivi de son député : vote = discipline de groupe, absentéisme trompeur, peu saillant en France.
- Banque de dilemmes intemporels : se joue une fois et s'épuise.
- Contre-argument + nouveau vote : bonne mécanique mais pousse vers le centre et allonge la boucle.
- Question « d'où vient ta conviction » quotidienne : retirée de la boucle (introspection peu fiable, durée).
- Score de « connaissance des autres » punitif ; duel avec un inconnu ; agrégat national.
- Avant ce projet : apps karting (rencontre, coach de trajectoire, classement façon Strava, carte des circuits) et fantasy F1 — abandonnées faute de fréquence d'usage ou de marché.

---

## 11. Points ouverts

1. **Web ou application ?** Contradiction à trancher : « web d'abord pour tester vite » avait été choisi, puis « c'est une application, il faut télécharger et créer un compte (Google/Apple) ». Impact fort sur l'invitation et les notifications.
2. **Validation de l'onboarding v2** (section 7).
3. **Modèle économique** : non défini.
4. **Juridique** : opinions politiques = données sensibles RGPD, partagées entre personnes identifiées ; cas des mineurs dans un cercle familial ; période électorale. Bloquant avant lancement public (pas pour un prototype entre amis).
5. **Mortalité du cercle** : si plusieurs membres décrochent, le jeu s'effondre pour les autres — pas de parade élégante identifiée.
6. Plafond d'attributions quotidiennes tous cercles confondus (proposé : 9).
7. Surcouche présidentielle 2027 (propositions de candidats à l'aveugle, à partir de février 2027).
8. Étapes suivantes non commencées : écrans, nom, logo, identité visuelle, ton, technique (iOS puis Android), prototype manuel.

**Prochaine étape immédiate** : trancher web vs app, valider l'onboarding, puis prototype manuel (10 textes préparés, un cercle de 6-8 personnes sur WhatsApp, deux semaines).
