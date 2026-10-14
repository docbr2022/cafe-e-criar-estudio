# Café e Criar · Estúdio

Templates da Café e Criar Marketing Design em [Remotion](https://www.remotion.dev/), no padrão do guia de marca (amarelo sobre preto, Baloo 2 + Poppins, sem emoji).

| Composição | Formato | Uso |
|---|---|---|
| `FeedPost` | 1080×1350 (4:5), imagem | Arte de feed do Instagram |
| `Reels` | 1080×1920 (9:16), 9 s a 30 fps | Reels e Stories |

Os textos de cada peça são props (`kicker`, `titulo`, `destaque`, `texto`, `cta`...), então uma nova peça não exige mexer no layout.

## Uso

```bash
npm install
npm run studio          # editor visual no navegador
npm run arte            # out/arte-feed.png
npm run reels           # out/reels.mp4
npx remotion still FeedPost out/post.png --props='{"titulo":"...","destaque":"..."}'
```

As fontes ficam em `public/fontes` e os logos em `public/`, então o render não depende de internet.

Licença do Remotion: gratuita para empresas com até 3 pessoas.
