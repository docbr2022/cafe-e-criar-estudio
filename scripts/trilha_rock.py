"""Rock clássico sintetizado (livre de direitos) para o Reels BoasVindasRock: 120 BPM, 20 s, Mi.
Guitarra em Karplus-Strong com distorção e caixa simulada, dobrada em L/R; baixo, bateria com sala.
Mapa (1 compasso = 2 s = 60 quadros a 30 fps):
  0-2 s riff sozinho | 2-4 riff + banda | 4-6 riff + virada de caixa | 6 s prato: refrão (revelação)
  10-12 riff | 12 s prato + "plug" (conexão) | 14 / 14,5 / 15 s paradas | 15-16 virada de tons
  16 s refrão final | 18-19 rufo | 19 s acorde final soando.
Uso: python3 scripts/trilha_rock.py public/audio/trilha-rock.wav"""
import sys, wave
import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
E8 = BEAT / 2
BAR = 4 * BEAT
DUR = 20.0
N = int(SR * DUR)
rng = np.random.default_rng(23)
gtr = np.zeros((N, 2))
bat = np.zeros((N, 2))
resto = np.zeros((N, 2))


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def filtro(x, lo=None, hi=None, ordem=2):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** (2 * ordem))
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** (2 * ordem))
    return np.fft.irfft(X * g, len(x))


def pico(x, fc, ganho_db, q=1.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = 1 + (10 ** (ganho_db / 20) - 1) * np.exp(-((np.log2(np.maximum(f, 1) / fc)) ** 2) / (2 * (0.5 / q) ** 2))
    return np.fft.irfft(X * g, len(x))


def soma(bus, sinal, t0, ganho=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i < 0:
        return
    s = sinal[: N - i] * ganho
    bus[i : i + len(s), 0] += s * (1 - pan)
    bus[i : i + len(s), 1] += s * (1 + pan)


def tempo(dur):
    return np.arange(int(dur * SR)) / SR


# ---------- Guitarra ----------
def corda(freq, dur, brilho=0.5, decai=0.996):
    """Karplus-Strong vetorizado em blocos de um período."""
    n = int(dur * SR)
    P = max(2, int(SR / freq))
    y = np.zeros(n + P + 2)
    exc = rng.uniform(-1, 1, P + 1)
    exc = filtro(np.concatenate([exc, exc]), hi=2000 + 6000 * brilho)[: P + 1]
    y[: P + 1] = exc
    k = P + 1
    while k < len(y):
        fim = min(k + P, len(y))
        y[k:fim] = decai * 0.5 * (y[k - P : fim - P] + y[k - P - 1 : fim - P - 1])
        k = fim
    return y[P + 1 : P + 1 + n]


def acorde(raiz, dur, abafado=False, toque=1.0):
    """Power chord (tônica, quinta, oitava) já distorcido e passado pela caixa."""
    d = dur + 0.05
    notas = [raiz, raiz + 7, raiz + 12]
    s = sum(corda(hz(m), d, 0.25 if abafado else 0.7, 0.985 if abafado else 0.9975) * (1 - 0.15 * i) for i, m in enumerate(notas))
    if abafado:
        s = filtro(s, hi=1100)
    t = np.arange(len(s)) / SR
    s *= np.minimum(t / 0.002, 1)
    # Corte no fim (mão abafando)
    s *= np.clip((d - t) / 0.03, 0, 1)
    x = s * (9 if abafado else 7) * toque
    x = np.where(x > 0, np.tanh(x), np.tanh(x * 0.8) / 0.8)  # assimétrica: harmônicos pares
    x = np.tanh(x * 2.2)
    x = filtro(x, lo=90, hi=5200, ordem=3)
    x = pico(x, 750, 2, 1.2)
    x = pico(x, 130, 4, 0.8)
    x = pico(x, 2600, 3, 1.5)
    return x


def tocar(raiz, t0, dur, abafado=False, toque=1.0):
    for lado, (atraso, desafina) in ((-0.75, (0.0, 0)), (0.75, (0.009, 0.08))):
        s = acorde(raiz + desafina, dur, abafado, toque)
        soma(gtr, s, t0 + atraso, 0.32, lado)


E, G, A, C, D, B = 40, 43, 45, 48, 50, 47

# Riff principal (colcheias): (passo, nota, abafado, duração em colcheias)
RIFF = [(0, E, False, 1), (1, E, True, 1), (2, G, False, 1), (3, E, True, 1), (4, A, False, 2), (6, G, False, 1), (7, E, True, 1)]
RIFF_B = [(0, E, False, 1), (1, E, True, 1), (2, G, False, 1), (3, E, True, 1), (4, D, False, 1), (5, C, False, 1), (6, B, False, 1), (7, A, False, 1)]


def riff(t0, var=False):
    for passo, nota, ab, dur in RIFF_B if var else RIFF:
        tocar(nota, t0 + passo * E8, dur * E8 * 0.95, ab)


def refrao(t0, seq):
    # Acordes abertos tocados em colcheias (pegada de rock), um acorde por meio compasso
    for meia, nota in enumerate(seq):
        for k in range(4):
            tocar(nota, t0 + meia * 2 * BEAT + k * E8, E8 * 0.98, False, 0.85 if k else 1.0)


riff(0.0)
riff(2.0)
riff(4.0, var=True)
refrao(6.0, [E, D])
refrao(8.0, [A, C])
riff(10.0)
riff(12.0)
for tc, nota in ((14.0, E), (14.5, G), (15.0, A)):  # paradas
    tocar(nota, tc, 0.42, False, 1.1)
refrao(16.0, [E, D])
for k in range(4):  # 18-19 s: tremolo em D
    for j in range(2):
        tocar(D, 18.0 + k * BEAT / 2 + j * BEAT / 4, BEAT / 4 * 0.95, False, 0.8)
tocar(E, 19.0, 1.0, False, 1.2)  # acorde final

# ---------- Baixo ----------
def baixo(midi, t0, dur):
    t = tempo(dur)
    f = hz(midi - 12)
    s = np.sin(2 * np.pi * f * t) + 0.45 * (2 * ((t * f) % 1) - 1)
    s = np.tanh(s * 1.8) * np.minimum(t / 0.004, 1) * np.exp(-t * 2.5) * np.clip((dur - t) / 0.02, 0, 1)
    soma(resto, filtro(s, hi=900), t0, 0.55)


def linha_baixo(t0, seq, passos=8):
    for k in range(passos):
        baixo(seq[k * len(seq) // passos], t0 + k * E8, E8 * 0.9)


for b in (2.0, 10.0, 12.0):
    linha_baixo(b, [E, E, G, E, A, A, G, E])
linha_baixo(4.0, [E, E, G, E, D, C, B, A])
for b, seq in ((6.0, [E, D]), (8.0, [A, C]), (16.0, [E, D])):
    linha_baixo(b, seq)
for tc, nota in ((14.0, E), (14.5, G), (15.0, A)):
    baixo(nota, tc, 0.4)
linha_baixo(18.0, [D], 4)
baixo(E, 19.0, 1.0)

# ---------- Bateria ----------
def bumbo():
    t = tempo(0.45)
    f = 50 + 140 * np.exp(-t * 35)
    clique = filtro(rng.standard_normal(len(t)), lo=2000) * np.exp(-t * 400) * 0.3
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + clique


def caixa():
    t = tempo(0.4)
    corpo = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 18) + 0.5 * np.sin(2 * np.pi * 330 * t) * np.exp(-t * 25)
    esteira = filtro(rng.standard_normal(len(t)), lo=1800, hi=10000) * np.exp(-t * 11)
    return corpo * 0.6 + esteira * 0.55


def tom(freq):
    t = tempo(0.5)
    f = freq * (1 + 0.5 * np.exp(-t * 20))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.9


def chimbal(aberto=False):
    t = tempo(0.3 if aberto else 0.06)
    r = filtro(rng.standard_normal(len(t)), lo=7000)
    return r * np.exp(-t * (9 if aberto else 60)) * 0.22


def prato(dur=2.6):
    t = tempo(dur)
    r = filtro(rng.standard_normal(len(t)), lo=3500)
    sino = sum(np.sin(2 * np.pi * f0 * t) for f0 in (3150, 4420, 5870)) * 0.03
    return (r * 0.35 + sino) * np.exp(-t * 1.6) * np.minimum(t / 0.002, 1)


def conducao():
    t = tempo(0.5)
    r = filtro(rng.standard_normal(len(t)), lo=5000)
    sino = np.sin(2 * np.pi * 5200 * t) * 0.15
    return (r * 0.12 + sino * 0.1) * np.exp(-t * 6)


def groove(t0, compassos=1, prato_inicio=False, ride=False):
    for c in range(compassos):
        tb = t0 + c * BAR
        for k in range(4):
            tk = tb + k * BEAT
            if k in (0, 2):
                soma(bat, bumbo(), tk, 0.8)
            if k == 2 or (k == 3 and c % 2):
                soma(bat, bumbo(), tk + E8, 0.6)
            if k in (1, 3):
                soma(bat, caixa(), tk, 0.75)
            for h in range(2):
                soma(bat, conducao() if ride else chimbal(aberto=(k == 3 and h == 1)), tk + h * E8, 1.0, 0.3)
    if prato_inicio:
        soma(bat, prato(), t0, 0.7, -0.3)


def virada_caixa(t0, dur):
    n = int(dur / (BEAT / 4))
    for k in range(n):
        soma(bat, caixa(), t0 + k * BEAT / 4, 0.35 + 0.45 * k / n, 0.05)


def virada_tons(t0):
    for k, f0 in enumerate([220, 220, 175, 175, 140, 140, 110, 110]):
        soma(bat, tom(f0), t0 + k * BEAT / 4, 0.7, 0.5 - k * 0.13)


groove(2.0)
groove(4.0)
virada_caixa(5.0, 1.0)  # substitui a segunda metade do compasso
groove(6.0, 2, prato_inicio=True, ride=True)
soma(bat, prato(), 8.0, 0.5, 0.3)
groove(10.0, 2, prato_inicio=True)
soma(bat, prato(), 12.0, 0.8, 0.3)
for tc in (14.0, 14.5, 15.0):
    soma(bat, bumbo(), tc, 0.9)
    soma(bat, prato(1.0), tc, 0.6, -0.2 if tc != 14.5 else 0.2)
virada_tons(15.0)
groove(16.0, 1, prato_inicio=True, ride=True)
for k in range(8):  # rufo 18-19 s
    soma(bat, caixa(), 18.0 + k * BEAT / 4, 0.3 + 0.07 * k)
    soma(bat, tom(110), 18.0 + k * BEAT / 4, 0.2 + 0.05 * k)
soma(bat, bumbo(), 19.0, 1.0)
soma(bat, prato(1.5), 19.0, 0.9, -0.3)
soma(bat, prato(1.5), 19.01, 0.7, 0.3)

# Sala: reverberação curta na bateria
ir = filtro(rng.standard_normal(int(0.9 * SR)), hi=6000) * np.exp(-np.arange(int(0.9 * SR)) / SR * 6)
ir /= np.sqrt(np.sum(ir**2))
for ch in range(2):
    L = N + len(ir)
    sala = np.fft.irfft(np.fft.rfft(bat[:, ch], L) * np.fft.rfft(ir, L), L)[:N]
    bat[:, ch] += sala * 0.18

# ---------- Efeitos ----------
def zap(dur=0.35):
    t = tempo(dur)
    zumbido = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.3 + filtro(rng.standard_normal(len(t)), lo=1500) * 0.7
    return zumbido * np.exp(-t * 9) * (rng.random(len(t)) > 0.3)


def subida(dur):
    t = tempo(dur)
    r = filtro(rng.standard_normal(len(t)), lo=400, hi=8000)
    return r * (t / dur) ** 3


soma(resto, zap(), 0.0, 0.25)
soma(resto, zap(), 1.0, 0.18, 0.4)
soma(resto, subida(1.0), 5.0, 0.25)
soma(resto, zap(0.6), 6.0, 0.35)
soma(resto, zap(0.5), 12.0, 0.4)  # plug conectando
soma(resto, subida(1.0), 18.0, 0.2)

if "--buses" in sys.argv:
    for nome, b in (("gtr", gtr), ("bat", bat), ("resto", resto)):
        X = np.abs(np.fft.rfft(b[:, 0]))
        f = np.fft.rfftfreq(N, 1 / SR)
        bandas = [(20, 150), (150, 600), (600, 2500), (2500, 6000), (6000, 20000)]
        e = [np.sum(X[(f >= a) & (f < z)] ** 2) for a, z in bandas]
        tot = sum(e)
        print(nome, "rms %.1f dB" % (20 * np.log10(np.sqrt(np.mean(b**2)) + 1e-9)), " ".join("%d-%d:%.0f%%" % (a, z, 100 * x / tot) for (a, z), x in zip(bandas, e)))

mix = gtr * 0.42 + bat * 1.0 + resto * 0.9
mix = mix / np.max(np.abs(mix)) * 0.95
mix = np.tanh(mix * 1.15) / np.tanh(1.15)  # cola do master
t = np.arange(N) / SR
mix *= np.clip((DUR - t) / 0.6, 0, 1)[:, None]
mix = mix / np.max(np.abs(mix)) * 0.93
pcm = (mix * 32767).astype("<i2")
with wave.open([a for a in sys.argv[1:] if not a.startswith("--")][0], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])
