// Scrapes Prydwen's Reverse: 1999 character tier list into public/data/characterTiers.json.
// Prydwen sits behind a Cloudflare challenge, so a real (headed) browser is used.
// Set HEADLESS=1 to try headless mode. Run with: npm run scrape-character-tiers
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeName } from "../src/utils/teamMatching.js";

const SOURCE = "https://www.prydwen.gg/re1999/tier-list";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outFile = path.join(root, "public", "data", "characterTiers.json");

const extract = () => {
  const roleNames = {
    dps: "damage-dealer",
    "sub-dps": "sub-carry",
    support: "support",
    survival: "survival",
  };
  const versionText =
    document.querySelector(".tier-list-header .title span")?.innerText?.trim() ??
    "";
  const version = versionText.replace(/^\((.*)\)$/, "$1");

  const characters = [...document.querySelectorAll(".custom-tier")].flatMap(
    (tierEl) => {
      const tier = tierEl.querySelector(".tier-rating")?.textContent?.trim() ?? "";
      return [...tierEl.querySelectorAll(".employees-container")].flatMap(
        (roleEl) => {
          const roleClass = [...roleEl.classList].find(
            (className) => className !== "employees-container",
          );
          const role = roleClass ? roleNames[roleClass] : undefined;
          if (!role) {
            return [];
          }

          return [...roleEl.querySelectorAll("a[href*='/characters/']")].map(
            (characterEl) => ({
              name:
                characterEl.querySelector(".emp-name")?.textContent?.trim() ??
                "",
              slug: characterEl.getAttribute("href")?.split("/").pop() ?? "",
              tier,
              role,
              tags:
                characterEl.querySelector(".tags")?.textContent?.trim() ?? "",
            }),
          );
        },
      );
    },
  );

  return { version, characters };
};

const browser = await chromium.launch({
  headless: process.env.HEADLESS === "1",
});
try {
  const page = await browser.newPage();
  await page.goto(SOURCE, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".custom-tier .employees-container", {
    timeout: 90000,
  });
  await page.waitForFunction(
    () => document.querySelectorAll(".employees-container .emp-name").length > 0,
    { timeout: 90000 },
  );
  const { version, characters: scrapedCharacters } = await page.evaluate(extract);
  const characters = scrapedCharacters.filter(
    (character) => character.name && character.slug && character.tier,
  );
  if (!version || characters.length === 0) {
    throw new Error("No character tiers found; page structure may have changed");
  }
  if (characters.length !== scrapedCharacters.length) {
    throw new Error("Some character entries are incomplete; refusing to save");
  }

  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        source: SOURCE,
        scrapedAt: new Date().toISOString(),
        version,
        characters,
      },
      null,
      2,
    ) + "\n",
  );

  const known = new Set(
    JSON.parse(
      fs.readFileSync(
        path.join(root, "public", "data", "arcanists.json"),
        "utf8",
      ),
    ).map((arcanist) => normalizeName(arcanist.Name)),
  );
  const unmatched = new Set(
    characters
      .map((character) => character.name)
      .filter((name) => !known.has(normalizeName(name))),
  );
  console.log(
    `Wrote ${characters.length} characters (${version}) to ${outFile}`,
  );
  if (unmatched.size) {
    console.warn("Names not found in arcanists.json:", [...unmatched]);
  }
} finally {
  await browser.close();
}
