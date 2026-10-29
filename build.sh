#!/bin/bash
# Build index.html from src.html: inject private OG/robots tags, the Share dock and the shared leaderboard.
# Shared tools are only IMPORTED with in-memory config; no shared file is modified.
set -e
D=/workspace/melissaette-bday-c38938-vol-2
V=${V:-$(cat $D/.ver 2>/dev/null || echo 1)}
sed "s/window.MTV='[0-9]*'/window.MTV='$V'/; s/\.js?v=[0-9]*/.js?v=$V/g" $D/src.html > $D/index.html
sed -i "s/V=P+'v[0-9]*'/V=P+'v$V'/" $D/sw.js
python3 - <<'PY'
import sys,html,re,os
sys.path.insert(0,'/workspace/launch');sys.path.insert(0,'/workspace/leaderboard')
import share,inject
REPO='melissaette-bday-c38938-vol-2';URL=f'https://ploug76.github.io/{REPO}/';IMG=URL+'cover.png?v=1'
T="Melissa Time: The Great Birthday Rescue, Volume 2"
DESC="Happy 54th Birthday, Melissa! 🎂 Volume 2: six painted lands, six boss battles, the Party Pals to rescue, 54 hidden candles and a birthday-party finale."
e=lambda s:html.escape(s,quote=True)
tags=(f'<!--og--><meta name="robots" content="noindex,nofollow"><meta name="description" content="{e(DESC)}">'
 f'<meta property="og:type" content="website"><meta property="og:site_name" content="{e(T)}"><meta property="og:title" content="{e(T)}">'
 f'<meta property="og:description" content="{e(DESC)}"><meta property="og:url" content="{URL}"><meta property="og:image" content="{IMG}">'
 f'<meta property="og:image:secure_url" content="{IMG}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200">'
 f'<meta property="og:image:height" content="630"><meta property="og:image:alt" content="{e(T)} cover: Happy 54th Birthday, Melissa!">'
 f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(T)}"><meta name="twitter:description" content="{e(DESC)}">'
 f'<meta name="twitter:image" content="{IMG}"><link rel="canonical" href="{URL}"><!--/og-->')
p='/workspace/melissaette-bday-c38938-vol-2/index.html';s=open(p,encoding='utf-8').read()
s=re.sub(r'<meta name="robots"[^>]*>','',s)
s=re.sub(r'<!--og-->.*?<!--/og-->','',s,flags=re.S);s=s.replace('</title>','</title>'+tags,1);open(p,'w',encoding='utf-8').write(s)
share.cfg(REPO,d=REPO,url=URL,title=T,vis="typeof state!=='undefined'&&state==='title'",text="Happy 54th Birthday, Melissa! 🎂 Play Melissa Time: The Great Birthday Rescue, Volume 2.")
share.apply(REPO,p)
s=open(p,encoding='utf-8').read()
assert 'Peter&#39;s Arcade' not in s and "Peter's Arcade" not in s,'arcade text leaked'
inject.G[REPO]=dict(max=10**7,overTitle='🎂 Happy Birthday, Melissa!',watch=[dict(when="typeof state!=='undefined'&&state==='ending'&&!!document.getElementById('endbox')&&!document.getElementById('endbox').hidden",score="G&&G.score")])
os.environ['PALB_CONFIG_FILE']='/workspace/leaderboard/config.firestore.js';os.environ['PALB_TITLE']='Melissa Time 2'
inject.inject(REPO,p)
s=open(p,encoding='utf-8').read()
assert 'vault' not in s.lower(),'vault leaked'
print('meta+dock+lb ok')
PY
echo built v$V
