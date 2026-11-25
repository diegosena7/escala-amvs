"""Gera ../index.html a partir de template.html, dos calendários e dos logos."""
import json, pathlib, base64
d = pathlib.Path(__file__).parent
uri = lambda f: 'data:image/png;base64,' + base64.b64encode((d/f).read_bytes()).decode()
data = {1: json.load(open(d/'opcao1.json')), 2: json.load(open(d/'opcao2.json')), 3: json.load(open(d/'opcao3.json'))}
html = (d/'template.html').read_text(encoding='utf-8')
html = (html.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':')))
            .replace('__LOGO_MARK__', uri('logo_mark_mask.png'))
            .replace('__LOGO_FULL__', uri('logo_full_mask.png'))
            .replace('__FAVICON__', uri('favicon.png')))
(d.parent/'index.html').write_text(html, encoding='utf-8')
print('index.html', len(html))
