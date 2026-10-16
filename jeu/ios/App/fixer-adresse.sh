#!/bin/sh
# Elenchos, étape 1 (coquille). Lancé par Xcode à chaque fabrication de l'application (phase « Fixer l'adresse du
# serveur », après la copie des ressources).
#
# L'adresse du serveur est fixée dans l'application au moment de la fabrication, à partir d'une seule source : le
# réglage ELENCHOS_SERVEUR, donné à xcodebuild par le workflow, qui le lit dans jeu/ios/adresse-serveur.txt
# (app-testflight.yml), ou le faux serveur local (app-simulateur.yml). Ce script la recopie dans la page embarquée, à la place de la marque __ELENCHOS_SERVEUR__, qui y
# figure deux fois : la règle de chargement (CSP, `connect-src`) et la balise lue par `public/client.js`. L'extension de
# réception lit le même réglage dans son Info.plist.
#
# Il refuse la fabrication si :
# - le réglage manque ou n'a pas la forme « https://hôte » (sans port, chemin ni « / » final) ; pour le simulateur
#   seulement, « http://localhost:port » est aussi permis (le faux serveur de app-simulateur.yml) ;
# - la page n'a pas la marque exactement deux fois.
# Il n'écrit jamais l'adresse dans le journal.

set -eu

marque='__ELENCHOS_SERVEUR__'
adresse="${ELENCHOS_SERVEUR:-}"
source_page="${SRCROOT}/App/public/index.html"
page="${TARGET_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/public/index.html"

hote='[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+'
case "${PLATFORM_NAME}" in
  iphoneos) motif="^https://${hote}\$" ;;
  iphonesimulator) motif="^(https://${hote}|http://localhost:[0-9]{2,5})\$" ;;
  *) echo "error: Elenchos : plateforme inattendue pour fixer l'adresse du serveur." ; exit 1 ;;
esac

if ! printf '%s' "${adresse}" | grep -Eq "${motif}"; then
  echo "error: Elenchos : ELENCHOS_SERVEUR absent ou mal formé (attendu : https://hôte, sans chemin)."
  exit 1
fi

if [ ! -f "${source_page}" ] || [ ! -f "${page}" ]; then
  echo "error: Elenchos : page embarquée introuvable. Lancer « npx cap sync ios » avant la fabrication."
  exit 1
fi

nombre=$(grep -o "${marque}" "${source_page}" | wc -l | tr -d ' ')
if [ "${nombre}" != "2" ]; then
  echo "error: Elenchos : la page doit porter la marque de l'adresse exactement deux fois (${nombre} trouvée(s))."
  exit 1
fi

# Toujours depuis la page d'origine : refaire la fabrication donne le même résultat.
provisoire="${page}.provisoire"
sed "s#${marque}#${adresse}#g" "${source_page}" > "${provisoire}"
mv "${provisoire}" "${page}"

if grep -q "${marque}" "${page}"; then
  echo "error: Elenchos : la marque de l'adresse est restée dans la page."
  exit 1
fi
echo "Elenchos : adresse du serveur fixée dans la page embarquée."
