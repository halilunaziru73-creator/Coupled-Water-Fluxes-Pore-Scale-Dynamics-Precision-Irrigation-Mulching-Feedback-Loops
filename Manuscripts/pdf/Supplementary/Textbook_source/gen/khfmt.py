import re,glob
def group(t,i):
    # t[i]=='{' -> return (content,end_index_after)
    d=0
    for j in range(i,len(t)):
        c=t[j]
        if c=='\\': continue
        if c=='{' and t[j-1]!='\\': d+=1
        elif c=='}' and t[j-1]!='\\':
            d-=1
            if d==0: return t[i+1:j],j+1
    return None,i
UNIT=re.compile(r'^((?:[ ~a-zA-Z/\-]|\\,|\;|\\%|\$\^\{?[-0-9.]+\}?\$|\$\^\\circ\$){0,28})')
STOP={'and','at','of','on','for','with','is','are','the','to','a','in','from','by','as','that','so','then','but','if','when','which','while'}
def unit(after):
    m=UNIT.match(after);u=m.group(1) if m else ''
    # cut at first stop word boundary
    u=re.split(r'\s(?:and|at|of|on|for|with|is|are|the|to|in|from|by|as|that|so|then|but|if|when|which|while)\b',' '+u)[0].strip()
    u=re.sub(r'(\s+(?:per|cent))?$',lambda m:m.group(0),u)
    u=u.strip(' ~')
    return u
def given(stmt):
    items=[];seen=set()
    for m in re.finditer(r'\$([^$]+)\$',stmt):
        g=m.group(1)
        if '=' not in g: continue
        if g.startswith('^'): continue
        rhs=g.split('=')[-1]
        if not re.search(r'\d',rhs): continue
        if len(g)>60: continue
        key=g.strip()
        if key in seen: continue
        seen.add(key)
        u=unit(stmt[m.end():])
        # drop units that begin with a sentence word
        if re.match(r'^(Find|Calculate|Compute|Determine|What|Show|Estimate)',u): u=''
        items.append(('$'+g.strip()+'$'+((' '+u) if u else '')))
        if len(items)>=9: break
    return items
tot=0;withg=0
for f in sorted(glob.glob('ch*.tex')+glob.glob('extra/*.tex')):
    t=open(f).read();out=[];pos=0
    while True:
        i=t.find('\\exbox{',pos)
        if i<0: out.append(t[pos:]);break
        out.append(t[pos:i])
        title,j=group(t,i+6)
        stmt,k=group(t,j) if j<len(t) and t[j]=='{' else (None,j)
        if stmt is None or not t[k:].lstrip().startswith('\\sol'):
            out.append(t[i:k]);pos=k;continue
        # keep exbox text
        out.append(t[i:k])
        rest=t[k:]
        s0=re.match(r'\s*\\sol\b',rest)
        after=rest[s0.end():]
        if after.lstrip().startswith('Given') or after.lstrip().startswith('\\given'):
            out.append(rest[:s0.end()]);pos=k+s0.end();continue
        tot+=1
        g=given(stmt)
        # end of this solution = first blank line
        m=re.search(r'\n[ \t]*\n',after)
        endi=m.start() if m else len(after)
        body=after[:endi];tail=after[endi:]
        body=body.rstrip()
        if not body.endswith('\\finans'): body+=' \\finans'
        head='\\sol'
        if g:
            withg+=1
            head+=' \\givenline{'+' ; '.join(g)+'}'
            if not re.match(r'\s*\\ans',body): body='\\ans '+body.lstrip()
        out.append(head+body)
        pos=k+s0.end()+endi
    open(f,'w').write(''.join(out))
print(tot,withg)
