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
  Hausaufgaben: [['Der Klassiker', 'Ich wollte es wirklich machen, aber {topic} hat mich komplett aus dem Konzept gebracht. Ich hole es zuverlässig nach.'], ['Fast geschafft', 'Ich habe bei {topic} zu lange gebraucht und konnte meine Prioritäten nicht sauber trennen. Ich mache es heute noch nach.'], ['Ziel verloren', 'Es war ein kompletter Ausrutscher mit {topic}. Ich bin dran und setze mich sofort wieder daran.']],
  'Zu spät': [['Knapp daneben', 'Wegen {topic} hat sich heute alles verzögert. Ich bin schon unterwegs und beeile mich, so gut es geht.'], ['Ungeplante Pause', 'Ich hatte wegen {topic} eine kleine Unterbrechung und bin dadurch später losgekommen. Ich bin unterwegs und entschuldige mich.'], ['Kleine Verzögerung', 'Es war ein unvorhergesehener Rückschlag mit {topic}. Ich werde mich direkt wieder in Bewegung setzen.']],
  Verabredung: [['Ungeplante Wendung', 'Es tut mir leid, aber wegen {topic} schaffe ich es heute leider nicht. Können wir einen neuen Termin finden?'], ['Ehrlich gesagt', 'Heute kommt mir {topic} dazwischen. Ich möchte dich nicht im Unklaren lassen und schlage einen neuen Termin vor.'], ['Besser ehrlich', 'Ich musste mich heute wegen {topic} kurzfristig um etwas kümmern. Ich würde gern einen neuen Termin mit dir vereinbaren.']],
  Arbeit: [['Kurze Erklärung', 'Ich kann mich heute wegen {topic} nicht so konzentrieren wie sonst. Ich kümmere mich darum und melde mich mit einem Update.'], ['Prioritäten', 'Wegen {topic} musste ich meine Energie heute anders verteilen. Ich bin aber sofort wieder am Ball und schaffe den Rest nach.'], ['Nicht ganz so einfach', 'Ich bin heute durch {topic} etwas aus dem Takt geraten. Ich arbeite die Sache schnell auf und melde mich dann wieder.']],
  Aufräumen: [['Haushaltsdiplomatie', 'Ich würde ja, aber {topic} ist gerade wirklich dazwischengekommen. Ich mache es später heute auf jeden Fall noch.'], ['Fast ordentlich', 'Wegen {topic} bin ich heute nicht richtig in den Rhythmus gekommen. Ich räume es danach sofort wieder auf.'], ['Zwei Schritte vor, ein Schritt zurück', 'Ich hätte es gern geschafft, aber {topic} hat mich heute ausgebremst. Ich räume es später gezielt nach.']],
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getHistory() {
  try {
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveHistory(excuse) {
  try {
    const history = [excuse, ...getHistory()].slice(0, 3);
    localStorage.setItem(historyKey, JSON.stringify(history));
    renderHistory(history);
  } catch {
    renderHistory(getHistory());
  }
}

function renderHistory(history = getHistory()) {
  if (!history.length) {
    historyList.innerHTML = '<p class="history-empty">Noch keine Ausreden erstellt.</p>';
    return;
  }

  historyList.innerHTML = history
    .map((excuse) => {
      const occasion = escapeHtml(excuse.occasion || 'Unbekannt');
      const tone = escapeHtml(excuse.tone || '—');
      const title = escapeHtml(excuse.title || 'Ausrede');

      return `
        <article class="history-card">
          <div class="card-meta">
            <span>${occasion}</span>
            <span>${tone}</span>
          </div>
          <p>${title}</p>
        </article>
      `;
    })
    .join('');
}

function createExcuse() {
  const occasion = occasionInput.value;
  const topic = topicInput.value.trim() || 'ein unerwarteter Zwischenfall';
  const options = templates[occasion];

  if (!Array.isArray(options) || !options.length) {
    const fallbackExcuse = {
      occasion: occasion || 'Allgemein',
      topic,
      tone: toneInput.value,
      detail: detailInput.value,
      title: `Notfallplan: ${topic}`,
      text: `Ich hatte heute mit ${topic} zu tun und konnte deshalb nicht wie geplant reagieren. Ich kümmere mich im nächsten Schritt darum.`,
    };

    renderResult(fallbackExcuse);
    saveHistory(fallbackExcuse);
    return;
  }

  const [title, template] = options[Math.floor(Math.random() * options.length)];
  const excuse = {
    occasion,
    topic,
    tone: toneInput.value,
    detail: detailInput.value,
    title: `${title}: ${topic}`,
    text: template.replace(/\{topic\}/g, topic),
  };

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

async function copyResult(event) {
  const button = event.currentTarget;
  const textToCopy = `${resultTitle.textContent || ''}\n\n${resultText.textContent || ''}`;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = textToCopy;
      tempTextArea.setAttribute('readonly', '');
      tempTextArea.style.position = 'fixed';
      tempTextArea.style.top = '-9999px';
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      tempTextArea.remove();
    }

    button.innerHTML = '<span aria-hidden="true">✓</span> Kopiert';
    window.setTimeout(() => {
      button.innerHTML = '<span aria-hidden="true">□</span> Kopieren';
    }, 1600);
  } catch (error) {
    console.error('Copy failed:', error);
    button.innerHTML = '<span aria-hidden="true">!</span> Fehler';
    window.setTimeout(() => {
      button.innerHTML = '<span aria-hidden="true">□</span> Kopieren';
    }, 1600);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  createExcuse();
});

document.querySelector('#new-button').addEventListener('click', createExcuse);
document.querySelector('#copy-button').addEventListener('click', copyResult);
document.querySelector('#clear-history').addEventListener('click', () => {
  try {
    localStorage.removeItem(historyKey);
  } catch {
    // Ignore storage errors silently.
  }
  renderHistory([]);
});

renderHistory();
