// Scrapes meta teams from prydwen.gg into public/data/teams.json.
// Prydwen sits behind a Cloudflare challenge, so a real (headed) browser is used.
// Set HEADLESS=1 to try headless mode. Run with: npm run scrape-teams
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeName } from "../src/utils/teamMatching.js";

const SOURCE = "https://www.prydwen.gg/re1999/team-tier-list";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "public", "data", "teams.json");

const extract = () =>
  [...document.querySelectorAll(".custom-tier")].flatMap((tierEl) => {
    const tier = tierEl.querySelector(".tier-rating")?.textContent?.trim() ?? "";
    return [...tierEl.querySelectorAll(".single-team")].map((teamEl) => ({
      name: teamEl.querySelector(":scope > p")?.textContent?.trim() ?? "",
      tier,
      damageType: [...teamEl.classList].find((c) => c !== "single-team") ?? "",
      slots: [...teamEl.querySelectorAll(".team-setup > .single")].map((slot) =>
        [...slot.querySelectorAll("a")].map((a) => ({
          name: a.querySelector("img")?.getAttribute("alt")?.trim() ?? "",
          slug: a.getAttribute("href")?.split("/").pop() ?? "",
        }))
      ),
    }));
  });

const browser = await chromium.launch({ headless: process.env.HEADLESS === "1" });
try {
  const page = await browser.newPage();
  await page.goto(SOURCE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".single-team", { timeout: 90000 });
  const teams = (await page.evaluate(extract)).filter(
    (t) => t.name && t.slots.length > 0
  );
  if (teams.length === 0) {
    throw new Error("No teams found; page structure may have changed");
  }

  fs.writeFileSync(
    outFile,
    JSON.stringify({ source: SOURCE, scrapedAt: new Date().toISOString(), teams }, null, 2) + "\n"
  );

  const known = new Set(
    JSON.parse(fs.readFileSync(path.join(root, "public", "data", "arcanists.json"), "utf8")).map(
      (a) => normalizeName(a.Name)
    )
  );
  const unmatched = new Set(
    teams.flatMap((t) => t.slots.flat()).map((c) => c.name).filter((n) => !known.has(normalizeName(n)))
  );
  console.log(`Wrote ${teams.length} teams to ${outFile}`);
  if (unmatched.size) {
    console.warn("Names not found in arcanists.json (add to aliases in src/utils/teamMatching.ts):", [...unmatched]);
  }
} finally {
  await browser.close();
}
