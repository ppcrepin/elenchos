#!/usr/bin/env bash
# Contrôle 14 (g) : preuve de publication (simulation.md, §9, contrôle 14 g et « Correctif » ; §8.8, les trois
# fichiers de gh-pages). Second essai (simulation-2.md, §8.8 « Publication », contrôle 14 g : « la publication est un
# remplacement ») : même adresse, mêmes trois fichiers, même image ; en plus, si PRECEDENT est donné, le commit de
# gh-pages du premier essai est un ancêtre du commit donné (gh-pages jamais réécrite).
# Lancé par la tâche GitHub Actions `essai2-preuve-publication.yml` (`essai-preuve-publication.yml` au premier essai), depuis la racine du
# dépôt (historique complet, branche gh-pages comprise). Lecture seule : rien n'est écrit dans le dépôt ni poussé.
#
# Entrées (variables d'environnement) :
#   COMMIT   commit de gh-pages attendu (SHA complet, 40 caractères)
#   ATTENDU  SHA-256 attendu de essai/index.html (64 caractères, recopié du rapport de construction)
#   DEPOT    propriétaire/dépôt (ppcrepin/elenchos)
#   PRECEDENT commit de gh-pages publié avant celui-ci (premier essai), facultatif : remplacement sans réécriture
#   GH_TOKEN jeton éphémère de la tâche, en lecture seule (l'API Pages l'exige) ; jamais écrit au journal
# Réglables pour un essai local : PAGE_TEST (commit de la page-test v2), ADRESSE (page servie), API, DISTANT (dépôt
# distant pour lire le sommet de gh-pages), ECART_MIN (secondes, 600).
#
# Le journal dit « juste » ou « FAUX » pour chaque point, quelques lignes d'information (empreintes, en-têtes,
# heures ; aucune valeur du jeu), et finit par « preuve de publication : réussie » ou « échouée ».
set -u

DEPOT=${DEPOT:-ppcrepin/elenchos}
COMMIT=${COMMIT:-}
ATTENDU=${ATTENDU:-}
PRECEDENT=${PRECEDENT:-}
PAGE_TEST=${PAGE_TEST:-b5d7d00767ccd682dc791ef139ff48f450b1a8d6} # « Publier la page-test de l'icône (version 2) »
ADRESSE=${ADRESSE:-https://ppcrepin.github.io/elenchos/essai/}
API=${API:-https://api.github.com}
DISTANT=${DISTANT:-origin}
ECART_MIN=${ECART_MIN:-600}
TRAVAIL=$(mktemp -d)
trap 'rm -rf "$TRAVAIL"' EXIT

nfaux=0
point() { # point CONDITION(0 = vrai) LIBELLÉ
  if [ "$1" = 0 ]; then echo "juste : $2"; else echo "FAUX : $2"; nfaux=$((nfaux + 1)); fi
}
info() { echo "  $1"; }
fin() {
  if [ "$nfaux" = 0 ]; then echo "preuve de publication : réussie"; exit 0; fi
  echo "preuve de publication : échouée"; exit 1
}
sha_de() { sha256sum "$1" | cut -c1-64; }
AUTH=()
if [ -n "${GH_TOKEN:-}" ]; then AUTH=(-H "Authorization: Bearer $GH_TOKEN"); fi
api() { # api CHEMIN SORTIE [ACCEPT] : écrit le corps dans SORTIE, rend le code HTTP
  local c
  c=$(curl -sS --max-time 60 -o "$2" -w '%{http_code}' -H "Accept: ${3:-application/vnd.github+json}" \
    -H 'X-GitHub-Api-Version: 2022-11-28' "${AUTH[@]}" "$API$1" 2> "$TRAVAIL/erreur-curl")
  echo "${c:-000}"
}
json() { # json FICHIER CLÉ[.SOUS-CLÉ] : valeur, ou vide (données reçues : lues par python3 -I, sans exécution)
  python3 -I -c 'import json, sys
try:
    v = json.load(open(sys.argv[1], encoding="utf-8"))
    for k in sys.argv[2].split("."):
        v = v.get(k) if isinstance(v, dict) else None
    print("" if v is None else v)
except Exception:
    print("")' "$1" "$2"
}
entete() { # entete FICHIER NOM : valeur du dernier en-tête de ce nom (insensible à la casse), ou « absent »
  local v
  v=$(tr -d '\r' < "$1" | awk -v n="$(echo "$2" | tr 'A-Z' 'a-z')" 'BEGIN { FS = ": " } { k = tolower($1); if (k == n) { sub(/^[^:]*: /, ""); v = $0 } } END { print v }')
  echo "${v:-absent}"
}
lire() { # lire ADRESSE PRÉFIXE : corps décompressé dans PRÉFIXE.corps, en-têtes dans PRÉFIXE.entetes ; rend le code
  local c
  : > "$2.entetes"; : > "$2.corps"
  c=$(curl -sS --compressed --max-time 60 -D "$2.entetes" -o "$2.corps" -w '%{http_code}' "$1" 2> "$2.erreur")
  echo "${c:-000}"
}
releve() { # releve PRÉFIXE CODE : en-têtes de réponse relevés (pas des valeurs du jeu)
  if [ "$2" = 000 ]; then info "aucune réponse : $(head -n 1 "$1.erreur" 2> /dev/null)"; return; fi
  info "code $2 ; content-type : $(entete "$1.entetes" content-type) ; content-encoding : $(entete "$1.entetes" content-encoding)"
  info "cache-control : $(entete "$1.entetes" cache-control) ; etag : $(entete "$1.entetes" etag) ; last-modified : $(entete "$1.entetes" last-modified)"
  info "age : $(entete "$1.entetes" age) ; x-cache : $(entete "$1.entetes" x-cache)"
}

echo "Preuve de publication (contrôle 14 g) : dépôt $DEPOT"
echo "Rappel : à lancer au moins dix minutes après la fin du déploiement Pages (cache de GitHub Pages) ; l'écart est vérifié au point 4."

# 0. Entrées
echo "$COMMIT" | grep -Eq '^[0-9a-f]{40}$'; point $? "entrée : commit de gh-pages, SHA complet de 40 caractères"
echo "$ATTENDU" | grep -Eq '^[0-9a-f]{64}$'; point $? "entrée : SHA-256 attendu de essai/index.html, 64 caractères"
[ "$nfaux" = 0 ] || fin
info "commit attendu : $COMMIT"
info "SHA-256 attendu de essai/index.html : $ATTENDU"

# 1. Arbre du commit donné
if ! git cat-file -e "$COMMIT^{commit}" 2> /dev/null; then git fetch -q --no-tags "$DISTANT" "$COMMIT" 2> /dev/null; fi
git cat-file -e "$COMMIT^{commit}" 2> /dev/null; present=$?
point $present "1. le commit donné est dans le dépôt"
[ "$present" = 0 ] || fin
sommet=$(git ls-remote "$DISTANT" refs/heads/gh-pages 2> /dev/null | cut -c1-40)
[ "$sommet" = "$COMMIT" ]; point $? "1. le commit donné est le sommet de gh-pages (lu au dépôt distant : ${sommet:-illisible})"
git ls-tree -r --full-tree "$COMMIT" > "$TRAVAIL/arbre"
printf '100644 blob .nojekyll\n100644 blob essai/apple-touch-icon.png\n100644 blob essai/index.html\n' > "$TRAVAIL/arbre-attendu"
awk -F '\t' '{ split($1, a, " "); print a[1] " " a[2] " " $2 }' "$TRAVAIL/arbre" | LC_ALL=C sort > "$TRAVAIL/arbre-lu"
cmp -s "$TRAVAIL/arbre-lu" "$TRAVAIL/arbre-attendu"; arbre=$?
point $arbre "1. arbre : exactement .nojekyll, essai/index.html et essai/apple-touch-icon.png, fichiers ordinaires"
if [ "$arbre" != 0 ]; then while IFS= read -r l; do info "dans l'arbre : $l"; done < "$TRAVAIL/arbre-lu"; fi
if [ -n "$PRECEDENT" ]; then
  if ! git cat-file -e "$PRECEDENT^{commit}" 2> /dev/null; then git fetch -q --no-tags "$DISTANT" "$PRECEDENT" 2> /dev/null; fi
  [ "$PRECEDENT" != "$COMMIT" ] && git merge-base --is-ancestor "$PRECEDENT" "$COMMIT" 2> /dev/null
  point $? "1. remplacement : le commit publié précédent (${PRECEDENT:0:7}) est un ancêtre du commit donné, gh-pages n'a pas été réécrite"
fi
if git cat-file blob "$COMMIT:essai/index.html" > "$TRAVAIL/page-git" 2> /dev/null; then sha_page_git=$(sha_de "$TRAVAIL/page-git"); else sha_page_git=absent; fi
info "SHA-256 de essai/index.html lu par Git : $sha_page_git ($(wc -c < "$TRAVAIL/page-git" 2> /dev/null || echo 0) octets)"
[ "$sha_page_git" = "$ATTENDU" ]; point $? "1. SHA-256 de l'objet essai/index.html, lu par Git, égal à la valeur attendue"
code=$(api "/repos/$DEPOT/contents/essai/index.html?ref=$COMMIT" "$TRAVAIL/page-api" "application/vnd.github.raw+json")
if [ "$code" = 200 ]; then sha_page_api=$(sha_de "$TRAVAIL/page-api"); else sha_page_api="illisible (code $code)"; fi
info "SHA-256 de essai/index.html lu par l'API GitHub (contenu du fichier à ce commit) : $sha_page_api"
[ "$sha_page_api" = "$ATTENDU" ]; point $? "1. SHA-256 de essai/index.html, lu par l'API GitHub, égal à la valeur attendue"
icone=$(git rev-parse -q --verify "$COMMIT:essai/apple-touch-icon.png" 2> /dev/null)
icone_test=$(git rev-parse -q --verify "$PAGE_TEST:essai/apple-touch-icon.png" 2> /dev/null)
if [ -n "$icone" ]; then git cat-file blob "$icone" > "$TRAVAIL/icone-git"; sha_icone_git=$(sha_de "$TRAVAIL/icone-git"); else sha_icone_git=absent; fi
if [ -n "$icone_test" ]; then sha_icone_test=$(git cat-file blob "$icone_test" | sha256sum | cut -c1-64); else sha_icone_test="absent (page-test ${PAGE_TEST:0:7} illisible)"; fi
info "SHA-256 de essai/apple-touch-icon.png : $sha_icone_git ; à la page-test v2 (${PAGE_TEST:0:7}) : $sha_icone_test"
[ -n "$icone" ] && [ "$icone" = "$icone_test" ] && cmp -s "$TRAVAIL/icone-git" <(git cat-file blob "$icone_test"); point $? "1. image de l'icône identique octet pour octet à celle de la page-test v2 (${PAGE_TEST:0:7})"

# 2. API Pages : dernière construction
code=$(api "/repos/$DEPOT/pages" "$TRAVAIL/site")
site_type=$(json "$TRAVAIL/site" build_type); site_branche=$(json "$TRAVAIL/site" source.branch); site_chemin=$(json "$TRAVAIL/site" source.path)
info "API Pages, site : code $code ; type de construction ${site_type:-illisible} ; source ${site_branche:-illisible} ${site_chemin} ; état $(x=$(json "$TRAVAIL/site" status); echo "${x:-illisible}")"
code=$(api "/repos/$DEPOT/pages/builds/latest" "$TRAVAIL/construction")
etat=$(json "$TRAVAIL/construction" status); commit_pages=$(json "$TRAVAIL/construction" commit)
debut=$(json "$TRAVAIL/construction" created_at); finc=$(json "$TRAVAIL/construction" updated_at)
info "API Pages, dernière construction : code $code ; état ${etat:-illisible} ; commit ${commit_pages:-illisible} ; erreur : $(x=$(json "$TRAVAIL/construction" error.message); [ "$code" = 200 ] && echo "${x:-aucune}" || echo "non lue")"
[ "$etat" = built ]; point $? "2. dernière construction Pages à l'état « built »"
[ "$commit_pages" = "$COMMIT" ]; point $? "2. commit de la dernière construction égal au commit donné"
echo "heure de publication (fin de la dernière construction Pages, donnée par GitHub) : ${finc:-illisible} (début : ${debut:-illisible})"

# 3. Page servie, lue depuis cette machine
lecture=$(date -u +%s)
echo "lecture de la page servie : $(date -u -d "@$lecture" +%Y-%m-%dT%H:%M:%SZ) (horloge de la machine)"
code=$(lire "$ADRESSE" "$TRAVAIL/servie-page")
if [ "$code" = 200 ]; then sha_servie=$(sha_de "$TRAVAIL/servie-page.corps"); else sha_servie="illisible (code $code)"; fi
info "$ADRESSE : SHA-256 du corps décompressé : $sha_servie"
releve "$TRAVAIL/servie-page" "$code"
[ "$code" = 200 ] && [ "$sha_servie" = "$sha_page_git" ] && [ "$sha_servie" = "$ATTENDU" ]; point $? "3. page servie : code 200, corps décompressé identique à l'objet Git essai/index.html"
code=$(lire "${ADRESSE}apple-touch-icon.png" "$TRAVAIL/servie-icone")
if [ "$code" = 200 ]; then sha_servie_icone=$(sha_de "$TRAVAIL/servie-icone.corps"); else sha_servie_icone="illisible (code $code)"; fi
info "${ADRESSE}apple-touch-icon.png : SHA-256 du corps décompressé : $sha_servie_icone"
releve "$TRAVAIL/servie-icone" "$code"
[ "$code" = 200 ] && [ "$sha_servie_icone" = "$sha_icone_git" ]; point $? "3. image servie : code 200, corps décompressé identique à l'objet Git essai/apple-touch-icon.png"
# seconde lecture avec un paramètre anti-cache : pour la comparaison seulement, hors verdict
anti_cache() { # anti_cache NOM ADRESSE SHA_GIT
  local code s
  code=$(lire "$2?preuve-anti-cache=$lecture" "$TRAVAIL/anti-cache")
  if [ "$code" = 200 ]; then s=$(sha_de "$TRAVAIL/anti-cache.corps"); else s=illisible; fi
  info "(comparaison, hors verdict) $1 relue avec un paramètre anti-cache : identique à l'objet Git : $([ "$s" = "$3" ] && echo oui || echo non)"
  releve "$TRAVAIL/anti-cache" "$code"
}
anti_cache page "$ADRESSE" "$sha_page_git"
anti_cache icône "${ADRESSE}apple-touch-icon.png" "$sha_icone_git"

# 4. Écart entre la fin de la construction Pages et la lecture
if [ -n "$finc" ] && t_fin=$(date -u -d "$finc" +%s 2> /dev/null); then
  ecart=$((lecture - t_fin))
  signe=""; abs=$ecart; if [ "$ecart" -lt 0 ]; then signe="-"; abs=$((-ecart)); fi
  echo "écart entre la fin de la construction Pages et la lecture de la page servie : $signe$((abs / 60)) min $((abs % 60)) s"
  [ "$ecart" -ge "$ECART_MIN" ]; point $? "4. page servie lue au moins dix minutes après la fin du déploiement"
else
  point 1 "4. page servie lue au moins dix minutes après la fin du déploiement (heure de construction illisible)"
fi

fin
