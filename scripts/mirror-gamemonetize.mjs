/**
 * Mirror GameMonetize Candy Crush static assets for offline self-host.
 * Re-run after upstream updates; then re-apply patch-game-min.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = 'https://html5.gamemonetize.co/ushitaltif0ig5by3w54p4cy9sd3yptt'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const ASSETS = {
  spritesheets: [
    'board',
    'BOOT-preloader',
    'bursteffects',
    'buttons',
    'dailyReward',
    'gems',
    'leaderboard',
    'mapsheet',
    'ssheet',
  ],
  sfx: [
    'boom.mp3',
    'sugarcrush.mp3',
    'sweet.mp3',
    'tasty.mp3',
    'delicious.mp3',
    'divine.mp3',
    'lvlcompleted.mp3',
    'lvlfailed.mp3',
    'booster.mp3',
    'brick_break.mp3',
    'cash_register.mp3',
    'chain_rattle.mp3',
    'chest_open.mp3',
    'chest_open_louder.mp3',
    'clock_tick.mp3',
    'coin_collect.mp3',
    'dirt_break.mp3',
    'exchange.mp3',
    'explosion_subtle.mp3',
    'forest_sounds.mp3',
    'ice_break_0.mp3',
    'ice_break_1.mp3',
    'lightning.mp3',
    'line.mp3',
    'match_1.mp3',
    'match_2.mp3',
    'match_3.mp3',
    'match_4.mp3',
    'match_5.mp3',
    'music.mp3',
    'pop.mp3',
    'stone_impact_1.mp3',
    'stone_impact_2.mp3',
    'stone_impact_3.mp3',
    'transition.mp3',
    'whoosh.mp3',
    'whoosh_short_1.mp3',
    'whoosh_short_2.mp3',
    'xylophone_positive.mp3',
    'xylophone_positive2.mp3',
    'xylophone_positive6.mp3',
    'xylophone_positive_12.mp3',
  ],
  images: [
    'BOOT-background_1.jpg',
    'BOOT-logo-ja.png',
    'BOOT-logo-mini-ja.png',
    'BOOT-logo-mini.png',
    'BOOT-logo.png',
    'Map_background_tileable_0.jpg',
    'Map_background_tileable_1.jpg',
    'Map_background_tileable_2.jpg',
    'Map_background_tileable_3.jpg',
    'map_margin.png',
  ],
  json: [
    'json.json',
    'languages.json',
    'levels.json',
    'map.json',
    'settings.json',
    'specialCandies.json',
    'tutorials.json',
  ],
}

const STATIC_PATHS = [
  'css/stylesheet.css',
  'js/custom-phaser.min.js',
  'js/game.min.js',
  'fonts/ComicSansBold.woff2',
  'fonts/ComicSansBold.woff',
  'img/bg.jpg',
  'img/icoCClm.png',
]

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

const OPTIONAL = new Set([
  'fonts/ComicSansBold.woff',
  'assets/hd/images/BOOT-logo-ja.png',
  'assets/hd/images/BOOT-logo-mini-ja.png',
])

async function download(rel) {
  const url = `${BASE}/${rel.replace(/^\//, '')}`
  const dest = path.join(ROOT, rel.replace(/\//g, path.sep))
  await ensureDir(dest)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`${res.status} ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(dest, buf)
  return dest
}

async function main() {
  const queue = [...STATIC_PATHS]
  for (const name of ASSETS.spritesheets) {
    queue.push(`assets/hd/spritesheets/${name}.png`)
    queue.push(`assets/hd/spritesheets/${name}.json`)
  }
  for (const name of ASSETS.sfx) {
    queue.push(`assets/sfx/${name}`)
  }
  for (const name of ASSETS.images) {
    queue.push(`assets/hd/images/${name}`)
  }
  for (const name of ASSETS.json) {
    queue.push(`assets/json/${name}`)
  }

  let ok = 0
  let fail = 0
  for (const rel of queue) {
    try {
      const dest = await download(rel)
      ok++
      console.log('OK', rel, `(${dest})`)
    } catch (e) {
      if (OPTIONAL.has(rel)) {
        console.warn('skip (optional):', rel)
        continue
      }
      fail++
      console.error('FAIL', rel, e.message)
    }
  }
  console.log(`\nDone: ${ok} ok, ${fail} failed`)
  if (fail > 0) process.exitCode = 1
  else {
    const { spawnSync } = await import('node:child_process')
    const patch = path.join(ROOT, 'scripts', 'patch-game-min.mjs')
    const r = spawnSync(process.execPath, [patch], { stdio: 'inherit' })
    if (r.status !== 0) process.exitCode = r.status ?? 1
  }
}

main()
