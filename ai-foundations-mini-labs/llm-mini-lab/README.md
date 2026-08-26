# LLM Mini Lab

A local static interactive app for Module 1's LLM segment.

## Flow

1. How LLMs learn through pretraining, supervised fine tuning, and feedback
2. Words become tokens
3. Tokens enter the context
4. A neural network processes context
5. The model predicts the next token
6. Repeated prediction creates a response
7. Hallucination shows why plausible text is not verified truth
8. Final reveal connects training, parameters, context, and generation

## Run Locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/llm-mini-lab/
```

This folder has no build step and does not publish or deploy anything.
