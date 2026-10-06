#!/usr/bin/env python3
"""Journal « j », écrit à la main (diagnostic demandé par l'orchestrateur), puis
rejoué par C ; affiche la manche d'Odile aux séances 2, 5 et 8.

Partie témoin « j », mode moteur, sur le fichier candidat. Réponses du joueur :
E1 : 5, rang 4 ; texte 1 : 5, rang 4 ; texte 4 : 5, rang 2 ; texte 7 : 1, rang 1.
Choix libres : E2 et E3 neutres (rang 1), paris 1, 3, 3 ; aucun autre texte
quotidien répondu (ils n'entrent pas dans les manches d'Odile sur S) ; toutes les
cartes passées et la manche validée ; ni carnet, ni « En attendant ».
Une séance par jour à 18h05, du dimanche 18 octobre 2026 au lundi 2 novembre
(heure d'hiver dès le 25 octobre).
"""

import sys
from pathlib import Path

ICI = Path(__file__).resolve().parent
sys.path.insert(0, str(ICI.parent))

import controle  # noqa: E402
from ec import canon  # noqa: E402
from ec.cli2 import rejouer_fichiers  # noqa: E402
from ec.jeu import LIBELLE_NIVEAU  # noqa: E402
from ec.tirage import sha256_hex  # noqa: E402

OUVERTURES = [
    "2026-10-18T18:05+02:00", "2026-10-19T18:05+02:00", "2026-10-20T18:05+02:00", "2026-10-21T18:05+02:00",
    "2026-10-22T18:05+02:00", "2026-10-23T18:05+02:00", "2026-10-24T18:05+02:00", "2026-10-25T18:05+01:00",
    "2026-10-26T18:05+01:00", "2026-10-27T18:05+01:00", "2026-10-28T18:05+01:00", "2026-10-29T18:05+01:00",
    "2026-10-30T18:05+01:00", "2026-10-31T18:05+01:00", "2026-11-01T18:05+01:00", "2026-11-02T18:05+01:00",
]
# nombre de cartes servies au joueur, séances 2 à 14 (constantes du candidat)
CARTES = {2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3, 11: 2, 12: 3, 13: 3, 14: 3}
REPONSES = {"1": {"niveau": 5, "raison": 4}, "4": {"niveau": 5, "raison": 2}, "7": {"niveau": 1, "raison": 1}}


def coups(k):
    c = {"carnet": {"q1": None, "q2": None, "q3": None}, "consentement": None, "deviner": None,
         "entree": None, "pseudo": None, "relire": 0, "reponse": None}
    if k == 0:
        c["consentement"] = True
        c["pseudo"] = "Témoin-j-4821-k"
        c["entree"] = {
            "E1": {"reponse": {"niveau": 5, "raison": 4}, "pari": 1},
            "E2": {"reponse": {"niveau": 3, "raison": 1}, "pari": 3},
            "E3": {"reponse": {"niveau": 3, "raison": 1}, "pari": 3},
        }
    if 2 <= k <= 14:
        c["deviner"] = [{"designe": "passe", "raison": None} for _ in range(CARTES[k])]
    if 1 <= k <= 14:
        c["reponse"] = REPONSES.get(str(k))
    return c


def journal(octets_scelle):
    return {
        "format": "elenchos-essai-journal", "version": 3, "empreinte_scelle": sha256_hex(octets_scelle),
        "partie": {"id": "j", "mode": "moteur", "graine": None},
        "seances": [{"k": k, "ouverture": OUVERTURES[k], "versions": None, "etapes": None,
                     "coups": coups(k), "attente": None} for k in range(16)],
        "copies": [],
        "arret": None,
        "fin": {"f2": None, "f1": {p: {t: None for t in "SPTL"} for p in ("Agathe", "Nassim", "Odile", "Valentin")}},
    }


def main():
    octets = controle.CANDIDAT.read_bytes()
    j = journal(octets)
    (ICI / "journal-j.json").write_bytes(canon.octets_canoniques(j))
    t, defauts = rejouer_fichiers(str(controle.CANDIDAT), str(ICI / "journal-j.json"))
    if t is None:
        raise SystemExit("\n".join(defauts))
    (ICI / "trace-c-j.json").write_bytes(canon.octets_canoniques(t))
    reps = canon.lire_strict(octets)["reponses"]
    L = ["Journal « j » rejoué par C (mode moteur) — manche d'Odile aux séances 2, 5 et 8",
         f"Journal : SHA-256 {sha256_hex(canon.octets_canoniques(j))} ; défauts au rejeu : {defauts or 'aucun'}", ""]
    for k in (2, 5, 8):
        m = t["seances"][k]["manches"]["Odile"]
        tid = m["texte"]
        L.append(f"Séance {k}, texte {tid} ({canon.lire_strict(octets)['textes'][tid]['tension']}, "
                 f"s = {canon.lire_strict(octets)['textes'][tid]['sens']})")
        L.append(f"  possibles (auteur : niveau, raison) : " + ", ".join(
            f"{a} : {p['niveau']}, {p['raison']}" for a, p in sorted(m["possibles"].items())))
        L.append(f"  classement {m['classement']} ; places {m['places']} ; raison cachée : {m['raison_cachee']}")
        L.append("  cartes dans l'ordre d'affichage :")
        for c in m["cartes"]:
            p = m["possibles"][c["auteur"]]
            L.append(f"    {c['auteur']:<9} {LIBELLE_NIVEAU[p['niveau']]:<17} raison {p['raison']!s:<7}"
                     f"{' (cachée)' if c['cachee'] else '':<10} → Odile désigne {c['designe']}"
                     + (f", raison devinée {c['raison_devinee']}" if c["cachee"] else "")
                     + (f" (auteur compté : {c['auteur_compte']})" if c["auteur_compte"] != c["auteur"] else ""))
        L.append(f"  rangs {m['rangs']}")
        L.append(f"  cotes_attendus {m['cotes_attendus']}")
        L.append(f"  curseur_porteur : somme_w {m['curseur_porteur']['somme_w']}, c {m['curseur_porteur']['c']}")
        L.append(f"  total {m['total']} ; affectation (rangs dans l'ordre des cartes) : "
                 f"{tuple(m['rangs'][c['designe']] for c in m['cartes'])}")
        rev = t["seances"][k + 1]["revelation"]["devineurs"]["Odile"]
        L.append(f"  révélation à la séance {k + 1} : justes {rev['justes']}, raison trouvée {rev['raison_trouvee']}")
        L.append("")
    texte = "\n".join(L)
    (ICI / "manches-odile-j.txt").write_text(texte + "\n", encoding="utf-8")
    print(texte)


if __name__ == "__main__":
    main()
