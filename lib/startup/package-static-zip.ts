import AdmZip from "adm-zip";
import type { GeneratedStartupPayload, StartupLandingSection } from "@/lib/startup/types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sectionHtml(section: StartupLandingSection, accent: string): string {
  switch (section.type) {
    case "hero":
      return `
        <section class="hero">
          <p class="badge">${escapeHtml(section.headline.split(" ")[0] ?? "Launch")}</p>
          <h1>${escapeHtml(section.headline)}</h1>
          <p class="lead">${escapeHtml(section.subheadline)}</p>
          <a class="cta" href="#contact">${escapeHtml(section.cta)}</a>
        </section>`;
    case "features":
      return `
        <section class="block">
          <h2>${escapeHtml(section.title)}</h2>
          <ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>`;
    case "pricing":
      return `
        <section class="block pricing">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="plans">
            ${section.plans
              .map(
                (plan) => `
              <article class="plan${plan.highlighted ? " highlighted" : ""}">
                <h3>${escapeHtml(plan.name)}</h3>
                <p class="price">${escapeHtml(plan.price)}</p>
                ${plan.description ? `<p>${escapeHtml(plan.description)}</p>` : ""}
              </article>`,
              )
              .join("")}
          </div>
        </section>`;
    case "cta":
      return `
        <section class="block cta-block">
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.subtitle)}</p>
          <a class="cta" href="#contact">${escapeHtml(section.button)}</a>
        </section>`;
    case "showcase":
      return `
        <section class="block">
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.caption)}</p>
          ${section.imageUrl ? `<img src="${escapeHtml(section.imageUrl)}" alt="${escapeHtml(section.imageAlt ?? section.title)}" loading="lazy" />` : ""}
        </section>`;
    default:
      return "";
  }
}

export function renderStartupStaticHtml(payload: GeneratedStartupPayload): string {
  const hue = payload.brand.primaryHue;
  const accent = `hsl(${hue} 85% 55%)`;
  const accentDark = `hsl(${hue} 70% 42%)`;
  const sections = payload.landingSections.map((s) => sectionHtml(s, accent)).join("\n");

  const fallbackFeatures =
    payload.features.length > 0
      ? `<section class="block"><h2>Features</h2><ul>${payload.features.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul></section>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(payload.name)}</title>
  <meta name="description" content="${escapeHtml(payload.tagline)}" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: #0c0a09; color: #f5f5f4; line-height: 1.6; }
    .wrap { max-width: 56rem; margin: 0 auto; padding: 0 1.25rem 4rem; }
    .top { border-bottom: 1px solid rgba(255,255,255,.08); padding: .75rem; text-align: center; font-size: .7rem; color: #a8a29e; }
    .top a { color: ${accent}; text-decoration: none; }
    header { padding: 2rem 0 1rem; }
    header h1 { font-size: 1.5rem; }
    header p { color: #a8a29e; margin-top: .25rem; }
    .hero { text-align: center; padding: 3rem 0 2rem; }
    .badge { display: inline-block; border: 1px solid ${accent}; color: ${accent}; border-radius: 999px; padding: .25rem .75rem; font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 1rem; }
    .hero h1 { font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; margin-bottom: 1rem; }
    .lead { color: #d6d3d1; font-size: 1.1rem; max-width: 36rem; margin: 0 auto 1.5rem; }
    .cta { display: inline-block; background: ${accent}; color: #fff; text-decoration: none; font-weight: 600; padding: .75rem 1.5rem; border-radius: .75rem; }
    .cta:hover { background: ${accentDark}; }
    .block { padding: 2.5rem 0; border-top: 1px solid rgba(255,255,255,.08); }
    .block h2 { font-size: 1.5rem; margin-bottom: 1rem; }
    ul { list-style: none; display: grid; gap: .75rem; }
    li { padding: .75rem 1rem; border-radius: .75rem; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.06); }
    .plans { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
    .plan { padding: 1.25rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03); }
    .plan.highlighted { border-color: ${accent}; box-shadow: 0 0 0 1px ${accent}; }
    .price { font-size: 1.25rem; font-weight: 700; color: ${accent}; margin: .5rem 0; }
    img { max-width: 100%; border-radius: 1rem; margin-top: 1rem; }
    footer { text-align: center; padding: 2rem 0; color: #78716c; font-size: .75rem; }
  </style>
</head>
<body>
  <div class="top">Built with <a href="https://mr.software">Mr.Software</a></div>
  <div class="wrap">
    <header>
      <h1>${escapeHtml(payload.name)}</h1>
      <p>${escapeHtml(payload.tagline)}</p>
    </header>
    ${sections || fallbackFeatures}
    <footer id="contact">&copy; ${new Date().getFullYear()} ${escapeHtml(payload.name)}</footer>
  </div>
</body>
</html>`;
}

export function packageStartupStaticZip(payload: GeneratedStartupPayload): Buffer {
  const zip = new AdmZip();
  zip.addFile("index.html", Buffer.from(renderStartupStaticHtml(payload), "utf8"));
  return zip.toBuffer();
}
