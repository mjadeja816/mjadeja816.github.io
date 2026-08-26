const concepts = [
  {
    id: "ai",
    order: "01",
    glyph: "AI",
    name: "Artificial Intelligence",
    shortName: "AI",
    path: "Rules",
    scenarioKicker: "Rule Based AI",
    scenarioTitle: "Scholarship eligibility check",
    scenarioText: "The system follows explicit rules: if attendance is above 75% and CGPA is above 8, the student is eligible.",
    scenarioOutput: "IF attendance > 75 AND CGPA > 8 -> Eligible",
    definition: "Machines performing tasks that normally require aspects of human intelligence.",
    note: "A rule based system can still be AI when it performs intelligence-like work using explicitly programmed logic.",
    hierarchy: "AI is the broad field: it includes rule based systems, learning systems, and modern generative systems."
  },
  {
    id: "ml",
    order: "02",
    glyph: "ML",
    name: "Machine Learning",
    shortName: "ML",
    path: "Learn patterns",
    scenarioKicker: "Learning From Data",
    scenarioTitle: "Academic support prediction",
    scenarioText: "Historical attendance, quiz, and assignment data help estimate which students may need support before final exams.",
    scenarioOutput: "Past student records -> Pattern learned -> Support risk predicted",
    definition: "AI systems that learn patterns from data rather than relying only on explicitly written rules.",
    note: "The model improves from examples; the teacher does not manually write every possible decision rule.",
    hierarchy: "Machine Learning is inside AI. It is a way to build AI by learning from data."
  },
  {
    id: "dl",
    order: "03",
    glyph: "DL",
    name: "Deep Learning",
    shortName: "DL",
    path: "Learn complex representations",
    scenarioKicker: "Neural Networks",
    scenarioTitle: "Handwritten assignment recognition",
    scenarioText: "A student uploads a handwritten page. A neural network learns useful visual features from pixels and recognizes the written content.",
    scenarioOutput: "Pixels -> Strokes -> Letters -> Words -> Recognized answer",
    definition: "Machine learning using multilayer neural networks to learn complex patterns.",
    note: "Deep learning is especially strong for complex data such as images, audio, language, and video.",
    hierarchy: "Deep Learning is a major family within Machine Learning, using many layers of learned representations."
  },
  {
    id: "genai",
    order: "04",
    glyph: "G",
    name: "Generative AI",
    shortName: "GenAI",
    path: "Create",
    scenarioKicker: "Content Generation",
    scenarioTitle: "Personalized study plan",
    scenarioText: "The system creates a new study plan from the student's goals, weak areas, schedule, and preferred learning style.",
    scenarioOutput: "Student profile + goals -> New study plan generated",
    definition: "AI designed to generate new content such as text, images, audio, video, or code.",
    note: "It creates new outputs rather than only classifying, ranking, or predicting labels.",
    hierarchy: "Modern Generative AI is largely powered by deep learning, though generative methods have broader roots."
  },
  {
    id: "llm",
    order: "05",
    glyph: "L",
    name: "Large Language Model",
    shortName: "LLM",
    path: "Communicate through language",
    scenarioKicker: "Language And Context",
    scenarioTitle: "Conversational explanation",
    scenarioText: "A student asks for a topic to be explained using a cricket analogy, and the system responds in natural language.",
    scenarioOutput: "Prompt + context -> Tokens predicted -> Conversational answer",
    definition: "A large neural network trained on extensive text data to process and generate language.",
    note: "LLMs are one major family of Generative AI models designed primarily around language.",
    hierarchy: "LLMs are a language-focused family of Generative AI systems, usually built with deep learning."
  }
];

const quizItems = [
  {
    task: "Detect whether an email is spam",
    answer: "Machine Learning",
    reason: "The system learns patterns from labelled examples of spam and non-spam messages."
  },
  {
    task: "Recognize an object in an image",
    answer: "Deep Learning",
    reason: "Multilayer neural networks can learn visual features directly from pixel data."
  },
  {
    task: "Generate a poster for a workshop",
    answer: "Generative AI",
    reason: "The goal is to create new content rather than only classify an existing item."
  },
  {
    task: "Answer questions conversationally from text",
    answer: "Large Language Model",
    reason: "The system must process context and generate language token by token."
  },
  {
    task: "Follow a fixed set of diagnostic rules",
    answer: "Rule Based AI",
    reason: "Explicit IF-THEN logic is enough when the rule set is known and stable."
  }
];

const milestones = [
  {
    year: "1950",
    type: "Question",
    title: "Alan Turing proposes the imitation game",
    message: "Can machines exhibit intelligent behaviour?",
    era: "Rules",
    focus: "ai",
    capability: "Capability focus: intelligence-like behaviour",
    connection: "Early AI asked whether machines could show intelligent behaviour at all."
  },
  {
    year: "1956",
    type: "Field",
    title: "Dartmouth workshop",
    message: "Artificial Intelligence emerges as a formal research field.",
    era: "Rules",
    focus: "ai",
    capability: "Capability focus: formalising AI as a discipline",
    connection: "The broad AI field now has a name, a research agenda, and shared questions."
  },
  {
    year: "1958",
    type: "Network",
    title: "Perceptron",
    message: "An early artificial neural network shows how learning machines might adjust from examples.",
    era: "Learning",
    focus: "ml",
    capability: "Capability focus: learning from examples",
    connection: "The learning idea starts to move AI beyond only hand-coded rules."
  },
  {
    year: "1966",
    type: "Conversation",
    title: "ELIZA",
    message: "An early conversational program demonstrates pattern-based dialogue.",
    era: "Rules",
    focus: "ai",
    capability: "Capability focus: scripted language interaction",
    connection: "ELIZA is historically important, but it is not an LLM; its dialogue depends on scripted patterns."
  },
  {
    year: "1970s-80s",
    type: "Rules",
    title: "Expert systems",
    message: "Knowledge is encoded through rules for specialised decision making.",
    era: "Rules",
    focus: "ai",
    capability: "Capability focus: explicit expert knowledge",
    connection: "This is the rule based AI idea from the campus scholarship example."
  },
  {
    year: "1986",
    type: "Training",
    title: "Backpropagation gains prominence",
    message: "Neural networks become easier to train by sending error information backward.",
    era: "Learning",
    focus: "ml",
    capability: "Capability focus: improving learned parameters",
    connection: "Machine Learning becomes more practical when models can adjust from errors efficiently."
  },
  {
    year: "1997",
    type: "Specialist AI",
    title: "Deep Blue defeats Garry Kasparov",
    message: "AI excels in a specialised intellectual task.",
    era: "Rules",
    focus: "ai",
    capability: "Capability focus: specialised decision search",
    connection: "The result showed task-specific AI power, even before today's broad generative systems."
  },
  {
    year: "2012",
    type: "Vision",
    title: "AlexNet",
    message: "Deep learning produces a major breakthrough in computer vision.",
    era: "Deep Learning",
    focus: "dl",
    capability: "Capability focus: learning complex representations",
    connection: "This illuminates Deep Learning: multilayer neural networks learn features from complex data."
  },
  {
    year: "2014",
    type: "Generation",
    title: "GANs",
    message: "Modern generative AI accelerates through systems that can create realistic new examples.",
    era: "Generation",
    focus: "genai",
    capability: "Capability focus: creating new content",
    connection: "The timeline now connects to Generative AI: systems can synthesize new outputs."
  },
  {
    year: "2017",
    type: "Architecture",
    title: "Transformer architecture",
    message: "A key foundation for modern large language models is introduced.",
    era: "Foundation Models",
    focus: "llm",
    capability: "Capability focus: context-aware sequence modelling",
    connection: "Transformers become central to modern LLMs because they handle language context effectively."
  },
  {
    year: "2020",
    type: "Scale",
    title: "GPT-3",
    message: "Large-scale language generation becomes strikingly capable.",
    era: "Foundation Models",
    focus: "llm",
    capability: "Capability focus: large-scale language generation",
    connection: "LLMs become visibly powerful as model scale, data, and training pipelines improve."
  },
  {
    year: "2022",
    type: "Adoption",
    title: "ChatGPT",
    message: "Conversational Generative AI reaches mass adoption.",
    era: "Foundation Models",
    focus: "llm",
    capability: "Capability focus: accessible conversational AI",
    connection: "The LLM idea becomes familiar to many learners through conversational interaction."
  },
  {
    year: "2023 onward",
    type: "Expansion",
    title: "Multimodal and increasingly agentic AI systems",
    message: "AI moves beyond text toward perception, reasoning, creation, and action.",
    era: "Multimodal And Agentic AI",
    focus: "genai",
    capability: "Capability focus: combining language, perception, creation, and action",
    connection: "Modern AI increasingly blends language with images, audio, tools, and task-oriented workflows."
  }
];

const eraLabels = ["Rules", "Learning", "Deep Learning", "Generation", "Foundation Models", "Multimodal And Agentic AI"];

let activeConceptIndex = 0;
let activeMilestoneIndex = 0;
let activeWindow = "family";

const elements = {
  header: document.querySelector(".app-header"),
  progressBar: document.querySelector("#progressBar"),
  tabs: Array.from(document.querySelectorAll(".window-tab")),
  panels: Array.from(document.querySelectorAll("[data-window-panel]")),
  termsToggle: document.querySelector("#termsToggle"),
  termsClose: document.querySelector("#termsClose"),
  termsPanel: document.querySelector("#termsPanel"),
  termsList: document.querySelector("#termsList"),
  restartButton: document.querySelector("#restartButton"),
  capabilityPath: document.querySelector("#capabilityPath"),
  conceptControls: document.querySelector("#conceptControls"),
  scenarioKicker: document.querySelector("#scenarioKicker"),
  scenarioTitle: document.querySelector("#scenarioTitle"),
  scenarioText: document.querySelector("#scenarioText"),
  scenarioOutput: document.querySelector("#scenarioOutput"),
  definitionLabel: document.querySelector("#definitionLabel"),
  definitionTitle: document.querySelector("#definitionTitle"),
  definitionNote: document.querySelector("#definitionNote"),
  hierarchyMap: document.querySelector("#hierarchyMap"),
  hierarchyNote: document.querySelector("#hierarchyNote"),
  quizGrid: document.querySelector("#quizGrid"),
  eraRibbon: document.querySelector("#eraRibbon"),
  timelineSlider: document.querySelector("#timelineSlider"),
  timelineYear: document.querySelector("#timelineYear"),
  timelineTrack: document.querySelector("#timelineTrack"),
  milestoneType: document.querySelector("#milestoneType"),
  milestoneTitle: document.querySelector("#milestoneTitle"),
  milestoneMessage: document.querySelector("#milestoneMessage"),
  milestoneCapability: document.querySelector("#milestoneCapability"),
  compactFamily: document.querySelector("#compactFamily"),
  timelineConnection: document.querySelector("#timelineConnection")
};

document.addEventListener("DOMContentLoaded", () => {
  renderTerms();
  renderCapabilityPath();
  renderConceptButtons();
  renderQuiz();
  renderEraRibbon();
  renderTimelineTrack();
  bindEvents();
  setConcept(0);
  setMilestone(0);
  setWindow("family");
});

function bindEvents() {
  window.addEventListener("scroll", () => {
    elements.header.dataset.elevated = String(window.scrollY > 6);
  });

  elements.tabs.forEach(tab => {
    tab.addEventListener("click", () => setWindow(tab.dataset.window));
  });

  elements.termsToggle.addEventListener("click", () => {
    const isOpen = !elements.termsPanel.hidden;
    elements.termsPanel.hidden = isOpen;
    elements.termsToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  elements.termsClose.addEventListener("click", closeTerms);
  elements.restartButton.addEventListener("click", restartLab);

  elements.timelineSlider.addEventListener("input", () => {
    setMilestone(Number(elements.timelineSlider.value));
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeTerms();
    if (event.key === "ArrowRight") {
      if (activeWindow === "family") setConcept(Math.min(concepts.length - 1, activeConceptIndex + 1));
      if (activeWindow === "timeline") setMilestone(Math.min(milestones.length - 1, activeMilestoneIndex + 1));
    }
    if (event.key === "ArrowLeft") {
      if (activeWindow === "family") setConcept(Math.max(0, activeConceptIndex - 1));
      if (activeWindow === "timeline") setMilestone(Math.max(0, activeMilestoneIndex - 1));
    }
  });
}

function renderTerms() {
  elements.termsList.innerHTML = concepts
    .map(concept => `
      <article class="term-item">
        <strong>${concept.name}</strong>
        <p>${concept.definition}</p>
      </article>
    `)
    .join("");
}

function renderCapabilityPath() {
  elements.capabilityPath.innerHTML = concepts
    .map(concept => `<span class="path-step" data-path="${concept.id}">${concept.path}</span>`)
    .join("");
}

function renderConceptButtons() {
  elements.conceptControls.innerHTML = concepts
    .map((concept, index) => `
      <button class="concept-button" type="button" data-concept="${index}">
        <span class="concept-glyph" aria-hidden="true">${concept.glyph}</span>
        <small>${concept.order}</small>
        <strong>${concept.name}</strong>
      </button>
    `)
    .join("");

  elements.conceptControls.querySelectorAll("[data-concept]").forEach(button => {
    button.addEventListener("click", () => setConcept(Number(button.dataset.concept)));
  });
}

function renderQuiz() {
  elements.quizGrid.innerHTML = quizItems
    .map((item, index) => `
      <button class="quiz-card" type="button" data-quiz="${index}" aria-expanded="false">
        <strong>${item.task}</strong>
        <span class="quiz-answer">Select to reveal</span>
      </button>
    `)
    .join("");

  elements.quizGrid.querySelectorAll("[data-quiz]").forEach(button => {
    button.addEventListener("click", () => {
      const item = quizItems[Number(button.dataset.quiz)];
      const answer = button.querySelector(".quiz-answer");
      button.classList.add("is-revealed");
      button.setAttribute("aria-expanded", "true");
      answer.innerHTML = `<b>${item.answer}</b><br>${item.reason}`;
    });
  });
}

function renderEraRibbon() {
  elements.eraRibbon.innerHTML = eraLabels
    .map(era => `<span class="era-step" data-era="${era}">${era}</span>`)
    .join("");
}

function renderTimelineTrack() {
  elements.timelineSlider.max = String(milestones.length - 1);
  elements.timelineTrack.innerHTML = milestones
    .map((milestone, index) => `
      <button class="timeline-dot" type="button" data-milestone="${index}" title="${milestone.title}">
        ${milestone.year}
      </button>
    `)
    .join("");

  elements.timelineTrack.querySelectorAll("[data-milestone]").forEach(button => {
    button.addEventListener("click", () => setMilestone(Number(button.dataset.milestone)));
  });
}

function setWindow(windowName) {
  activeWindow = windowName;

  elements.tabs.forEach(tab => {
    const isActive = tab.dataset.window === windowName;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  elements.panels.forEach(panel => {
    panel.classList.toggle("is-active", panel.dataset.windowPanel === windowName);
  });

  updateProgress();
}

function setConcept(index) {
  activeConceptIndex = index;
  const concept = concepts[index];

  elements.scenarioKicker.textContent = concept.scenarioKicker;
  elements.scenarioTitle.textContent = concept.scenarioTitle;
  elements.scenarioText.textContent = concept.scenarioText;
  elements.scenarioOutput.textContent = concept.scenarioOutput;
  elements.definitionLabel.textContent = concept.name;
  elements.definitionTitle.textContent = concept.definition;
  elements.definitionNote.textContent = concept.note;
  elements.hierarchyNote.textContent = concept.hierarchy;
  elements.hierarchyMap.dataset.focus = concept.id;

  elements.conceptControls.querySelectorAll("[data-concept]").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
  });

  elements.capabilityPath.querySelectorAll("[data-path]").forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === index);
    step.classList.toggle("is-complete", stepIndex < index);
  });

  updateProgress();
}

function setMilestone(index) {
  activeMilestoneIndex = index;
  const milestone = milestones[index];
  elements.timelineSlider.value = String(index);
  elements.timelineYear.textContent = milestone.year;
  elements.milestoneType.textContent = milestone.type;
  elements.milestoneTitle.textContent = milestone.title;
  elements.milestoneMessage.textContent = milestone.message;
  elements.milestoneCapability.textContent = milestone.capability;
  elements.timelineConnection.textContent = milestone.connection;

  elements.timelineTrack.querySelectorAll("[data-milestone]").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
    dot.classList.toggle("is-complete", dotIndex < index);
  });

  elements.eraRibbon.querySelectorAll("[data-era]").forEach(step => {
    const firstIndex = milestones.findIndex(item => item.era === step.dataset.era);
    const isActive = step.dataset.era === milestone.era;
    step.classList.toggle("is-active", isActive);
    step.classList.toggle("is-complete", firstIndex > -1 && firstIndex < index && !isActive);
  });

  elements.compactFamily.querySelectorAll("[data-compact]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.compact === milestone.focus);
  });

  updateProgress();
}

function updateProgress() {
  const familyProgress = activeConceptIndex / (concepts.length - 1);
  const timelineProgress = activeMilestoneIndex / (milestones.length - 1);
  const combined = activeWindow === "family"
    ? familyProgress * 0.48
    : 0.52 + timelineProgress * 0.48;
  elements.progressBar.style.width = `${Math.round(combined * 100)}%`;
}

function closeTerms() {
  elements.termsPanel.hidden = true;
  elements.termsToggle.setAttribute("aria-expanded", "false");
}

function restartLab() {
  closeTerms();
  document.querySelectorAll(".quiz-card").forEach((button, index) => {
    button.classList.remove("is-revealed");
    button.setAttribute("aria-expanded", "false");
    button.querySelector(".quiz-answer").textContent = index === 0 ? "Select to reveal" : "Select to reveal";
  });
  setConcept(0);
  setMilestone(0);
  setWindow("family");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
