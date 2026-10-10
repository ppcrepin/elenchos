#!/bin/sh
# Rejoue chaque journal témoin dans le programme de contrôle (C) et compare sa trace à celle de la page (P).
#   sh temoins/comparer.sh FICHIER_SCELLE [DOSSIER_TEMOINS]
# Écrit DOSSIER/<id>/trace-C.json et DOSSIER/resultats.txt ; code 1 si un témoin diffère.
set -u
SCELLE="$1"; D="${2:-$(dirname "$0")}"
CTRL="$(dirname "$0")/../../controle/controle.py"
: > "$D/resultats.txt"; code=0
for j in "$D"/*/journal.json; do
  id=$(basename "$(dirname "$j")")
  python3 -I "$CTRL" rejouer --scelle "$SCELLE" --sortie "$D/$id/trace-C.json" "$j" > "$D/$id/rejeu-C.txt" 2>&1 || { echo "$id : rejeu C en échec (voir $id/rejeu-C.txt)" >> "$D/resultats.txt"; code=1; continue; }
  r=$(python3 -I "$CTRL" comparer-traces "$D/$id/trace-P.json" "$D/$id/trace-C.json" 2>&1) || code=1
  echo "$id : $r" >> "$D/resultats.txt"
done
cat "$D/resultats.txt"; exit $code
