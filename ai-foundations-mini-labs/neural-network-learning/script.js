const screens = Array.from(document.querySelectorAll(".screen"));
const terms = [
  ["Artificial Neuron", "Basic computational unit of a neural network."],
  ["Input", "Information provided to the model."],
  ["Weight", "Learned value representing the influence of an input."],
  ["Bias", "Learned value that helps shift or adjust a neuron's output."],
  ["Prediction", "Output produced by the model."],
  ["Loss", "Numerical measure of prediction error."],
  ["Training", "Process through which model parameters are learned from data."],
  ["Backpropagation", "Process that communicates prediction error backward through the network."],
  ["Optimizer", "Mechanism that updates parameters to reduce loss."],
  ["Neural Network", "Interconnected collection of artificial neurons."],
  ["Training Data", "Examples used for learning."],
  ["Test Data", "Unseen examples used for evaluation."],
  ["Inference", "Using a trained model to make predictions."],
  ["Overfitting", "Learning the training data too specifically and performing poorly on unseen data."]
];

const symbolText = {
  x: "x is the input: the information given to the neuron.",
  w: "w is the weight: how strongly the neuron considers that input.",
  b: "b is the bias: an additional learned value that shifts the output."
};

const trainingRounds = [
  { round: 1, prediction: 55.0, error: 5.0 },
  { round: 2, prediction: 57.0, error: 3.0 },
  { round: 3, prediction: 59.0, error: 1.0 },
  { round: 4, prediction: 59.8, error: 0.2 }
];

let currentStep = 0;
let autoTimer = null;
let trainingTimer = null;

const elements = {
  header: document.querySelector(".app-header"),
  progressBar: document.querySelector("#progressBar"),
  prevButton: document.querySelector("#prevButton"),
  nextButton: document.querySelector("#nextButton"),
  autoButton: document.querySelector("#autoButton"),
  restartTop: document.querySelector("#restartTop"),
  termsToggle: document.querySelector("#termsToggle"),
  termsClose: document.querySelector("#termsClose"),
  termsPanel: document.querySelector("#termsPanel"),
  termsList: document.querySelector("#termsList"),
  weightSlider: document.querySelector("#weightSlider"),
  biasSlider: document.querySelector("#biasSlider"),
  weightValue: document.querySelector("#weightValue"),
  biasValue: document.querySelector("#biasValue"),
  weightBadge: document.querySelector("#weightBadge"),
  predictionBadge: document.querySelector("#predictionBadge"),
  symbolHelp: document.querySelector("#symbolHelp"),
  trainButton: document.querySelector("#trainButton"),
  roundLabel: document.querySelector("#roundLabel"),
  roundPrediction: document.querySelector("#roundPrediction"),
  roundError: document.querySelector("#roundError"),
  errorLine: document.querySelector("#errorLine"),
  errorDots: document.querySelector("#errorDots"),
  overfitResult: document.querySelector("#overfitResult")
};

document.addEventListener("DOMContentLoaded", () => {
  renderTerms();
  bindEvents();
  updateStep(0);
  updateNeuronPrediction();
  renderTrainingRound(0);
});

function bindEvents() {
  window.addEventListener("scroll", () => {
    elements.header.dataset.elevated = String(window.scrollY > 6);
  });

  elements.prevButton.addEventListener("click", () => updateStep(currentStep - 1));
  elements.nextButton.addEventListener("click", () => updateStep(currentStep + 1));
  elements.restartTop.addEventListener("click", restartStory);
  elements.autoButton.addEventListener("click", toggleAutoPlay);

  document.querySelectorAll("[data-next]").forEach(button => {
    button.addEventListener("click", () => updateStep(currentStep + 1));
  });

  elements.termsToggle.addEventListener("click", toggleTerms);
  elements.termsClose.addEventListener("click", closeTerms);

  elements.weightSlider.addEventListener("input", updateNeuronPrediction);
  elements.biasSlider.addEventListener("input", updateNeuronPrediction);

  document.querySelectorAll("[data-symbol]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-symbol]").forEach(item => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
      elements.symbolHelp.textContent = symbolText[button.dataset.symbol];
    });
  });

  elements.trainButton.addEventListener("click", animateTraining);

  document.querySelectorAll("[data-overfit]").forEach(button => {
    button.addEventListener("click", () => {
      elements.overfitResult.hidden = false;
      elements.overfitResult.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") updateStep(currentStep + 1);
    if (event.key === "ArrowLeft") updateStep(currentStep - 1);
    if (event.key === "Escape") closeTerms();
  });
}

function updateStep(nextStep) {
  const boundedStep = Math.max(0, Math.min(screens.length - 1, nextStep));
  currentStep = boundedStep;

  screens.forEach((screen, index) => {
    screen.classList.toggle("is-active", index === currentStep);
    screen.setAttribute("aria-hidden", String(index !== currentStep));
  });

  elements.prevButton.disabled = currentStep === 0;
  elements.nextButton.disabled = currentStep === screens.length - 1;
  elements.progressBar.style.width = `${(currentStep / (screens.length - 1)) * 100}%`;

  if (currentStep === 5) renderTrainingRound(0);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function restartStory() {
  stopAutoPlay();
  elements.overfitResult.hidden = true;
  updateStep(0);
}

function toggleAutoPlay() {
  if (autoTimer) {
    stopAutoPlay();
    return;
  }

  elements.autoButton.setAttribute("aria-pressed", "true");
  autoTimer = window.setInterval(() => {
    if (currentStep >= screens.length - 1) {
      stopAutoPlay();
      return;
    }
    updateStep(currentStep + 1);
  }, 5200);
}

function stopAutoPlay() {
  if (autoTimer) {
    window.clearInterval(autoTimer);
    autoTimer = null;
  }
  elements.autoButton.setAttribute("aria-pressed", "false");
}

function renderTerms() {
  elements.termsList.innerHTML = terms
    .map(([term, description]) => `
      <article class="term-item">
        <strong>${term}</strong>
        <p>${description}</p>
      </article>
    `)
    .join("");
}

function toggleTerms() {
  const isOpen = elements.termsToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    closeTerms();
  } else {
    elements.termsPanel.hidden = false;
    elements.termsToggle.setAttribute("aria-expanded", "true");
  }
}

function closeTerms() {
  elements.termsPanel.hidden = true;
  elements.termsToggle.setAttribute("aria-expanded", "false");
}

function updateNeuronPrediction() {
  const weight = Number(elements.weightSlider.value);
  const bias = Number(elements.biasSlider.value);
  const normalizedSize = 10;
  const prediction = normalizedSize * weight + bias;

  elements.weightValue.textContent = weight.toFixed(1);
  elements.biasValue.textContent = bias.toFixed(1);
  elements.weightBadge.textContent = weight.toFixed(1);
  elements.predictionBadge.textContent = `Rs. ${prediction.toFixed(1)} lakh`;
}

function animateTraining() {
  window.clearInterval(trainingTimer);
  let index = 0;
  renderTrainingRound(index);
  elements.trainButton.disabled = true;
  elements.trainButton.textContent = "Training...";

  trainingTimer = window.setInterval(() => {
    index += 1;
    renderTrainingRound(index);

    if (index >= trainingRounds.length - 1) {
      window.clearInterval(trainingTimer);
      elements.trainButton.disabled = false;
      elements.trainButton.textContent = "Train Again";
    }
  }, 950);
}

function renderTrainingRound(index) {
  const visibleRounds = trainingRounds.slice(0, index + 1);
  const active = trainingRounds[index] || trainingRounds[0];
  elements.roundLabel.textContent = `Round ${active.round}`;
  elements.roundPrediction.textContent = `Prediction: Rs. ${active.prediction.toFixed(1)} lakh`;
  elements.roundError.textContent = `Error: Rs. ${active.error.toFixed(1)} lakh`;
  renderErrorChart(visibleRounds);
}

function renderErrorChart(rounds) {
  const chart = {
    left: 58,
    top: 34,
    right: 486,
    bottom: 214,
    maxError: 5
  };
  const points = rounds.map(item => {
    const x = chart.left + ((item.round - 1) / 3) * (chart.right - chart.left);
    const y = chart.bottom - (item.error / chart.maxError) * (chart.bottom - chart.top);
    return [x, y];
  });

  elements.errorLine.setAttribute("points", points.map(([x, y]) => `${x},${y}`).join(" "));
  elements.errorDots.innerHTML = points
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"></circle>`)
    .join("");
}
