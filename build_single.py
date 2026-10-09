#!/usr/bin/env python3
"""Bundle the whole site into ONE self-contained HTML file."""
import re, os, base64, mimetypes
ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = f'{ROOT}/dist'
sprite = open(f'{DIST}/logo-sprite.html').read()
head = open(f'{ROOT}/partials/head.html').read()
foot = open(f'{ROOT}/partials/footer.html').read()

def body_of(name):
    s = open(f'{ROOT}/pages/{name}').read()
    m = re.search(r'\{\{meta\s+(.*?)\}\}', s, re.S)
    attrs = dict(re.findall(r'(\w+)="(.*?)"', m.group(1), re.S))
    return attrs, s[m.end():]

pages = [('index.html', 'home'), ('demping-pro.html', 'demping-pro'), ('foryou-cargo.html', 'foryou-cargo'),
         ('autobir.html', 'autobir'), ('bai-group.html', 'bai-group'), ('prolight.html', 'prolight')]

def datauri(path):
    mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
    if path.endswith('.webp'): mime = 'image/webp'
    if path.endswith('.glb'): mime = 'model/gltf-binary'
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

cache = {}
def inline_assets(html):
    def rep(m):
        p = m.group(2)
        if p not in cache: cache[p] = datauri(f'{DIST}/{p}')
        return m.group(1) + cache[p] + m.group(3)
    return re.sub(r'((?:src|href|data-model|data-color|data-depth)=")(assets/[^"]+|resume\.pdf)(")', rep, html)

def relink(html, is_home):
    # case links -> hash routes
    for f, slug in pages[1:]:
        html = html.replace(f'href="{f}"', f'href="#/{slug}"')
    html = html.replace('href="index.html#', 'href="#').replace('href="index.html"', 'href="#top"')
    return html

titles = {}
parts = []
for f, slug in pages:
    attrs, body = body_of(f)
    titles[slug] = attrs['title']
    body = relink(body, slug == 'home')
    hidden = '' if slug == 'home' else ' hidden'
    parts.append(f'<div class="page" id="p-{slug}" data-title="{attrs["title"]}"{hidden}>\n{body}\n</div>')

# header from partial
hd = head.split('<header class="header">')[1]
hd = relink('<header class="header">' + hd, True)
ft = relink(foot.split('<!-- 13 Final CTA + footer -->')[1].split('<script')[0], True)

css = open(f'{DIST}/styles.css').read()
js = open(f'{DIST}/main.js').read()
# header: pick the hero of the visible page
js = js.replace("const hero = $('.hero, .case-hero');", "const heroOf = () => $('.page:not([hidden]) .hero, .page:not([hidden]) .case-hero');")
js = js.replace("const limit = hero ? hero.offsetHeight - 80 : 40;", "const hero = heroOf(); const limit = hero ? hero.offsetHeight - 80 : 40;")
# hero 3D wrap only in home (already single)
router = """
  /* ---------- Single-file router ---------- */
  (function () {
    const pagesEl = $$('.page');
    const show = (slug) => {
      let target = $('#p-' + slug) || $('#p-home');
      pagesEl.forEach(p => { p.hidden = p !== target; });
      document.body.classList.toggle('case-page', target.id !== 'p-home');
      document.title = target.dataset.title || document.title;
      $$('.rv', target).forEach(el => { if (!el.classList.contains('in')) {} });
      window.scrollTo({ top: 0, behavior: 'auto' });
      updateHeader();
      window.dispatchEvent(new Event('resize'));
    };
    const route = () => {
      const h = location.hash || '';
      if (h.startsWith('#/')) { show(h.slice(2) || 'home'); }
      else {
        const wasCase = !$('#p-home') || $('#p-home').hidden;
        if (wasCase) show('home');
        if (h.length > 1) { const t = $(h); if (t) setTimeout(() => window.__scrollToEl ? window.__scrollToEl(t) : t.scrollIntoView(), wasCase ? 80 : 0); }
      }
    };
    window.addEventListener('hashchange', route);
    route();
  })();
"""
js = js.replace("  /* ---------- Copy-to-clipboard for email ---------- */", router + "\n  /* ---------- Copy-to-clipboard for email ---------- */")
# reveal: observe elements inside hidden pages too (IO handles when they appear)

page_css = ".page[hidden]{display:none}\n"

html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titles['home']}</title>
<meta name="description" content="Дизайн сайтов, мобильных приложений и лендингов, которые продают. Первый экран — бесплатно.">
<meta name="theme-color" content="#0A0E17">
<link rel="icon" href="{datauri(f'{DIST}/favicon.svg')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add('js')</script>
<script type="importmap">{{"imports":{{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}}}</script>
<script src="https://unpkg.com/lenis@1.1.18/dist/lenis.min.js"></script>
<style>
{css}
{page_css}
</style>
</head>
<body class="home">
{sprite}
{hd}
{chr(10).join(parts)}
{ft}
<script>
{js}
</script>
</body>
</html>"""
html = inline_assets(html)
out = f'{ROOT}/abd-portfolio.html'
open(out, 'w').write(html)
print('written', out, len(html) // 1024 // 1024, 'MB')
