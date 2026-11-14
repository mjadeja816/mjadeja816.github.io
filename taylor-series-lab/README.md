# Taylor Series Discovery Lab

Standalone, browser-only mathematics activity with ten guided experiments. Open `index.html` through an HTTP server; there is no build step. JavaScript modules use the same mathematical engine for coefficients, curves, derivative tables, term readouts and convergence traces.

## Files

- `lessons.mjs`: prompts, predictions, feedback, checkpoints and initial values.
- `math.mjs`: analytic derivatives, coefficient generation, Horner evaluation, numerical formatting and convergence classifications.
- `app.js`: progressive disclosure, plotting, geometry, input validation, local progress, sharing and animation.
- `style.css`: responsive layout and reduced-motion treatment.
- `vendor/`: self-hosted KaTeX and its license. Typography comes from the parent site's self-hosted font assets.

## Verification

Run `node tests/taylor-math.mjs` from the repository root. Preview with `python3 -m http.server 8767` and open `/taylor-series-lab/`.

For browser regression, traverse all ten labs in guided, free and classroom modes. Exercise every prediction, hint, reveal, step, coefficient input, apply/build action, overlay, range, preset, checkpoint, reset, undo and navigation control. Test desktop, 390px mobile, 360px mobile, tablet and reduced motion. Confirm the same shared link restores the experiment, learning mode and parameters after a reload.

Check these mathematical edge cases: cosine at 0.1; cosine centred at π; zero odd cosine coefficients; factorial steps; sine's cubic coefficient; exponential at 1 and 2; signed area with x < a; logarithm at 2 and 2.2; negative logarithm at −1; order zero; highest supported order; very small nonzero coefficients; invalid and fractional input. Green tolerance marks are sampled estimates, not certified bounds. Off-scale curves are clipped explicitly.

The Teaching Demonstrations and Tools entries are maintained in `scripts/build_site.py`. The independent Calculus Lab links here from its HTML entry point. The custom domain and existing publishing setup are unchanged.
