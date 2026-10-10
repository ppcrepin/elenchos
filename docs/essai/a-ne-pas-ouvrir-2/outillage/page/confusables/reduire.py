"""Table réduite des lettres qui imitent les nôtres (§8.8, « Refus du pseudo » ; §7.19, E7).

    python3 -I confusables/reduire.py CONFUSABLES_TXT confusables/table-16.0.0.json

Lit `confusables.txt` d'Unicode (UTS #39), version 16.0.0, dont le SHA-256 doit être celui
du §8.8 de simulation-2.md. Garde les lignes dont la source est un seul caractère et la
cible une seule lettre de A à Z ou de a à z (la même règle que le programme de contrôle,
ec/journal.py, table_confusables). Écrit un objet JSON canonique, en ASCII (\\u échappés) :
{"source_sha256", "version", "table": {caractère: lettre}}. Même entrée, mêmes octets.
Le fichier source n'est pas versionné (722 Ko) ; la table l'est, avec l'empreinte de sa source.
Outillage d'essai (D-001 tenu). Python 3.11, bibliothèque standard seulement.
"""
import hashlib
import json
import re
import sys

SHA_ATTENDU = "95bd0aad6dced5ebc63436f459c06ab21a8d107cd842fb57f5c3a1e91bca8611"
VERSION = "16.0.0"


def main():
    source, sortie = sys.argv[1], sys.argv[2]
    with open(source, "rb") as f:
        octets = f.read()
    sha = hashlib.sha256(octets).hexdigest()
    if sha != SHA_ATTENDU:
        sys.exit("confusables.txt : SHA-256 %s, attendu %s (version %s)" % (sha, SHA_ATTENDU, VERSION))
    table = {}
    for ligne in octets.decode("utf-8-sig").split("\n"):
        corps = ligne.split("#", 1)[0].strip()
        if not corps:
            continue
        champs = [c.strip() for c in corps.split(";")]
        if len(champs) < 2:
            continue
        src, cible = champs[0].split(), champs[1].split()
        if len(src) != 1 or len(cible) != 1:
            continue
        c = chr(int(cible[0], 16))
        if re.fullmatch(r"[A-Za-z]", c):
            table[chr(int(src[0], 16))] = c
    texte = json.dumps({"source_sha256": sha, "table": table, "version": VERSION}, ensure_ascii=True, sort_keys=True, separators=(",", ":"))
    with open(sortie, "wb") as f:
        f.write(texte.encode("ascii"))
    print("table écrite : %s, %d entrées, %d octets, SHA-256 %s" % (sortie, len(table), len(texte), hashlib.sha256(texte.encode("ascii")).hexdigest()))


if __name__ == "__main__":
    main()
