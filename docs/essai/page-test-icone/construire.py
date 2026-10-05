"""Construit index.html à partir de source.html : politique de sécurité avec les empreintes exactes du style et du script."""
import hashlib, base64, re, sys
import os
d = os.path.dirname(os.path.abspath(__file__)) + "/"
s = open(d + "source.html", encoding="utf-8").read()
def h(t): return "'sha256-" + base64.b64encode(hashlib.sha256(t.encode("utf-8")).digest()).decode() + "'"
style = re.search(r"<style>(.*?)</style>", s, re.S).group(1)
script = re.search(r"<script>(.*?)</script>", s, re.S).group(1)
csp = "default-src 'none'; img-src 'self'; style-src " + h(style) + "; script-src " + h(script) + "; base-uri 'none'; form-action 'none'"
assert s.count("__CSP__") == 1
out = s.replace("__CSP__", csp)
open(d + "index.html", "w", encoding="utf-8", newline="\n").write(out)
print(csp); print(len(out.encode()), "octets ;", hashlib.sha256(out.encode()).hexdigest())
