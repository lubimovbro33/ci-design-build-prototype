CSS = """@font-face{font-family:"Zalando Sans Expanded";src:url(/__gf/zse.ttf) format("truetype");font-weight:100 900;font-display:block}
@font-face{font-family:"Zalando Sans SemiExpanded";src:url(/__gf/zss.ttf) format("truetype");font-weight:100 900;font-display:block}"""
async def gf(page):
    async def css(route): await route.fulfill(status=200, content_type='text/css', body=CSS)
    async def ttf(route):
        name = route.request.url.rsplit('/',1)[-1]
        await route.fulfill(status=200, content_type='font/ttf', body=open('/home/claude/fig/gf/'+name,'rb').read())
    await page.route("**/fonts.googleapis.com/**", css)
    await page.route("**/__gf/**", ttf)
