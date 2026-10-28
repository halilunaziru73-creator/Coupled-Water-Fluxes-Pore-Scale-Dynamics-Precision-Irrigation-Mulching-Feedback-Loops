import re,glob,sys,collections
def split(text):
    """yield (kind,chunk): kind 'p' prose or 'k' keep (math, code)"""
    out=[];i=0
    pat=re.compile(r'(```.*?```|\$\$.*?\$\$|\\begin\{(?:align|equation|gather|aligned|cases|array)\*?\}.*?\\end\{(?:align|equation|gather|aligned|cases|array)\*?\}|\$[^$\n]+\$|`[^`\n]+`|\]\([^)\n]*\)|\{[^}\n]*width[^}\n]*\}|https?://\S+)',re.S)
    for m in pat.finditer(text):
        out.append(('p',text[i:m.start()]));out.append(('k',m.group(0)));i=m.end()
    out.append(('p',text[i:]));return out
cnt=collections.Counter();ex=collections.defaultdict(list)
for f in sorted(glob.glob('chapters/*.md')):
    t=open(f).read()
    if t.startswith('---'): t=t.split('---',2)[2] if t.count('---')>=2 else t
    for k,c in split(t):
        if k!='p': continue
        for m in re.finditer(r'[^\n]{0,30}( - |—|–| -- )[^\n]{0,30}',c):
            cnt[m.group(1)]+=1
            if len(ex[m.group(1)])<12 and cnt[m.group(1)]%25==1: ex[m.group(1)].append(f[-12:]+': '+m.group(0))
print(cnt)
for k,v in ex.items():
    print('==',repr(k));print('\n'.join(v))
