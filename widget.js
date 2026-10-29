// N & Q Run widget for Scriptable (iPhone).
// Setup: install "Scriptable" from the App Store, create a new script, paste this,
// then long-press the home screen > + > Scriptable > pick this script.
// APP_URL is filled in once the app is published.
const APP_URL = "https://noamfuchs-dotcom.github.io/nq-run/";

const SUN = new Color("#ff8fb8"), SEA = new Color("#7cc4ee"), INK = new Color("#2d3a5a"), SOFT = new Color("#ffffff", 0.85);
const DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const pad = n => String(n).padStart(2, "0");
const now = new Date(), today = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
const parse = s => { const p = s.split("-"); return new Date(+p[0], +p[1]-1, +p[2]); };
const fmt = s => { const d = parse(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
const secs = p => { const m = String(p || "7:00").split(":"); return (+m[0])*60 + (+m[1] || 0); };
const dur = s => { const m = Math.round(s/300)*5; return m >= 60 ? `${Math.floor(m/60)}h${pad(m%60)}` : `${m} min`; };
const daysToGo = Math.max(0, Math.round((new Date(2027,1,5) - parse(today)) / 864e5));

let data = null;
try { const r = new Request(APP_URL + "data.json?t=" + Date.now()); data = await r.loadJSON(); } catch (e) {}

const w = new ListWidget();
const g = new LinearGradient(); g.colors = [new Color("#ffa6c9"), new Color("#9fd6f5")]; g.locations = [0, 1]; w.backgroundGradient = g;
w.url = APP_URL;
w.setPadding(14, 14, 14, 14);
w.refreshAfterDate = new Date(Date.now() + 60*60*1000);

const top = w.addStack();
const t1 = top.addText("N & Q"); t1.font = Font.heavyRoundedSystemFont(14); t1.textColor = Color.white();
top.addSpacer();
const t2 = top.addText(`${daysToGo} days`); t2.font = Font.semiboldRoundedSystemFont(12); t2.textColor = SOFT;
w.addSpacer(6);

const runs = data && Array.isArray(data.runs) ? data.runs : [];
const next = runs.find(r => !r.doneKm && r.date >= today);
if (next) {
  const lab = w.addText(next.date === today ? "TODAY" : fmt(next.date).toUpperCase());
  lab.font = Font.boldSystemFont(11); lab.textColor = SOFT;
  const km = next.upTo ? `${next.km}–${next.upTo} km` : `${next.km} km`;
  const big = w.addText(km + (next.long ? " long" : ""));
  big.font = Font.heavyRoundedSystemFont(26); big.textColor = Color.white(); big.minimumScaleFactor = 0.6; big.lineLimit = 1;
  const p = secs(next.pace);
  const tm = "~" + dur(next.km * p) + (next.upTo ? "–" + dur(next.upTo * p) : "");
  const sub = w.addText(`${next.pace || "7:00"}/km · ${tm} · ${next.time || "06:30"}`);
  sub.font = Font.semiboldSystemFont(12); sub.textColor = Color.white(); sub.lineLimit = 1; sub.minimumScaleFactor = 0.7;
} else {
  const big = w.addText(data ? "Week done!" : "Open the app");
  big.font = Font.heavyRoundedSystemFont(22); big.textColor = Color.white();
}

w.addSpacer();
const plan = runs.reduce((a, r) => a + (+r.km || 0), 0), done = runs.reduce((a, r) => a + (+r.doneKm || 0), 0);
const foot = w.addText(`${Math.round(done*10)/10} / ${Math.round(plan*10)/10} km this week`);
foot.font = Font.semiboldSystemFont(11); foot.textColor = SOFT;

if (config.runsInWidget) Script.setWidget(w); else await w.presentSmall();
Script.complete();
