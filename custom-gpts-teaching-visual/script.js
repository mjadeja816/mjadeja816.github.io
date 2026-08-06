const components = [
  {
    title: "Clear Purpose",
    short: "Purpose",
    accent: "#2447e7",
    detail: "Define one teaching job the assistant should perform reliably.",
  },
  {
    title: "Instructions",
    short: "Instructions",
    accent: "#12b7c6",
    detail: "Specify how it should explain, question, scaffold, and format classroom-ready output.",
  },
  {
    title: "Knowledge",
    short: "Knowledge",
    accent: "#18a558",
    detail: "Add syllabus, readings, lesson notes, policies, rubrics, and local teaching context.",
  },
  {
    title: "Examples",
    short: "Examples",
    accent: "#f4ad28",
    detail: "Show model responses for quizzes, analogies, activities, feedback, and lesson plans.",
  },
  {
    title: "Rules and Guardrails",
    short: "Rules",
    accent: "#e55361",
    detail: "Make it ask for missing inputs, avoid unsupported claims, and protect academic integrity.",
  },
  {
    title: "Tools and Integrations",
    short: "Tools",
    accent: "#7a5cff",
    detail: "Connect approved actions, datasets, forms, or APIs when the teaching workflow needs them.",
  },
  {
    title: "Testing and Refinement",
    short: "Testing",
    accent: "#0f9f83",
    detail: "Try real classroom prompts, collect feedback, and revise until the output is dependable.",
  },
];

const tags = document.querySelectorAll("#assistantTags li");
const componentButtons = document.querySelector("#componentButtons");
const detailCard = document.querySelector("#detailCard");
const stepTitle = document.querySelector("#stepTitle");
const progressFill = document.querySelector("#progressFill");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const playBtn = document.querySelector("#playBtn");
const restartBtn = document.querySelector("#restartBtn");
const motionBtn = document.querySelector("#motionBtn");
const fullscreenBtn = document.querySelector("#fullscreenBtn");

let current = 0;
let timer = null;
let isPlaying = false;

components.forEach((item, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "component";
  button.style.setProperty("--accent", item.accent);
  button.setAttribute("aria-label", `Show ${item.title}`);
  button.innerHTML = `<span>${index + 1}</span><strong>${item.short}</strong>`;
  button.addEventListener("click", () => {
    stopAutoplay();
    showStep(index);
  });
  componentButtons.appendChild(button);
});

const buttons = document.querySelectorAll(".component");

function showStep(index) {
  current = Math.max(0, Math.min(index, components.length - 1));
  const item = components[current];
  stepTitle.textContent = item.title;
  detailCard.innerHTML = `
    <p class="detail-kicker">Step ${current + 1}</p>
    <h2>${item.title}</h2>
    <p>${item.detail}</p>
  `;

  buttons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-visible", buttonIndex <= current);
    button.classList.toggle("is-active", buttonIndex === current);
  });

  tags.forEach((tag, tagIndex) => {
    tag.classList.toggle("is-lit", tagIndex <= Math.min(current, tags.length - 1));
  });

  progressFill.style.width = `${((current + 1) / components.length) * 100}%`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === components.length - 1;
}

function nextStep() {
  if (current === components.length - 1) {
    if (isPlaying) showStep(0);
    return;
  }
  showStep(current + 1);
}

function prevStep() {
  showStep(current - 1);
}

function startAutoplay() {
  if (isPlaying) return;
  isPlaying = true;
  playBtn.textContent = "Pause";
  playBtn.setAttribute("aria-label", "Pause autoplay");
  timer = window.setInterval(nextStep, 3200);
}

function stopAutoplay() {
  isPlaying = false;
  playBtn.textContent = "Play";
  playBtn.setAttribute("aria-label", "Start autoplay");
  window.clearInterval(timer);
  timer = null;
}

prevBtn.addEventListener("click", () => {
  stopAutoplay();
  prevStep();
});

nextBtn.addEventListener("click", () => {
  stopAutoplay();
  nextStep();
});

restartBtn.addEventListener("click", () => {
  stopAutoplay();
  showStep(0);
});

playBtn.addEventListener("click", () => {
  if (isPlaying) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
});

motionBtn.addEventListener("click", () => {
  const isReduced = document.body.classList.toggle("reduced-motion");
  motionBtn.setAttribute("aria-pressed", String(isReduced));
  motionBtn.textContent = isReduced ? "Motion On" : "Reduce Motion";
});

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "Exit Full Screen";
  } else {
    await document.exitFullscreen();
    fullscreenBtn.textContent = "Full Screen";
  }
});

document.addEventListener("fullscreenchange", () => {
  fullscreenBtn.textContent = document.fullscreenElement ? "Exit Full Screen" : "Full Screen";
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    stopAutoplay();
    nextStep();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    stopAutoplay();
    prevStep();
  }
  if (event.key.toLowerCase() === "r") {
    stopAutoplay();
    showStep(0);
  }
  if (event.key.toLowerCase() === "p") {
    isPlaying ? stopAutoplay() : startAutoplay();
  }
});

showStep(0);
