"""Résumé lisible d'une trace (pour relire une partie à côté d'une feuille de calcul).
Toutes les valeurs viennent de la trace, telles quelles (fractions « p/q »)."""

from .jeu import LIBELLE_NIVEAU, MEMBRES, PERSONNAGES, TENSIONS


def _rep(niveau, raison):
    return f"{LIBELLE_NIVEAU[niveau]} · raison {raison}"


def resumer(t):
    L = []
    p = t["partie"]
    L.append(f"Partie « {p['id']} », mode {p['mode']} ; fichier scellé {t['empreinte_scelle']}")
    L.append(f"Séances 0 à {len(t['seances']) - 1} ; "
             + (f"arrêt à la séance {t['arret']['k']}" if t["arret"] else "menée jusqu'à la clôture"))
    for s in t["seances"]:
        k = s["k"]
        L.append("")
        L.append("=" * 78)
        L.append(f"Séance {k} — ouverture {s['ouverture']} ; versions {s['versions']} ; étapes {s['etapes']}")
        c = s["coups"]
        L.append(f"  coups : réponse {c['reponse']} ; relire {c['relire']} ; carnet {c['carnet']}")
        if s["entree"]:
            for e, x in s["entree"]["textes"].items():
                ce = c["entree"][e]
                L.append(f"  entrée {e} : Agathe {_rep(**x['inviteuse'])} ; réponse {ce['reponse']} ; pari {ce['pari']} ; juste {x['juste']}")
            L.append(f"  paris justes : {s['entree']['justes']}")
        if s["revelation"]:
            r = s["revelation"]
            L.append(f"  révélation du texte {r['texte']} :")
            for g in MEMBRES:
                if g in r["devineurs"]:
                    d = r["devineurs"][g]
                    L.append(f"    {g:<9} justes {d['justes']} ; raison trouvée {d['raison_trouvee']} ; points {d['points']} ; "
                             f"semaine {d['points_semaine']}" + (f" ; verdicts {d['verdicts']}" if d["verdicts"] else ""))
        if s["dimanche"]:
            d = s["dimanche"]
            L.append(f"  dimanche, semaine {d['semaine']} :")
            L.append(f"    Sans-Faute {d['sans_faute']} ; Pas de Côté {d['pas_de_cote']}")
            L.append(f"    Devin {d['devin']['titulaire']} ({d['devin']['departage']}) ; points {d['devin']['points']} ; raisons {d['devin']['raisons']}")
            L.append(f"    Mystère {d['mystere']['titulaire']} ({d['mystere']['departage']}) ; tentatives {d['mystere']['tentatives']} ; erreurs {d['mystere']['erreurs']}")
            L.append(f"    Fidèle {d['fidele']['titulaires']}")
            L.append(f"    surprise : texte {d['surprise']['texte']} ({d['surprise']['departage']}) ; attributions {d['surprise']['attributions']} ; erreurs {d['surprise']['erreurs']}")
            ps = d["phrase_semaine"]
            L.append(f"    phrase de la semaine : cas {ps['cas']}, tension {ps['tension']} ; poids {ps['poids']}")
            L.append(f"      « {ps['phrase']} »")
        if s["manches"]:
            for g in MEMBRES:
                if g not in s["manches"]:
                    continue
                m = s["manches"][g]
                L.append(f"  manche de {g}, texte {m['texte']} :")
                for a in MEMBRES:
                    if a in m["possibles"]:
                        x = m["possibles"][a]
                        L.append(f"    {a:<9} {_rep(x['niveau'], x['raison']):<30} Σw {x['somme_w']:<4} x {x['x']:<4} c {x['c']:<5} "
                                 f"ℓ {x['l']:<6} q {x['q']:<5} dist {x['distance']:<7} rareté {x['rarete']:<6} surprise {x['surprise']}")
                L.append(f"    médiane {m['mediane']} ; classement {m['classement']} ; départages {m['departages']}")
                L.append(f"    remplacements {m['remplacements']} ; places {m['places']} ; raison cachée {m['raison_cachee']} ; ordre {m['ordre']}")
                if m["rangs"] is not None:
                    L.append(f"    rangs {m['rangs']} ; côtés attendus {m['cotes_attendus']} ; curseur porteur {m['curseur_porteur']} ; total {m['total']}")
                for x in m["cartes"]:
                    L.append(f"    carte {x['auteur']:<9} compté {x['auteur_compte']:<9} {'cachée ' if x['cachee'] else '       '}"
                             f"→ {x['designe']}" + (f", raison {x['raison_devinee']}" if x["cachee"] else ""))
        if s["phrase_jour"]:
            pj = s["phrase_jour"]
            L.append(f"  phrase du jour (texte {pj['texte']}) : {pj['classe']}, w {pj['w']}, pôle {pj['pole']} : « {pj['phrase']} »")
        if s["attente"]:
            L.append("  En attendant : " + " ; ".join(f"{l['heure']} → {l['visages']}" for l in s["attente"]["lectures"]))
        L.append("  portrait : " + " ; ".join(
            f"{T} Σw {x['somme_w']} c {x['c']} ℓ {x['l']}" for T, x in s["portrait"]["tensions"].items())
            + f" ; ordre de Moi {s['portrait']['ordre_moi']}")
        L.append("  curseurs vus : " + " | ".join(
            f"{p_} " + ", ".join(f"{T} {s['curseurs_vus'][p_][T]['somme_w']}/{s['curseurs_vus'][p_][T]['c']}" for T in TENSIONS)
            for p_ in PERSONNAGES) + "   (Σw/c)")
        L.append(f"  surprises des proches : {s['surprises_proches']}")
        L.append(f"  mesures : {s['mesures']}")
    L.append("")
    L.append("=" * 78)
    L.append(f"Agrégats : {t['agregats']}")
    for i, cp in enumerate(t["copies"]):
        L.append(f"Copie {i} : séance {cp['k']} ; versions {cp['versions']} ; étapes {cp['etapes']} ; mesures {cp['mesures']}")
    return "\n".join(L) + "\n"
