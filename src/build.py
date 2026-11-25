"""Gera as páginas (index, escala, opcoes, regras) e a pasta assets/ na raiz do projeto.
Uso: python3 src/build.py"""
import json, pathlib, base64, re
d = pathlib.Path(__file__).parent; root = d.parent
(root/'assets').mkdir(exist_ok=True)
uri = lambda f: 'data:image/png;base64,' + base64.b64encode((d/f).read_bytes()).decode()

# dados e logos
data = {1: json.load(open(d/'opcao1.json')), 2: json.load(open(d/'opcao2.json')), 3: json.load(open(d/'opcao3.json'))}
(root/'assets'/'data.js').write_text('const DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
css = (d/'styles.css').read_text(encoding='utf-8').replace('__LOGO_MARK__', uri('logo_mark_mask.png')).replace('__LOGO_FULL__', uri('logo_full_mask.png'))
(root/'assets'/'styles.css').write_text(css, encoding='utf-8')
(root/'assets'/'app.js').write_text((d/'app.js').read_text(encoding='utf-8'), encoding='utf-8')
(root/'assets'/'favicon.png').write_bytes((d/'favicon.png').read_bytes())

# páginas
head = (d/'pages'/'_head.html').read_text(encoding='utf-8')
nav = (d/'pages'/'_nav.html').read_text(encoding='utf-8')
foot = (d/'pages'/'_foot.html').read_text(encoding='utf-8')
for name in ['index', 'escala', 'opcoes', 'regras']:
    body = (d/'pages'/f'{name}.html').read_text(encoding='utf-8')
    title = re.match(r'<!--TITLE:(.*?)-->\n', body).group(1)
    body = re.sub(r'^<!--TITLE:.*?-->\n', '', body)
    n = nav
    for p in ['index', 'escala', 'opcoes', 'regras']:
        n = n.replace('{{CUR_%s}}' % p, ' aria-current="page"' if p == name else '')
    (root/f'{name}.html').write_text(head.replace('{{TITLE}}', title) + n + '\n' + body + '\n' + foot, encoding='utf-8')
print('build ok')
