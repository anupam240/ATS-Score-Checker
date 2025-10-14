// ---------- Helpers: tokenization & skills extraction ----------

const STOPWORDS = new Set([
  "and","or","the","a","an","to","in","of","for","with","on","by","at","as","is","are","be",
  "that","this","it","from","we","you","our","your","their","they","i","he","she","them","us",
  "using","use","used","via","into","per","such","will","can","able","including","etc","&","/"
]);

// Common skills lexicon (extendable). Includes phrases and single words.
const SKILLS_LEXICON = new Set([
  // Programming & Data
  "javascript","typescript","react","node","express","next.js","vue","angular","svelte","html","css","sass","less",
  "tailwind","webpack","vite","rollup","babel","jquery",
  "python","django","flask","fastapi","pandas","numpy","matplotlib","scikit-learn","pytorch","tensorflow","keras",
  "java","spring","kotlin","scala","c","c++","c#","go","rust","ruby","rails","php","laravel","sql","mysql","postgresql",
  "mongodb","redis","elasticsearch","kafka","hadoop","spark","airflow","dbt","graphql","rest","grpc","docker","kubernetes",
  "aws","azure","gcp","terraform","ansible","linux","bash","git","github","gitlab","ci/cd","jenkins","circleci","travis",
  "testing","jest","mocha","chai","playwright","cypress","selenium","puppeteer","storybook",
  // Product & Design
  "figma","sketch","adobe xd","photoshop","illustrator","ux","ui","wireframing","prototyping",
  // PM & Business
  "agile","scrum","kanban","jira","confluence","stakeholder management","roadmap","backlog","estimation",
  // Data/Analytics
  "power bi","tableau","looker","excel","statistics","a/b testing","experimentation","sql server",
  // Security/DevSecOps
  "owasp","sast","dast","threat modeling","siem","splunk",
  // Misc
  "communication","leadership","mentoring","problem solving","debugging","performance optimization"
]);

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9.+#\/\-\s]/g, " ") // keep tech symbols like c++, c#, node.js, next.js
    .replace(/\s+/g, " ")
    .trim();
}

function ngrams(tokens, maxN = 3) {
  const grams = new Set();
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n).join(" ");
      grams.add(gram);
    }
  }
  return grams;
}

function tokenize(text) {
  const norm = normalize(text);
  const tokens = norm.split(" ").filter(t => t && !STOPWORDS.has(t));
  return tokens;
}

function extractSkillsFreeform(text) {
  const tokens = tokenize(text);
  const grams = ngrams(tokens, 3);
  const hits = new Set();

  // fuzzy helpers for common variants
  const normalizeSkill = (s) => s
    .replace(/\bnodejs\b/g, "node")
    .replace(/\bnode\.js\b/g, "node")
    .replace(/\bc\s*\+\+\b/g, "c++")
    .replace(/\bc\s*#\b/g, "c#")
    .replace(/\bci\s*\/\s*cd\b/g, "ci/cd")
    .replace(/\breactjs\b/g, "react")
    .replace(/\bjavascript\b/g, "javascript");

  // check phrases first (3->2->1 grams)
  for (const g of Array.from(grams).sort((a,b)=>b.split(" ").length-a.split(" ").length)) {
    const gNorm = normalizeSkill(g);
    if (SKILLS_LEXICON.has(gNorm)) hits.add(gNorm);
  }

  // heuristic: keep capitalized acronyms and techy tokens with +/-/#/.
  for (const t of tokens) {
    if (t.length <= 2) continue;
    if (/^[a-z0-9.+#\/-]+$/.test(t)) {
      if (SKILLS_LEXICON.has(t)) hits.add(t);
      // capture likely skills even if not in lexicon (acronyms etc.)
      if (/^(aws|gcp|ci\/cd|ui|ux)$/i.test(t)) hits.add(t);
    }
  }
  return Array.from(hits).sort();
}

function jaccardPrecisionRecall(jdSkills, resumeSkills) {
  const jd = new Set(jdSkills);
  const res = new Set(resumeSkills);
  const inter = new Set([...jd].filter(x => res.has(x)));
  const precision = res.size ? inter.size / res.size : 0;
  const recall = jd.size ? inter.size / jd.size : 0;
  const f1 = (precision + recall) ? (2 * precision * recall) / (precision + recall) : 0;
  // Our headline score: percentage of JD skills covered (recall)
  const coverage = Math.round(recall * 100);
  return { coverage, precision, recall, f1, matched: Array.from(inter).sort() };
}

// ---------- PDF -> text via PDF.js ----------

async function pdfToText(file) {
  if (!window.pdfjsLib) throw new Error("PDF.js not loaded");
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const strings = content.items.map(i => (typeof i.str === "string" ? i.str : ""));
    fullText += "\n" + strings.join(" ");
  }
  return fullText;
}

// ---------- UI wiring ----------

const jdEl = document.getElementById("jd");
const resumeEl = document.getElementById("resume");
const fileInfoEl = document.getElementById("fileInfo");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");

const resultsEl = document.getElementById("results");
const jdSkillsEl = document.getElementById("jdSkills");
const resumeSkillsEl = document.getElementById("resumeSkills");
const matchedSkillsEl = document.getElementById("matchedSkills");
const progressEl = document.getElementById("progress");
const scoreLabelEl = document.getElementById("scoreLabel");
const debugEl = document.getElementById("debug");

function pills(container, arr) {
  container.innerHTML = arr.map(s => `<span class="kpill">${s}</span>`).join(" ");
}

function saveState(state) {
  chrome.storage.local.set(state);
}

function restoreState() {
  chrome.storage.local.get(["jdText", "resumeName", "resumeText"], (data) => {
    if (data.jdText) jdEl.value = data.jdText;
    if (data.resumeName) fileInfoEl.textContent = data.resumeName;
    if (data.resumeText) {
      // nothing to show here; resume text is used internally for analysis
    }
  });
}

restoreState();

resumeEl.addEventListener("change", () => {
  const file = resumeEl.files && resumeEl.files[0];
  if (!file) { fileInfoEl.textContent = "No file selected"; return; }
  fileInfoEl.textContent = file.name;
  saveState({ resumeName: file.name });
});

clearBtn.addEventListener("click", () => {
  jdEl.value = "";
  resumeEl.value = "";
  fileInfoEl.textContent = "No file selected";
  resultsEl.style.display = "none";
  chrome.storage.local.clear();
});

analyzeBtn.addEventListener("click", async () => {
  const jdText = jdEl.value.trim();
  if (!jdText) {
    alert("Please paste the job description.");
    return;
  }
  let resumeText = "";
  const file = resumeEl.files && resumeEl.files[0];
  try {
    if (file) {
      resumeText = await pdfToText(file);
    } else {
      const fallback = confirm("No PDF selected. Continue by analyzing only the job description?");
      if (!fallback) return;
    }
  } catch (e) {
    console.error(e);
    debugEl.textContent = (debugEl.textContent || "") + "\nPDF error: " + (e && e.message ? e.message : String(e));
    alert("Failed to read the PDF. Ensure the file is a valid PDF and that PDF.js files are installed in libs/pdfjs/. See Debug details below.");
  }

  // Persist locally
  saveState({ jdText, resumeText });

  // Extract skills
  const jdSkills = extractSkillsFreeform(jdText);
  const resumeSkills = extractSkillsFreeform(resumeText);
  const { coverage, precision, recall, f1, matched } = jaccardPrecisionRecall(jdSkills, resumeSkills);

  // Update UI
  pills(jdSkillsEl, jdSkills);
  pills(resumeSkillsEl, resumeSkills);
  pills(matchedSkillsEl, matched);
  progressEl.style.width = coverage + "%";
  scoreLabelEl.innerHTML = `Match Score: <strong>${coverage}%</strong>`;
  resultsEl.style.display = "grid";

  debugEl.textContent = JSON.stringify({
    counts: { jdSkills: jdSkills.length, resumeSkills: resumeSkills.length, matched: matched.length },
    metrics: { coverage, precision: +precision.toFixed(3), recall: +recall.toFixed(3), f1: +f1.toFixed(3) }
  }, null, 2);
});