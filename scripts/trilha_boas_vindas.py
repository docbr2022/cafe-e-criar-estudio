"""Trilha sintetizada (livre de direitos) para o Reels de boas-vindas: 120 BPM, 15 s, Ré maior (D-A-Bm-G).
Acompanha a composição BoasVindas (1 batida = 15 quadros, 1 compasso = 2 s):
  0-2 s intro leve | 2-4 s subida com virada | 4 s drop + prato (logo do cliente)
  8 s brinde (tim-tim de copos) | 10/10,5/11 s acordes nas palavras | 12 s prato no encerramento.
Uso: python3 scripts/trilha_boas_vindas.py public/audio/trilha-boas-vindas.wav"""
import sys, wave
import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
mix = np.zeros((N, 2))


def nota(n):  # semitons a partir de A4
    return 440 * 2 ** (n / 12)


def fft_filtro(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * g, len(x))


def soma(sinal, t0, ganho=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    s = sinal[: N - i] * ganho
    mix[i : i + len(s), 0] += s * (1 - pan)
    mix[i : i + len(s), 1] += s * (1 + pan)


def tempo(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def kick():
    t = tempo(0.4)
    f = 48 + 120 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def snare(dur=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ruido = fft_filtro(rng.standard_normal(n), lo=1500, hi=9000)
    tom = np.sin(2 * np.pi * 200 * t) * np.exp(-t * 25)
    return ruido * 0.35 * np.exp(-t * 18) + tom * 0.5


def palma():
    t = tempo(0.22)
    r = fft_filtro(rng.standard_normal(len(t)), lo=900, hi=5000)
    e = np.zeros(len(t))
    for k in (0, 0.009, 0.02):
        e += (t >= k) * np.exp(-np.maximum(t - k, 0) * 55)
    return r * e * 0.3


def chimbal(aberto=False):
    t = tempo(0.2 if aberto else 0.05)
    r = fft_filtro(rng.standard_normal(len(t)), lo=7000)
    return r * np.exp(-t * (13 if aberto else 70)) * 0.25


def prato(dur=2.2):
    t = tempo(dur)
    r = fft_filtro(rng.standard_normal(len(t)), lo=4000)
    return r * np.exp(-t * 2.2) * 0.3


def saw(freq, dur, detune=(0,)):
    t = tempo(dur)
    return sum(2 * ((t * freq * 2 ** (d / 1200)) % 1) - 1 for d in detune) / len(detune)


def tri(freq, dur):
    t = tempo(dur)
    return 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1


def glock(freq, dur=0.7):
    t = tempo(dur)
    return (
        np.sin(2 * np.pi * freq * t) * np.exp(-t * 5)
        + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 14)
        + 0.15 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 30)
    ) * np.minimum(t / 0.001, 1)


def tim_tim():
    # Dois copos batendo: parciais inarmônicas agudas, com leve batimento.
    t = tempo(1.4)
    out = np.zeros(len(t))
    for base, atraso in ((2380, 0.0), (2960, 0.018)):
        tt = np.maximum(t - atraso, 0)
        for mult, amp, dec in ((1, 1, 2.6), (2.32, 0.5, 4), (4.25, 0.3, 7), (6.1, 0.15, 11)):
            out += amp * np.sin(2 * np.pi * base * mult * tt) * np.sin(2 * np.pi * 1.0 * mult * tt + 1) * np.exp(-tt * dec) * (t >= atraso)
    click = fft_filtro(rng.standard_normal(len(t)), lo=3000) * np.exp(-t * 300)
    return (out * 0.18 + click * 0.4)


def subida(dur):
    t = tempo(dur)
    r = fft_filtro(rng.standard_normal(len(t)), lo=500, hi=7000)
    tom = np.sin(2 * np.pi * np.cumsum(200 + 1400 * (t / dur) ** 2) / SR)
    return (r * 0.7 + tom * 0.15) * (t / dur) ** 2.5


# Acordes (semitons relativos a A4): D, A, Bm, G
acordes = [[-7, -3, 0], [-8, -5, 0], [-10, -7, -3], [-10, -7, -2]]
raizes = [-31, -36, -34, -38]
melodias = [
    [(0, 12), (0.5, 9), (1, 12), (1.5, 17), (2.5, 16), (3, 14)],
    [(0, 16), (0.5, 12), (1, 16), (1.5, 19), (2.5, 17), (3, 16)],
    [(0, 14), (0.5, 9), (1, 14), (1.5, 17), (2.5, 16), (3, 14)],
    [(0, 10), (0.5, 14), (1, 17), (1.5, 22), (2.5, 21), (3, 19)],
]

DROP = 2 * BAR  # 4 s
n_bars = int(np.ceil(DUR / BAR))
pad_bus = np.zeros(N)

for b in range(n_bars):
    t0 = b * BAR
    ac = acordes[b % 4]
    intro, build = b == 0, b == 1
    ultimo = t0 + BAR > DUR
    # Pad (vai abrindo o filtro na subida)
    pad = sum(saw(nota(n), BAR, detune=(-10, 0, 10)) for n in ac)
    pad = fft_filtro(pad, hi=700 if intro else 1100 if build else 2200)
    a = np.minimum(np.arange(len(pad)) / (0.04 * SR), 1) * np.minimum((len(pad) - np.arange(len(pad))) / (0.08 * SR), 1)
    i = int(t0 * SR)
    seg = (pad * a)[: N - i]
    pad_bus[i : i + len(seg)] += seg
    # Melodia de glockenspiel (gancho)
    for pos, n in melodias[b % 4]:
        if build and pos >= 3:
            continue
        soma(glock(nota(n)), t0 + pos * BEAT, 0.16 if intro else 0.2, 0.25)
    # Arpejo pluck em semicolcheias depois do drop
    if t0 >= DROP:
        seq = [ac[0] + 12, ac[1] + 12, ac[2] + 12, ac[1] + 24]
        for k in range(16):
            d = BEAT / 4
            s = tri(nota(seq[k % 4]), d * 1.4) * env(int(d * 1.4 * SR), 0.002, 0.07)
            soma(s, t0 + k * d, 0.08, -0.45 if k % 2 else 0.45)
        # Baixo no contratempo (pulsante)
        for k in range(4):
            d = BEAT / 2
            s = fft_filtro(saw(nota(raizes[b % 4]), d * 0.85, detune=(-6, 6)), hi=500) * env(int(d * 0.85 * SR), 0.003, 0.3)
            soma(s, t0 + k * BEAT + d, 0.42)
            soma(s * 0.6, t0 + k * BEAT, 0.25)
    # Bateria
    for k in range(4):
        tb = t0 + k * BEAT
        if tb >= DUR:
            break
        if intro:
            if k in (0, 2):
                soma(kick(), tb, 0.45)
            soma(chimbal(), tb + BEAT / 2, 0.8, 0.2)
        elif build:
            if k < 3:
                soma(kick(), tb, 0.6)
            # Virada de caixa acelerando (colcheias -> semicolcheias)
            passos = 2 if k < 2 else 4
            for h in range(passos):
                if k == 3 and h >= 2:
                    continue  # respiro antes do drop
                soma(snare(0.15), tb + h * BEAT / passos, 0.18 + 0.1 * (k + h / passos), 0.1)
        else:
            soma(kick(), tb, 0.75)
            if k in (1, 3):
                soma(snare(), tb, 0.45)
                soma(palma(), tb, 0.65)
            soma(chimbal(), tb, 0.6, 0.25)
            soma(chimbal(aberto=True), tb + BEAT / 2, 0.9, -0.2)

# Bombeamento do pad pelo bumbo (sidechain) e entrada no mix
t = np.arange(N) / SR
fase = (t % BEAT) / BEAT
duck = np.where(t >= DROP, 1 - 0.65 * np.exp(-fase * 7), 1.0)
soma(pad_bus * duck, 0, 0.075, -0.25)
soma(np.concatenate([np.zeros(int(0.012 * SR)), pad_bus * duck])[:N], 0, 0.075, 0.25)

# Efeitos que casam com os cortes
soma(subida(1.9), DROP - 1.9, 0.22)
for tc in (DROP, 4 * BAR, 6 * BAR):  # 4 s, 8 s, 12 s
    soma(prato(), tc, 0.6)
    soma(kick(), tc, 0.35)
soma(tim_tim(), 4 * BAR, 0.9)
for k, tc in enumerate((10.0, 10.5, 11.0)):
    stab = sum(saw(nota(n + 12), 0.3, detune=(-8, 8)) for n in acordes[1])
    stab = fft_filtro(stab, hi=3500) * env(len(stab), 0.003, 0.12)
    soma(stab, tc, 0.12 + 0.03 * k)
soma(glock(nota(17), 2.5), 14.0, 0.25)  # nota final (Ré agudo)

mix = mix / np.max(np.abs(mix)) * 0.9
fade = np.clip((DUR - t) / 0.9, 0, 1)
mix *= fade[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
pcm = (mix * 32767 * 0.95).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])
