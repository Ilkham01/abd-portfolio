#!/usr/bin/env python3
import re, os, glob
ROOT = os.path.dirname(os.path.abspath(__file__))
head = open(f'{ROOT}/partials/head.html').read()
foot = open(f'{ROOT}/partials/footer.html').read()
# cache-busting: versions from file contents, so browsers always load fresh CSS/JS after a change
import hashlib
_v = lambda f: hashlib.md5(open(f'{ROOT}/dist/{f}','rb').read()).hexdigest()[:8]
head = head.replace('href="styles.css"', f'href="styles.css?v={_v("styles.css")}"')
foot = foot.replace('src="main.js"', f'src="main.js?v={_v("main.js")}"')
sprite = open(f'{ROOT}/dist/logo-sprite.html').read()

for path in glob.glob(f'{ROOT}/pages/*.html'):
    body = open(path).read()
    m = re.search(r'\{\{meta\s+(.*?)\}\}', body, re.S)
    attrs = dict(re.findall(r'(\w+)="(.*?)"', m.group(1), re.S))
    body = body[m.end():]
    h = head
    for k in ('title', 'description', 'bodyclass'):
        h = h.replace('{{' + k + '}}', attrs.get(k, ''))
    h = h.replace('{{sprite}}', sprite)
    page_ru = '' if os.path.basename(path) == 'index.html' else os.path.basename(path)[:-5]
    h = h.replace('{{page_ru}}', page_ru)
    out = h + body + foot
    if os.path.basename(path) == 'index.html':
        out = out.replace('href="./#', 'href="#').replace('href="./"', 'href="#top"')
    name = os.path.basename(path)
    open(f'{ROOT}/dist/{name}', 'w').write(out)
    print('built', name, len(out) // 1024, 'KB')


# Kazakh version: dist/kk/*.html from the built Russian pages + the RU→KK dictionary
import subprocess, sys
r = subprocess.run([sys.executable, f'{ROOT}/src/i18n/build_kk.py'], capture_output=True, text=True)
print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else '', r.stderr.strip())
if r.returncode: raise SystemExit('kk build failed')
