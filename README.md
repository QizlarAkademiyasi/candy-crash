# Candy Crush · Qizlar Akademiyasi

GameMonetize Phaser bundle — **reklamasiz**, offline self-host uchun tayyor. GameMonetize SDK, banner/interstitial chaqiruvlari va “more games” olib tashlangan; o‘rniga [`js/ad-stub.js`](js/ad-stub.js) ishlatiladi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda ko‘rsatilgan URL (odatda `http://localhost:3000`) ni oching.

## Self-host

Butun repo papkasini static hosting’ga yuklang (Nginx, Cloudflare Pages, S3 + CDN, va hokazo). Kirish nuqtasi: [`index.html`](index.html).

## Assetlarni qayta yuklash

Manba CDN yangilansa:

```bash
npm run mirror
```

Bu skript assetlarni yuklaydi va [`scripts/patch-game-min.mjs`](scripts/patch-game-min.mjs) orqali reklama domain gate patch’ini qo‘llaydi.

## Vue rewrite arxivi

Oldingi Vue 3 loyiha: [`docs/archive/vue-rewrite/`](docs/archive/vue-rewrite/).

## Hujjatlar

- [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md) — smoke test
- [`docs/AD_REMOVAL_PATCHES.md`](docs/AD_REMOVAL_PATCHES.md) — patch tafsilotlari
