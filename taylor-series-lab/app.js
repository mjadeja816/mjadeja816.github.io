import {
  factorial,
  derivative,
  value,
  coefficients,
  polynomial,
  polyDerivative,
  fmt,
  fraction,
  parseNumber,
  convergence,
} from "./math.mjs";
import { lessons } from "./lessons.mjs";
const $ = (s) => document.querySelector(s),
  colors = {
    blue: "#79baff",
    gold: "#f4ca75",
    teal: "#70dcc7",
    coral: "#fc9e99",
    muted: "#acb9cc",
  };
const manualKinds = ["pendulum", "matching", "terms", "challenge"];
const defaults = (i) => {
  const l = lessons[i],
    c = Array(l.n + 1).fill(0);
  if (l.kind === "terms") {
    c[0] = 1;
    c[2] = -0.5;
  }
  return {
    n: l.n,
    k: l.k,
    a: l.a,
    x: l.x,
    span: l.span,
    c,
    manual: manualKinds.includes(l.kind),
    step: 0,
    pred: -1,
    hint: false,
    check: -1,
    d: 0,
    length: 1,
    layer: 0,
    inspect: l.k,
    previous: true,
    term: false,
    error: false,
    tangent: false,
    tolerance: 0.02,
    speed: 1,
  };
};
let index = 0,
  mode = "guided",
  states = lessons.map((_, i) => defaults(i)),
  history = [],
  timer = null,
  anim = null,
  finished = new Set();
function sanitize(raw, i) {
  const s = defaults(i),
    l = lessons[i];
  if (!raw || typeof raw !== "object") return s;
  const limits = {
    n:
      l.kind === "factorial"
        ? [1, 8]
        : l.kind === "area"
          ? [2, 2]
          : [0, ["convergence", "challenge"].includes(l.kind) ? 30 : 12],
    k: [0, 30],
    a: l.kind === "centre" ? [-Math.PI, Math.PI] : [l.a, l.a],
    x: l.range,
    span: [0.5, 5],
    step: [0, 4],
    pred: [-1, l.choices.length - 1],
    check: [-1, l.answers.length - 1],
    d: [0, 8],
    length: [0.5, 2],
    layer: [0, 2],
    inspect: [0, 30],
    tolerance: [0.001, 0.2],
    speed: [0.5, 2],
  };
  for (const [k, [lo, hi]] of Object.entries(limits))
    if (Number.isFinite(raw[k])) s[k] = Math.min(hi, Math.max(lo, raw[k]));
  for (const k of ["n", "k", "step", "pred", "check", "d", "layer", "inspect"])
    s[k] = Math.round(s[k]);
  s.k = Math.min(s.k, s.n);
  s.inspect = Math.min(s.inspect, s.n);
  s.d = Math.min(s.d, s.n);
  for (const k of ["manual", "hint", "previous", "term", "error", "tangent"])
    if (typeof raw[k] === "boolean") s[k] = raw[k];
  if (Array.isArray(raw.c))
    s.c = Array.from({ length: s.n + 1 }, (_, k) =>
      Number.isFinite(raw.c[k]) ? Math.max(-100, Math.min(100, raw.c[k])) : 0,
    );
  return s;
}
try {
  let saved = JSON.parse(localStorage.getItem("taylor-discovery-v1"));
  if (saved) {
    states = lessons.map((_, i) => sanitize(saved.states?.[i], i));
    index = Math.max(0, Math.min(9, Number(saved.index) || 0));
    if (["guided", "free", "classroom"].includes(saved.mode)) mode = saved.mode;
    finished = new Set(
      (saved.finished || []).filter(
        (i) => Number.isInteger(i) && i >= 0 && i < 10,
      ),
    );
  }
} catch {}
function readHash() {
  try {
    const p = new URLSearchParams(location.hash.slice(1));
    if (p.has("lab"))
      index = Math.max(0, Math.min(9, (parseInt(p.get("lab")) || 1) - 1));
    if (["guided", "free", "classroom"].includes(p.get("m"))) mode = p.get("m");
    if (p.has("s")) states[index] = sanitize(JSON.parse(p.get("s")), index);
  } catch {}
}
readHash();
const S = () => states[index],
  L = () => lessons[index],
  shown = () => mode === "free" || S().step > 0;
const current = () =>
  S().manual
    ? Array.from({ length: S().n + 1 }, (_, i) => S().c[i] || 0)
    : coefficients(L().id, S().n, S().a);
function save() {
  try {
    localStorage.setItem(
      "taylor-discovery-v1",
      JSON.stringify({ states, index, mode, finished: [...finished] }),
    );
  } catch {}
}
function remember() {
  history.push(JSON.stringify(S()));
  if (history.length > 80) history.shift();
}
function stop() {
  clearInterval(timer);
  timer = null;
  if (anim) cancelAnimationFrame(anim);
  anim = null;
}
function toast(msg) {
  $("#toast").textContent = msg;
  $("#toast").style.display = "block";
  setTimeout(() => ($("#toast").style.display = "none"), 3000);
}
function math(tex) {
  const el = document.createElement("span");
  try {
    window.katex.render(tex, el, {
      throwOnError: false,
      output: "htmlAndMathml",
      strict: false,
    });
  } catch {
    el.textContent = tex;
  }
  return el.innerHTML;
}
const fn = (id) =>
  ({
    cos: "\\cos x",
    sin: "\\sin x",
    exp: "e^x",
    log: "\\ln x",
    neglog: "-\\ln(1-x)",
    height: "1-\\cos x",
  })[id];
function dTex(id, n) {
  if (n === 0) return fn(id);
  if (id === "cos")
    return ["\\cos x", "-\\sin x", "-\\cos x", "\\sin x"][n % 4];
  if (id === "sin")
    return ["\\sin x", "\\cos x", "-\\sin x", "-\\cos x"][n % 4];
  if (id === "exp") return "e^x";
  if (id === "height")
    return n % 4 === 0
      ? "-\\cos x"
      : n % 4 === 1
        ? "\\sin x"
        : n % 4 === 2
          ? "\\cos x"
          : "-\\sin x";
  return id === "log"
    ? `${n % 2 === 0 ? "-" : ""}\\frac{${n > 1 ? `${n - 1}!` : "1"}}{x^{${n}}}`
    : `\\frac{${n > 1 ? `${n - 1}!` : "1"}}{(1-x)^{${n}}}`;
}
const basis = (a, k) =>
  k === 0
    ? ""
    : `${Math.abs(a) < 1e-12 ? "x" : `(x${a < 0 ? "+" : "-"}${fmt(Math.abs(a), 3)})`}${k === 1 ? "" : `^{${k}}`}`;
function polyTex(c, a) {
  let parts = [];
  c.forEach((v, k) => {
    if (v === 0) return;
    const f = fraction(Math.abs(v)),
      term = (k > 0 && f === "1" ? "" : f) + basis(a, k);
    parts.push(`${v < 0 ? "-" : parts.length ? "+" : ""}${term}`);
  });
  return parts.join(" ") || "0";
}
function control(key, label, min, max, step, v, numeric = false, extra = "") {
  return `<div class="control"><div class="control-top"><label for="${key}">${label}</label>${numeric ? `<input type="text" id="${key}-value" data-number="${key}" aria-label="${label}: exact value" value="${fmt(v, 8)}">` : `<output for="${key}">${fmt(v, 3)}</output>`}</div><input id="${key}" data-control="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${v}">${extra}</div>`;
}
function coefficientControls() {
  let s = S(),
    c = current();
  return `<div class="control"><div class="control-top"><label for="coefficient">Inspect coefficient</label><select id="coefficient">${Array.from({ length: s.n + 1 }, (_, k) => `<option value="${k}" ${s.k === k ? "selected" : ""}>c${sub(k)}</option>`).join("")}</select></div></div>${control("coefficient-value", `Coefficient c${sub(s.k)}`, Math.min(-2, c[s.k] || 0), Math.max(2, c[s.k] || 0), 0.001, c[s.k] || 0, true, "<small>Enter a decimal or fraction, such as 1/24.</small>")}`;
}
const sub = (n) =>
  String(n)
    .split("")
    .map((x) => "₀₁₂₃₄₅₆₇₈₉"[+x])
    .join("");
function controls() {
  let l = L(),
    s = S(),
    out = "";
  if (l.kind === "factorial") {
    out += control("n", "Power n", 1, 8, 1, s.n);
    out += `<div class="motion-controls"><button data-action="differentiate" ${s.d >= s.n ? "disabled" : ""}>Differentiate once</button><button data-action="rewind">Rewind</button></div>`;
  } else {
    if (l.kind === "pendulum") {
      out += control("length", "String length L", 0.5, 2, 0.1, s.length);
      out += control("x", "Angle θ", ...l.range, 0.01, s.x);
    } else {
      if (l.kind !== "area")
        out += control(
          "n",
          "Truncation order N",
          0,
          ["convergence", "challenge"].includes(l.kind) ? 30 : 12,
          1,
          s.n,
        );
      out += control(
        "x",
        l.kind === "area" ? "Endpoint x" : "Probe x",
        ...l.range,
        0.01,
        s.x,
      );
    }
    if (l.kind === "centre")
      out +=
        control("a", "Expansion centre a", -Math.PI, Math.PI, 0.01, s.a) +
        `<div class="presets"><button data-centre="0">a = 0</button><button data-centre="${Math.PI}">a = π</button><button data-centre="${Math.PI / 2}">a = π/2</button></div>`;
    if (["convergence", "challenge"].includes(l.kind)) {
      let vals =
        l.id === "exp"
          ? [1, 2, -1]
          : l.id === "log"
            ? [1.5, 2, 2.2]
            : [-1, -0.5, 0.5];
      out += `<div class="presets">${vals.map((v) => `<button data-probe="${v}">x = ${v}</button>`).join("")}</div><div class="motion-controls"><button data-action="add" ${s.n >= 30 ? "disabled" : ""}>Add a term</button><button data-action="play">${timer ? "Pause" : "Play terms"}</button></div>`;
      out += control("speed", "Playback speed", 0.5, 2, 0.5, s.speed);
    }
    if (l.kind === "area")
      out += `<div class="motion-controls"><button data-layer="1" aria-pressed="${s.layer >= 1}">Rectangle</button><button data-layer="2" aria-pressed="${s.layer >= 2}">+ Triangle</button></div>`;
    if (l.kind !== "area" && (s.step > 0 || mode === "free"))
      out += coefficientControls();
  }
  if (
    !["factorial", "area"].includes(l.kind) &&
    (s.step >= 3 || mode === "free")
  )
    out += `<div class="motion-controls"><button data-action="apply">Use derived c${sub(s.k)}</button>${s.step === 4 || mode === "free" ? '<button data-action="build">Build all terms</button>' : ""}</div>`;
  if (!["factorial", "area"].includes(l.kind))
    out += `<details class="control"><summary>View &amp; accuracy</summary>${control("span", "Half-width of view", 0.5, 5, 0.1, s.span)}${control("tolerance", "Error tolerance ε", 0.001, 0.2, 0.001, s.tolerance)}<small>Teal segments on the x-axis mark sampled points within ε.</small></details>`;
  $("#controls").innerHTML = out;
}
function render() {
  const l = L(),
    s = S();
  document.body.classList.toggle("classroom", mode === "classroom");
  $("#mode").value = mode;
  $("#lessons").innerHTML = lessons
    .map(
      (l, i) =>
        `<button data-lab="${i}" class="${i === index ? "active " : ""}${finished.has(i) ? "done" : ""}" ${i === index ? 'aria-current="step"' : ""}><span class="num">${finished.has(i) ? "✓" : String(i + 1).padStart(2, "0")}</span>${l.short}</button>`,
    )
    .join("");
  $("#chapter").textContent =
    `Experiment ${String(index + 1).padStart(2, "0")} / 10`;
  $("#title").textContent = l.title;
  $("#subtitle").textContent = l.sub;
  $("#question").textContent = l.question;
  $("#prompt").textContent = l.prompt;
  $("#stage-title").textContent =
    l.kind === "area"
      ? "Derivative graph · signed area"
      : l.kind === "factorial"
        ? "A term and its successive derivatives"
        : l.kind === "pendulum"
          ? "Height above the lowest point · metres"
          : `Function & local approximation · a = ${fmt(s.a, 3)}`;
  if (!["area", "factorial", "pendulum"].includes(l.kind))
    $("#stage-title").innerHTML =
      math("f(x)=" + fn(l.id)) + ` <span>· a = ${fmt(s.a, 3)}</span>`;
  $("#step-label").textContent =
    mode === "free"
      ? "Free exploration"
      : [
          "1 / 5 · Predict",
          "2 / 5 · Experiment",
          "3 / 5 · Differentiate",
          "4 / 5 · Find the coefficient",
          "5 / 5 · Apply & compare",
        ][s.step];
  $("#predictions").innerHTML = l.choices
    .map(
      (t, i) =>
        `<button data-predict="${i}" class="${s.pred === i ? "selected" : ""}" aria-pressed="${s.pred === i}">${t}</button>`,
    )
    .join("");
  $("#feedback").textContent = s.pred < 0 ? "" : l.feedback[s.pred];
  $("#hint-text").hidden = !s.hint;
  $("#hint-text").textContent = l.hint;
  $("#hint").textContent = s.hint ? "Hide hint" : "Give me a hint";
  $("#undo").disabled = !history.length;
  $("#reveal").textContent = [
    "Explore the construction",
    "Show the derivative",
    "Find the coefficient",
    "Show the term’s contribution",
    "Replay this construction",
  ][s.step];
  $("#step-back").disabled = s.step === 0;
  $("#step-next").disabled = s.step === 4;
  $("#reveal-count").textContent =
    mode === "free"
      ? "All steps available"
      : `${Math.max(0, s.step - 1)} / 3 revealed`;
  for (let key of ["previous", "term", "error", "tangent"])
    $("#show-" + key).checked = s[key];
  $("#legend").innerHTML =
    l.kind === "factorial"
      ? `<span style="color:${colors.blue}"><i></i>Original term</span><span style="color:${colors.gold}"><i></i>Current derivative</span>`
      : l.kind === "area"
        ? `<span style="color:${colors.blue}"><i></i>f′(t) = eᵗ</span><span style="color:${colors.gold}"><i></i>Rectangle</span><span style="color:${colors.teal}"><i></i>Triangle</span>`
        : `<span style="color:${colors.blue}"><i></i>Exact function</span><span style="color:${colors.gold}"><i></i>${s.manual ? "Your polynomial" : "Taylor polynomial"}</span><span style="color:${colors.coral}"><i></i>Probe error</span>`;
  controls();
  drawPlot();
  derivation();
  companion();
  $("#companion-title").textContent = l.companion;
  $("#checkpoint").innerHTML =
    `<p><strong>Pause &amp; think.</strong> ${l.checkpoint}</p>${l.answers.map((a, i) => `<button data-answer="${i}" aria-pressed="${s.check === i}">${a}</button>`).join("")}${s.check >= 0 ? `<p class="answer">${s.check === l.answer ? "Exactly. " : "Look again. "}${l.why}</p>` : ""}`;
  $("#prev-lab").disabled = index === 0;
  $("#next-lab").textContent =
    index === 9 ? "Return to the first lab ↺" : "Next lab →";
  $("#progress").textContent = `${finished.size} of 10 checkpoints explored`;
  save();
}
function derivation() {
  const l = L(),
    s = S(),
    k = s.k,
    a = s.a,
    level = mode === "free" ? 4 : s.step;
  let html = "";
  if (level < 2)
    html =
      '<div class="locked"><span class="lock-symbol">?</span><div>Try an adjustment first.<br>The derivation opens one step at a time when you are ready.</div></div>';
  else {
    let rows = [];
    if (l.kind === "area") {
      rows = [
        [
          "f(x)-f(a)=\\int_a^x f\u0027(t)\\,dt",
          "The exact change in the area function is the signed area under its derivative.",
        ],
        [
          "\\Delta f\\approx f\u0027(a)(x-a)",
          "A rectangle uses the starting height of the derivative graph.",
        ],
        [
          "\\Delta f\\approx f\u0027(a)(x-a)+\\tfrac12f\u0027\u0027(a)(x-a)^2",
          "The tangent adds a triangle: half the base times the signed height. Here f(x) = eˣ and a = 0.",
        ],
      ];
    } else if (l.kind === "factorial") {
      rows = [
        [
          `\\frac{d^{${s.d}}}{dx^{${s.d}}}x^{${s.n}}=${factorial(s.n) / factorial(s.n - s.d)}${s.n - s.d ? `x^{${s.n - s.d}}` : ""}`,
          "Every differentiation brings down the current exponent.",
        ],
        [
          `\\left.\\frac{d^{${s.n}}}{dx^{${s.n}}}\\big[c_{${s.n}}x^{${s.n}}\\big]\\right|_{x=0}=${s.n}!c_{${s.n}}`,
          "After n steps, the power disappears and n! remains.",
        ],
        [
          `c_{${s.n}}=\\frac{f^{(${s.n})}(0)}{${s.n}!}`,
          "Divide by that multiplier to match the required derivative.",
        ],
      ];
    } else
      rows = [
        [
          `f^{(${k})}(x)=${dTex(l.id, k)}`,
          k === 0
            ? "The zeroth derivative means the function itself."
            : "Differentiate the target function to the selected order.",
        ],
        [
          `c_{${k}}=\\frac{f^{(${k})}(${fmt(a, 3)})}{${k}!}=\\frac{${fraction(derivative(l.id, k, a))}}{${factorial(k)}}=${fraction(derivative(l.id, k, a) / factorial(k))}`,
          "Evaluate at the centre, then divide by the factorial.",
        ],
        [
          `T_{${k}}(x)=${fraction(derivative(l.id, k, a) / factorial(k))}${basis(a, k)}`,
          `At the probe, this derived term contributes ${fmt((derivative(l.id, k, a) / factorial(k)) * (s.x - a) ** k)}. Use the derived coefficient to apply it to your graph.`,
        ],
      ];
    html = rows
      .slice(0, level - 1)
      .map(
        ([t, p]) =>
          `<div class="derivation-row"><div class="math" tabindex="0">${math(t)}</div><p>${p}</p></div>`,
      )
      .join("");
    if (level === 4 && l.kind !== "factorial" && l.kind !== "area")
      html += `<div class="derivation-row"><p>${s.manual ? "Your current polynomial" : "Current Taylor polynomial"}</p><div class="math" tabindex="0">${math(s.n > 8 ? `P_{${s.n}}(x)=\\sum_{n=0}^{${s.n}}c_n(x-a)^n` : "P_{" + s.n + "}(x)=" + polyTex(current(), a))}</div></div>`;
  }
  $("#derivation").innerHTML = html;
  let c = current(),
    v = c[k] || 0;
  $("#inspector").innerHTML =
    shown() && l.kind !== "factorial" && l.kind !== "area"
      ? `<div class="term-details"><div><span>Current c${sub(k)}</span><strong>${fmt(v, 8)}</strong></div><div><span>Current term at x = ${fmt(s.x, 3)}</span><strong>${fmt(v * (s.x - a) ** k)}</strong></div><div><span>Truncation order</span><strong>${s.n}</strong></div><div><span>Nonzero terms</span><strong>${c.filter((v) => v !== 0).length}</strong></div></div>`
      : "";
}
function svgText(x, y, t, color = colors.muted, extra = "") {
  return `<text x="${x}" y="${y}" fill="${color}" ${extra}>${t}</text>`;
}
function plotBase(
  xmin,
  xmax,
  ymin,
  ymax,
  w = Math.max(360, Math.min(800, $("#plot").clientWidth)),
  h = Math.max(280, w * 0.5),
) {
  const pad = { l: 54, r: 25, t: 30, b: 45 },
    X = (x) => pad.l + ((x - xmin) / (xmax - xmin)) * (w - pad.l - pad.r),
    Y = (y) => h - pad.b - ((y - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
  let content = "";
  const step = (range) => {
    let base = 10 ** Math.floor(Math.log10(range / 6));
    return (
      [1, 2, 5, 10].map((v) => v * base).find((v) => range / v <= 8) ||
      base * 10
    );
  };
  for (
    let x = Math.ceil(xmin / step(xmax - xmin)) * step(xmax - xmin);
    x <= xmax + 1e-8;
    x += step(xmax - xmin)
  ) {
    content +=
      `<path d="M${X(x)},${pad.t}V${h - pad.b}" stroke="#233148" stroke-width="${Math.abs(x) < 1e-8 ? 1.5 : 0.6}"/>` +
      svgText(X(x), h - 18, fmt(x, 2), colors.muted, 'text-anchor="middle"');
  }
  for (
    let y = Math.ceil(ymin / step(ymax - ymin)) * step(ymax - ymin);
    y <= ymax + 1e-8;
    y += step(ymax - ymin)
  ) {
    content +=
      `<path d="M${pad.l},${Y(y)}H${w - pad.r}" stroke="#233148" stroke-width="${Math.abs(y) < 1e-8 ? 1.5 : 0.6}"/>` +
      svgText(
        pad.l - 10,
        Y(y) + 4,
        fmt(y, 2),
        colors.muted,
        'text-anchor="end"',
      );
  }
  const path = (f) => {
    let d = "",
      prev = false;
    for (let i = 0; i <= 500; i++) {
      const x = xmin + ((xmax - xmin) * i) / 500,
        y = f(x),
        yp = Y(y);
      if (!Number.isFinite(y) || Math.abs(yp) > 1e7) {
        prev = false;
        continue;
      }
      d +=
        (prev ? "L" : "M") +
        X(x).toFixed(2) +
        "," +
        Math.max(-1e5, Math.min(1e5, yp)).toFixed(2);
      prev = true;
    }
    return d;
  };
  return { X, Y, path, content, w, h, pad, xmin, xmax, ymin, ymax };
}
function svgWrap(p, content, label, id = "plot-clip") {
  return `<svg viewBox="0 0 ${p.w} ${p.h}" role="img" aria-label="${label}"><title>${label}</title><defs><clipPath id="${id}"><rect x="${p.pad.l}" y="${p.pad.t}" width="${p.w - p.pad.l - p.pad.r}" height="${p.h - p.pad.t - p.pad.b}"/></clipPath></defs>${p.content}<g clip-path="url(#${id})">${content}</g>${svgText(p.w - 13, p.h - 18, "x", colors.muted)}</svg>`;
}
function curve(p, f, color, dash = "") {
  return `<path class="curve" d="${p.path(f)}" stroke="${color}" fill="none" stroke-width="3" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}
function drawPlot(override) {
  const l = L(),
    s = S(),
    c = override || current(),
    a = s.a;
  let xmin = (l.kind === "centre" ? Math.PI / 2 : a) - s.span,
    xmax = (l.kind === "centre" ? Math.PI / 2 : a) + s.span,
    ymin = -1.7,
    ymax = 1.7;
  if (l.id === "exp") {
    ymin = -0.8;
    ymax = Math.min(16, Math.max(4, value("exp", Math.min(xmax, 2.5))));
  }
  if (l.id === "log") {
    xmin = Math.max(0.01, a - s.span);
    ymin = -3;
    ymax = 2;
  }
  if (l.id === "neglog") {
    xmax = Math.min(0.98, a + s.span);
    ymin = -2;
    ymax = 3;
  }
  if (l.kind === "pendulum") {
    ymin = -0.2;
    ymax = 2.2 * s.length;
  }
  if (l.kind === "factorial") {
    xmin = -1.5;
    xmax = 1.5;
    ymin = -Math.max(2, (factorial(s.n) / factorial(s.n - s.d)) * 1.2);
    ymax = -ymin;
  }
  if (l.kind === "area") {
    xmin = -0.5;
    xmax = 1.7;
    ymin = -0.3;
    ymax = 5.7;
  }
  let p = plotBase(xmin, xmax, ymin, ymax),
    g = "",
    exact = (x) => value(l.id, x) * (l.kind === "pendulum" ? s.length : 1),
    approx = (x) =>
      polynomial(c, x, a) * (l.kind === "pendulum" ? s.length : 1);
  const within = s.x >= xmin && s.x <= xmax;
  if (l.kind === "area") {
    g = areaPlot(p);
    $("#plot-note").textContent =
      "The graph is f′, not f. Shaded areas estimate f(x) − f(a). For x < a, integrate from right to left with signed area.";
  } else if (l.kind === "factorial") {
    g = curve(p, (x) => x ** s.n, colors.blue);
    if (shown())
      g += curve(
        p,
        (x) => (factorial(s.n) / factorial(s.n - s.d)) * x ** (s.n - s.d),
        colors.gold,
        "8 4",
      );
    $("#plot-note").textContent =
      `Differentiation ${s.d} of ${s.n}. The coefficient is temporarily 1 so you can see the power-rule multiplier.`;
  } else {
    if (l.id === "log" || l.id === "neglog") {
      let lo = l.id === "log" ? 0 : -1,
        hi = l.id === "log" ? 2 : 1;
      g += `<rect class="domain-band" x="${p.X(Math.max(xmin, lo))}" y="${p.pad.t}" width="${p.X(Math.min(xmax, hi)) - p.X(Math.max(xmin, lo))}" height="${p.h - p.pad.t - p.pad.b}"/>`;
      for (let x of [lo, hi])
        g += `<path d="M${p.X(x)},${p.pad.t}V${p.h - p.pad.b}" stroke="${colors.teal}" stroke-dasharray="3 5" opacity=".7"/>`;
    }
    g += curve(p, exact, colors.blue);
    if (shown()) {
      if (s.previous && c.length > 1)
        g += curve(
          p,
          (x) =>
            polynomial(c.slice(0, -1), x, a) *
            (l.kind === "pendulum" ? s.length : 1),
          "#8291aa",
          "4 6",
        );
      if (s.term)
        g += curve(
          p,
          (x) =>
            (c[s.k] || 0) *
            (x - a) ** s.k *
            (l.kind === "pendulum" ? s.length : 1),
          colors.teal,
          "9 5",
        );
      g += curve(p, approx, colors.gold, "11 3");
      if (s.tangent) {
        const slope =
          derivative(l.id, 1, a) * (l.kind === "pendulum" ? s.length : 1);
        g += curve(p, (x) => exact(a) + slope * (x - a), colors.blue, "3 6");
        g += curve(
          p,
          (x) =>
            approx(a) +
            polyDerivative(c, 1, a) *
              (l.kind === "pendulum" ? s.length : 1) *
              (x - a),
          colors.gold,
          "3 6",
        );
      }
      for (let j = 0; j < 160; j++) {
        let x = xmin + ((xmax - xmin) * j) / 160;
        if (Math.abs(exact(x) - approx(x)) <= s.tolerance)
          g += `<path d="M${p.X(x)},${p.h - p.pad.b - 3}h${(p.w - p.pad.l - p.pad.r) / 160 + 1}" stroke="${colors.teal}" stroke-width="3"/>`;
      }
    }
    g += `<path d="M${p.X(a)},${p.pad.t}V${p.h - p.pad.b}" stroke="#8393ab" stroke-dasharray="4 6"/><circle data-drag="centre" cx="${p.X(a)}" cy="${p.Y(exact(a))}" r="7" fill="${colors.blue}" stroke="#0c1422" stroke-width="3"/>`;
    g += svgText(p.X(a) + 10, p.pad.t + 15, `a = ${fmt(a, 2)}`, colors.blue);
    if (within) {
      let ye = exact(s.x),
        ya = approx(s.x);
      g += `<path d="M${p.X(s.x)},${p.pad.t + 23}V${p.h - p.pad.b}" stroke="#617087" stroke-dasharray="2 7"/>`;
      if (shown())
        g += `<path d="M${p.X(s.x)},${p.Y(ye)}V${p.Y(ya)}" stroke="${colors.coral}" stroke-width="3"/><circle data-drag="probe" cx="${p.X(s.x)}" cy="${p.Y(ya)}" r="5" fill="${colors.gold}"/>`;
      g +=
        `<circle data-drag="probe" cx="${p.X(s.x)}" cy="${p.Y(ye)}" r="5" fill="${colors.blue}"/>` +
        svgText(
          Math.min(p.w - 100, Math.max(55, p.X(s.x) + 10)),
          p.h - p.pad.b - 12,
          `x = ${fmt(s.x, 2)}`,
          colors.gold,
        );
    }
    let note = shown()
      ? `${s.manual ? "Experimental coefficients." : "Coefficients match derivatives at the centre."} ${s.previous ? "Dashed grey: same coefficients with the highest-order term removed. " : ""}`
      : "The target curve is shown. Choose “Explore the construction” to introduce your polynomial. ";
    if (!within)
      note +=
        "Probe is outside the current view; widen the view or move the probe. ";
    note +=
      "Teal axis segments show sampled |error| ≤ ε, not a proof of a bound. Curves are clipped to the displayed axes.";
    $("#plot-note").textContent = note;
  }
  $("#plot").innerHTML = svgWrap(
    p,
    g,
    l.kind === "area"
      ? "Derivative graph with rectangle and triangle area approximations"
      : `${l.title} Exact function and polynomial with movable probe`,
  );
  $("#plot")._p = p;
  let exactV = exact(s.x),
    approxV = approx(s.x);
  if (l.kind === "area") {
    exactV = Math.exp(s.x) - Math.exp(a);
    approxV =
      (s.layer >= 1 ? Math.exp(a) * (s.x - a) : 0) +
      (s.layer >= 2 ? 0.5 * Math.exp(a) * (s.x - a) ** 2 : 0);
  }
  if (l.kind === "factorial") {
    exactV = s.x ** s.n;
    approxV = (factorial(s.n) / factorial(s.n - s.d)) * s.x ** (s.n - s.d);
  }
  $("#readouts").innerHTML =
    `<div>${l.kind === "area" ? "Exact change in area" : l.kind === "factorial" ? "Original term at probe" : "Exact value"}<strong style="color:${colors.blue}">${fmt(exactV, 7)}</strong></div><div>${l.kind === "area" ? "Revealed area estimate" : l.kind === "factorial" ? "Derivative at probe" : "Current approximation"}<strong style="color:${colors.gold}">${shown() ? fmt(approxV, 7) : "Explore to reveal"}</strong></div><div>${l.kind === "factorial" ? "Derivative steps" : "Absolute error"}<strong style="color:${colors.coral}">${l.kind === "factorial" ? s.d : shown() ? fmt(Math.abs(exactV - approxV), 7) : "—"}</strong></div>`;
  $("#error-plot").innerHTML = "";
  if (s.error && shown() && !["factorial", "area"].includes(l.kind)) {
    let max = 0;
    for (let j = 0; j <= 200; j++) {
      let x = xmin + ((xmax - xmin) * j) / 200;
      max = Math.max(max, Math.abs(exact(x) - approx(x)));
    }
    max = Math.min(100, Math.max(0.001, max * 1.15));
    let ep = plotBase(xmin, xmax, -max, max, p.w, 180);
    $("#error-plot").innerHTML = svgWrap(
      ep,
      curve(ep, (x) => exact(x) - approx(x), colors.coral),
      "Signed error: exact minus approximation",
      "error-clip",
    );
  }
  for (let id of ["show-previous", "show-term", "show-tangent", "show-error"])
    $("#" + id).disabled =
      ["factorial", "area"].includes(l.kind) ||
      (id === "show-previous" && s.n === 0);
}
function areaPlot(p) {
  const s = S(),
    a = s.a,
    x = s.x,
    h = x - a,
    ya = Math.exp(a),
    end = ya + ya * h;
  let out = curve(p, Math.exp, colors.blue),
    points = [];
  for (let j = 0; j <= 100; j++) {
    let t = a + (h * j) / 100;
    points.push(`${p.X(t)},${p.Y(Math.exp(t))}`);
  }
  out += `<polygon points="${p.X(a)},${p.Y(0)} ${points.join(" ")} ${p.X(x)},${p.Y(0)}" fill="${colors.blue}" opacity=".09"/>`;
  if (s.layer >= 1 && shown())
    out += `<polygon points="${p.X(a)},${p.Y(0)} ${p.X(x)},${p.Y(0)} ${p.X(x)},${p.Y(ya)} ${p.X(a)},${p.Y(ya)}" fill="${colors.gold}" opacity=".3" stroke="${colors.gold}"/>`;
  if (s.layer >= 2 && shown())
    out += `<polygon points="${p.X(a)},${p.Y(ya)} ${p.X(x)},${p.Y(ya)} ${p.X(x)},${p.Y(end)}" fill="${colors.teal}" opacity=".6" stroke="${colors.teal}"/>`;
  out += curve(p, (t) => ya + ya * (t - a), colors.muted, "5 6");
  out += `<path d="M${p.X(x)},${p.Y(0)}V${p.Y(Math.exp(x))}" stroke="${colors.blue}" stroke-dasharray="5 4"/>`;
  out +=
    svgText(p.X(x) + 9, p.Y(0) - 10, `x = ${fmt(x, 2)}`, colors.gold) +
    svgText(p.X(a) + 8, p.Y(ya) - 15, "a", colors.blue);
  return out;
}
function companion() {
  const l = L(),
    s = S(),
    c = current();
  let out = "",
    note = "";
  if (l.kind === "pendulum") {
    let t = s.x,
      len = (145 * s.length) / 2,
      ox = 150,
      oy = 30,
      bx = ox + len * Math.sin(t),
      by = oy + len * Math.cos(t),
      low = oy + len;
    out = `<svg viewBox="0 0 470 220" role="img" aria-label="Pendulum length, angle and height"><path d="M90 30H210" stroke="#52627b" stroke-width="3"/><path d="M${ox} ${oy}V${low}" stroke="#52627b" stroke-dasharray="4 5"/><path d="M${ox} ${oy}L${bx} ${by}" stroke="${colors.blue}" stroke-width="3"/><circle cx="${bx}" cy="${by}" r="12" fill="${colors.gold}"/><path d="M50 ${low}H285" stroke="#52627b" stroke-dasharray="4 5"/><path d="M285 ${by}V${low}" stroke="${colors.teal}" stroke-width="3"/><path d="M${bx + 15} ${by}H300" stroke="${colors.teal}" opacity=".5"/>${svgText(315, 75, "θ = " + fmt(t, 2) + " rad", colors.gold)}${svgText(315, 105, "L = " + fmt(s.length, 1) + " m", colors.blue)}${svgText(315, 135, "h = " + fmt(s.length * (1 - Math.cos(t)), 4) + " m", colors.teal)}${svgText(90, 205, "Drag the angle slider to lift the bob.")}</svg>`;
    note =
      "h = L(1 − cos θ). For a 1 kg bob, potential energy is U = 9.81h joules. Changing L scales both height curves.";
    if (shown())
      out += `<div class="stat-strip"><span>Exact U <b>${fmt(9.81 * s.length * value("height", s.x), 4)} J</b></span><span>Estimated U <b>${fmt(9.81 * s.length * polynomial(c, s.x), 4)} J</b></span></div>`;
  } else if (l.kind === "factorial") {
    let d = s.d,
      n = s.n;
    out = `<div class="math" tabindex="0">${math(`x^{${n}}\\;\\xrightarrow{\\;${d}\\text{ derivatives}\\;}\\;${factorial(n) / factorial(n - d)}${n - d ? `x^{${n - d}}` : ""}`)}</div><div class="factor-tiles">${Array.from({ length: n }, (_, k) => `<span class="factor-tile ${k < d ? "used" : ""}">${n - k}</span>`).join("")}</div><p>${d === n ? `All ${n} multipliers are present. Their product is ${factorial(n)}.` : `${d} of ${n} multipliers collected. Use “Differentiate once” to continue.`}</p>`;
    note =
      "For a term cₙxⁿ, the same cascade carries cₙ along. Each lower derivative still vanishes at zero until the final step.";
  } else if (l.kind === "area") {
    const h = s.x - s.a,
      r = Math.exp(s.a) * h,
      tr = 0.5 * Math.exp(s.a) * h * h;
    const p = plotBase(-1, 1.5, -1, 4, 500, 230);
    out = svgWrap(
      p,
      curve(p, (x) => Math.exp(x) - 1, colors.blue) +
        (shown() && s.layer >= 1
          ? curve(p, (x) => x, colors.gold, "6 4")
          : "") +
        (shown() && s.layer >= 2
          ? curve(p, (x) => x + 0.5 * x * x, colors.teal, "6 4")
          : ""),
      "Change in accumulated area versus endpoint",
      "area-clip",
    );
    note = `Exact Δf = ${fmt(Math.exp(s.x) - 1)}. ${s.layer >= 1 ? `Rectangle = ${fmt(r)}. ` : ""}${s.layer >= 2 ? `Triangle correction = ${fmt(tr)}. ` : ""}For negative Δx the rectangle is negative; the correction is positive because both the interval orientation and the triangular deviation reverse.`;
  } else if (["convergence", "challenge"].includes(l.kind)) {
    if (!shown()) {
      out =
        '<div class="locked"><span class="lock-symbol">∑</span><div>Predict first, then explore.<br>A sequence of finite sums will appear here.</div></div>';
      note =
        "Each dot will represent one truncation order at the selected input.";
    } else {
      const limit = Math.max(12, s.n),
        sums = Array.from({ length: limit + 1 }, (_, n) =>
          polynomial(
            s.manual
              ? Array.from({ length: n + 1 }, (_, j) => c[j] || 0)
              : coefficients(l.id, n, s.a),
            s.x,
            s.a,
          ),
        ),
        trueV = value(l.id, s.x),
        max = Math.min(
          100,
          Math.max(1, ...sums.map(Math.abs), Math.abs(trueV)) * 1.2,
        ),
        min = Math.max(-100, Math.min(0, ...sums, trueV) - max * 0.12),
        p = plotBase(0, limit, min, max, 500, 230);
      let g = `<path d="M${p.X(0)},${p.Y(trueV)}H${p.X(limit)}" stroke="${colors.blue}" stroke-dasharray="4 5"/>`;
      g += `<path d="${sums.map((v, i) => `${i ? "L" : "M"}${p.X(i)},${p.Y(v)}`).join("")}" fill="none" stroke="${colors.gold}" stroke-width="2"/>`;
      sums.forEach(
        (v, i) =>
          (g += `<circle cx="${p.X(i)}" cy="${p.Y(v)}" r="${i === s.n ? 5 : 2.5}" fill="${i === s.n ? colors.teal : colors.gold}"/>`),
      );
      out = svgWrap(
        p,
        g,
        "Partial sum versus truncation order at the chosen input",
        "sums-clip",
      ).replace(/>x<\/text>/, ">N</text>");
      note = s.manual
        ? "These are partial sums of your current coefficient choices (missing terms are zero). Build all derived terms to investigate Taylor convergence."
        : `${convergence(l.id, s.a, s.x)}. The horizontal axis is order N; the blue line is the exact value. ${max === 100 ? "Large values leave the fixed ±100 scale." : ""}`;
    }
  } else if (l.kind === "terms") {
    let p = plotBase(-0.5, Math.max(5, s.n + 0.5), -1.3, 1.3, 500, 230),
      g = "";
    if (shown())
      c.forEach((v, i) => {
        let term = v * (s.x - s.a) ** i;
        g += `<path d="M${p.X(i)},${p.Y(0)}V${p.Y(term)}" stroke="${i === s.k ? colors.teal : colors.gold}" stroke-width="12"/><circle cx="${p.X(i)}" cy="${p.Y(term)}" r="4" fill="${colors.gold}"/>`;
      });
    out = svgWrap(
      p,
      g,
      "Individual term contributions at the probe",
      "terms-clip",
    ).replace(/>x<\/text>/, ">n</text>");
    note =
      "Each bar is cₙ(x − a)ⁿ at the probe. A coefficient of zero gives no bar. Contributions outside ±1.3 extend beyond this view.";
  } else {
    out = `<div class="matching"><div class="match-row header"><span>At the centre</span><span>Target</span><span>Your polynomial</span></div>${Array.from(
      { length: Math.min(s.n + 1, 5) },
      (_, k) => {
        const target = derivative(l.id, k, s.a),
          got = polyDerivative(c, k, s.a),
          good = Math.abs(target - got) < 1e-8;
        return `<div class="match-row"><span>${k === 0 ? "Value" : k === 1 ? "Slope" : `Derivative ${k}`}</span><span>${s.step >= 2 || mode === "free" ? fmt(target, 4) : "Reveal to inspect"}</span><span class="${shown() ? (good ? "good" : "bad") : ""}">${shown() ? `${fmt(got, 4)} ${good ? "✓" : "≠"}` : "—"}</span></div>`;
      },
    ).join("")}</div>`;
    note =
      l.kind === "centre"
        ? "The blue centre marker can be dragged. Re-centering updates the powers and all Taylor coefficients together."
        : "Match the value first, then slope, then higher derivatives. Green means agreement at the centre, not everywhere on the curve.";
  }
  $("#companion").innerHTML = out;
  $("#companion-note").textContent = note;
}
function animateApply(before) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !shown())
    return;
  let after = current(),
    start = performance.now();
  if (anim) cancelAnimationFrame(anim);
  const loop = (t) => {
    const z = Math.min(1, (t - start) / 350),
      e = 1 - (1 - z) ** 3;
    drawPlot(
      after.map((v, i) => (before[i] || 0) + (v - (before[i] || 0)) * e),
    );
    if (z < 1) anim = requestAnimationFrame(loop);
    else anim = null;
  };
  anim = requestAnimationFrame(loop);
}
function navigate(i) {
  stop();
  index = (i + 10) % 10;
  history = [];
  window.history.replaceState(null, "", `#lab=${index + 1}`);
  render();
  $("#title").setAttribute("tabindex", "-1");
  $("#title").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}
function changeControl(key, v) {
  const s = S(),
    l = L();
  if (!Number.isFinite(v)) {
    toast("Enter a finite number or a fraction with a nonzero denominator.");
    render();
    return;
  }
  remember();
  if (key === "coefficient-value") {
    v = Math.min(100, Math.max(-100, v));
    if (!s.manual) s.c = current();
    s.manual = true;
    s.c[s.k] = v;
  } else if (key === "n") {
    s.n = Math.round(v);
    s.k = Math.min(s.n, s.k);
    s.d = Math.min(s.d, s.n);
    while (s.c.length < s.n + 1) s.c.push(0);
    if (l.kind === "factorial") s.k = s.n;
  } else if (key === "a") {
    s.a = v;
    s.manual = false;
  } else s[key] = v;
  if (key === "speed" && timer) {
    clearInterval(timer);
    timer = setInterval(tick, 1100 / s.speed);
  }
  render();
}
function tick() {
  const s = S();
  if (s.n >= 30) {
    stop();
    render();
    return;
  }
  s.n++;
  s.k = s.n;
  s.manual = false;
  s.step = Math.max(1, s.step);
  render();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  let s = S();
  if (b.dataset.lab !== undefined) return navigate(+b.dataset.lab);
  if (b.dataset.predict !== undefined) {
    remember();
    s.pred = +b.dataset.predict;
    return render();
  }
  if (b.dataset.answer !== undefined) {
    remember();
    s.check = +b.dataset.answer;
    finished.add(index);
    return render();
  }
  if (b.dataset.probe !== undefined) {
    remember();
    s.x = +b.dataset.probe;
    return render();
  }
  if (b.dataset.centre !== undefined) {
    remember();
    s.a = +b.dataset.centre;
    s.manual = false;
    return render();
  }
  if (b.dataset.layer !== undefined) {
    remember();
    s.layer = +b.dataset.layer;
    s.step = Math.max(1, s.step);
    return render();
  }
  const action = b.dataset.action;
  if (action) {
    const before = current();
    remember();
    if (action === "apply") {
      if (!s.manual) s.c = current();
      s.c[s.k] = derivative(L().id, s.k, s.a) / factorial(s.k);
      s.manual = true;
      s.step = Math.max(1, s.step);
    }
    if (action === "build") {
      s.manual = false;
      s.step = 4;
    }
    if (action === "differentiate") {
      s.d = Math.min(s.n, s.d + 1);
      s.step = Math.max(1, s.step);
    }
    if (action === "rewind") s.d = 0;
    if (action === "add") {
      s.n = Math.min(30, s.n + 1);
      s.k = s.n;
      s.manual = false;
      s.step = Math.max(1, s.step);
    }
    if (action === "play") {
      if (timer) stop();
      else {
        if (s.n >= 30) s.n = 0;
        s.manual = false;
        s.step = Math.max(1, s.step);
        timer = setInterval(tick, 1100 / s.speed);
      }
    }
    render();
    if (["apply", "build", "add"].includes(action)) animateApply(before);
  }
});
$("#controls").addEventListener("change", (e) => {
  const el = e.target;
  if (el.id === "coefficient") {
    remember();
    S().k = +el.value;
    if (mode !== "free") S().step = Math.min(1, S().step);
    render();
    return;
  }
  if (el.dataset.number) {
    const range = $("#" + el.dataset.number);
    let v = parseNumber(el.value);
    changeControl(el.dataset.number, v);
    return;
  }
  if (el.dataset.control) changeControl(el.dataset.control, +el.value);
});
// Native range controls retain focus while their previews update.
$("#controls").addEventListener("input", (e) => {
  const el = e.target;
  if (!el.dataset.control) return;
  let s = S(),
    key = el.dataset.control,
    v = +el.value;
  if (!el._started) {
    remember();
    el._started = true;
  }
  if (key === "coefficient-value") {
    if (!s.manual) s.c = current();
    s.manual = true;
    s.c[s.k] = v;
  } else if (key === "n") {
    s.n = v;
    s.k = Math.min(s.k, v);
    s.d = Math.min(s.d, v);
    if (L().kind === "factorial") s.k = v;
    while (s.c.length < v + 1) s.c.push(0);
  } else if (key === "a") {
    s.a = v;
    s.manual = false;
  } else s[key] = v;
  const out = el.closest(".control").querySelector("output"),
    num = el.closest(".control").querySelector("input[type=text]");
  if (out) out.textContent = fmt(v, 3);
  if (num) num.value = fmt(v, 8);
  drawPlot();
  companion();
  derivation();
  save();
});
$("#reveal").onclick = () => {
  remember();
  S().step = S().step === 4 ? 0 : S().step + 1;
  render();
};
$("#step-next").onclick = () => {
  remember();
  S().step = Math.min(4, S().step + 1);
  render();
};
$("#step-back").onclick = () => {
  remember();
  S().step = Math.max(0, S().step - 1);
  render();
};
$("#hint").onclick = () => {
  S().hint = !S().hint;
  render();
};
$("#undo").onclick = () => {
  if (history.length) {
    stop();
    states[index] = JSON.parse(history.pop());
    render();
  }
};
$("#reset").onclick = () => {
  stop();
  remember();
  states[index] = defaults(index);
  render();
};
$("#mode").onchange = (e) => {
  stop();
  mode = e.target.value;
  render();
};
$("#focus").onclick = () => {
  const on = document.body.classList.toggle("focus");
  $("#focus").setAttribute("aria-pressed", on);
  $("#focus").textContent = on ? "Exit focus" : "Focus view";
  requestAnimationFrame(() => drawPlot());
};
$("#prev-lab").onclick = () => navigate(index - 1);
$("#next-lab").onclick = () => navigate(index + 1);
for (let key of ["previous", "term", "error", "tangent"])
  $("#show-" + key).onchange = (e) => {
    remember();
    S()[key] = e.target.checked;
    drawPlot();
    save();
  };
$("#share").onclick = async () => {
  const url = new URL(location.href);
  url.hash = new URLSearchParams({
    lab: index + 1,
    m: mode,
    s: JSON.stringify(S()),
  }).toString();
  try {
    await navigator.clipboard.writeText(url.href);
    toast("Experiment link copied. It includes your current settings.");
  } catch {
    window.history.replaceState(null, "", url);
    toast(
      "The address bar now contains your experiment link. Copy it to share.",
    );
  }
};
let drag = null;
$("#plot").addEventListener("pointerdown", (e) => {
  const marker = e.target.closest("[data-drag]");
  if (!marker) return;
  if (marker.dataset.drag === "centre" && L().kind !== "centre") return;
  remember();
  drag = marker.dataset.drag;
  $("#plot").setPointerCapture(e.pointerId);
});
$("#plot").addEventListener("pointermove", (e) => {
  if (!drag) return;
  const p = $("#plot")._p,
    svg = $("#plot svg"),
    rect = svg.getBoundingClientRect(),
    vx = ((e.clientX - rect.left) / rect.width) * p.w,
    x =
      p.xmin + ((vx - p.pad.l) / (p.w - p.pad.l - p.pad.r)) * (p.xmax - p.xmin);
  if (drag === "centre") {
    S().a = Math.max(-Math.PI, Math.min(Math.PI, x));
    S().manual = false;
  } else S().x = Math.max(L().range[0], Math.min(L().range[1], x));
  drawPlot();
  derivation();
  companion();
});
$("#plot").addEventListener("pointerup", () => {
  if (drag) {
    drag = null;
    render();
  }
});
$("#plot").addEventListener("pointercancel", () => {
  drag = null;
  render();
});
window.addEventListener("hashchange", () => {
  stop();
  readHash();
  history = [];
  render();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stop();
    render();
  }
});
render();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(drawPlot, 100);
});
