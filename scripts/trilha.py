"""Trilha sintetizada (livre de direitos) para os Reels: 120 BPM, 15 s, Am-F-C-G.
Uso: python3 scripts/trilha.py public/audio/trilha-120bpm.wav"""
import sys, wave
import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
DUR = 15.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))


def nota(n):  # n = semitons a partir de A4
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
    if i >= N:
        return
    s = sinal[: N - i] * ganho
    mix[i : i + len(s), 0] += s * (1 - pan) / 1.0
    mix[i : i + len(s), 1] += s * (1 + pan) / 1.0


def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 45 + 110 * np.exp(-t * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * 1.0


def snare():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    ruido = fft_filtro(rng.standard_normal(n), lo=1500, hi=9000)
    tom = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)
    return (ruido * 0.35 * np.exp(-t * 18) + tom * 0.5)


def chimbal(aberto=False):
    n = int((0.18 if aberto else 0.05) * SR)
    t = np.arange(n) / SR
    r = fft_filtro(rng.standard_normal(n), lo=7000)
    return r * np.exp(-t * (14 if aberto else 70)) * 0.25


def palma():
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    r = fft_filtro(rng.standard_normal(n), lo=900, hi=5000)
    e = np.zeros(n)
    for k in (0, 0.01, 0.022):
        e += (t >= k) * np.exp(-np.maximum(t - k, 0) * 60)
    return r * e * 0.3


def saw(freq, dur, detune=(0,)):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for d in detune:
        f = freq * 2 ** (d / 1200)
        out += 2 * ((t * f) % 1) - 1
    return out / len(detune)


def tri(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    return 2 * np.abs(2 * ((t * freq) % 1) - 1) - 1


# Acordes (semitons relativos a A4): Am, F, C, G
acordes = [[0, 3, 7], [-4, 0, 3], [-9, -5, -2], [-2, 2, 5]]
raizes = [-24, -28, -33, -26]
BAR = 4 * BEAT
n_bars = int(np.ceil(DUR / BAR))

for b in range(n_bars):
    t0 = b * BAR
    ac = acordes[b % 4]
    intro = b == 0
    fim = t0 >= 14.0
    # Pad de acordes (saw detunado, filtrado), entra mais aberto depois da intro
    pad = sum(saw(nota(n - 12), BAR, detune=(-9, 0, 9)) for n in ac)
    pad = fft_filtro(pad, hi=900 if intro else 1800)
    a = np.minimum(np.arange(len(pad)) / (0.05 * SR), 1) * np.minimum((len(pad) - np.arange(len(pad))) / (0.1 * SR), 1)
    soma(pad * a, t0, 0.09, -0.3)
    soma(pad * a, t0 + 0.012, 0.09, 0.3)
    # Arpejo em colcheias (pluck)
    seq = [ac[0] + 12, ac[1] + 12, ac[2] + 12, ac[1] + 12, ac[0] + 24, ac[2] + 12, ac[1] + 12, ac[2] + 12]
    for i, n in enumerate(seq):
        d = BEAT / 2
        s = tri(nota(n), d * 1.5) * env(int(d * 1.5 * SR), 0.002, 0.12)
        soma(s, t0 + i * d, 0.14, 0.4 if i % 2 else -0.4)
    if not intro:
        # Baixo
        for i in range(8):
            if i in (1, 5):
                continue
            d = BEAT / 2
            s = fft_filtro(saw(nota(raizes[b % 4]), d * 0.9), hi=400) * env(int(d * 0.9 * SR), 0.004, 0.25)
            soma(s, t0 + i * d, 0.35)
    for k in range(4):
        tb = t0 + k * BEAT
        if tb >= DUR:
            break
        if not intro or k in (0, 2):
            soma(kick(), tb, 0.7)
        if not intro and k in (1, 3):
            soma(snare(), tb, 0.55)
            soma(palma(), tb, 0.6)
        for h in range(2):
            if not intro or h == 1:
                soma(chimbal(aberto=(h == 1 and k == 3)), tb + h * BEAT / 2, 1.0, 0.2)
    # Whoosh (subida de ruído) antes de cada troca de compasso
    w = int(0.45 * SR)
    r = fft_filtro(rng.standard_normal(w), lo=600, hi=6000)
    soma(r * np.linspace(0, 1, w) ** 3, t0 + BAR - 0.45, 0.12)

# Impacto final + fade
mix = mix / np.max(np.abs(mix)) * 0.89
t = np.arange(N) / SR
fade = np.clip((DUR - t) / 0.8, 0, 1)
mix *= fade[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3)
pcm = (mix * 32767 * 0.95).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])
