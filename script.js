const form = document.querySelector('#excuse-form');
const topicInput = document.querySelector('#topic');
const occasionInput = document.querySelector('#occasion');
const toneInput = document.querySelector('#tone');
const detailInput = document.querySelector('#detail');
const emptyState = document.querySelector('#empty-state');
const resultState = document.querySelector('#result-state');
const resultTitle = document.querySelector('#result-title');
const resultText = document.querySelector('#result-text');
const resultMeta = document.querySelector('#result-meta');
const resultOccasion = document.querySelector('#result-occasion');
const historyList = document.querySelector('#history-list');
const historyKey = 'ausredenwerk-history';

const templates = {
  Hausaufgaben: [['Der Klassiker', 'Ich wollte es wirklich machen, aber {topic} hat mich komplett aus dem Konzept gebracht. Ich hole es zuverlässig nach.'], ['Fast geschafft', 'Ich habe bei {topic} angefangen, bin aber an einer Stelle hängen geblieben. Ich bringe es morgen fertig mit.']],
  'Zu spät': [['Knapp daneben', 'Wegen {topic} hat sich heute alles verzögert. Ich bin schon unterwegs und beeile mich, so gut es geht.'], ['Ungeplante Pause', 'Ich hatte wegen {topic} eine kleine Verzögerung. Tut mir leid, ich bin gleich da.']],
  Verabredung: [['Ungeplante Wendung', 'Es tut mir leid, aber wegen {topic} schaffe ich es heute leider nicht. Können wir einen neuen Termin finden?'], ['Ehrlich gesagt', 'Heute kommt mir {topic} dazwischen. Ich möchte nicht kurzfristig absagen, aber anders klappt es leider nicht.']],
  Arbeit: [['Kurze Erklärung', 'Ich kann mich heute wegen {topic} nicht so konzentrieren wie sonst. Ich kümmere mich darum und melde mich mit einem Update.'], ['Prioritäten', 'Wegen {topic} muss ich heute kurz umplanen. Ich verschiebe das auf morgen und halte dich auf dem Laufenden.']],
  Aufräumen: [['Haushaltsdiplomatie', 'Ich würde ja, aber {topic} ist gerade wirklich dazwischengekommen. Ich mache es später heute auf jeden Fall noch.'], ['Fast ordentlich', 'Wegen {topic} bin ich noch nicht dazu gekommen. Es sieht schlimmer aus, als es ist, versprochen.']]
};

function createExcuse() {
  const occasion = occasionInput.value;
  const topic = topicInput.value.trim() || 'ein unerwarteter Zwischenfall';
  const options = templates[occasion];
  const [title, template] = options[Math.floor(Math.random() * options.length)];
  const excuse = { occasion, topic, tone: toneInput.value, detail: detailInput.value, title: `${title}: ${topic}`, text: template.replace('{topic}', topic) };
  renderResult(excuse);
  saveHistory(excuse);
}

function renderResult(excuse) {
  emptyState.hidden = true;
  resultState.hidden = false;
  resultOccasion.textContent = excuse.occasion;
  resultMeta.textContent = `${excuse.tone} · ${excuse.detail}`;
  resultTitle.textContent = excuse.title;
  resultText.textContent = excuse.text;
}

function saveHistory(excuse) {
  const history = [excuse, ...getHistory()].slice(0, 3);
  localStorage.setItem(historyKey, JSON.stringify(history));
  renderHistory(history);
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(historyKey)) || []; } catch { return []; }
}

function renderHistory(history = getHistory()) {
  if (!history.length) { historyList.innerHTML = '<p class="history-empty">Noch keine Ausreden erstellt.</p>'; return; }
  historyList.innerHTML = history.map((excuse) => `<article class="history-card"><div class="card-meta"><span>${excuse.occasion}</span><span>${excuse.tone}</span></div><p>${excuse.title}</p></article>`).join('');
}

form.addEventListener('submit', (event) => { event.preventDefault(); createExcuse(); });
document.querySelector('#new-button').addEventListener('click', createExcuse);
document.querySelector('#copy-button').addEventListener('click', async (event) => {
  await navigator.clipboard.writeText(`${resultTitle.textContent}\n\n${resultText.textContent}`);
  event.currentTarget.innerHTML = '<span aria-hidden="true">✓</span> Kopiert';
  setTimeout(() => { event.currentTarget.innerHTML = '<span aria-hidden="true">□</span> Kopieren'; }, 1600);
});
document.querySelector('#clear-history').addEventListener('click', () => { localStorage.removeItem(historyKey); renderHistory([]); });
renderHistory();