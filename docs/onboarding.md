# Onboarding (validé)

*Validé par le porteur le 4 octobre 2026 (D-006). Remplace le §7 de `docs/projet.md`. Source de vérité au même rang que `docs/vision.md`. Issu du circuit : UX, Game design, Juridique → synthèse → Cohérence + Vérificateur. Thomas crée le cercle, Marie est invitée.*

## Principe

L'invitant ne fait rien de plus que sa propre entrée ; c'est l'invitée qui devine. À la création d'un cercle, le système fixe trois textes d'archive clivants, identiques pour tous ceux qui rejoindront ce cercle (Game design propose une tension différente par texte, à vérifier sur les archives). Ils comptent pour les curseurs, ni pour les scores ni pour les titres.

## Parcours de Marie (invitée)

1. **Un message de Thomas, avec un lien personnel** : « Tu crois me connaître ? J'ai répondu à 3 vraies questions de l'Assemblée. Devine ce que j'ai dit, 2 minutes. » Le lien est à usage unique et expire ; un lien transféré ne sert qu'une fois.
2. **Le premier texte, tout de suite.** Pas d'accueil, pas de compte : trois lignes et le curseur.
3. **Au moment de donner sa position, une carte de consentement, une fois** : « Tes réponses révèlent tes opinions politiques. Elles servent au jeu : tes proches te devinent, ton portrait se dessine. Seul ton cercle les voit, elles ne sont jamais vendues. Tu peux tout effacer, quand tu veux. 15 ans et plus. — J'accepte · Qui, durée, droits ». Obligatoire avant la première réponse enregistrée (RGPD art. 9.2.a), écran dédié, un geste, rien de précoché, sans exiger d'identité. Formulation à relire par un avocat avant le lancement public ; à tester au prototype (comprise ? effrayante ?).
4. **Sa considération, puis « Et Thomas ? »** Elle devine la position de Thomas. Aussitôt, la révélation immédiate : la réponse de Thomas, le vote de l'Assemblée, l'auteur du texte, le député auteur de la considération choisie par Marie. La réponse de Marie n'est pas affichée à côté de celle de Thomas (§9, aucune mise en scène du désaccord). Textes 2 et 3, même boucle. Fin : « 2 sur 3 », non conservé ; à 0 ou 1, on compte les surprises (« Thomas t'a surpris deux fois »). Puis son esquisse : trois curseurs flous.
5. **Le compte, après la révélation** (D-005) : « Pour que Thomas sache que c'était toi, et retrouver tes réponses demain : un pseudo, ton e-mail. » Pseudo libre (§3) + e-mail vérifié par un code à six chiffres, sans bloquer le jeu. Google/Apple pourront être ajoutés en option en phase 2 (D-006) ; « Sign in with Apple » devient alors obligatoire sur l'App Store.
6. **Le cercle.** Si une manche est ouverte, elle la joue tout de suite ; sinon, la question du jour. Au compte à rebours de 18h : le geste d'ajout à l'écran d'accueil (iPhone) ou la notification (D-005). Elle peut inviter à son tour (§3).

## Parcours de Thomas (créateur)

Le même début, sans compte : trois textes, la carte de consentement au premier texte, révélation immédiate texte par texte, esquisse. Puis pseudo, e-mail, nom du cercle. Puis « Inviter » : un lien et le message pré-écrits, un toucher par personne, avec la phrase : « Tu envoies tes 3 réponses à la personne que tu invites. Ce lien est pour elle seule. » C'est son consentement explicite, base légale de ce que Marie verra (Juridique). Le service ne contacte jamais un non-membre : Thomas transmet lui-même.

Tant que le cercle n'a pas trois membres, Thomas est prévenu à chaque arrivée (« Marie t'a deviné 2 fois sur 3 ») ; dès trois membres, tout passe par le message de 18h (D-006, exception au §2 bornée). Seul, il dépose chaque soir et la révélation de 18h lui arrive comme aux autres (moment : C-006). À deux : il devine à son tour les trois réponses de Marie, sur le même écran. À trois : le cercle est lancé.

## Règle des réponses à deviner (C-002, D-006)

L'écran Deviner propose les réponses des autres membres, jusqu'à trois, chaque personne une fois. À trois membres : deux réponses, choix binaire plus la considération masquée. À quatre : trois réponses, la dernière se déduit. À partir de cinq : trois réponses dont un leurre possible, sélection du §2 (2 atypiques + 1 au hasard). Le cercle est lancé à trois membres ; une absence vide la manche, raison visible d'aller à cinq.

## Mineurs

Quinze ans et plus en v1, par déclaration dans la carte de consentement (pas de date de naissance). Parcours parent-enfant sous quinze ans : v2.

## Indicateurs

Part d'invités qui finissent les trois textes ; part de créateurs qui envoient au moins deux invitations ; part d'invités qui créent le compte après la révélation ; part qui font le geste d'ajout à l'écran d'accueil (D-005).

## Ce que le prototype manuel teste

Le message d'invitation recrute-t-il ; chaque nouveau répond aux trois textes en privé puis devine le créateur ; la carte de consentement lue avant la première réponse ; « 2 sur 3 » lance-t-il la conversation ; le créateur invite-t-il deux personnes. Non testables sur WhatsApp : lien, compte, notifications.
