#!/bin/sh
# Second essai, lot 7 (simulation-2.md, §8.8 « Construction » et « Publication » ; §9, contrôle 5) :
# la commande unique qui reconstruit la page avec les entrées réelles et écrit le rapport de construction.
# Outillage d'essai (D-001 tenu).
#
#   sh harnais/construire-final.sh AAAA-MM-JJ HH:MM [CONSULTES_LE]
#
#   AAAA-MM-JJ, HH:MM  date et heure de Paris du message de publication de l'empreinte (§8.11) :
#                      empreinte_publiee_le, empreinte_publiee_a.
#   CONSULTES_LE       facultatif ; par défaut celui de temoins/entrees-final-factices.json.
#   SCELLE=chemin      variable facultative ; par défaut le fichier final du scellement.
#   ENTREES, SORTIE, RAPPORTS : variables facultatives (essai de la commande hors du dépôt) ; par défaut ci-dessous.
#
# Lancée depuis n'importe où. Écrit, sans rien committer :
#   a-ne-pas-ouvrir-2/entrees-construction.json        (forme canonique, comme au premier essai)
#   outillage/page/sorties/construction/               porteur/index.html, temoin/index.html, version.txt,
#                                                      rapport-construction.txt (lu par la passe WebKit)
#   outillage/page/sorties/rapports/controle5.txt      contrôle 5 sur cette construction
# Puis reconstruit dans un dossier temporaire et compare les octets (mêmes entrées, mêmes octets).
# Le terminal ne reçoit que les SHA-256 et le bilan : aucune valeur du jeu.
set -eu
ICI=$(cd "$(dirname "$0")/.." && pwd)
RACINE=$(cd "$ICI/../.." && pwd)                 # docs/essai/a-ne-pas-ouvrir-2
DEPOT=$(cd "$RACINE/../../.." && pwd)
SCELLE=${SCELLE:-$RACINE/outillage/scellement/final/fichier-scelle-candidat-final.json}
ENTREES=${ENTREES:-$RACINE/entrees-construction.json}
SORTIE=${SORTIE:-$ICI/sorties/construction}
RAPPORTS=${RAPPORTS:-$ICI/sorties/rapports}
PAGE_TEST=$DEPOT/docs/essai/page-test-icone/source.html

[ $# -ge 2 ] && [ $# -le 3 ] || { echo "usage : sh harnais/construire-final.sh AAAA-MM-JJ HH:MM [CONSULTES_LE]" >&2; exit 2; }
LE=$1; A=$2; CONSULTES=${3:-}

python3 -I - "$SCELLE" "$ICI/temoins/entrees-final-factices.json" "$ENTREES" "$LE" "$A" "$CONSULTES" <<'PY'
import datetime, hashlib, json, re, sys
scelle, modele, sortie, le, a, consultes = sys.argv[1:7]
e = json.load(open(modele, encoding="utf-8"))
def date(x, nom):
    try:
        datetime.date.fromisoformat(x)
    except ValueError:
        sys.exit("refusé : %s doit être une date AAAA-MM-JJ" % nom)
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", x):
        sys.exit("refusé : %s doit être une date AAAA-MM-JJ" % nom)
date(le, "empreinte_publiee_le")
if not re.fullmatch(r"([01][0-9]|2[0-3]):[0-5][0-9]", a):
    sys.exit("refusé : empreinte_publiee_a doit être une heure HH:MM")
if consultes:
    date(consultes, "consultes_le")
    e["consultes_le"] = consultes
if le < e["consultes_le"]:
    sys.exit("refusé : l'empreinte serait publiée avant la consultation des sources")
e["empreinte_publiee_le"], e["empreinte_publiee_a"] = le, a
e["empreinte"] = hashlib.sha256(open(scelle, "rb").read()).hexdigest()
s = json.dumps(e, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
open(sortie, "w", encoding="utf-8").write(s)
print("entrées : " + s)
PY

rm -rf "$SORTIE"
mkdir -p "$SORTIE" "$RAPPORTS"
python3 -I "$ICI/construire.py" --scelle "$SCELLE" --entrees "$ENTREES" --sortie "$SORTIE" > /dev/null \
  || { echo "échoué : construction (relancer construire.py à la main pour lire le refus)"; exit 1; }

# Mêmes entrées, mêmes octets.
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
python3 -I "$ICI/construire.py" --scelle "$SCELLE" --entrees "$ENTREES" --sortie "$TMP/b" > /dev/null
for f in porteur/index.html temoin/index.html version.txt rapport-construction.txt; do
  cmp -s "$SORTIE/$f" "$TMP/b/$f" || { echo "ÉCART : deux constructions diffèrent ($f)"; exit 1; }
done

node "$ICI/harnais/controle5-2.js" --construction "$SORTIE" --scelle "$SCELLE" --page-test "$PAGE_TEST" \
  --sortie "$RAPPORTS/controle5.txt" > /dev/null \
  || { echo "ÉCART : contrôle 5 (voir $RAPPORTS/controle5.txt)"; exit 1; }

echo "SHA-256 porteur/index.html (essai/index.html publié) : $(sha256sum "$SORTIE/porteur/index.html" | cut -d' ' -f1)"
echo "SHA-256 temoin/index.html : $(sha256sum "$SORTIE/temoin/index.html" | cut -d' ' -f1)"
echo "rapport de construction : $SORTIE/rapport-construction.txt"
echo "contrôle 5 : $(grep -c '^juste : ' "$RAPPORTS/controle5.txt") justes, $(grep -c '^FAUX : ' "$RAPPORTS/controle5.txt") fausse ; $RAPPORTS/controle5.txt"
echo "réussi"
