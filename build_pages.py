#!/usr/bin/env python3
import re, os, glob
ROOT = os.path.dirname(os.path.abspath(__file__))
head = open(f'{ROOT}/partials/head.html').read()
foot = open(f'{ROOT}/partials/footer.html').read()
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
    out = h + body + foot
    if os.path.basename(path) == 'index.html':
        out = out.replace('href="index.html#', 'href="#').replace('href="index.html"', 'href="#top"')
    name = os.path.basename(path)
    open(f'{ROOT}/dist/{name}', 'w').write(out)
    print('built', name, len(out) // 1024, 'KB')
