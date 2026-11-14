import assert from "node:assert/strict";
import {
  factorial,
  derivative,
  coefficients,
  polynomial,
  polyDerivative,
  value,
  parseNumber,
  convergence,
  fraction,
  fmt,
} from "../taylor-series-lab/math.mjs";
let checks = 0;
function near(a, b, tol = 1e-10) {
  checks++;
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
}
near(factorial(0), 1);
near(factorial(8), 40320);
for (const id of ["sin", "cos", "exp", "log", "neglog", "height"])
  for (const a of id === "log"
    ? [0.5, 1, 2]
    : id === "neglog"
      ? [-0.5, 0, 0.4]
      : [-Math.PI, 0, 0.5, Math.PI])
    for (let n = 0; n <= 12; n++) {
      const c = coefficients(id, n, a);
      for (let k = 0; k <= n; k++)
        near(polyDerivative(c, k, a), derivative(id, k, a));
      near(polynomial(c, a, a), value(id, a));
      if (n > 0)
        for (let k = 0; k < n; k++)
          near(polyDerivative(c, k, a), polyDerivative(c.slice(0, -1), k, a));
    }
near(polynomial(coefficients("cos", 2, 0), 0.1), 0.995);
near(polynomial(coefficients("sin", 3, 0), 1), 5 / 6);
near(
  polynomial(coefficients("cos", 2, Math.PI), Math.PI + 0.1, Math.PI),
  -0.995,
);
near(polynomial(coefficients("exp", 20, 0), 1), Math.E);
near(polynomial(coefficients("exp", 30, 0), 2), Math.exp(2));
near(polynomial(coefficients("log", 30, 1), 1.5, 1), Math.log(1.5));
near(polynomial(coefficients("neglog", 30, 0), 0.5), -Math.log(0.5));
for (const h of [-0.8, -0.1, 0, 0.1, 0.8])
  near(polynomial(coefficients("exp", 2, 0), h) - 1, h + (h * h) / 2);
near(parseNumber("-1/6"), -1 / 6);
near(parseNumber("1e-6"), 1e-6);
assert.notEqual(fraction(1 / factorial(30)), "0");
assert.notEqual(fmt(1 / factorial(30)), "0");
near(parseNumber(".25"), 0.25);
assert.ok(!Number.isFinite(parseNumber("1/0")));
assert.ok(Number.isNaN(parseNumber("foo")));
assert.match(convergence("log", 1, 2), /endpoint/);
assert.match(convergence("log", 1, 2.2), /Diverges/);
assert.match(convergence("neglog", 0, -1), /endpoint/);
assert.match(convergence("neglog", 0, 1), /domain/);
assert.ok(
  Math.abs(polynomial(coefficients("log", 30, 1), 2.2, 1) - Math.log(2.2)) > 1,
);
console.log(
  `PASS: ${checks} numerical assertions plus domain, parsing and convergence checks.`,
);

for (const [id, expected] of [
  ["cos", [1, 0, -0.5, 0, 1 / 24, 0, -1 / 720]],
  ["sin", [0, 1, 0, -1 / 6, 0, 1 / 120]],
  ["log", [0, 1, -0.5, 1 / 3, -0.25, 1 / 5]],
  ["neglog", [0, 1, 0.5, 1 / 3, 0.25, 1 / 5]],
]) {
  const c = coefficients(id, expected.length - 1, id === "log" ? 1 : 0);
  expected.forEach((v, k) => near(c[k], v));
}
console.log(
  "PASS: independently specified coefficient sequences and small-number formatting.",
);
