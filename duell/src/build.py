#!/usr/bin/env python3
"""Baut /turmwacht-duell/index.html aus den Modulen (eine selbstständige Datei, keine externen Dateien)."""
import os,re
D=os.path.dirname(os.path.abspath(__file__))
ORDER=['shared/tw-bestiary.js','shared/tw-art.js','shared/tw-sfx.js','duell-art.js','duell-back.js','duell-sim.js','duell-ai.js','duell-campaign.js','duell-cards.js','duell-render.js','duell-ui.js']
def strip_node(s):return re.sub(r"^if\(typeof module!=='undefined'\)module\.exports=.*$","",s,flags=re.M)
js='\n'.join('// ---- '+f+' ----\n'+strip_node(open(os.path.join(D,f),encoding='utf-8').read()) for f in ORDER)
page=open(os.path.join(D,'page.html'),encoding='utf-8').read().replace('/*@@SCRIPTS@@*/',js)
out=os.path.join(D,'..','index.html');open(out,'w',encoding='utf-8').write(page);print('ok',out,len(page))
