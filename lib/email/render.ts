import type { Profile } from "@/config/profiles";

export interface DigestItem {
  itemScoreId: number;
  band: "A" | "B" | "C";
  title: string;
  journal: string | null;
  authors: string[] | null;
  url: string;
  doi: string | null;
  summary: {
    hook?: string;
    key_finding?: string;
    mechanism_novelty?: string;
    relation_to_work?: string;
    competing_group_note?: string | null;
    scoop_risk_flag?: string | null;
  };
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
  /**
   * item_score IDs actually shown (after per-section caps). Only these
   * should be marked included_in_digest=true — anything cut for being over
   * the cap rolls over to the next send instead of vanishing.
   */
  includedItemScoreIds: number[];
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

function byline(item: DigestItem): string {
  const parts = [item.journal, item.authors?.[0] ? `${item.authors[0]}${item.authors.length > 1 ? " et al." : ""}` : null].filter(
    Boolean,
  );
  return parts.join(" · ");
}

/** Every item — hero, relevant, or adjacent — always links out to the actual source, never just a title. */
function sourceLinkHtml(item: DigestItem): string {
  return `<a href="${escapeHtml(item.url)}" style="color:#0b5fff;text-decoration:none;font-weight:600;">Read the full paper →</a>`;
}

function heroItemHtml(item: DigestItem): string {
  const s = item.summary;
  return `
  <div style="border:2px solid #0b5fff;border-radius:8px;padding:20px;margin-bottom:24px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#0b5fff;font-weight:700;margin-bottom:8px;">Top pick today</div>
    <a href="${escapeHtml(item.url)}" style="color:#111;text-decoration:none;">
      <h2 style="font-size:19px;margin:0 0 4px 0;line-height:1.3;">${escapeHtml(item.title)}</h2>
    </a>
    <div style="font-size:13px;color:#666;margin-bottom:12px;">${escapeHtml(byline(item))}</div>
    ${s.hook ? `<p style="font-size:15px;font-weight:600;margin:0 0 10px 0;">${escapeHtml(s.hook)}</p>` : ""}
    ${s.key_finding ? `<p style="font-size:14px;margin:0 0 10px 0;">${escapeHtml(s.key_finding)}</p>` : ""}
    ${s.mechanism_novelty ? `<p style="font-size:14px;margin:0 0 10px 0;"><strong>What's new:</strong> ${escapeHtml(s.mechanism_novelty)}</p>` : ""}
    ${s.relation_to_work ? `<p style="font-size:14px;margin:0 0 10px 0;color:#333;"><strong>Why it matters to you:</strong> ${escapeHtml(s.relation_to_work)}</p>` : ""}
    ${s.competing_group_note ? `<p style="font-size:13px;margin:0 0 10px 0;color:#555;">${escapeHtml(s.competing_group_note)}</p>` : ""}
    ${s.scoop_risk_flag ? `<p style="font-size:13px;margin:0 0 10px 0;color:#b45309;">⚠ ${escapeHtml(s.scoop_risk_flag)}</p>` : ""}
    <div style="margin-top:8px;">${sourceLinkHtml(item)}</div>
  </div>`;
}

function relevantItemHtml(item: DigestItem): string {
  const s = item.summary;
  return `
  <div style="padding:14px 0;border-bottom:1px solid #eee;">
    <a href="${escapeHtml(item.url)}" style="color:#111;text-decoration:none;">
      <h3 style="font-size:16px;margin:0 0 4px 0;line-height:1.3;">${escapeHtml(item.title)}</h3>
    </a>
    <div style="font-size:12px;color:#666;margin-bottom:8px;">${escapeHtml(byline(item))}</div>
    ${s.hook ? `<p style="font-size:14px;margin:0 0 6px 0;">${escapeHtml(s.hook)}</p>` : ""}
    ${s.key_finding ? `<p style="font-size:13px;margin:0 0 6px 0;color:#333;">${escapeHtml(s.key_finding)}</p>` : ""}
    ${s.relation_to_work ? `<p style="font-size:13px;margin:0 0 6px 0;color:#555;">${escapeHtml(s.relation_to_work)}</p>` : ""}
    ${s.scoop_risk_flag ? `<p style="font-size:12px;margin:0 0 6px 0;color:#b45309;">⚠ ${escapeHtml(s.scoop_risk_flag)}</p>` : ""}
    <div>${sourceLinkHtml(item)}</div>
  </div>`;
}

function adjacentItemHtml(item: DigestItem): string {
  return `
  <div style="padding:8px 0;border-bottom:1px solid #f2f2f2;font-size:13px;">
    <a href="${escapeHtml(item.url)}" style="color:#111;text-decoration:none;font-weight:600;">${escapeHtml(item.title)}</a>
    ${item.summary.hook ? ` — ${escapeHtml(truncate(item.summary.hook, 160))}` : ""}
    &nbsp;<a href="${escapeHtml(item.url)}" style="color:#0b5fff;text-decoration:none;">(full paper)</a>
  </div>`;
}

export function renderDigestEmail(profile: Profile, sinceLabel: string, items: DigestItem[]): RenderedEmail {
  const caps = profile.digestCaps;
  const hero = items.filter((i) => i.band === "A").slice(0, caps.hero);
  const relevant = items.filter((i) => i.band === "B").slice(0, caps.relevant);
  const adjacent = items.filter((i) => i.band === "C").slice(0, caps.adjacent);

  const totalShown = hero.length + relevant.length + adjacent.length;
  const totalAvailable = items.length;
  const overflowNote =
    totalAvailable > totalShown
      ? `<p style="font-size:12px;color:#888;">Busy stretch — showing the top ${totalShown} of ${totalAvailable} relevant items ${sinceLabel}.</p>`
      : "";

  let subject: string;
  if (hero.length > 0) {
    subject = truncate(hero[0].title, 68);
  } else if (relevant.length > 0) {
    subject = truncate(`Nothing must-read, but worth a look: ${relevant[0].title}`, 68);
  } else {
    subject = `Quiet stretch ${sinceLabel} — nothing matched your topics`;
  }

  const bodyHtml = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;color:#111;">
      <p style="font-size:13px;color:#666;">Good morning, ${escapeHtml(profile.name)} — here's what's new ${sinceLabel}.</p>
      ${
        hero.length > 0
          ? hero.map(heroItemHtml).join("")
          : `<p style="font-size:14px;color:#555;">No must-read papers matched your core topics ${sinceLabel}. ${
              relevant.length + adjacent.length > 0 ? "Here's what came close:" : "Quiet stretch — nothing to report."
            }</p>`
      }
      ${
        relevant.length > 0
          ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#888;margin:20px 0 4px 0;">Also relevant</h3>${relevant.map(relevantItemHtml).join("")}`
          : ""
      }
      ${
        adjacent.length > 0
          ? `<h3 style="font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#888;margin:20px 0 4px 0;">Broader awareness</h3>${adjacent.map(adjacentItemHtml).join("")}`
          : ""
      }
      ${overflowNote}
      <p style="font-size:11px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:12px;">
        Chem Digest — sourced from ChemRxiv, journal ASAP feeds, CrossRef, and PubMed, scored for relevance by Claude.
        Every item links to its original source. Reply to this email with feedback.
      </p>
    </div>`;

  const textLines: string[] = [`Good morning, ${profile.name} — here's what's new ${sinceLabel}.`, ""];
  if (hero.length > 0) {
    for (const item of hero) {
      textLines.push(`TOP PICK: ${item.title}`, byline(item));
      if (item.summary.hook) textLines.push(item.summary.hook);
      if (item.summary.key_finding) textLines.push(item.summary.key_finding);
      if (item.summary.relation_to_work) textLines.push(`Why it matters to you: ${item.summary.relation_to_work}`);
      textLines.push(`Read the full paper: ${item.url}`, "");
    }
  } else {
    textLines.push(`No must-read papers matched your core topics ${sinceLabel}.`, "");
  }
  if (relevant.length > 0) {
    textLines.push("ALSO RELEVANT:");
    for (const item of relevant) {
      textLines.push(`- ${item.title} (${byline(item)})`);
      if (item.summary.hook) textLines.push(`  ${item.summary.hook}`);
      textLines.push(`  ${item.url}`);
    }
    textLines.push("");
  }
  if (adjacent.length > 0) {
    textLines.push("BROADER AWARENESS:");
    for (const item of adjacent) {
      textLines.push(`- ${item.title} — ${item.summary.hook ?? ""} (${item.url})`);
    }
    textLines.push("");
  }
  if (totalAvailable > totalShown) {
    textLines.push(`(Busy stretch — showing top ${totalShown} of ${totalAvailable} relevant items ${sinceLabel}.)`);
  }

  const includedItemScoreIds = [...hero, ...relevant, ...adjacent].map((i) => i.itemScoreId);

  return { subject, html: bodyHtml, text: textLines.join("\n"), includedItemScoreIds };
}
