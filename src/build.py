"""Gera ../index.html a partir de template.html e dos calendários das 3 opções."""
import json, pathlib
d = pathlib.Path(__file__).parent
data = {1: json.load(open(d/'opcao1.json')), 2: json.load(open(d/'opcao2.json')), 3: json.load(open(d/'opcao3.json'))}
html = (d/'template.html').read_text().replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
(d.parent/'index.html').write_text(html)
