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
  # Mode interface (a-interface) : durées, carnet et copies, comparés aussi par le contrôle 13.
  if [ -f "$D/$id/durees.json" ]; then extra="--durees $D/$id/durees.json --textes $D/$id/textes-C"; else extra=""; fi
  python3 -I "$CTRL" rejouer --scelle "$SCELLE" $extra --sortie "$D/$id/trace-C.json" "$j" > "$D/$id/rejeu-C.txt" 2>&1 || { echo "$id : rejeu C en échec (voir $id/rejeu-C.txt)" >> "$D/resultats.txt"; code=1; continue; }
  r=$(python3 -I "$CTRL" comparer-traces "$D/$id/trace-P.json" "$D/$id/trace-C.json" 2>&1) || code=1
  if [ -f "$D/$id/carnet-P.txt" ]; then
    copies=""; for c in "$D/$id"/copie-*-P.txt; do [ -f "$c" ] && copies="$copies --copie $c"; done
    r="$r ; $(python3 -I "$CTRL" carnets --carnet "$D/$id/carnet-P.txt" $copies "$D/$id/trace-C.json" 2>&1 | tr '\n' ' ')" || code=1
  fi
  echo "$id : $r" >> "$D/resultats.txt"
done
cat "$D/resultats.txt"; exit $code
