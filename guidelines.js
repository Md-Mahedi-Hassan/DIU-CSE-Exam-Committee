const status = document.querySelector("#guidelineStatus");
const list = document.querySelector("#guidelineList");
const title = document.querySelector("#guidelineTitle");
const slotOverview = document.querySelector("#slotOverview");
const markedNotice = document.querySelector("#markedNotice");
const cooperationNote = document.querySelector("#cooperationNote");
const centerName = document.querySelector("#centerName");

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadGuidelines() {
  try {
    const pdfjs = await import("./pdf.min.js");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("./pdf.worker.js", import.meta.url).href;
    const response = await fetch(`./duty-roster.pdf?refresh=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`duty-roster.pdf returned HTTP ${response.status}.`);
    const document = await pdfjs.getDocument({ data: new Uint8Array(await response.arrayBuffer()) }).promise;
    const allPageLines = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      const items = content.items
        .filter((item) => item.str?.trim())
        .map((item) => ({
          text: clean(item.str),
          x: item.transform[4],
          y: viewport.height - item.transform[5],
        }))
        .sort((a, b) => a.y - b.y || a.x - b.x);

      const pageLines = [];
      for (const item of items) {
        let line = pageLines.find((candidate) => Math.abs(candidate.y - item.y) <= 5);
        if (!line) {
          line = { y: item.y, items: [], pageNumber };
          pageLines.push(line);
        }
        line.items.push(item);
      }
      pageLines.forEach((line) => {
        line.items.sort((a, b) => a.x - b.x);
        line.text = clean(line.items.map((item) => item.text).join(" "));
      });
      pageLines.sort((a, b) => a.y - b.y);
      allPageLines.push(...pageLines);
    }

    const lines = allPageLines;

    const allText = lines.map((line) => line.text).join(" ");
    const publishedTitle = lines.find((line) => /Invigilator'?s Duty (Plan|Roster)/i.test(line.text))?.text;
    if (publishedTitle) title.textContent = `Extracted from ${publishedTitle}.`;

    const times = {};
    for (const line of lines) {
      const match = line.text.match(/Slot\s*([ABC])\s*[-:=]?\s*(\d{1,2}:?\d{0,2}\s*[AP]M\s*(?:to|-)\s*\d{1,2}:?\d{0,2}\s*[AP]M)/i);
      if (match) times[match[1].toUpperCase()] = clean(match[2]);
    }
    slotOverview.innerHTML = ["A", "B", "C"].map((slot) => `
      <article>
        <b class="slot-badge slot-${slot.toLowerCase()}">${slot}</b>
        <div><span>Slot ${slot}</span><strong>${escapeHtml(times[slot] || "Time not detected")}</strong></div>
      </article>
    `).join("");

    const centerMatch = allText.match(/Center.*?(KT-?\s*204)|\b(KT-?\s*204)\b/i);
    if (centerMatch) centerName.textContent = `Center: ${(centerMatch[1] || centerMatch[2]).replace(/\s+/g, "")}`;

    const starLine = lines.find((line) => /Marked Faculty Members/i.test(line.text));
    if (starLine) markedNotice.textContent = starLine.text.replace(/^\*\s*/, "");

    const noticeStart = lines.findIndex((line) => /^1\.\s/.test(line.text));
    const noticeEnd = lines.findIndex((line, index) => index > noticeStart && /Md Jakaria|Contact Point|Convener/i.test(line.text));
    const noticeLines = lines.slice(noticeStart, noticeEnd > noticeStart ? noticeEnd : lines.length);
    const guidelines = [];
    let current = null;
    for (const line of noticeLines) {
      const start = line.text.match(/^(\d+)\.\s*(.*)/);
      if (start) {
        current = { number: Number(start[1]), text: start[2] };
        guidelines.push(current);
      } else if (current && line.text && !/^-{3,}/.test(line.text)) {
        current.text = clean(`${current.text} ${line.text}`);
      }
    }

    if (!guidelines.length) throw new Error("The numbered Important Notice section was not detected.");
    list.innerHTML = guidelines.map((item) => `
      <article class="guideline-item">
        <span>${item.number}</span>
        <p>${escapeHtml(item.text)}</p>
      </article>
    `).join("");

    const nbStart = lines.findIndex((line) => /^N\.\s*B\./i.test(line.text));
    if (nbStart >= 0) {
      const cooperation = [];
      for (let index = nbStart; index < noticeStart; index += 1) {
        if (lines[index]?.text) cooperation.push(lines[index].text);
      }
      if (cooperation.length) cooperationNote.textContent = clean(cooperation.join(" "));
    }

    status.className = "data-status ready";
    status.innerHTML = "<i></i> Guidelines ready";
  } catch (error) {
    console.error(error);
    status.className = "data-status error";
    status.innerHTML = "<i></i> Notice error";
    list.innerHTML = `<div class="no-suggestion">Could not extract guidelines: ${escapeHtml(error.message)}</div>`;
  }
}

if (!globalThis.__GUIDELINES_PARSER_TEST__) loadGuidelines();

export { loadGuidelines };
