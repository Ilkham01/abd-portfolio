#!/usr/bin/env python3
"""Screenshot pages with Playwright for visual QA. Usage: shot.py page.html [mobile] [full]"""
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
import sys, asyncio, os
from playwright.async_api import async_playwright

page_name = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
mobile = 'mobile' in sys.argv
full = 'full' in sys.argv
out = sys.argv[-1] if sys.argv[-1].endswith('.png') else f'/tmp/claude-0/shot-{"m" if mobile else "d"}.png'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(
            viewport={'width': 390, 'height': 844} if mobile else {'width': 1440, 'height': 900},
            device_scale_factor=1, is_mobile=mobile, has_touch=mobile,
            reduced_motion='reduce')
        pg = await ctx.new_page()
        errors = []
        pg.on('console', lambda m: errors.append(f'{m.type}: {m.text}') if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        await pg.goto(f'file://{ROOT}/dist/{page_name}', wait_until='load')
        await pg.wait_for_timeout(800)
        h0 = await pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, h0, 700):
            await pg.evaluate(f'window.scrollTo(0,{y})'); await pg.wait_for_timeout(60)
        await pg.evaluate('window.scrollTo(0,0)')
        await pg.wait_for_timeout(800)
        # force reveal
        await pg.evaluate("document.querySelectorAll('.rv').forEach(e=>e.classList.add('in'))")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=out, full_page=full)
        h = await pg.evaluate('document.documentElement.scrollHeight')
        ow = await pg.evaluate('document.documentElement.scrollWidth')
        print('saved', out, 'height', h, 'scrollWidth', ow)
        for e in errors[:20]: print(e)
        await b.close()
asyncio.run(main())
