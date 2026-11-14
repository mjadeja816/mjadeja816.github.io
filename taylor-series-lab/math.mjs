export const factorial = (n) => {
  let v = 1;
  for (let k = 2; k <= n; k++) v *= k;
  return v;
};
export const clean = (x) => (Math.abs(x) < 1e-14 ? 0 : x);
export function derivative(id, n, a) {
  if (id === "cos")
    return clean([Math.cos(a), -Math.sin(a), -Math.cos(a), Math.sin(a)][n % 4]);
  if (id === "sin")
    return clean([Math.sin(a), Math.cos(a), -Math.sin(a), -Math.cos(a)][n % 4]);
  if (id === "exp") return Math.exp(a);
  if (id === "log")
    return a > 0
      ? n === 0
        ? Math.log(a)
        : ((-1) ** (n - 1) * factorial(n - 1)) / a ** n
      : NaN;
  if (id === "neglog")
    return a < 1
      ? n === 0
        ? -Math.log1p(-a)
        : factorial(n - 1) / (1 - a) ** n
      : NaN;
  if (id === "height")
    return n === 0 ? 1 - Math.cos(a) : -derivative("cos", n, a);
  return NaN;
}
export const value = (id, x) => derivative(id, 0, x);
export const coefficients = (id, n, a) =>
  Array.from({ length: n + 1 }, (_, k) => derivative(id, k, a) / factorial(k));
export function polynomial(c, x, a = 0) {
  let r = 0;
  for (let k = c.length - 1; k >= 0; k--) r = r * (x - a) + c[k];
  return r;
}
export function polyDerivative(c, k, a, x = a) {
  let s = 0;
  for (let j = k; j < c.length; j++)
    s += ((c[j] * factorial(j)) / factorial(j - k)) * (x - a) ** (j - k);
  return s;
}
export const fmt = (v, d = 5) =>
  !Number.isFinite(v)
    ? "undefined"
    : v === 0
      ? "0"
      : Math.abs(v) >= 1e6 || Math.abs(v) < 1e-4
        ? v.toExponential(3)
        : Number(v.toFixed(d)).toString();
export function fraction(x) {
  if (!Number.isFinite(x)) return "\\text{undefined}";
  if (x === 0) return "0";
  for (let d = 1; d <= 40320; d++) {
    let n = Math.round(x * d);
    if (n !== 0 && Math.abs(n / d - x) < 1e-12 * Math.abs(x))
      return d === 1
        ? `${n}`
        : `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
  }
  return fmt(x).replace(/e([+-]?\d+)/, (_, e) => `\\times 10^{${Number(e)}}`);
}
export function parseNumber(s) {
  if (typeof s !== "string") return NaN;
  const m = s
    .trim()
    .match(
      /^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)(?:\s*\/\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?))?$/,
    );
  return m ? Number(m[1]) / (m[2] === undefined ? 1 : Number(m[2])) : NaN;
}
export function convergence(id, a, x) {
  if (id === "log") {
    const t = (x - a) / a;
    if (x <= 0) return "Outside the real domain";
    if (Math.abs(t) < 1) return "Converges to ln(x)";
    if (t === 1) return "Converges at the endpoint (conditionally)";
    return "Diverges: the terms do not approach zero";
  }
  if (id === "neglog") {
    const t = (x - a) / (1 - a);
    if (x >= 1) return "Outside the real domain";
    if (Math.abs(t) < 1) return "Converges to −ln(1−x)";
    if (t === -1) return "Converges at the endpoint (conditionally)";
    return "Diverges: the terms do not approach zero";
  }
  return "Converges for every real input";
}
