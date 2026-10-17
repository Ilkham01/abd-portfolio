#!/bin/sh
# Собрать и выложить сайт: Cloudflare Pages (основной хостинг) + GitHub Pages (старый адрес, переадресует на новый)
set -e
cd "$(dirname "$0")"
python3 build_pages.py >/dev/null
touch dist/.nojekyll
git add -A
git commit -q -m "${1:-Обновление сайта}" || true
git push -q origin main
set -a; . "$HOME/.cf.env"; set +a
npx --yes wrangler pages deploy dist --project-name abd-design --branch main --commit-dirty=true 2>&1 | grep -E "Success|Deployment complete|error" || true
git subtree split --prefix dist -b gh-pages-tmp >/dev/null
git push -q -f origin gh-pages-tmp:gh-pages
git branch -D gh-pages-tmp >/dev/null
echo "Готово: https://abd-design.pages.dev/"
