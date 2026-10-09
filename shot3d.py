import asyncio, os, time, mimetypes, sys
from playwright.async_api import async_playwright
S='/tmp/claude-0/-home-claude/59b40717-7861-517e-8a19-f6661d15af68/scratchpad'
DIST='/home/claude/site/dist'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(proxy={'server':os.environ['HTTPS_PROXY']},args=['--ignore-certificate-errors','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
        ctx=await b.new_context(viewport={'width':1440,'height':900})
        async def serve(route, request):
            path=request.url.split('site.test/')[1].split('?')[0].split('#')[0] or 'index.html'
            f=os.path.join(DIST,path)
            if os.path.exists(f):
                mt=mimetypes.guess_type(f)[0] or 'application/octet-stream'
                if f.endswith('.glb'): mt='model/gltf-binary'
                if f.endswith('.webp'): mt='image/webp'
                await route.fulfill(status=200,body=open(f,'rb').read(),content_type=mt)
            else: await route.fulfill(status=404,body='')
        await ctx.route('https://site.test/**', serve)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        t0=time.time(); await pg.goto('https://site.test/index.html')
        for i in range(60):
            await pg.wait_for_timeout(1000)
            if 'ready' in await pg.evaluate("document.querySelector('.hero-figure')?.className||''"): print('ready at',round(time.time()-t0,1)); break
        print('errors',errs[:3])
        await pg.mouse.move(0,899); await pg.wait_for_timeout(3000); await pg.screenshot(path=f'{S}/3d-a.png',clip={'x':900,'y':150,'width':540,'height':600})
        await pg.mouse.move(1439,0); await pg.wait_for_timeout(3000); await pg.screenshot(path=f'{S}/3d-b.png',clip={'x':900,'y':150,'width':540,'height':600})
        await pg.mouse.move(720,450); await pg.wait_for_timeout(3000); await pg.screenshot(path=f'{S}/3d-hero.png')
        await b.close()
asyncio.run(main())
