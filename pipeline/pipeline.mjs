#!/usr/bin/env node
// Small helpers for run.sh. No dependencies beyond gray-matter (already a site dependency).
//   node pipeline/pipeline.mjs pick [--lane <name>]     -> JSON: lane, notes file, brief, limits
//   node pipeline/pipeline.mjs existing                 -> markdown list of current posts
//   node pipeline/pipeline.mjs record <slug> <lane> [notes-file]

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const write = (p, v) => fs.writeFileSync(path.join(root, p), JSON.stringify(v, null, 2) + "\n");

const lanesCfg = read("pipeline/lanes.json");
const state = read("pipeline/state.json");

function readyNotes() {
  const dir = path.join(root, "pipeline", "notes");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md")
    .map((f) => ({ f, mtime: fs.statSync(path.join(dir, f)).mtimeMs, fm: matter(fs.readFileSync(path.join(dir, f), "utf8")).data }))
    .filter((n) => n.fm.status === "ready")
    .sort((a, b) => a.mtime - b.mtime)
    .map((n) => `pipeline/notes/${n.f}`);
}

const [, , cmd, ...args] = process.argv;

if (cmd === "pick") {
  const forced = args[0] === "--lane" ? args[1] : null;
  const seq = lanesCfg.sequence;
  let lane = forced ?? seq[state.cursor % seq.length];
  const notes = readyNotes();
  if (lane === "notes" && notes.length === 0) lane = "explainer"; // nothing real to write about
  if (!lanesCfg.lanes[lane]) {
    console.error(`unknown lane: ${lane}`);
    process.exit(2);
  }
  const cfg = lanesCfg.lanes[lane];
  const notesFile = lane === "notes" ? notes[0] : "";
  console.log(
    JSON.stringify({
      lane,
      notesFile,
      brief: cfg.brief.replace("{{NOTES}}", notesFile),
      minWords: cfg.words[0],
      maxWords: cfg.words[1],
      minSources: cfg.minSources,
    }),
  );
} else if (cmd === "existing") {
  const dir = path.join(root, "content", "posts");
  const rows = fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => /\.mdx?$/.test(f))
        .map((f) => {
          const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
          return `- ${f.replace(/\.mdx?$/, "")}: ${data.title ?? ""} [${(data.tags ?? []).join(", ")}]`;
        })
    : [];
  const covered = state.covered.map((c) => `- ${c.slug} (${c.lane}, ${c.date})`);
  console.log([...rows, ...covered.filter((c) => !rows.some((r) => r.startsWith(`- ${c.slice(2).split(" ")[0]}`)))].join("\n") || "(none yet)");
} else if (cmd === "record") {
  const [slug, lane, notesFile] = args;
  state.cursor += 1;
  state.covered.push({ slug, lane, date: new Date().toLocaleDateString("en-CA") }); // local date, yyyy-mm-dd
  write("pipeline/state.json", state);
  if (notesFile && fs.existsSync(path.join(root, notesFile))) {
    const p = path.join(root, notesFile);
    const parsed = matter(fs.readFileSync(p, "utf8"));
    parsed.data.status = "used";
    parsed.data.used_in = slug;
    fs.writeFileSync(p, matter.stringify(parsed.content, parsed.data));
  }
} else {
  console.error("usage: pipeline.mjs pick|existing|record");
  process.exit(2);
}
