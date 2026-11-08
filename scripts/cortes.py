import json, wave, numpy as np, sys
S=sys.argv[1]
w=wave.open(f"{S}/teste/audio16.wav"); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
h=160 # 10ms
r=np.array([np.sqrt(np.mean(a[i:i+h]**2)) for i in range(0,len(a)-h,h)]); db=20*np.log10(r+1e-9)
# suaviza 50ms
k=5; dbs=np.convolve(db,np.ones(k)/k,mode="same")
sil=dbs<-40.4
dur=len(a)/16000
# silêncios >= 0.25s
gaps=[]; i=0
while i<len(sil):
    if sil[i]:
        j=i
        while j<len(sil) and sil[j]: j+=1
        if (j-i)*0.01>=0.25: gaps.append((i*0.01,j*0.01))
        i=j
    else: i+=1
# intervalos de fala com folga
PAD_IN, PAD_OUT = 0.07, 0.10
keep=[]; prev=0.0
for g0,g1 in gaps:
    if g0>prev: keep.append([max(0,prev-PAD_IN) if prev>0 else max(0,prev), g0+PAD_OUT])
    prev=g1
if prev<dur: keep.append([prev-PAD_IN, dur])
keep=[k for k in keep if k[1]-k[0]>0.12]
# começa um pouco antes da 1a palavra
keep[0][0]=max(keep[0][0],1.20)
# merge sobreposições
m=[]
for k0,k1 in keep:
    if m and k0<=m[-1][1]: m[-1][1]=max(m[-1][1],k1)
    else: m.append([k0,k1])
keep=m
d0=__import__('json').load(open(f"{S}/teste/transcricao.json"))
starts=[x["s"] for s in d0 for x in s["words"]]+[x["e"] for s in d0 for x in s["words"]]
keep=[k for k in keep if k[1]-k[0]>=0.4 or any(k[0]<=t<=k[1] for t in starts)]
m=[]
for k0,k1 in keep:
    if m and k0-m[-1][1]<0.25: m[-1][1]=k1
    else: m.append([k0,k1])
keep=m
# arredonda para quadros de 30fps
keep=[[round(k0*30)/30, round(k1*30)/30] for k0,k1 in keep]
tot=sum(k1-k0 for k0,k1 in keep)
print("segmentos",len(keep),"duração final %.2f"%tot)
def mapa(t, fwd=True):
    acc=0
    for k0,k1 in keep:
        if t<k0: return acc if fwd else acc  # caiu num corte
        if t<=k1: return acc+(t-k0)
        acc+=k1-k0
    return acc
fix={"empreendedora,#0":"empreendedor,","meta":"média","mercada,":"mercado,","paremos":"faremos","internas":"internos","Falar":"Fale","designer":"design","facture":"fature","aumenta":"aumente","café":"Café","do#marketing":"e"}
d=json.load(open(f"{S}/teste/transcricao.json"))
W=[x for s in d for x in s["words"]]
out=[]; seen={}
for i,x in enumerate(W):
    t=x["w"].strip()
    n=seen.get(t,0); seen[t]=n+1
    if f"{t}#{n}" in fix: t=fix[f"{t}#{n}"]
    elif t in fix: t=fix[t]
    if t=="do" and i>0 and W[i-1]["w"].strip()=="marketing": t="e"
    if t=="se" and i+1<len(W) and W[i+1]["w"].strip()=="faturar": continue
    ws,we=x["s"],x["e"]
    partes=[(max(ws,k0),min(we,k1)) for k0,k1 in keep if min(we,k1)>max(ws,k0)]
    if partes:
        ws,we=max(partes,key=lambda q:q[1]-q[0])
    s=mapa(ws); e=mapa(we)
    if e-s<0.12: e=s+0.12
    out.append({"t":t,"s":round(s,3),"e":round(e,3)})
json.dump({"cortes":keep,"palavras":out,"duracao":tot},open(f"{S}/teste/edicao.json","w"),ensure_ascii=False,indent=1)
for k in keep: print("%.2f-%.2f"%tuple(k))
