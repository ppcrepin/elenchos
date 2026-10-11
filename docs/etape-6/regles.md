# Les règles du jeu, chiffrées

*Étape 6, travail 1 du plan de construction (`docs/plan-construction.md`, partie 4, « Préparer les règles »). Rédaction : Game design, 11 octobre 2026. Sources relues : `docs/decisions.md` (D-001 à D-051), `docs/projet.md`, `docs/produit.md`, `docs/vision.md`, `docs/onboarding.md`, `docs/plan-construction.md` (parties 4 à 7), et dans `docs/essai/` les spécifications, bilans et fichiers de calcul des deux essais. Prénoms, textes et réponses sont fictifs. Les cercles simulés sont faits de joueurs inventés : aucune donnée réelle de joueur n'existe ni n'a servi (D-048). Ce document propose ; ce qui n'est écrit dans aucune décision est marqué « (proposé) ». Aucun code applicatif : les simulations sont de l'outillage de travail, gardé hors du dépôt.*

## En bref

**Ce que nous avons fait.**
- Chaque règle du jeu a maintenant ses chiffres et un exemple joué (section 3).
- Les points que vos décisions laissaient à l'étape 6 sont fermés, un par un (section 4).
- Les réglages ont été calés sur 600 cercles simulés de 3, 5 et 10 joueurs inventés, pendant douze semaines, avec des contrôles à 4 et 7 joueurs (section 5).
- Dix journées jouées à la main servent de corrigé : le code devra retrouver exactement les mêmes résultats (section 6).

**Ce que vous regardez : la section 1, « Ce que vit un cercle type en trois mois ».** Deux pages, sans calcul.

**Les réglages qui comptent.**
- **Un curseur devient net un peu plus tôt que dans les essais.** C'est ce qui tient votre promesse : « environ trois mois pour trois ou quatre curseurs nets » (règle 18). Avec le seuil des essais, un joueur régulier n'en aurait qu'un ou deux à trois mois, et un sur cinq aucun.
- **La barre du portrait se remplit en 60 réponses**, soit environ trois mois à cinq réponses par semaine, puis s'efface. Elle n'annonce aucune arrivée (D-038).
- **Le Pas de Côté devient vraiment rare** : environ un joueur sur quarante dans ses trois premiers mois, puis à peu près un par mois dans un cercle de cinq.
- **Les tempéraments s'ajustent à la taille du cercle** : à trois, être « seul de son avis » arrive par simple hasard.
- **L'avis du cercle s'affiche dès trois réponses.**

**Ce que la simulation apprend, franchement.**
- **Le cercle de trois est fragile.** Un sur deux s'y endort au moins une fois en trois mois, et l'avis du cercle n'y apparaît qu'un soir sur deux. Rien à décider aujourd'hui : D-006 (« cercle lancé à trois ») est déjà sur la liste des décisions que l'équipe pourrait vous demander de rouvrir après la bêta (plan, partie 7).
- **Le Sans-Faute n'est jamais tombé dans nos cercles de cinq ou dix, et il est tombé dans sept cercles de trois sur dix.** La règle R7 prévoit déjà d'y revenir à mi-bêta. De vrais proches devinent sans doute mieux que nos joueurs inventés ; on verra.
- **Ce sont des joueurs inventés.** La simulation vérifie que les règles tiennent ensemble et règle leurs seuils. Elle ne dit rien du plaisir de deviner de vrais proches (D-039).

**Décisions touchées.** Une exception à D-011 : un nouveau venu n'est pas proposé dans Deviner pour un texte fermé avant son arrivée. Trois précisions : la barre (D-026, dans le cadre de D-038), Le Pont (§4), la phrase du dimanche (R2). Tout le reste précise des règles sans en changer aucune (section 8).

**Une seule question pour vous, à la fin** (section 7) : valider ces règles d'un geste, comme les règles de détail du bilan (D-030).

---

## 1. Ce que vit un cercle type en trois mois

*Pour vous. Le cercle « Famille » : Thomas, Marie, Hugo, Inès et Paul. Les chiffres entre parenthèses viennent de nos 200 cercles simulés de cinq joueurs inventés. Un joueur « régulier » répond au moins cinq jours sur sept ; c'est le cas de deux joueurs simulés sur trois.*

### Le premier mois : on apprend à se deviner

Un mardi, Thomas répond à ses trois textes d'entrée et envoie son défi. Marie le relève le soir, Hugo le lendemain : à trois, le cercle est lancé. Inès et Paul arrivent dans la semaine.

Chaque jour, chacun devine les réponses de la veille. Trois jours sur quatre, il y a trois cartes ; sinon deux, ou une, parce que quelqu'un n'a pas répondu. Dans nos cercles simulés, on trouve un peu plus de quatre cartes sur dix ; en posant les visages au hasard, on en trouverait trois (42 % contre 30 %). Ce petit écart, c'est la place du talent. Avec de vrais proches, il devrait être plus grand : c'est ce que la bêta dira.

À 18h, la révélation. Neuf soirs sur dix, l'avis du cercle s'affiche ; le dixième, moins de trois membres avaient répondu, et il ne s'affiche pas. Le cercle est « partagé » quatre fois sur dix ; il « l'aurait adopté » ou « l'aurait rejeté » chacun un peu plus d'une fois sur quatre.

Le dimanche, les titres. Le Devin, Le Mystère et la surprise de la semaine ont presque toujours un titulaire. Le Fidèle en a un ou deux ; une semaine sur huit, personne n'a répondu les sept jours. Les titres tournent : en douze semaines, Le Devin passe par quatre des cinq membres, Le Mystère aussi. Puis chacun lit sa phrase de la semaine, par exemple : « Cette semaine, entre précaution et innovation, tu as le plus souvent choisi l'innovation. »

### Le deuxième mois : le portrait prend forme

Rien n'est encore net. Dans Moi, la barre « Ton portrait se dessine » avance d'un cran à chaque réponse. Les curseurs se resserrent lentement.

Vers la huitième semaine, chez un joueur régulier, le premier curseur devient net (pour la moitié d'entre eux, entre les semaines 7 et 9). Le dimanche qui suit, sa phrase change de forme : « Entre précaution et innovation, tu choisis le plus souvent l'innovation. » Dans Le Cercle, son initiale apparaît sur cette barre.

Le même dimanche arrivent les premiers tempéraments, qui demandent deux mois de réponses. À douze semaines, un membre sur deux en a au moins un : Le Pont ou L'Original, chacun environ un membre sur cinq ; Le Mesuré, un sur sept ; Le Tranché, un sur dix.

### Le troisième mois : on se reconnaît

Vers la neuvième ou dixième semaine, la barre d'un joueur régulier est pleine : soixante réponses. Elle se montre pleine une fois, puis laisse la place aux curseurs.

À douze semaines, un joueur régulier a trois curseurs nets (deux à quatre pour la moitié d'entre eux). Les autres restent flous, et c'est vrai : on sait peu de chose de lui sur ces tensions. Marie touche le visage de Hugo : leurs portraits superposés, proches sur trois tensions, éloignés sur une. De quoi en parler au prochain repas.

Le Pas de Côté reste rare : il faut un curseur très net, puis une réponse franchement contraire. Dans les trois premiers mois, environ un joueur sur quarante le reçoit ; ensuite, à peu près un par mois dans un cercle de cinq.

Le Sans-Faute, lui, n'est jamais tombé dans nos cercles de cinq : sept jours sans une erreur ni une carte passée, sur une vingtaine de cartes, c'est hors de portée de nos joueurs inventés.

### Trois, cinq ou dix : le même jeu, pas la même soirée

| Sur douze semaines, dans nos cercles simulés | 3 membres | 5 membres | 10 membres |
|---|---|---|---|
| Cartes à deviner par jour | 2 (une fois sur trois : 1) | 3 (trois fois sur quatre) | 3 |
| Cartes justes, contre le hasard | 65 % contre 54 % | 42 % contre 30 % | 26 % contre 16 % |
| Soirs où l'avis du cercle s'affiche | 44 % | 91 % | 100 % |
| Cercles endormis au moins une fois | 53 % (10 jours en moyenne) | 3 % | 0 % |
| Membres différents qui ont eu Le Devin | 2,9 sur 3 | 4,2 sur 5 | 6,4 sur 10 |
| Fidèles par semaine (en moyenne) | 1,0 | 1,7 | 3,4 |
| Cercles qui ont vu un Sans-Faute | 7 sur 10 | 0 | 0 |
| Curseurs nets d'un joueur régulier | 3 | 3 | 3 |

À trois, on devine presque à coup sûr (deux cartes, deux visages), mais le cercle dépend de chacun : une absence vide la manche, une pause l'endort. À dix, deviner devient difficile, et les titres circulent entre beaucoup de monde. Cinq est le point d'équilibre ; l'onboarding le disait déjà (« raison visible d'aller à cinq »).

### Ce que ce récit ne dit pas

Nos joueurs inventés répondent d'après un profil caché, se trompent sur leurs proches selon un tirage, et ne se lassent jamais. Ils ne disent rien du plaisir, de la gêne ou de l'envie de revenir. Le récit montre que les règles tiennent ensemble et que leurs seuils sont réglés ; il ne promet pas ce que vivront de vrais proches.

---

## 2. Comment lire la suite

*Pour le code et pour l'équipe. Les sections 2 à 6 sont la spécification.*

**Le jour de jeu.** Il va de 18h à 18h, heure de Paris, donnée par le jeu et non par le téléphone (R10). Le « jour de jeu du jeudi » commence le mercredi à 18h et finit le jeudi à 18h. Pendant ce jour :
- on devine les réponses au texte du mercredi (la manche du jeudi) ;
- on répond au texte du jeudi ;
- à sa fin, le jeudi à 18h, tombe la révélation de la manche du jeudi, c'est-à-dire du texte du mercredi (lecture A, D-010).

**La semaine.** Elle compte les sept jours de jeu du lundi au dimanche. Ses points et ses titres portent sur les sept manches de ces jours, révélées du lundi 18h au dimanche 18h ; Le Fidèle et la phrase du dimanche, sur les sept textes de ces jours. Les points repartent de zéro après les titres du dimanche.

**Notations** (reprises des essais, `docs/essai/simulation.md`, §0 et §5).

| Symbole | Sens |
|---|---|
| TD, D, N, F, TF | Très défavorable, Défavorable, Neutre, Favorable, Très favorable |
| v | valeur d'une position : 0, 1/4, 1/2, 3/4, 1 (de TD à TF) |
| s | sens d'un texte : le pôle (0 ou 1) que sert « favorable » |
| x | place d'une réponse sur l'axe de la tension : v si s = 1, 1 − v si s = 0 |
| π | pôle que sert la position : s si favorable, 1 − s si défavorable |
| ρ | pôle de la raison choisie : 0, 1, ou aucun (raison hors tension, ou « aucune ») |
| w | poids d'une réponse dans le portrait (règle 17) |
| W, Σwπ | somme des poids d'un curseur ; somme des poids tournés vers le pôle 1 |
| c, ℓ | centre et largeur d'un curseur (règle 17) |

**Calcul exact.** Toutes les grandeurs sont des fractions exactes, jamais des nombres à virgule, comme aux essais : une égalité qui déclenche un départage se juge sur la valeur exacte.

**Tirages.** « Au hasard » veut dire un tirage équitable, fait une fois, gardé avec la journée, pour qu'une journée se rejoue à l'identique (proposé ; la méthode est à Back-end). Dans les journées de la section 6, les tirages sont donnés comme des entrées.

**Les tensions**, dans leur ordre fixe (règle 16) : 1 sécurité / liberté (S) ; 2 égalité / mérite ; 3 solidarité collective / responsabilité individuelle ; 4 précaution / innovation (P) ; 5 tradition / changement (T) ; 6 souveraineté / ouverture ; 7 État / marché ; 8 décision locale / décision nationale (L). Le pôle 0 est la première valeur. Les exemples n'utilisent que les quatre tensions déjà essayées ; les libellés des quatre autres sont l'objet du travail 2 (`docs/etape-6/tensions.md`).

---

## 3. Les règles, une par une

*La numérotation suit `docs/produit.md`, section 4 (règles 1 à 19), plus une règle 20. Pour chaque règle : ce qu'elle dit, ses chiffres, un exemple joué (prénoms et réponses fictifs) et sa source. « J1 » à « J10 » renvoient aux journées de la section 6.*

### Le cercle

**Règle 1 · Taille et pseudo.**
- **Chiffres.** De 3 à 10 membres, membres en pause compris. La partie (manches, titres) démarre à 3. Le cercle est complet à 10 : le bouton « Inviter » disparaît, et un lien ouvert alors ne fait entrer personne ; ses mots sont à UX (proposé). Deux membres d'un même cercle n'ont jamais le même pseudo, comparé sans majuscules ni accents ni lettres d'autres alphabets qui imitent les nôtres (E7).
- **Exemple.** « Famille » a dix membres. Le lien qu'Inès avait envoyé à son cousin s'ouvre sur un écran qui dit que le cercle est complet ; rien n'est enregistré. « Marie » et « marié » ne peuvent pas cohabiter dans un cercle.
- *Source : règle 1 ; D-006 ; E7 (D-030).*

**Règle 2 · Inviter.**
- **Chiffres.** Un lien par personne, à usage unique, valable 7 jours (proposé, en accord avec les 7 jours de conservation des réponses d'un invité proposés par Juridique, `docs/onboarding.md`).
- **Exemple.** Thomas invite Paul un mardi. Paul ouvre le lien le mardi suivant à 19h : il a expiré, Thomas doit en envoyer un autre.
- *Source : règle 2 ; D-006.*

**Règle 3 · Plusieurs cercles.**
- **Chiffres.** Trois cercles au plus. Une réponse par jour, valable pour tous ses cercles. Une manche par cercle, jouées à la suite dans l'ordre où l'on est entré dans ces cercles (proposé). Neuf cartes par jour au plus.
- **Un proche présent dans deux de mes cercles** ne m'est servi qu'une fois par jour (R8) :
  - dans le cercle où son absence viderait la manche ;
  - si son absence viderait deux manches, ou aucune, un tirage invisible choisit ;
  - dans l'autre manche, son visage n'est pas proposé ;
  - une manche vidée ainsi est sautée : « Rien à deviner dans ce cercle aujourd'hui ».
- **La révélation reste unique** : les attributions cercle par cercle, puis le vote et les auteurs une seule fois ; l'avis du cercle, cercle par cercle, jamais additionné (D-011, D-025). Points et titres se comptent par cercle ; le portrait est unique.
- **Exemples.** J4 (Hugo servi dans « Amis », où Léa n'a pas répondu) ; J5 (tirage).
- *Source : règle 3 ; R8 (D-030).*

**Règle 4 · Partir.**
- **Chiffres.** Au départ d'un membre (il quitte le cercle, efface tout, ou son compte est effacé pour inactivité), ses réponses partent avec lui, sur-le-champ. Le reste suit (proposé) :
  - une de ses cartes déjà servie mais pas encore révélée disparaît de la manche ; elle ne compte ni juste ni fausse ;
  - si son visage était posé sur une autre carte, cette carte redevient vide ;
  - la carte « qui et pourquoi » n'est pas remplacée si c'était la sienne ;
  - les points déjà gagnés sur ses cartes révélées restent (§3, « scores figés ») ;
  - ses titres passés restent dans l'historique, sous « un ancien membre » (D-045) ; deux anciens membres ne se distinguent pas, c'est voulu ;
  - un titre de la semaine qu'il détenait n'est pas redonné : il disparaît avec son visage et reste dans les titres passés ;
  - il ne peut plus recevoir de titre le dimanche ;
  - s'il revient, il entre comme un nouveau membre : ses anciens titres restent sous « un ancien membre ».
- **Exemple.** J10.
- *Source : règle 4 ; D-045 ; projet §3.*

**Règle 5 · Pause, sommeil, effacement.**
- **Pause.** Un membre qui n'a répondu à aucun des 7 derniers textes est en pause, à partir de 18h le jour de jeu où se ferme le septième. Sa prochaine réponse l'en sort. En pause, il reçoit toujours le message de 18h (D-029) et son visage reste proposé dans Deviner (D-011).
- **Sommeil.** À chaque 18h, un cercle qui compte moins de 3 membres hors pause s'endort : pas de manche le jour suivant. Il se réveille à 18h, dès qu'il compte de nouveau 3 membres hors pause. Les titres du dimanche tombent si le cercle était éveillé pendant le jour de jeu du dimanche (proposé). On répond toujours, et le vote et les auteurs tombent toujours (E1).
- **Effacement.** Un compte qui n'ouvre pas le jeu pendant 365 jours est effacé. Un e-mail part 30 jours avant, une seule fois. Toute ouverture du jeu remet le compteur à zéro (D-045).
- **Exemple.** « Amis » compte Léa, Marie et Hugo. Léa ne répond plus à partir d'un lundi.
  - Le dimanche suivant, à 18h, les titres de la semaine tombent : le cercle était éveillé ce jour-là.
  - À cette même heure, Léa n'a répondu à aucun des 7 derniers textes : elle est en pause. Le cercle n'a plus que 2 membres hors pause et s'endort : pas de manche le lundi.
  - Le mercredi à 8h, Léa répond. À 18h, le cercle se réveille, et la manche du jeudi a lieu.
- *Source : règle 5 ; D-010 (point 3), D-029, D-045. Dans les cercles simulés : 53 % des cercles de trois s'endorment au moins une fois en douze semaines, 3 % des cercles de cinq, aucun de dix.*

### Le jour

**Règle 6 · Le texte du jour et l'heure.**
- **Chiffres.** Le texte s'ouvre à 18h, heure de Paris, pour 24 heures.
- **Une réponse en retard** est acceptée jusqu'à 18h10, si l'écran Répondre de ce texte s'est affiché avant 18h00 (proposé : R10 disait « quelques minutes »). Elle compte pour le portrait, la barre, Le Fidèle et l'avis du cercle. Elle n'est pas servie à deviner : les cartes sont tirées à 18h, parmi les réponses déjà fermées.
- **Le mélange** : sur 4 semaines glissantes, textes adoptés et rejetés font chacun entre un tiers et deux tiers des textes servis (D-028), soit 10 à 18 rejetés sur 28 textes.
- **Exemple.** J5 : Inès ouvre Répondre à 17h58 et valide à 18h04.
- *Source : règle 6 ; R10, E11 (D-030) ; D-028.*

**Règle 7 · Répondre.**
- **Chiffres.** Cinq positions (valeurs 0, 1/4, 1/2, 3/4, 1). Puis une raison parmi les quatre du texte, présentées mêlées dans un ordre tiré une fois par texte, ou « aucune ». La réponse est définitive.
- **Égalité entre groupes** : sur 12 semaines glissantes, chaque groupe fournit entre deux tiers et quatre tiers de la part égale des raisons (D-044). Par exemple, avec 84 textes, 336 raisons et 10 groupes, la part égale est de 33,6 raisons, et chaque groupe en fournit de 23 à 44. Un député non inscrit est admis, au plus un par texte, hors du compte.
- **Exemple.** Marie lit le texte, touche « Défavorable », puis « « R3 » ». Elle ne peut plus changer.
- *Source : règle 7 ; D-010 ; D-034 ; D-044 (point 3).*

**Règle 8 · Les cartes à deviner.**
- **Les réponses possibles**, pour un devineur et un cercle : les réponses au texte de la veille des autres membres qui étaient membres à sa fermeture et le sont encore, moins celles que la règle 3 envoie dans un autre cercle.
- **Trois réponses possibles ou moins** : toutes sont servies.
- **Quatre ou plus** (donc dès cinq membres) :
  1. On calcule la surprise de chaque réponse possible. Si le curseur de son auteur sur cette tension est net, tel que le devineur peut le voir (règle 19) : surprise = |x − c|. Sinon : surprise = |x − m|, où m est la médiane des x des réponses possibles. Avec un nombre pair de réponses, m est la moyenne des deux du milieu. La réponse du devineur n'entre jamais dans ce calcul (R3).
  2. Les deux plus fortes surprises prennent les places 1 et 2 ; à égalité, un tirage les ordonne.
  3. La place 3 est tirée au hasard parmi les autres.
  4. **Deux réponses identiques** (même position, même raison, « aucune » comprise) ne sont pas servies ensemble si une autre réponse peut prendre la place. On écarte la moins bien classée des deux, et on la remplace par la première réponse non servie, dans l'ordre du classement, qui n'est identique à aucune carte servie (R4). Sinon, elles sont servies ensemble.
- **Qui est proposé** : tous les autres membres, dans l'ordre d'arrivée, en pause compris (D-011). Deux exceptions : le proche servi dans un autre de mes cercles (R8) ; un membre arrivé après la fermeture du texte, qui ne pouvait pas y répondre (proposé ; **exception à D-011**, section 8).
- **Exemples.** J1 (surprise par la médiane) ; J2 (deux réponses identiques, remplacement) ; J3 (servies ensemble) ; J8 (surprise par le curseur net).
- *Source : règle 8 ; R3, R4 (D-030) ; D-024 ; essais, fichiers de calcul §4.*

**Règle 9 · La carte « qui et pourquoi », et Valider.**
- **Laquelle.** Elle est tirée au sort parmi les cartes servies dont la raison n'est pas « aucune » (D-038). Si toutes sont « aucune », il n'y a pas de carte « qui et pourquoi » ce jour-là (proposé).
- **Son ordre.** Les autres cartes viennent d'abord, dans un ordre tiré au sort ; elle vient en dernier. Une manche à deux cartes la met en second. Une manche d'une seule carte est cette carte (proposé ; D-038 était écrite pour trois cartes).
- **Le geste.** Son « pourquoi » se choisit parmi les quatre raisons du texte, une fois son visage posé (D-038). Changer de visage garde le « pourquoi ». Retirer le visage ou passer la carte l'efface (proposé, comme dans l'essai : une raison va avec une personne).
- **Valider** enregistre la manche telle qu'elle est ; ensuite, rien ne change, et le repère de la journée passe à « fait » (proposé ; R10 renvoyait ce point à l'étape 6). Avant Valider, la manche est un brouillon gardé à chaque geste. À 18h, un brouillon compte tel qu'il est (règle 10). Le mot « Valider » des maquettes reste (D-014).
- **Passer** ne coûte rien, sauf pour Le Sans-Faute (règle 14).
- **Exemples.** J1, J4 (une carte), J5 (manche non validée à 18h).
- *Source : règle 9 ; D-038 ; R10 (D-030) ; D-022.*

### La révélation, les points, les titres

**Règle 10 · 18h.**
- **L'ordre.** Les attributions, cercle par cercle ; puis le vote et, avec lui, l'avis de chaque cercle ; puis les auteurs ; puis les badges rares (D-011).
- **La manche se ferme telle qu'elle est.** Un visage posé compte ; une carte vide est passée. Une manche dont l'écran Deviner ne s'est jamais affiché n'a pas de cartes, et sa révélation commence au vote (R10).
- **L'avis du cercle** (D-025 ; seuil et ligne proposés) :
  - il compte les réponses des membres actuels du cercle au texte révélé, réponses en retard comprises ;
  - **seuil : 3 réponses** ; en dessous, ni ligne, ni graphique, ni phrase de remplacement ;
  - on range les n réponses de TD à TF. Si n est impair, la mention du milieu est celle de rang (n + 1)/2. Si n est pair, on marque les deux du milieu, ou une seule si elles sont égales ;
  - la ligne suit le côté du milieu : favorable, « Ton cercle, lui, l'aurait adopté. » ; défavorable, « … l'aurait rejeté. » ; neutre, ou deux côtés différents au milieu, « Ton cercle, lui, était partagé. » ;
  - la réponse du joueur n'est jamais marquée (lecture d'UX de la maquette 2.7a).
- **Pourquoi trois, et non six (position d'UX).** Dans un cercle de trois ou quatre, chacun reçoit déjà toutes les réponses des autres en cartes : le graphique n'y apprend rien de plus. Avec un seuil de six, aucun cercle de trois à cinq ne verrait jamais l'avis que vous avez choisi (D-025). Juridique proposait aussi trois.
- **« Partagé » pour un cercle tout entier neutre.** UX objectait que ce serait faux. Nous gardons les trois lignes de D-025 : « être partagé » veut aussi dire hésiter entre deux avis, et le cas reste rare (0,6 % des soirs où l'avis s'affiche à trois, 0,2 % à cinq, jamais à dix dans nos cercles simulés).
- **Exemples.** J1 (« rejeté »), J2 (« adopté »), J3 (nombre pair, « partagé »), J6 (sous le seuil).
- *Source : règle 10 ; D-010, D-011, D-025 ; R10, E1 (D-030).*

**Règle 11 · Les points.**
- **Chiffres.** Un point par bonne attribution, tous de même valeur.
- **Ce qui est juste.** Une attribution est juste si le visage posé est celui de l'auteur, ou d'un proche qui a donné exactement la même réponse : même position, même raison, « aucune » comprise (le jumeau, D-024). Pour deux cartes identiques servies ensemble, l'un ou l'autre auteur est juste sur chacune (R4). Ensuite, pour « C'était … », Le Mystère et « ses surprises », chaque auteur désigné devient l'auteur de la carte où on l'a posé, et les autres vont aux cartes restantes dans l'ordre d'arrivée (règle des essais).
- **« Raison cachée trouvée »** : la personne est juste et la raison aussi. Elle ne rapporte pas de point ; elle sert seulement à départager Le Devin (R5).
- **Le hasard d'une manche** (mesure interne, D-041) : pour chaque carte, h = nombre de proposés qui ont donné la même réponse, divisé par le nombre de proposés. La somme des h donne le nombre de cartes justes qu'on aurait en posant les visages au hasard.
- **Exemples.** J2 (jumeau : 1 point, et le hasard monte à 1 carte au lieu de 3/4) ; J3.
- *Source : règle 11 ; D-024 ; R4, R5 (D-030) ; D-041.*

**Règle 12 · Les titres du dimanche.**
- **Le Devin** : le plus de points de la semaine, au moins 1. À égalité, le plus de raisons cachées trouvées ; puis un tirage, jamais montré.
- **Le Mystère** : la plus forte part d'erreurs du cercle sur ses cartes de la semaine, passes exclues, avec au moins 6 tentatives et au moins 1 erreur. Désigner un jumeau n'est jamais une erreur. À égalité, le plus d'erreurs ; puis un tirage.
- **Le Fidèle** : tous ceux qui ont répondu aux 7 textes de la semaine, réponses en retard comprises. Un membre arrivé en cours de semaine ne peut pas l'avoir cette semaine-là (lettre de la règle 12 : « les sept jours » ; proposé, l'essai 2 faisait autrement par convention).
- **La surprise de la semaine** : parmi les textes de ses sept manches, la plus forte part d'attributions fausses, passes exclues, avec au moins 4 attributions et au moins 1 fausse. À égalité, le plus d'erreurs ; puis un tirage.
- **Titre sans titulaire** : il n'apparaît pas (R6). Pas de titres si le cercle a dormi pendant le jour de jeu du dimanche (règle 5).
- **Exemple.** J7.
- *Source : règle 12 ; R6 (D-030) ; D-024. Dans les cercles simulés de cinq, Le Devin manque moins d'une semaine sur mille, Le Mystère et la surprise une sur cinq cents ; à trois, Le Mystère manque une semaine sur dix et la surprise plus d'une sur huit.*

**Règle 13 · Les tempéraments.**
- **Quand.** Chaque dimanche, au moment des titres, sur les 56 derniers jours de jeu (deux mois).
- **Qui.** Il faut au moins 20 réponses dans ces 56 jours, et une première réponse vieille de 56 jours au moins (dans le cercle, pour L'Original et Le Pont). Pour L'Original et Le Pont, un texte ne compte que s'il a au moins 3 réponses dans le cercle.
- **L'Original** (par cercle) : son côté (favorable ou défavorable) réunit au plus un tiers des réponses du cercle à ce texte, lui compris. Il faut que ce soit le cas sur au moins 2/5 de ses réponses dans un cercle de 3, 1/3 dans un cercle de 4, 1/4 dans un cercle de 5 ou plus.
- **Le Pont** (par cercle) : on regarde les textes « partagés », ceux où les autres membres ont donné au moins un avis favorable et un défavorable ; il en faut au moins 6. Le Pont a répondu Neutre sur au moins 1/4 d'entre eux, et les Neutre y faisaient au plus un tiers des réponses.
- **Le Mesuré** (pour toute la personne) : Neutre sur au moins 1/3 de ses réponses.
- **Le Tranché** (pour toute la personne) : « Très … » sur au moins 1/2 de ses réponses.
- **Garder un tempérament.** Une fois obtenu, il se garde tant que la part reste au moins aux 4/5 du seuil, et que les conditions de « Qui » restent remplies (proposé). Sans cette marge, les tempéraments changeraient d'une semaine à l'autre presque deux fois plus souvent.
- **Affichage.** Sous un visage : ceux de ce cercle, après les titres, un par ligne, dans l'ordre L'Original, Le Pont, Le Mesuré, Le Tranché. Dans Moi : tous, avec le nom du cercle pour L'Original et Le Pont (R9).
- **Exemple.** J9.
- *Source : règle 13 ; R9 (D-030) ; projet §4 ; seuils et marge proposés (section 5). Le Pont se juge texte par texte, et non tension par tension comme l'écrit le §4 : précision signalée en section 8.*

**Règle 14 · Les badges rares.**
- **Le Sans-Faute** : sur la semaine, des cartes révélées au moins 5 jours, aucune erreur, aucune carte passée. La raison cachée n'est pas exigée. Un jour sans carte ne compte ni pour ni contre (R7). Il est annoncé le dimanche avec la révélation, avant les titres, puis vit comme un titre : sous le visage jusqu'aux titres suivants, dans Mes titres, dans les titres passés, sans total.
- **Le Pas de Côté** :
  - une réponse du jour qui est un arbitrage net (w = 1) ;
  - elle va vers le pôle opposé au penchant de son curseur sur cette tension, tel qu'il était juste avant : toutes ses réponses précédentes, entrée comprise ;
  - ce curseur est net (W ≥ 8) et penche très clairement : |c − 1/2| ≥ 7/20, c'est-à-dire c ≥ 17/20 ou c ≤ 3/20 (proposé ; l'essai prenait 1/5) ;
  - concrètement, il faut au moins dix arbitrages nets d'un même côté, sans presque aucun écart, puis une réponse franchement contraire ;
  - il vaut pour tout membre, sur les textes du jour, jamais l'entrée ;
  - il est annoncé dans chacun de ses cercles, à la révélation de ce texte, après les auteurs ; plusieurs le même soir sont possibles ;
  - ensuite, il vit comme un titre, comme Le Sans-Faute (proposé ; R11 ne disait rien).
- **Exemples.** J7 (Le Sans-Faute manqué par deux passes) ; J8 (Le Pas de Côté de Paul).
- *Source : règle 14 ; R7, R11 (D-030). Rareté mesurée en section 5.*

**Règle 15 · L'entrée.**
- **Chiffres.** Trois textes, fixés à la création du cercle, identiques pour tous ceux qui y entrent, d'une tension différente chacun, dont au moins un texte rejeté (D-028). Ils comptent pour le portrait et la barre (3 crans), jamais pour les points ni les titres.
- **Pas de phrase du jour à l'entrée** : la révélation immédiate en tient lieu (proposé, conforme au parcours validé, `docs/onboarding.md`).
- **Un joueur déjà inscrit qui rejoint un autre cercle** relève le défi comme tout invité : il répond aux trois textes de ce cercle et devine celui qui l'invite (proposé ; D-030 renvoyait ce point à l'étape 6). S'il avait déjà répondu à l'un de ces textes, sa réponse est reprise, sans compter deux fois. Il ne recrée pas de compte. Si son pseudo est déjà pris dans ce cercle, il en choisit un autre pour ce cercle (mots : UX). S'il a déjà trois cercles, le lien le lui dit.
- **Exemple.** Hugo, déjà dans « Famille », est invité par Léa dans « Amis ». Il répond aux trois textes d'« Amis » ; il avait déjà répondu au deuxième dans « Famille », et sa réponse y est reprise telle quelle. Puis il devine Léa. Sa barre avance de 2 crans, pas de 3.
- *Source : règle 15 ; D-006 ; D-028 ; D-030.*

### Le portrait

**Règle 16 · Les tensions.**
- **Chiffres.** Huit tensions, chaque texte en touche une. Sur 8 semaines, pour chaque tension, autant de textes où « favorable » sert une valeur que l'autre (E9, règle de Contenu). Un libellé par valeur, toujours le même ; ceux des quatre tensions jamais essayées viennent du travail 2.
- **Exemple.** Sur 8 semaines, la tension précaution / innovation reçoit 7 textes : 4 où être favorable sert l'innovation, 3 où il sert la précaution. Un joueur qui approuve tout ne voit donc pas son curseur pencher pour cette seule raison.
- *Source : règle 16 ; E2, E9 (D-030).*

**Règle 17 · Le curseur.**
- **Le poids d'une réponse.**

| Réponse | w | Vers |
|---|---|---|
| Non neutre, raison du pôle que sert la position (ρ = π) : **arbitrage net** | 1 | π |
| Non neutre, raison hors tension ou « aucune » : **penchant** | 1/2 | π |
| Non neutre, raison de l'autre pôle : **tiraillé** | 0 | — |
| Neutre | 0 | — |

- **Le calcul.** Centre c = (2 + Σwπ) / (4 + W). Largeur ℓ = max(19/20 − 7/80 × W ; 1/4).
- **Net dès W ≥ 8** (proposé ; l'essai prenait 10, section 5). La largeur atteint alors son plancher : un curseur net se dessine comme un point.
- Si la bêta ne fait circuler que quatre tensions, le seuil passe à 14 pour garder les trois mois (section 5).
- **Exemple.** Marie, tension précaution / innovation (pôle 1 : l'innovation), 9 réponses : 6 arbitrages nets vers l'innovation, 1 vers la précaution, 1 penchant vers l'innovation, 1 neutre.
  - W = 6 + 1 + 1/2 = 15/2 ; Σwπ = 6 + 1/2 = 13/2.
  - c = (2 + 13/2) / (4 + 15/2) = 17/23 ; ℓ = 19/20 − 7/80 × 15/2 = 47/160. Pas encore net.
  - Une réponse de plus, arbitrage net vers l'innovation : W = 17/2, Σwπ = 15/2, c = 19/25. Net : c'est son curseur de J8.
- *Source : règle 17 ; essais, `simulation.md` §5.1 et §5.2 ; seuil calé en section 5.*

**Règle 18 · Les phrases et la barre.**
- **La phrase du jour**, juste après chaque réponse du jour (pas à l'entrée) :
  - arbitrage net : « Aujourd'hui, tu as fait passer {pôle gagnant} avant {l'autre}. » ;
  - penchant : « Aujourd'hui, tu as penché vers {pôle}. » ;
  - tiraillé : « Aujourd'hui, tu as donné du poids à {pôle 0} comme à {pôle 1}. » ;
  - neutre : « Aujourd'hui, tu n'as penché ni vers {pôle 0} ni vers {pôle 1}. » (R1).
- **La phrase du dimanche**, après les titres, sur le portrait à cet instant (réponse du dimanche comprise). On prend la première forme qui s'applique :
  1. **une tension devenue nette** depuis la lecture du dimanche précédent (pour le premier dimanche : depuis l'arrivée). S'il y en a plusieurs : la plus éloignée de 1/2, puis le plus grand W, puis l'ordre des tensions. Un curseur net de centre exactement 1/2 n'y entre pas. Phrase : « Entre {…} et {…}, tu choisis le plus souvent {…}. » ;
  2. **sinon, le choix le plus marqué de la semaine.** Sur les 7 textes de la semaine, on garde les tensions qui ont au moins 2 réponses de poids non nul. On prend celle où l'écart entre les poids de ses deux pôles est le plus grand ; à écart égal, le plus fort poids total ; puis l'ordre des tensions. Écart non nul : « Cette semaine, entre {…} et {…}, tu as le plus souvent choisi {…}. » Écart nul : « Cette semaine, entre {…} et {…}, tu as penché autant d'un côté que de l'autre. » ;
  3. **sinon**, si aucun curseur n'est net : « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. » ;
  4. **sinon, pas de phrase** ce dimanche (proposé : la troisième phrase serait fausse chez qui a déjà des curseurs nets ; précise R2).
- **La barre « Ton portrait se dessine »** (proposé, dans le cadre de D-026 et D-038) :
  - 60 crans, un par réponse, entrée comprise ; elle ne recule jamais et ne porte aucune date ;
  - 60 réponses, c'est environ trois mois à cinq réponses par semaine, un peu plus de deux mois pour qui répond chaque jour ;
  - à 60 réponses, environ trois joueurs réguliers sur quatre ont déjà un curseur net (section 5) ;
  - pleine, elle se montre pleine une fois, à la prochaine ouverture de Moi, avec une ligne qui ne promet rien (mots : UX ; par exemple « Ton portrait continue de se préciser à chaque réponse. »), puis elle disparaît ;
  - elle ne saute pas au plein au premier curseur net, comme dans l'essai 2 : un cran par réponse, sans exception ;
  - elle n'est visible que du joueur (D-026).
- **Exemples.** J5 (les quatre phrases du jour) ; J7 (phrase de la semaine) ; J8 (barre pleine) ; J9 (tension devenue nette).
- *Source : règle 18 ; R1, R2 (D-030) ; D-026, D-038.*

**Règle 19 · Ce que voit le cercle.**
- **Lecture A.** Le cercle voit tes curseurs, mais seulement d'après ton entrée et tes réponses déjà révélées : jamais d'après une réponse qu'on n'a pas encore devinée (D-010). C'est aussi ce curseur qui sert à la surprise (règle 8). Toi, dans Moi, tu vois tout ton portrait.
- **Le Cercle.** Sur chaque barre, l'initiale de chaque membre dont le curseur est net, placée à son centre ; « Encore flou : » liste les autres, dans l'ordre d'arrivée.
- **Moi.** Les curseurs nets d'abord, du plus éloigné de 1/2 au plus proche, puis du plus grand W, puis dans l'ordre des tensions. Puis les flous, du plus étroit au plus large, puis dans l'ordre des tensions.
- **« Ses surprises »** : les réponses révélées de ce proche que tu avais attribuées à un membre dont la réponse différait ; ni passes, ni textes d'entrée, ni jumeau désigné (D-024, R12).
- **Exemple.** J8 (ordre des curseurs de Marie dans Moi).
- *Source : règle 19 ; D-010, D-024, D-026 ; R12 (D-030).*

**Règle 20 · Un texte corrigé après coup** (proposé ; question ouverte par la procédure de correction de D-044).
- **Erreur sur le vote, un auteur, une date** (ce qu'on apprend à 18h) : un erratum daté au registre, et la fiche du texte le dit. Rien ne change dans le jeu.
- **Erreur sur ce à quoi on a répondu** (les trois lignes, ou une raison qui trahit son auteur) : le texte sort du portrait.
  - Les réponses restent, mais ne comptent plus dans aucun curseur.
  - Dans l'Historique, la phrase du jour de ce texte porte une mention (mots : UX).
  - Tout le reste tient : cartes, points, titres, Le Fidèle, l'avis du cercle, la barre (elle ne recule jamais, D-026).
  - Raison : on a deviné ce que les proches avaient répondu, et cela reste vrai ; seul le lien entre la réponse et une valeur est faussé.
- **Rien n'est remplacé en cours de journée** : on ne rouvre pas les réponses d'un texte.
- **Exemple.** J10.
- *Source : D-044 (point 1) ; `docs/produit.md`, « Ce que ces décisions laissent à régler », point de Game design. À confirmer par Contenu et Back-end.*

---

## 4. Les règles laissées à l'étape 6, fermées

*Liste tirée de `docs/produit.md` (« Ce que ces décisions laissent à régler »), des renvois de D-026, D-030 et D-038, et des constats de Game design du second essai (`docs/essai/simulation-2.md`, « Constats pour l'étape 6 »).*

| Point ouvert | D'où il vient | Ce qui est fermé | Où |
|---|---|---|---|
| Le seuil des trois mois | D-026 | Net dès W ≥ 8 ; largeur recalée | Règle 17 |
| Ce que la barre annonce au bout, jusqu'à quand elle s'affiche | D-026, D-038 | 60 réponses ; pleine une fois, puis effacée ; rien de promis | Règle 18 |
| Le seuil du Pas de Côté | R11 | Net et \|c − 1/2\| ≥ 7/20 | Règle 14 |
| Ce que devient Le Pas de Côté après son annonce | Constat essai 2 | Il vit comme un titre, comme Le Sans-Faute | Règle 14 |
| Le mot « Valider » | R10, D-022 | Il fige la manche ; le mot reste | Règle 9 |
| L'ordre des cartes : deux cartes, une carte, toutes « aucune », visage changé ou retiré | D-038 | Cas fermés un par un | Règle 9 |
| L'avis du cercle : seuil, règle de la ligne, réponse du joueur | D-025 | 3 réponses ; médiane ; jamais marquée | Règle 10 |
| « Quelques minutes » après 18h | R10 | Jusqu'à 18h10 si Répondre était affiché avant 18h | Règle 6 |
| Un texte corrigé après coup | D-044 | Il sort du portrait, le reste tient | Règle 20 |
| « Un ancien membre » : deux anciens membres ; un titulaire qui part | D-045 | Indistincts ; titre non redonné ; carte retirée | Règle 4 |
| Un joueur déjà inscrit rejoint un autre cercle | D-030 | Il relève le défi ; réponses déjà données reprises | Règle 15 |
| Un nouveau venu proposé pour un texte d'avant son arrivée | Constat essai 2 | Non proposé (exception à D-011) | Règle 8 |
| Le Fidèle d'un nouveau venu arrivé en cours de semaine | Constat essai 2 | Pas cette semaine-là (lettre de la règle 12) | Règle 12 |
| Tempéraments : fenêtre, ancienneté, seuils | Constat essai 2 | 56 jours, 20 réponses, seuils par taille, marge de 4/5 | Règle 13 |
| La lecture « devenue nette » | R2 | Depuis la lecture du dimanche précédent | Règle 18 |
| Une phrase du dimanche fausse chez un joueur déjà net | Relevé ici | Pas de phrase ce dimanche-là | Règle 18 |
| L'ordre des manches de plusieurs cercles | Relevé ici | Ordre d'entrée dans les cercles | Règle 3 |
| Pause et sommeil : à quel moment | Relevé ici | À 18h, sur les 7 derniers textes | Règle 5 |
| Le hasard d'une manche | D-041 | Formule et exemple | Règle 11 |
| Les voix sous le vote | E4 | Aucune voix à la révélation ; le lien officiel, donné à 18h, les montre (position d'UX, que Game design partage : la révélation reste sans chiffre). Contenu proposait les voix. À confirmer par UX et Contenu, dont c'est le domaine | — |

Restent hors de ce travail : les libellés des quatre tensions jamais essayées (travail 2, `docs/etape-6/tensions.md`) ; les mots des écrans (UX) ; la forme du graphique de l'avis du cercle (UX et Direction artistique, D-025).

---

## 5. Réglages : les cercles simulés

### La méthode

- **Les cercles.** 200 cercles de 3 membres, 200 de 5, 200 de 10, plus 100 de 4 et 100 de 7 pour contrôler les seuils qui dépendent de la taille. Douze semaines de jeu (84 jours) après l'entrée. Les seuils du portrait ont aussi été regardés à 13 semaines, et Le Pas de Côté sur 26 semaines.
- **Les joueurs.** Ils sont inventés, sur le modèle des personnages des essais (fichiers de calcul des essais 1 et 2) :
  - un profil caché par tension (une position de 0 à 1, tirée au hasard) et une fermeté (faible, moyenne, forte) ;
  - environ une réponse sur cinq donnée contre ce profil, comme aux essais ;
  - un joueur sur deux « nuancé », qui prend l'argument inattendu une fois sur quatre ou sur deux quand il existe (D-034) ; la moitié des textes a des arguments inattendus ;
  - quatre rythmes : 95, 85, 70 ou 50 % des jours (35, 30, 20 et 15 % des joueurs) ;
  - 15 % décrochent pendant une à quatre semaines, dont un tiers pour de bon.
- **Ce qu'ils répondent.** 62 % d'arbitrages nets, 13 % de penchants (« aucune » compris), 7 % de réponses tiraillées, 17 % de Neutre.
- **Comment ils devinent.** Chacun connaît le penchant d'un proche sur une tension 40 à 90 % du temps ; sinon, il le croit au hasard. La moitié des joueurs lit les raisons. Quand un curseur est net, ils regardent Le Cercle une fois sur deux. Ils passent 5 % des cartes, et n'ouvrent pas Deviner 3 % des jours.
- **Les textes.** Les huit tensions, tirées au hasard, jamais deux jours de suite ; sens alterné par tension (E9).
- **Les règles.** Celles de la section 3.
- **Pourquoi ce modèle.** C'est celui des essais, complété de ce que les essais n'avaient pas : des absences réelles, des décrochages, des cercles de taille variable. Il ne prétend pas imiter de vrais proches ; il sert à régler des seuils qu'on recalera en bêta.

### Le portrait : pourquoi 8

Joueurs réguliers (au moins 5 réponses sur 7), curseurs nets selon le seuil :

| Seuil W | Nets à 12 semaines (médiane ; moitié centrale) | Nets à 13 semaines | Aucun net à 12 semaines | Premier net (réponses ; semaine) |
|---|---|---|---|---|
| 7 | 4 (3 à 5) | 5 | 0 % | 42 ; semaine 7 |
| **8** | **3 (2 à 4)** | **4** | **2 %** | **50 ; semaine 8** |
| 9 | 2 (1 à 3) | 3 | 7 % | 57 ; semaine 9 |
| 10 (essais) | 1 (1 à 2) | 2 | 18 % | 64 ; semaine 10 |

- **La cible** est celle de la règle 18 et du §5 : « environ trois mois pour trois ou quatre curseurs nets ; les autres restent flous plus longtemps ». Seul le seuil 8 la tient : 3 nets à 12 semaines, 4 à 13. Avec 10, un joueur régulier sur cinq n'aurait aucun curseur net à trois mois. C'était l'objection de D-026, vécue.
- **Le joueur nuancé** (argument inattendu une fois sur deux) n'a aucun curseur net à 12 semaines dans 5 % des cas avec le seuil 8, contre 44 % avec 10.
- **Le joueur irrégulier** a en moyenne 0,8 curseur net à 12 semaines avec le seuil 8. Le portrait suit le nombre de réponses, pas le calendrier.
- **La phrase de l'état « portrait pas encore formé »** (« Il faut environ trois mois pour les premiers curseurs nets », 5.11) reste vraie en gros : le premier curseur net arrive vers deux mois, les trois ou quatre premiers vers trois mois. UX relit déjà ce texte à l'étape 6.

### La barre : pourquoi 60

- Chez les joueurs réguliers, le premier curseur net arrive après 50 réponses (moitié centrale : 43 à 56).
- 60 réponses : à ce moment, environ trois joueurs réguliers sur quatre ont un curseur net. Le chiffre tient aussi la cible de « environ trois mois » de la règle 18 pour un joueur à cinq réponses par semaine (12 semaines × 5 = 60).
- Elle est pleine en semaine 9 ou 10 chez un joueur régulier.

### Le Pas de Côté : pourquoi 7/20

Sur 26 semaines, cercles de cinq :

| Condition sur le curseur | Joueurs touchés en 12 semaines | Par cercle de cinq et par mois, après 3 mois |
|---|---|---|
| Net, \|c − 1/2\| ≥ 1/5 (essai) | 37 % | 6,2 |
| Net, \|c − 1/2\| ≥ 3/10 | 15 % | 2,9 |
| **Net, \|c − 1/2\| ≥ 7/20** | **4 %** | **1,1** |

Avec le seuil de l'essai, un joueur sur trois aurait un « badge rare » dès les trois premiers mois. Avec 7/20, il reste un événement : environ un par mois dans un cercle de cinq une fois les curseurs formés. Ce chiffre dépend de ce qu'on ignore : la fréquence avec laquelle de vrais joueurs répondent contre leur penchant (dans nos joueurs inventés, environ une réponse sur dix est un arbitrage net contraire).

### Les tempéraments : pourquoi des seuils par taille

Part des joueurs éligibles qui ont chaque tempérament à 12 semaines, avec les seuils et la marge de la règle 13 :

| Taille | L'Original | Le Pont | Le Mesuré | Le Tranché | Au moins un | Changements par joueur et par semaine |
|---|---|---|---|---|---|---|
| 3 | 22 % | 23 % | 16 % | 8 % | 56 % | 13 % |
| 4 | 23 % | 24 % | 16 % | 9 % | 54 % | 8 % |
| 5 | 23 % | 18 % | 15 % | 10 % | 51 % | 9 % |
| 7 | 27 % | 19 % | 16 % | 8 % | 52 % | 9 % |
| 10 | 26 % | 18 % | 15 % | 11 % | 52 % | 9 % |

- **L'Original.** Avec un seul seuil (3/10, celui de l'essai), il allait à 42 % des membres d'un cercle de trois, et à personne dans un cercle de dix : à trois, être seul de son avis arrive par hasard une fois sur trois ; à dix, presque jamais. D'où « au plus un tiers du cercle » au lieu de « seul », et un seuil qui baisse avec la taille.
- **Le Pont.** « Seul au milieu » (essai) ne marchait pas non plus à dix : le seuil « au plus un tiers de Neutre » le remplace.
- **La marge de 4/5** divise presque par deux les changements d'une semaine à l'autre (de 25 % à 13 % par joueur et par semaine à trois ; de 16-17 % à 9 % à cinq et à dix).
- **La cible** (proposé) : chaque tempérament chez un joueur éligible sur dix à un sur quatre ; un joueur sur deux avec au moins un. Un tempérament que tout le monde a ne décrit plus personne.

### Le reste, vérifié

- **Titres.** Le Devin et Le Mystère tournent (4,2 et 4,5 titulaires différents sur 5 en douze semaines). Les minimums de R6 ne vident presque jamais un titre dès cinq membres.
- **Le Sans-Faute.** Jamais à 5, 7 ou 10 membres ; 6 % des cercles de 4 ; 70 % des cercles de 3, où deux cartes et deux visages en font presque un pile ou face. R7 tient : l'équipe vous fera une proposition à mi-bêta s'il n'est jamais tombé. Un Sans-Faute à cinq demande une vingtaine de cartes justes de suite : avec trois cartes justes sur quatre, ce serait une semaine sur soixante-dix environ.
- **L'avis du cercle.** Réparti entre « adopté », « rejeté » et « partagé » sans pencher : la règle du milieu est symétrique.
- **Les cartes.** Deux réponses identiques servies ensemble restent rares dès cinq membres, grâce au remplacement (R4).

### Si la bêta ne fait circuler que quatre tensions

Chaque tension reçoit alors deux fois plus de textes, et le seuil 8 donnerait 3 curseurs nets sur 4 dès six semaines. Pour garder « environ trois mois », le seuil passerait à 14 (2 à 3 nets sur 4 à 12-13 semaines, simulés). Le seuil se recale chaque fois que le nombre de tensions en circulation change (proposé).

### Ce qui se recale au réglage de mi-bêta

Le plan prévoit un seul lot de réglages, à mi-parcours de la bêta (`docs/plan-construction.md`, partie 5). Voici les repères proposés, mesurés sur ce que font les joueurs, jamais publiés :
- **le seuil de netteté**, si les joueurs réguliers à 8 semaines s'écartent nettement de la courbe ci-dessus ;
- **le Pas de Côté**, si plus d'un joueur sur dix le reçoit dans ses trois premiers mois ;
- **les tempéraments**, si l'un d'eux sort de la fourchette d'un joueur éligible sur dix à un sur quatre ;
- **Le Sans-Faute** (R7).

---

## 6. Dix journées jouées à la main

*Le corrigé du code. Chaque journée donne ses entrées (réponses, curseurs, tirages) et ce que le jeu doit en tirer. Les dix journées ont été calculées à la main, puis recalculées par un script de vérification, en fractions exactes ; les deux concordent. Textes fictifs, désignés par une lettre ; leurs quatre raisons, R1 à R4, sont décrites par leur côté et leur pôle.*

### Le décor

- **« Famille »**, cinq membres, dans l'ordre d'arrivée : Thomas, Marie, Hugo, Inès, Paul. Le cercle a deux semaines ; aucun curseur n'est net.
- **« Amis »**, trois membres, dans l'ordre d'arrivée : Léa, Marie, Hugo. Marie est entrée dans « Famille » avant « Amis » : ses manches se jouent dans cet ordre.
- **Les journées 1 à 7** forment la semaine 3, du lundi au dimanche. On suit Marie.

**Les textes de la semaine 3** (fictifs) :

| Texte | Répondu le | Tension, sens | R1 | R2 | R3 | R4 |
|---|---|---|---|---|---|---|
| A | dimanche (sem. 2) | S, s = 0 (favorable sert la sécurité) | pour, sécurité | pour, hors tension | contre, liberté | contre, sécurité |
| B | lundi | P, s = 1 (favorable sert l'innovation) | pour, innovation | pour, innovation | contre, précaution | contre, précaution |
| C | mardi | T, s = 0 (favorable sert la tradition) | pour, tradition | pour, changement | contre, changement | contre, hors tension |
| D | mercredi | L, s = 1 (favorable sert la décision nationale) | pour, national | pour, national | contre, local | contre, local |
| E | jeudi | P, s = 0 (favorable sert la précaution) | pour, précaution | pour, précaution | contre, innovation | contre, innovation |
| F | vendredi | S, s = 1 (favorable sert la liberté) | pour, liberté | pour, hors tension | contre, sécurité | contre, liberté |
| G | samedi | L, s = 0 (favorable sert la décision locale) | pour, local | pour, hors tension | contre, national | contre, local |
| H | dimanche | T, s = 1 (favorable sert le changement) | pour, changement | pour, changement | contre, tradition | contre, tradition |

Les textes A, C, F et G ont un argument inattendu de chaque côté (croisé ou pratique) ; B, D, E et H n'en ont pas (D-034 : « un de chaque côté, ou aucun »).

**Les réponses** (« — » : pas de réponse) :

| Texte | Thomas | Marie | Hugo | Inès | Paul | Léa |
|---|---|---|---|---|---|---|
| A | F · R1 | D · R3 | TF · R2 | D · R3 | D · R4 | — |
| B | F · R1 | F · R2 | D · R3 | TF · R2 | D · R3 | — |
| C | — | F · R1 | D · R3 | D · R3 | N · R4 | — |
| D | F · R1 | D · R3 | TF · R2 | F · R2 | D · R4 | — |
| E | F · R1 | D · R3 | F · R2 | TD · R4 | N · R1 | F · R1 |
| F | TF · R1 | F · R2 | D · R4 | N · R3 (18h04) | D · R3 | — |
| G | D · R3 | F · R1 | — | F · R2 | F · R1 | — |
| H | N · R3 | N · R1 | D · R3 | F · R1 | F · R2 | — |

### J1 · Lundi : une manche ordinaire, curseurs flous

**Deviner (texte A, Famille).**
- Réponses possibles : Thomas, Hugo, Inès, Paul.
- Places sur l'axe (s = 0, donc x = 1 − v) : Thomas 1/4 ; Hugo 0 ; Inès 3/4 ; Paul 3/4. Médiane : (1/4 + 3/4) / 2 = 1/2.
- Aucun curseur net : surprise = |x − 1/2|. Hugo 1/2 ; Thomas, Inès, Paul 1/4.
- Classement : Hugo, puis l'égalité Thomas, Inès, Paul, que le tirage ordonne Paul, Inès, Thomas.
- Places 1 et 2 : Hugo, Paul. Place 3, tirée parmi Inès et Thomas : Inès.
- Aucune réponse identique. Carte « qui et pourquoi », tirée parmi les trois : Paul.
- Ordre affiché (tirage pour les deux autres) : Inès, Hugo, puis Paul.
- Visages proposés : Thomas, Hugo, Inès, Paul.

**Ce que fait Marie, et ce que dit 18h.**

| Carte affichée | Marie pose | Verdict | Point |
|---|---|---|---|
| Défavorable · « R3 » | Thomas | « C'était Inès. » « Ça alors ! » | 0 |
| Très favorable · « R2 » | Hugo | « Tu connais ton monde. » | 1 |
| Défavorable · raison cachée | Paul, « R4 » | « Tu connais ton monde, et ses raisons. » | 1, raison cachée trouvée |

- Hasard de la manche : 1/4 + 1/4 + 1/4 = 3/4 de carte.
- **Avis du cercle sur A** : D, D, D, F, TF. Cinq réponses, milieu au rang 3 : D. Ligne : « Ton cercle, lui, l'aurait rejeté. »
- **Répondre (texte B).** Marie : F · R2. Arbitrage net vers l'innovation : « Aujourd'hui, tu as fait passer l'innovation avant la précaution. »

### J2 · Mardi : deux réponses identiques, puis un jumeau

**Deviner (texte B, Famille).**
- Places sur l'axe (s = 1, x = v) : Thomas 3/4 ; Hugo 1/4 ; Inès 1 ; Paul 1/4. Médiane : 1/2.
- Surprises : Inès 1/2 ; Thomas, Hugo, Paul 1/4 (ordre tiré : Hugo, Paul, Thomas).
- Places 1 et 2 : Inès, Hugo. Place 3, tirée parmi Paul et Thomas : Paul.
- **Hugo et Paul ont la même réponse (D · R3).** Thomas peut prendre la place. On écarte la moins bien classée des deux, Paul, et on met Thomas à sa place.
- Cartes : Inès, Hugo, Thomas. Carte « qui et pourquoi », tirée : Thomas. Ordre affiché : Hugo, Inès, puis Thomas.

**Ce que fait Marie, et ce que dit 18h.**

| Carte affichée | Marie pose | Verdict | Point |
|---|---|---|---|
| Défavorable · « R3 » | Paul | « Tu connais ton monde. » « C'était Hugo. Paul avait répondu la même chose. » | 1 (jumeau, D-024) |
| Très favorable · « R2 » | Inès | « Tu connais ton monde. » | 1 |
| Favorable · raison cachée | Thomas, « R2 » | « Tu connais ton monde. » « Sa raison : « R1 ». » | 1 |

- Pour Le Mystère, c'est une tentative sur la carte de Hugo, sans erreur. Ce n'est pas une « surprise » de Hugo.
- Hasard : la carte de Hugo a deux bons visages sur quatre (Hugo, Paul), soit 1/2 + 1/4 + 1/4 = 1 carte.
- **Avis du cercle sur B** : D, D, F, F, TF. Milieu : F. « Ton cercle, lui, l'aurait adopté. »
- **Répondre (texte C).** Marie : F · R1 : « Aujourd'hui, tu as fait passer la tradition avant le changement. »

### J3 · Mercredi : deux cartes identiques servies ensemble

**Deviner (texte C, Famille).**
- Thomas n'a pas répondu : réponses possibles Hugo, Inès, Paul. Trois réponses : toutes servies.
- Hugo et Inès ont la même réponse (D · R3), et aucune autre ne peut prendre la place : elles sont servies ensemble.
- Carte « qui et pourquoi », tirée parmi les trois : celle d'Inès. Ordre affiché : Paul, Hugo, puis la carte d'Inès.
- Visages proposés : Thomas (absent hier, mais proposé, D-011), Hugo, Inès, Paul.

| Carte affichée (auteur d'origine) | Marie pose | Auteur après redistribution | Verdict | Point |
|---|---|---|---|---|
| Neutre · « R4 » (Paul) | Thomas | Paul | « C'était Paul. » « Ça alors ! » | 0 |
| Défavorable · « R3 » (Hugo) | Inès | Inès | « Tu connais ton monde. » | 1 |
| Défavorable · raison cachée (Inès) | Hugo, « R3 » | Hugo | « Tu connais ton monde, et ses raisons. » | 1, raison cachée trouvée |

- **Avis du cercle sur C** : quatre réponses, D, D, N, F. Nombre pair : on marque les deux du milieu, D et N. Leurs côtés diffèrent : « Ton cercle, lui, était partagé. »
- **Répondre (texte D).** Marie : D · R3 (π = local, ρ = local) : « Aujourd'hui, tu as fait passer la décision locale avant la décision nationale. »

### J4 · Jeudi : deux cercles, et Hugo dans les deux

**Les réponses possibles (texte D).**
- « Famille » : Thomas, Hugo, Inès, Paul.
- « Amis » : Hugo seulement (Léa n'a pas répondu).
- Hugo est dans les deux cercles de Marie. Sans lui, la manche d'« Amis » serait vide : il y est servi (R8).
- Dans « Famille », sa réponse n'est pas servie, et son visage n'est pas proposé.

**« Famille ».**
- Réponses possibles : Thomas, Inès, Paul, toutes servies.
- Carte « qui et pourquoi », tirée : Inès. Ordre affiché : Paul, Thomas, puis Inès.
- Visages proposés : Thomas, Inès, Paul.

| Carte | Marie pose | Verdict | Point |
|---|---|---|---|
| Défavorable · « R4 » | Paul | « Tu connais ton monde. » | 1 |
| Favorable · « R1 » | Inès | « C'était Thomas. » « Ça alors ! » | 0 |
| Favorable · raison cachée | Thomas | « C'était Inès. » « Ça alors ! » « Sa raison : « R2 ». » | 0 |

**« Amis ».**
- Une seule carte : c'est la carte « qui et pourquoi ».
- Visages proposés : Léa, Hugo.

| Carte | Marie pose | Verdict | Point |
|---|---|---|---|
| Très favorable · raison cachée | Hugo, « R1 » | « Tu connais ton monde. » « Sa raison : « R2 ». » | 1 (dans « Amis ») |

- **À 18h, une révélation** : « Famille », puis « Amis », puis le vote et les auteurs une fois.
- **Avis du cercle sur D.** « Famille » : D, D, F, F, TF, « Ton cercle, lui, l'aurait adopté. » « Amis » : deux réponses, rien.
- Points du jour : 1 dans « Famille », 1 dans « Amis ».
- **Répondre (texte E).** Marie : D · R3 (s = 0, donc π = innovation ; ρ = innovation) : « Aujourd'hui, tu as fait passer l'innovation avant la précaution. »

### J5 · Vendredi : 18h arrive en pleine manche

**Les réponses possibles (texte E).**
- Léa a répondu cette fois : « Amis » a Hugo et Léa ; « Famille », Thomas, Hugo, Inès, Paul.
- Sans Hugo, aucune des deux manches ne serait vide : un tirage invisible le place dans « Famille ».
- « Amis » : une carte, celle de Léa, et le visage de Hugo n'y est pas proposé.

**« Famille », le choix des cartes.**
- Places (s = 0) : Thomas 1/4 ; Hugo 1/4 ; Inès 1 ; Paul 1/2. Médiane : (1/4 + 1/2) / 2 = 3/8.
- Surprises : Inès 5/8 ; Thomas, Hugo, Paul 1/8 (ordre tiré : Paul, Hugo, Thomas).
- Places 1 et 2 : Inès, Paul. Place 3, tirée parmi Hugo et Thomas : Hugo.
- Carte « qui et pourquoi », tirée : Hugo. Ordre affiché : Inès, Paul, puis Hugo.

**Ce qui se passe.**
- À 12h, Marie pose Inès sur la première carte et Thomas sur la deuxième, puis ferme l'appli sans toucher « Valider ». La manche reste un brouillon.
- Paul, lui, a validé sa manche à 14h : elle est figée.
- Thomas n'a pas ouvert Deviner de la journée. Sa manche n'a pas de cartes ; à 18h, sa révélation commence au vote.
- Marie joue « Amis » à 12h05 : elle pose Léa sur la carte unique, « R1 », valide. Juste, et la raison aussi. Un seul visage était proposé : seul le « pourquoi » restait à deviner. C'est la conséquence de R8 dans un cercle de trois (section 9).
- **À 18h, la manche de Marie se ferme telle quelle.**

| Carte | État à 18h | Verdict | Point |
|---|---|---|---|
| Très défavorable · « R4 » | Inès | « Tu connais ton monde. » | 1 |
| Neutre · « R1 » | Thomas | « C'était Paul. » « Ça alors ! » | 0 |
| Favorable · raison cachée | vide, donc passée | « Tu avais passé. » « C'était Hugo. » « Sa raison : « R2 ». » | 0 |

- **Avis du cercle sur E** (« Famille ») : TD, D, N, F, F. Milieu : N. « Ton cercle, lui, était partagé. »

**Répondre (texte F) : les quatre phrases du jour.**

| Joueur | Réponse | Classement (règle 17) | Phrase |
|---|---|---|---|
| Thomas | TF · R1 | π = liberté, ρ = liberté : arbitrage net | « Aujourd'hui, tu as fait passer la liberté avant la sécurité. » |
| Marie | F · R2 | π = liberté, ρ hors tension : penchant | « Aujourd'hui, tu as penché vers la liberté. » |
| Hugo | D · R4 | π = sécurité, ρ = liberté : tiraillé | « Aujourd'hui, tu as donné du poids à la sécurité comme à la liberté. » |
| Inès | N · R3 | neutre | « Aujourd'hui, tu n'as penché ni vers la sécurité ni vers la liberté. » |
| Paul | D · R3 | π = sécurité, ρ = sécurité : arbitrage net | « Aujourd'hui, tu as fait passer la sécurité avant la liberté. » |

- **Inès** a ouvert Répondre à 17h58 et validé à 18h04 : sa réponse est acceptée (règle 6). Elle a sa phrase, compte pour son portrait et pour Le Fidèle. Elle ne sera pas servie à deviner demain.

### J6 · Samedi : une manche à deux cartes

**Les réponses possibles (texte F).**
- « Amis » : Hugo seulement (Léa n'a pas répondu). Sans lui, la manche serait vide : Hugo est servi dans « Amis ».
- « Famille » : Thomas, Paul. La réponse d'Inès, arrivée après 18h, n'est pas servie ; celle de Hugo est dans « Amis ».
- « Famille » a donc deux cartes. Carte « qui et pourquoi », tirée : Thomas, en second. Ordre : Paul, puis Thomas.
- Visages proposés dans « Famille » : Thomas, Inès, Paul.

| Cercle | Carte | Marie pose | Verdict | Point |
|---|---|---|---|---|
| Famille | Défavorable · « R3 » | Paul | « Tu connais ton monde. » | 1 |
| Famille | Très favorable · raison cachée | Thomas, « R1 » | « Tu connais ton monde, et ses raisons. » | 1, raison cachée trouvée |
| Amis | Défavorable · raison cachée | Hugo, « R3 » | « Tu connais ton monde. » « Sa raison : « R4 ». » | 1 |

- **Avis du cercle sur F.** « Famille » : D, D, N (Inès, en retard, comptée), F, TF. Milieu : N. « Ton cercle, lui, était partagé. » « Amis » : deux réponses (Marie, Hugo), rien.
- **Répondre (texte G).** Marie : F · R1 (s = 0 : π = local, ρ = local) : « Aujourd'hui, tu as fait passer la décision locale avant la décision nationale. »

### J7 · Dimanche : les titres et la phrase de la semaine

**Deviner (texte G).**
- « Amis » : Hugo et Léa n'ont pas répondu. « Rien à deviner dans ce cercle aujourd'hui. »
- « Famille » : Thomas, Inès, Paul, toutes servies. Carte « qui et pourquoi », tirée : Thomas. Ordre : Paul, Inès, puis Thomas.
- Marie trouve tout : Paul, Inès, et Thomas avec « R3 ». 3 points, une raison cachée trouvée.
- **Le message de 18h** de Marie : « 18h. Qui avait dit quoi ? La révélation d'hier t'attend, et la question d'aujourd'hui. » et « Ce soir, aussi : les titres de la semaine. »
- **Avis du cercle sur G.** « Famille » : D, F, F, F (Hugo n'a pas répondu). Nombre pair, les deux du milieu : F et F. « Ton cercle, lui, l'aurait adopté. » « Amis » : une réponse, rien.
- **Répondre (texte H).** Marie : N · R1 : « Aujourd'hui, tu n'as penché ni vers la tradition ni vers le changement. »

**Les comptes de la semaine dans « Famille »** (les manches de Marie sont celles de J1 à J7 ; celles des autres sont des entrées).

| Devineur | Jours avec cartes | Justes | Erreurs | Passes | Raisons cachées trouvées |
|---|---|---|---|---|---|
| Thomas | 5 (pas joué mardi ; Deviner jamais ouvert vendredi) | 9 | 4 | 0 | 2 |
| Marie | 7 | 14 | 5 | 1 | 4 |
| Hugo | 6 (pas joué samedi) | 11 | 0 | 2 | 2 |
| Inès | 7 | 9 | 8 | 1 | 1 |
| Paul | 7 | 14 | 6 | 0 | 3 |

| Auteur des cartes | Tentatives (passes exclues) | Erreurs | Part |
|---|---|---|---|
| Thomas | 15 | 4 | 4/15 |
| Marie | 16 | 4 | 1/4 |
| Hugo | 16 | 4 | 1/4 |
| Inès | 18 | 6 | 1/3 |
| Paul | 15 | 5 | 1/3 |

| Texte deviné | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|
| Attributions (passes exclues) | 14 | 13 | 9 | 10 | 8 | 12 | 14 |
| Fausses | 4 | 2 | 3 | 5 | 4 | 3 | 2 |
| Part | 2/7 | 2/13 | 1/3 | 1/2 | 1/2 | 1/4 | 1/7 |

*Contrôle : 80 attributions et 23 erreurs dans les trois tableaux ; 57 justes = 80 − 23.*

**Les titres** (à 18h, après la révélation).
- **Le Devin** : Marie et Paul ont 14 points. Raisons cachées trouvées : Marie 4, Paul 3. **Marie.**
- **Le Mystère** : tous ont au moins 6 tentatives et 1 erreur. Inès et Paul ont la plus forte part, 1/3 ; Inès a plus d'erreurs (6 contre 5). **Inès.**
- **Le Fidèle** : réponses aux textes B à H. Thomas n'a pas répondu à C, Hugo à G. Inès a répondu à F à 18h04, accepté. **Marie, Inès, Paul.**
- **La surprise de la semaine** : D et E ont la même part, 1/2 ; D a plus d'erreurs (5 contre 4). **Le texte D.**
- **Le Sans-Faute** : personne. Hugo n'a fait aucune erreur, mais il a passé deux cartes.
- « Amis » a ses propres titres, calculés de même (non détaillés).

**La phrase de la semaine de Marie** (textes B à H).
- Aucune tension n'est devenue nette.
- Poids par tension :
  - P : B et E, deux arbitrages nets vers l'innovation, écart 2 ;
  - L : D et G, deux vers la décision locale, écart 2 ;
  - T : C seul a un poids (H est neutre) : une seule réponse qui compte, tension écartée ;
  - S : F seul, penchant 1/2 : tension écartée.
- P et L sont à égalité (écart 2, total 2) ; l'ordre des tensions retient P.
- Phrase : « Cette semaine, entre précaution et innovation, tu as le plus souvent choisi l'innovation. »
- Les deux autres formes, sur des poids donnés :
  - P : 1 vers l'innovation et 1 vers la précaution, et rien d'autre qui compte deux fois : « Cette semaine, entre précaution et innovation, tu as penché autant d'un côté que de l'autre. » ;
  - aucune tension avec deux réponses qui comptent, aucun curseur net : « Cette semaine, ton portrait est encore flou. Chaque réponse le précise. » ; avec un curseur net : pas de phrase ce dimanche.

### J8 · Semaine 13, mardi : un curseur net, un Pas de Côté, une barre pleine

**Deviner (texte K, Famille ; S, s = 0, favorable sert la sécurité).**
- Raisons de K : R1 pour, sécurité ; R2 pour, sécurité ; R3 contre, liberté ; R4 contre, liberté.
- Réponses : Thomas TD · R3 ; Hugo F · R1 ; Inès F · R2 ; Paul D · R3. Aucune n'est identique à une autre.
- Curseurs S vus par Marie (entrée et textes révélés, règle 19) :
  - Thomas : W = 9, Σwπ = 8, c = 10/13, net ;
  - Hugo : W = 13/2, Σwπ = 1, c = 2/7, flou ;
  - Inès : W = 8, Σwπ = 0, c = 1/6, net ;
  - Paul : W = 12, Σwπ = 0, c = 1/8, net.

| Auteur | x | Curseur | Surprise |
|---|---|---|---|
| Thomas | 1 | net | \|1 − 10/13\| = 3/13 |
| Hugo | 1/4 | flou | \|1/4 − 1/2\| = 1/4 (médiane des x : 1/2) |
| Inès | 1/4 | net | \|1/4 − 1/6\| = 1/12 |
| Paul | 3/4 | net | \|3/4 − 1/8\| = 5/8 |

- Classement : Paul, Hugo, Thomas, Inès. Places 1 et 2 : Paul, Hugo. Place 3, tirée parmi Thomas et Inès : Inès.
- Carte « qui et pourquoi », tirée : Hugo. Ordre : Paul, Inès, puis Hugo.
- Marie s'attend à la sécurité chez Paul : elle pose Thomas sur « Défavorable · « R3 » ». Faux, « C'était Paul. » Inès : juste. Hugo, « R1 » : juste, et la raison aussi.

**Le Pas de Côté de Paul.**
- Avant K, son curseur S : W = 12, Σwπ = 0, c = 1/8. Il est net, et |1/8 − 1/2| = 3/8 ≥ 7/20.
- Sa réponse à K, D · R3, est un arbitrage net vers la liberté, à l'opposé.
- **Pas de Côté.** Il est annoncé dans « Famille » à 18h, à la révélation de K, après les auteurs. Il reste sous le visage de Paul jusqu'aux titres de dimanche.
- Après K : W = 13, c = 3/17 ; |3/17 − 1/2| ≈ 0,32 < 7/20. Il faudra d'autres réponses de sécurité avant qu'un nouveau Pas de Côté soit possible sur S.

**Répondre (texte N ; L, s = 0, favorable sert la décision locale).**
- Marie : F · R1, un arbitrage net vers la décision locale. Son curseur L passe de W = 7, Σwπ = 1 (c = 3/11) à W = 8, Σwπ = 1 (c = 1/4) : **il devient net.**
- C'est sa soixantième réponse, entrée comprise. **La barre est pleine** ; elle se montre pleine à la prochaine ouverture de Moi, puis disparaît.

**Moi, chez Marie** (son portrait complet, ce mardi soir).

| Rang | Tension | W | c | État |
|---|---|---|---|---|
| 1 | précaution / innovation | 17/2 | 19/25 (écart à 1/2 : 13/50) | net |
| 2 | décision locale / décision nationale | 8 | 1/4 (écart : 1/4) | net |
| 3 | sécurité / liberté | 6 | 13/20 | flou, ℓ = 17/40 |
| 4 | tradition / changement | 5 | 4/9 | flou, ℓ = 41/80 |
| 5 | solidarité collective / responsabilité individuelle | 3 | 3/7 | flou, ℓ = 11/16 |
| 6 | égalité / mérite | 2 | 1/2 | flou, ℓ = 31/40 |
| 7 | souveraineté / ouverture | 3/2 | 4/11 | flou, ℓ = 131/160 |
| 8 | État / marché | 0 | 1/2 | flou, ℓ = 19/20 |

Son curseur P est net depuis la semaine 9.

### J9 · Semaine 13, dimanche : une tension devenue nette, les tempéraments

**La phrase de la semaine de Marie.**
- Au dimanche précédent, son seul curseur net était P. Aujourd'hui, P et L sont nets : L est devenue nette.
- Phrase : « Entre local et national, tu choisis le plus souvent la décision locale. » (c = 1/4, du côté du pôle 0).

**Les tempéraments dans « Famille »** (5 membres ; 56 jours ; comptes donnés en entrée).

| Membre | Réponses | Mesure | Seuil | Résultat |
|---|---|---|---|---|
| Thomas | 19 | — | il faut 20 réponses | aucun ; il perd ceux qu'il avait |
| Marie | 50 | Le Pont : Neutre peu partagé sur 7 des 31 textes partagés, 7/31 ≈ 0,23 | 1/4 pour l'obtenir, 1/5 pour le garder | **Le Pont, gardé** (obtenu en semaine 11) |
| Paul | 52 | dans un tiers ou moins du cercle sur 14 de 52 textes, 14/52 ≈ 0,27 | 1/4 (cinq membres) | **L'Original** |
| Hugo | 47 | « Très … » sur 24 de 47, ≈ 0,51 | 1/2 | **Le Tranché** |
| Inès | 44 | Neutre sur 15 de 44, ≈ 0,34 | 1/3 | **Le Mesuré** |

- Dans « Amis » (3 membres), Marie est seule de son côté sur 19 de ses 44 réponses, ≈ 0,43 ≥ 2/5 : **L'Original**.
- **Dans Moi**, Marie lit, dans l'ordre : « L'Original (Amis) », « Le Pont (Famille) ».
- **Sous son visage dans « Famille »** : « Le Pont ». Dans « Amis » : « L'Original ».

### J10 · Semaine 14 : un départ, une arrivée, un texte corrigé

**Lundi.** Paul est Le Devin de la semaine 13 ; le titre s'affiche sous son visage. Tous répondent au texte M.

**Mardi, 11h : Paul quitte « Famille ».**
- Sa réponse à M part avec lui. Sa carte, dans la manche de Marie sur M, disparaît : elle ne comptera ni juste ni fausse.
- Son visage disparaît des visages proposés. Marie l'avait posé sur la carte d'Inès : cette carte redevient vide. À elle de la reposer avant 18h ; sinon, elle sera passée.
- La carte « qui et pourquoi » était celle de Thomas : elle reste.
- Dans les titres passés : « Semaine 13 · Le Devin : un ancien membre. » Le titre n'est pas redonné.
- L'avis du cercle sur M, mardi à 18h, compte quatre réponses.
- Paul ne peut plus être Le Mystère de la semaine 14.

**Mercredi, 10h : Zoé entre, invitée par Inès.**
- La manche du mercredi (texte du mardi) est ouverte : Zoé la joue tout de suite (D-039). Elle devine des réponses à un texte qu'elle n'a jamais lu.
- Pour les autres, son visage n'est pas proposé sur le texte du mardi : il s'est fermé mardi à 18h, avant son arrivée.
- Elle répond au texte du mercredi, ouvert jusqu'à 18h. Jeudi, sa carte peut être servie, et son visage est proposé.
- Elle ne peut pas être Le Fidèle de la semaine 14.

**Jeudi : le texte N de J8 est corrigé** (une de ses trois lignes décrivait mal la mesure ; l'erreur est trouvée neuf jours après).
- Erratum daté au registre. N sort de tous les portraits.
- Marie n'a pas répondu à d'autres textes L depuis. Son curseur L revient à W = 7, Σwπ = 1 : c = 3/11, ℓ = 27/80. **Il n'est plus net.**
- Sa barre reste pleine (elle ne recule jamais). Les points de la manche sur N, l'avis du cercle sur N et Le Fidèle de la semaine 13 ne changent pas.
- Si L redevient net un jour, la phrase du dimanche dira de nouveau « devenue nette ».

---

## 7. Question pour vous

**Règles** — Validez-vous ces règles chiffrées, d'un geste, comme les règles de détail du bilan (D-030) ?

- **Valider tout (Recommandé)** — Elles ferment les points ouverts sans changer le jeu ; les décisions touchées sont dites (section 8).
- **Valider, sauf l'exception** — Un nouveau venu resterait proposé sur un texte d'avant son arrivée (D-011 tel quel).
- **Relire d'abord** — Vous lisez la section 3, puis vous répondez.

---

## 8. Décisions touchées

**Modifiée, explicitement.**
- **D-011** (« au Deviner, tous les autres membres sont proposés, y compris ceux en pause »). Seconde exception, après R8 : un membre arrivé après la fermeture d'un texte n'est pas proposé sur ce texte (règle 8). Il ne pouvait pas y avoir répondu ; le proposer offrirait à tous une élimination gratuite, et ne cache rien, puisque son arrivée est connue du cercle. La raison de D-011 (ne jamais montrer qui a décroché) tient : un membre en pause reste proposé.

**Précisées.**
- **D-026 et D-038 (la barre)** : D-026 disait « jusqu'aux premiers curseurs nets ». La barre va jusqu'à 60 réponses, curseur net ou non, comme D-038 l'admet (une barre pleine sans curseur net). Le « seuil des trois mois » ne change pas.
- **`projet.md` §4 (Le Pont, « défini par tension, pas en moyenne globale »)** : il se juge texte par texte, sur les textes où le cercle se partage. Cela tient le « pas en moyenne globale », mais pas la lettre « par tension ». C'était déjà la lecture de l'essai 2, et le désaccord y était nommé.
- **R2 (D-030)** : la phrase « Cette semaine, ton portrait est encore flou » ne s'écrit plus chez un joueur qui a déjà un curseur net.
- **R10 (D-030)** : « quelques minutes » devient 18h10 ; « Valider » fige la manche (le mot de D-014 reste).
- **R11 (D-030)** : seuil fixé ; Le Pas de Côté vit comme un titre.
- **Règle 12 (D-010)** : Le Fidèle demande les sept textes de la semaine, y compris pour un nouveau venu. C'est la lettre de la règle ; l'essai 2 faisait autrement, par convention.
- **Règle 4 (D-010) et D-045** : sort d'une carte et d'un titre quand quelqu'un part.
- **D-025** : seuil de 3 réponses et règle de la ligne, proposés. La position d'UX, six réponses, est nommée en règle 10.

**Conventions des essais remplacées** (ce n'étaient pas des décisions) : net à W ≥ 10 (désormais 8) ; Pas de Côté à 1/5 (désormais 7/20) ; barre de 16 crans pleine au premier net (désormais 60, un cran par réponse) ; tempéraments à seuil unique (désormais par taille, avec une marge).

**Inchangées** : la promesse (D-002), la lecture A (D-010), le jumeau (D-024), l'avis du cercle tel que choisi (D-025), toutes les lignes rouges (§9).

---

## 9. Limites et doutes

**Ce que la simulation ne peut pas dire.**
- Les seuils sont réglés sur des joueurs inventés : profils tirés au hasard, une réponse sur cinq contre son profil, connaissance des proches tirée au sort. De vrais cercles seront sans doute plus homogènes (familles, amis qui se ressemblent) : moins d'Originaux, plus de Ponts, une justesse plus haute. Le réglage de mi-bêta est fait pour cela.
- La fréquence du Pas de Côté dépend de ce que l'on ignore le plus : à quelle fréquence de vrais joueurs répondent franchement contre leur penchant. Nous l'avons rendu rare par le seuil, et non par la mesure.
- Le temps est simulé : personne ne se lasse, personne ne revient « pour voir ». Les décrochages sont tirés au sort.
- Les nouveaux venus et les joueurs dans plusieurs cercles ne sont pas simulés ; leurs règles sont réglées à la main (J4, J5, J6, J10).

**Ce qui nous inquiète.**
- **Le cercle de trois** : fragile (sommeil, avis du cercle un soir sur deux), et ses titres deviennent faciles (Le Sans-Faute dans 7 cercles sur 10). C'est un constat pour la bêta, pas une proposition : D-006 tient.
- **Le Sans-Faute** est hors d'atteinte dès cinq membres dans nos cercles, et presque banal à trois. R7 prévoit d'y revenir à mi-bêta ; une règle qui ne dépend pas de la taille du cercle reste à trouver.
- **Le Pas de Côté s'annonce à tout le cercle.** Il apprend à tous que la réponse de Paul allait contre son curseur, donc son côté sur ce texte, même à ceux qui n'avaient pas sa carte. Le §4 (« annoncés au cercle ») l'a voulu ; c'est une fuite du même ordre que l'avis du cercle (D-025). Juridique devrait l'ajouter à « Qui, durée, droits » (signalé, pas une question pour vous).
- **Retirer un texte corrigé du portrait** peut faire perdre un curseur net (J10). C'est honnête, mais déroutant si cela arrive souvent : c'est un argument de plus pour une chaîne des textes fiable.
- **Le seuil 8** fait arriver le premier curseur net vers deux mois. La phrase de 5.11 (« environ trois mois pour les premiers curseurs nets ») reste vraie en gros, puisque les trois ou quatre premiers arrivent vers trois mois. UX la relit déjà à l'étape 6.

**À vérifier avec de vraies personnes (bêta).**
- La justesse réelle, toujours lue contre le hasard de chaque manche (D-041), et l'écart entre cercles de 3, 5 et 10.
- Le moment du premier curseur net chez les joueurs réguliers : vers la semaine 8 ?
- La part des joueurs qui ont chaque tempérament, et ce qu'ils en comprennent sans explication.
- Le Pas de Côté : rare, et bien reçu, ou vécu comme un reproche ?
- La barre : fait-elle revenir, et sa disparition passe-t-elle inaperçue ?
- Le cercle de trois : combien s'endorment, combien grandissent ?
