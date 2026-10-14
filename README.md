# Café e Criar · Estúdio

Templates da Café e Criar Marketing Design em [Remotion](https://www.remotion.dev/), no padrão do guia de marca (amarelo sobre preto, Baloo 2 + Poppins, sem emoji).

| Composição | Formato | Uso |
|---|---|---|
| `FeedPost` | 1080×1350 (4:5), imagem | Arte de feed do Instagram |
| `Reels` | 1080×1920 (9:16), 9 s a 30 fps | Reels e Stories |
| `ReelsOferta` | 1080×1920 (9:16), 15 s a 30 fps, com trilha | Reels de oferta com cortes no tempo da música |
| `BoasVindas` | 1080×1920 (9:16), 15 s a 30 fps, com trilha | Boas-vindas a cliente novo (nome e logo como props) |

Os textos de cada peça são props (`kicker`, `titulo`, `destaque`, `texto`, `cta`...), então uma nova peça não exige mexer no layout.

## Uso

```bash
npm install
npm run studio          # editor visual no navegador
npm run arte            # out/arte-feed.png
npm run reels           # out/reels.mp4
npx remotion still FeedPost out/post.png --props='{"titulo":"...","destaque":"..."}'
```

Boas-vindas para um cliente (logo em `public/clientes/`, props em `props/`; `logoRedondo: true` quando o logo já é um selo redondo):

```bash
npx remotion render BoasVindas out/boas-vindas.mp4 --props=props/trend-cable.json
```

Trilhas próprias, sintetizadas e livres de direitos: `python3 scripts/trilha.py public/audio/trilha-120bpm.wav` e `python3 scripts/trilha_boas_vindas.py public/audio/trilha-boas-vindas.wav`.

As fontes ficam em `public/fontes` e os logos em `public/`, então o render não depende de internet.

Licença do Remotion: gratuita para empresas com até 3 pessoas.
