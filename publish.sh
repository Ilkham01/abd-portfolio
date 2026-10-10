#!/bin/sh
# Собрать и выложить сайт: коммит в main + публикация папки dist в ветку gh-pages (GitHub Pages)
set -e
cd "$(dirname "$0")"
python3 build_pages.py >/dev/null
touch dist/.nojekyll
git add -A
git commit -q -m "${1:-Обновление сайта}" || true
git push -q origin main
git subtree split --prefix dist -b gh-pages-tmp >/dev/null
git push -q -f origin gh-pages-tmp:gh-pages
git branch -D gh-pages-tmp >/dev/null
echo "Готово: https://ilkham01.github.io/abd-portfolio/ (обновится через ~1 мин)"
