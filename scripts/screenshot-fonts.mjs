import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = '/workspace/docs/screenshots'
const ART = '/opt/cursor/artifacts'
fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(ART, { recursive: true })

async function shot(page, baseName) {
  const file = `${baseName}.png`
  const p1 = path.join(OUT, file)
  const p2 = path.join(ART, file)
  await page.screenshot({ path: p1, fullPage: true })
  fs.copyFileSync(p1, p2)
  // Keep pixel-fonts-* copies in artifacts for the review trail
  fs.copyFileSync(p1, path.join(ART, `pixel-fonts-${baseName}.png`))
  console.log('saved', file)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 450, height: 920 } })
  await page.goto('http://127.0.0.1:4173/?dev=1', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all([
      document.fonts.load('16px "Press Start 2P"'),
      document.fonts.load('24px VT323'),
    ])
  })

  await page.getByLabel(/name your unit/i).fill('VOLT')
  await shot(page, '01-naming')
  await page.getByRole('button', { name: /boot device/i }).click()
  await page.getByText(/tap the egg to hatch/i).waitFor()

  for (let i = 0; i < 5; i++) {
    await page.getByLabel(/hatch egg/i).click()
    await page.waitForTimeout(200)
  }
  await page.getByText(/HUNGER/i).waitFor()
  await shot(page, '02-game')

  await page.getByRole('button', { name: /catch/i }).click()
  await page.getByText(/Orb Catch/i).waitFor()
  await page.waitForTimeout(400)
  await shot(page, '03-minigame')

  const deadline = Date.now() + 14000
  while (Date.now() < deadline) {
    const orbs = page.getByRole('button', { name: /catch orb/i })
    if ((await orbs.count()) > 0) {
      try {
        await orbs.first().click({ timeout: 500 })
      } catch {
        // ignore
      }
    }
    if (await page.getByText(/HUNGER/i).count()) break
    await page.waitForTimeout(200)
  }
  await page.getByText(/HUNGER/i).waitFor({ timeout: 8000 })

  await page.getByRole('button', { name: /^help$/i }).click()
  await page.getByText(/Field Manual/i).waitFor()
  await shot(page, '04-help')
  await page.getByRole('button', { name: /back to device/i }).click()

  await page.getByRole('button', { name: '+2h' }).click({ force: true })
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: '+6h' }).click({ force: true })
  await page.waitForTimeout(600)
  await shot(page, '02b-evolved')

  await page.evaluate(() => {
    const now = Date.now()
    const dead = {
      version: 1,
      name: 'VOLT',
      createdAt: now - 20 * 3600_000,
      lastTickAt: now,
      ageMs: 20 * 3600_000,
      stage: 'adult',
      adultForm: 'volt',
      stats: { hunger: 0, energy: 0, fun: 0, hygiene: 0, health: 0 },
      mood: 'dead',
      lightsOff: false,
      isSick: true,
      sickSince: now - 3600_000,
      isDead: true,
      deathAt: now,
      deathCause: 'untreated sickness',
      poopCount: 3,
      careScore: 400,
      careSamples: 5,
      hatchProgress: 5,
      muted: true,
      actionUntil: 0,
      lastPoopAt: now,
    }
    localStorage.setItem('neon-tamagotchi-v1', JSON.stringify(dead))
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    await document.fonts.ready
  })
  await page.getByText(/In memoriam/i).waitFor({ timeout: 5000 })
  await shot(page, '05-memorial')

  await page.getByRole('button', { name: /memorial card/i }).click({ force: true })
  await page.getByText(/Share Card/i).waitFor()
  await page.waitForTimeout(800)
  await shot(page, '06-share')

  console.log('docs screenshots refreshed')
  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
