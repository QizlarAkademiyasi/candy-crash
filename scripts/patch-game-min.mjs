/**
 * Patches game.min.js: ad gate removal + 520px viewport cap (2048-game parity).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const GAME = path.join(ROOT, 'js', 'game.min.js')
const MAX_VIEW_WIDTH = 520

const DOMAIN_GATES = [
  '"games.ollgames.ru"==document.domain?(',
  '"games.ollgames.ru" == document.domain ? (',
]
const DOMAIN_ALWAYS = '!0?('

function patchViewportCap(js) {
  let parentPatched = 0
  if (!js.includes('Phaser.CANVAS, "game-root"')) {
    const before = js
    js = js.replace(
      'new Phaser.Game(800, 1100, Phaser.CANVAS, "", null, !0)',
      'new Phaser.Game(800, 1100, Phaser.CANVAS, "game-root", null, !0)',
    )
    if (js !== before) parentPatched = 1
  }

  let scalePatched = 0
  const aspectBefore = 'var a = window.innerWidth / window.innerHeight,'
  const aspectAfter = `var viewW=Math.min(window.innerWidth,${MAX_VIEW_WIDTH}),viewH=window.innerHeight,a=viewW/viewH,`
  if (js.includes(aspectBefore)) {
    js = js.replace(aspectBefore, aspectAfter)
    scalePatched = 1
  }

  const heightBefore = 'Math.ceil(c * (window.innerHeight / window.innerWidth))'
  const heightAfter = 'Math.ceil(c * (viewH / viewW))'
  if (js.includes(heightBefore)) {
    js = js.replace(heightBefore, heightAfter)
    scalePatched = 1
  }

  let resizeCbPatched = 0
  const resizeBefore =
    'G.old_w == window.innerWidth && G.old_h == window.innerHeight || (G.old_w = window.innerWidth, G.old_h = window.innerHeight, game.resizeGame())'
  const resizeAfter = `G.old_w == Math.min(window.innerWidth,${MAX_VIEW_WIDTH}) && G.old_h == window.innerHeight || (G.old_w = Math.min(window.innerWidth,${MAX_VIEW_WIDTH}), G.old_h = window.innerHeight, game.resizeGame())`
  if (js.includes(resizeBefore)) {
    js = js.replace(resizeBefore, resizeAfter)
    resizeCbPatched = 1
  }

  return { js, parentPatched, scalePatched, resizeCbPatched }
}

async function main() {
  let js = await fs.readFile(GAME, 'utf8')
  let beforeGate = 0
  for (const gate of DOMAIN_GATES) {
    const n = js.split(gate).length - 1
    beforeGate += n
    js = js.split(gate).join(DOMAIN_ALWAYS)
  }
  const beforeAnby = (js.match(/AnbycookGP\(\),/g) || []).length
  js = js.replace(/AnbycookGP\(\),/g, '')
  js = js.replace(
    /AnbycookGP\s*=\s*function\(\)\s*\{\s*window\.parent\.postMessage\("okvid",\s*"\*"\)\s*\}/,
    'AnbycookGP=function(){}',
  )

  const { js: capped, parentPatched, scalePatched, resizeCbPatched } =
    patchViewportCap(js)
  js = capped

  await fs.writeFile(GAME, js)
  console.log(
    `Patched ${GAME}: domain gates ${beforeGate}, AnbycookGP calls removed ${beforeAnby}, viewport parent ${parentPatched}, scale ${scalePatched}, resizeCb ${resizeCbPatched}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
