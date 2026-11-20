import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const OUT = '/workspace/docs/screenshots'
const ART = '/opt/cursor/artifacts'
fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(ART, { recursive: true })

async function shot(page, name) {
  const file = `${name}.png`
  const p1 = path.join(OUT, file)
  const p2 = path.join(ART, file)
  await page.screenshot({ path: p1, fullPage: true })
  fs.copyFileSync(p1, p2)
  console.log('saved', file)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 450, height: 920 } })
  await page.goto('http://127.0.0.1:4173/?dev=1', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  // 1 Naming
  await page.getByLabel(/name your unit/i).fill('VOLT')
  await shot(page, '01-naming')
  await page.getByRole('button', { name: /boot device/i }).click()
  await page.getByText(/tap the egg to hatch/i).waitFor()

  // 2 Hatch
  for (let i = 0; i < 5; i++) {
    await page.getByLabel(/hatch egg/i).click()
    await page.waitForTimeout(200)
  }
  await page.getByText(/HUNGER/i).waitFor()
  await shot(page, '02-game')

  // Care actions
  await page.getByRole('button', { name: /^feed$/i }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /^sleep$/i }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: /^wake$/i }).click()
  await page.waitForTimeout(300)

  // 3 Mini-game (Catch is more deterministic)
  await page.getByRole('button', { name: /catch/i }).click()
  await page.getByText(/Orb Catch/i).waitFor()
  await shot(page, '03-minigame')
  // Click orbs if present, else wait out timer
  const deadline = Date.now() + 14000
  while (Date.now() < deadline) {
    const orbs = page.getByRole('button', { name: /catch orb/i })
    const n = await orbs.count()
    if (n > 0) {
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

  // 4 Help
  await page.getByRole('button', { name: /^help$/i }).click()
  await page.getByText(/Field Manual/i).waitFor()
  await shot(page, '04-help')
  await page.getByRole('button', { name: /back to device/i }).click()

  // 5 Evolution via time skip
  await page.getByRole('button', { name: '+2h' }).click()
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: '+6h' }).click()
  await page.waitForTimeout(800)
  const stageText = await page.locator('p.font-pixel').first().textContent()
  console.log('stage after skip:', stageText)
  await shot(page, '02b-evolved')

  // Feed/care a bit then neglect to death
  await page.getByRole('button', { name: /^feed$/i }).click().catch(() => {})
  for (let i = 0; i < 8; i++) {
    await page.getByRole('button', { name: '+12h' }).click()
    await page.waitForTimeout(300)
    if (await page.getByText(/In memoriam/i).count()) break
  }
  await page.getByText(/In memoriam/i).waitFor({ timeout: 5000 })
  await shot(page, '05-memorial')

  // Share card
  await page.getByRole('button', { name: /memorial card/i }).click()
  await page.getByText(/Share Card/i).waitFor()
  await shot(page, '06-share')
  await page.getByRole('button', { name: /^close$/i }).click()

  // Restart
  await page.getByRole('button', { name: /^restart$/i }).click()
  await page.getByLabel(/name your unit/i).waitFor()
  console.log('playthrough OK')

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
