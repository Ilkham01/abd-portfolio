# Портфолио — Ильхам Абдримов

Сайт-портфолио UI/UX-дизайнера. Чистые HTML/CSS/JS, без фреймворков.

## Структура

```
partials/        head.html (шапка, меню), footer.html (контакты, футер, скрипты)
pages/           тексты страниц: index.html + 5 кейсов
dist/            ГОТОВЫЙ САЙТ — это публикует Netlify
  ├ index.html, demping-pro.html, foryou-cargo.html, autobir.html, bai-group.html, prolight.html
  ├ styles.css   все стили
  ├ main.js      анимации, меню, печатающийся текст, слайдеры
  ├ assets/      картинки (webp)
  └ resume.pdf
src/             исходные экспорты из Figma — в git не попадают (слишком большие)
build_pages.py   partials + pages → dist/*.html
build_single.py  весь сайт в один файл abd-portfolio.html (для отправки файлом)
build_assets.py  src/*.png → dist/assets/*.webp
shot.py          скриншоты страниц через Playwright для проверки
```

## Как вносить правки

- **Тексты** — в `pages/*.html`, потом `python3 build_pages.py`.
- **Шапка / футер / контакты** — в `partials/`, потом `python3 build_pages.py`.
- **Стили и анимации** — прямо в `dist/styles.css` и `dist/main.js` (пересборка не нужна).
- **Картинки** — положить в `dist/assets/` (webp) и прописать в странице.

После правок:

```bash
python3 build_pages.py        # собрать dist/
python3 build_single.py       # опционально: один файл abd-portfolio.html
git add -A && git commit -m "Что поменял" && git push
```

Netlify подхватит пуш и выложит новую версию сам.

## Публикация

Netlify → Add new site → Import an existing project → GitHub → этот репозиторий.
Настройки: Build command — пусто, Publish directory — `dist` (уже в `netlify.toml`).
