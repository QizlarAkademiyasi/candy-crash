# Reklama olib tashlash patch’lari

## index.html

Olib tashlangan:

- `api.gamemonetize.com/sdk.js` inject
- `SDK_OPTIONS` va banner `setInterval` / `sdk.showBanner()`
- `#moreg` tashqi “more games” bloki
- `supports-ad-play-button` meta

Qo‘shilgan: `js/ad-stub.js` (Phaser dan oldin).

## js/ad-stub.js

| Event / global | Reja |
|----------------|------|
| `sdk.showBanner` / `showInterstitial` | no-op |
| `sdkHandler.trigger('save'/'restore')` | `localStorage` prefiks `candy-crush:` |
| `rewardedAd` | `callback(true)` |
| `playButtonPressed` | darhol `callback()` |
| `sgSettings.config.moreGames.displayButton` | `false` |

## js/game.min.js (patch-game-min.mjs)

O‘yin `"games.ollgames.ru" == document.domain` sharti bilan “Watch video” mukofotini faqat shu domenda beradi; boshqa joyda `NoMoreAds` popup chiqadi.

Patch:

- Domain shartini `!0` (doim true) qiladi (5 joy).
- `AnbycookGP(),` chaqiruvlarini olib tashlaydi (parent `postMessage` reklama).

Qayta `npm run mirror` dan keyin patch avtomatik qo‘llanadi.
