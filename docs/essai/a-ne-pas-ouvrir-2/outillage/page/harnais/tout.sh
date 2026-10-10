#!/bin/sh
# Contrôles 5 à 14 de la page, dans l'ordre, dans l'environnement de l'équipe (Chromium) — §9.
#
#   sh harnais/tout.sh FICHIER_SCELLE ENTREES_CONSTRUCTION SORTIE [REFERENCES] [PHRASES]
#
# PHRASES : fichier des phrases attendues écrit par le programme de contrôle (schema.md, partie 4.5),
# lu par le contrôle 11 ; par défaut controle/sorties/final/phrases.json, s'il existe ; sinon le
# contrôle 11 ne fait que sa vérification provisoire (noms et dates avant la révélation) et le dit.
#
# Construit la version de la page (numéro du fichier d'entrées) et les versions 2 et 3 du harnais
# (même code, numéros suivants : correctifs simulés), puis : contrôle 5 ; journaux du harnais ;
# rejeu des parties (contrôles 6 à 10, 13 ; fuseau America/New_York) ; contrôle 11 ; contrôle 12 ;
# contrôle 14 (a, b, c, d, f, h, i, arrêts techniques) ; empreintes attendues de la passe WebKit.
# Chaque étape écrit son rapport dans SORTIE ; le script s'arrête à la première étape qui ne peut
# pas s'exécuter, pas au premier défaut (les défauts sont dans les rapports).
set -u
ICI=$(cd "$(dirname "$0")/.." && pwd)
SCELLE=$1; ENTREES=$2; SORTIE=$3; REFERENCES=${4:-$ICI/../references}; PHRASES=${5:-$ICI/../controle/sorties/final/phrases.json}
if [ -f "$PHRASES" ]; then OPT_PHRASES="--phrases $PHRASES"; else OPT_PHRASES=""; echo "contrôle 11 : fichier des phrases attendues absent ($PHRASES), vérification provisoire seulement"; fi
mkdir -p "$SORTIE"
for v in 1 2 3; do
  if [ "$v" = 1 ]; then OPT=""; else OPT="--version-page $v"; fi
  python3 -I "$ICI/construire.py" --scelle "$SCELLE" --entrees "$ENTREES" --sortie "$SORTIE/construction-v$v" $OPT > "$SORTIE/construction-v$v.log" 2>&1 \
    || { echo "construction v$v refusée : voir $SORTIE/construction-v$v.log"; exit 2; }
done
C="--construction $SORTIE/construction-v1 --construction-2 $SORTIE/construction-v2 --construction-3 $SORTIE/construction-v3"
node "$ICI/harnais/controle5.js" --construction "$SORTIE/construction-v1" --scelle "$SCELLE" --page-test "$ICI/../../../page-test-icone/source.html" --sortie "$SORTIE/rapport-controle5.txt" > /dev/null
echo "contrôle 5 : $(grep -E 'vérifications sont justes|vérification\(s\) fausse' "$SORTIE/rapport-controle5.txt")"
node "$ICI/harnais/lancer.js" journaux --scelle "$SCELLE" --references "$REFERENCES" --sortie "$SORTIE" || exit 2
node "$ICI/harnais/lancer.js" rejeu --scelle "$SCELLE" $C --journaux "$SORTIE/journaux" --sortie "$SORTIE" > "$SORTIE/rejeu.log" 2>&1
echo "rejeu : $(tail -n 1 "$SORTIE/rapport-rejeu-chromium.txt")"
node "$ICI/harnais/controle11.js" --scelle "$SCELLE" --journaux "$SORTIE/journaux" --rejeu "$SORTIE" $C --sortie "$SORTIE" $OPT_PHRASES > "$SORTIE/controle11.log" 2>&1
echo "contrôle 11 : $(tail -n 1 "$SORTIE/rapport-controle11.txt")"
node "$ICI/harnais/controle12.js" --scelle "$SCELLE" --journaux "$SORTIE/journaux" --rejeu "$SORTIE" $C --sortie "$SORTIE" > "$SORTIE/controle12.log" 2>&1
echo "contrôle 12 : $(tail -n 1 "$SORTIE/rapport-controle12.txt")"
node "$ICI/harnais/controle14.js" --scelle "$SCELLE" --journaux "$SORTIE/journaux" $C --sortie "$SORTIE" > "$SORTIE/controle14.log" 2>&1
echo "contrôle 14 : $(tail -n 1 "$SORTIE/rapport-controle14-chromium.txt")"
node "$ICI/harnais/passe-webkit.js" attendus --rejeu "$SORTIE" --journaux "$SORTIE/journaux" --sortie "$SORTIE/attendus-webkit.json"
node "$ICI/harnais/captures.js" --scelle "$SCELLE" --journaux "$SORTIE/journaux" $C --sortie "$SORTIE/captures" > "$SORTIE/captures.log" 2>&1
echo "captures : $(tail -n 2 "$SORTIE/captures.log" | tr '\n' ' ')"
