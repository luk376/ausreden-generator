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
  Hausaufgaben: [
    ['Heute nicht geschafft', 'Ich bin mit {topic} heute nicht so weit gekommen wie geplant. Ich setze mich später noch einmal in Ruhe daran.'],
    ['Ich hole es nach', 'Bei {topic} bin ich heute hängen geblieben und dann ist mir die Zeit davongelaufen. Ich mache morgen weiter und hole den Rest nach.'],
    ['Kopf war woanders', 'Ich konnte mich heute bei {topic} einfach nicht richtig konzentrieren. Ich schaue es mir später noch einmal an.'],
  ],
  'Zu spät': [
    ['Bin unterwegs', 'Ich hänge gerade etwas hinterher und bin schon auf dem Weg. Tut mir leid, dass du warten musst.'],
    ['Komme später', 'Bei mir hat sich gerade alles ein bisschen verzögert. Ich beeile mich und bin so schnell wie möglich da.'],
    ['Kleine Verspätung', 'Ich schaffe es leider nicht ganz pünktlich. Ich bin unterwegs und sage Bescheid, sobald ich da bin.'],
  ],
  Verabredung: [
    ['Können wir verschieben?', 'Es tut mir leid, aber ich schaffe es heute doch nicht. Können wir einen anderen Tag ausmachen?'],
    ['Heute klappt es leider nicht', 'Ich muss unser Treffen für heute absagen. Tut mir leid, dass ich so kurzfristig Bescheid sage. Passt dir ein anderer Tag?'],
    ['Lass uns einen neuen Termin finden', 'Bei mir ist heute etwas dazwischengekommen und ich schaffe es nicht mehr. Ich würde dich aber gern sehen – wann passt es dir nächste Woche?'],
  ],
  Arbeit: [
    ['Kurzes Update', 'Ich bin mit {topic} noch nicht so weit, wie ich gehofft hatte. Ich arbeite daran weiter und gebe dir Bescheid, sobald ich einen verlässlichen Stand habe.'],
    ['Brauche noch etwas Zeit', 'Bei {topic} brauche ich noch ein bisschen länger. Ich melde mich, sobald ich es abgeschlossen habe.'],
    ['Ich kümmere mich darum', 'Ich bin bei {topic} heute nicht wie geplant vorangekommen. Ich nehme es als Nächstes in Angriff und halte dich auf dem Laufenden.'],
  ],
  Aufräumen: [
    ['Mache ich später', 'Ich bin heute noch nicht zum Aufräumen gekommen. Ich kümmere mich später darum.'],
    ['Ist noch nicht erledigt', 'Ich hab’s heute nicht mehr geschafft aufzuräumen. Ich mache es morgen, versprochen.'],
    ['Kommt noch dran', 'Heute ist der Haushalt liegen geblieben. Ich räume später noch ein bisschen auf.'],
  ],
};

const genericTemplates = {
  Hausaufgaben: [
    ['Heute nicht geschafft', 'Ich bin heute nicht so weit gekommen wie geplant. Ich setze mich später noch einmal in Ruhe daran.'],
    ['Ich hole es nach', 'Ich bin heute bei den Aufgaben hängen geblieben und dann ist mir die Zeit davongelaufen. Ich mache morgen weiter und hole den Rest nach.'],
    ['Kopf war woanders', 'Ich konnte mich heute einfach nicht richtig konzentrieren. Ich schaue es mir später noch einmal an.'],
  ],
  'Zu spät': [
    ['Bin unterwegs', 'Ich hänge gerade etwas hinterher und bin schon auf dem Weg. Tut mir leid, dass du warten musst.'],
    ['Komme später', 'Bei mir hat sich gerade alles ein bisschen verzögert. Ich beeile mich und bin so schnell wie möglich da.'],
    ['Kleine Verspätung', 'Ich schaffe es leider nicht ganz pünktlich. Ich bin unterwegs und sage Bescheid, sobald ich da bin.'],
  ],
  Verabredung: [
    ['Können wir verschieben?', 'Es tut mir leid, aber ich schaffe es heute doch nicht. Können wir einen anderen Tag ausmachen?'],
    ['Heute klappt es leider nicht', 'Ich muss unser Treffen für heute absagen. Tut mir leid, dass ich so kurzfristig Bescheid sage. Passt dir ein anderer Tag?'],
    ['Lass uns einen neuen Termin finden', 'Heute ist bei mir einfach zu viel los und ich schaffe es nicht mehr. Ich würde dich aber gern sehen – wann passt es dir nächste Woche?'],
  ],
  Arbeit: [
    ['Kurzes Update', 'Ich bin heute nicht so weit gekommen, wie ich gehofft hatte. Ich arbeite daran weiter und gebe dir Bescheid, sobald ich einen verlässlichen Stand habe.'],
    ['Brauche noch etwas Zeit', 'Ich brauche dafür noch ein bisschen länger. Ich melde mich, sobald ich es abgeschlossen habe.'],
    ['Ich kümmere mich darum', 'Ich bin heute nicht wie geplant vorangekommen. Ich nehme es als Nächstes in Angriff und halte dich auf dem Laufenden.'],
  ],
  Aufräumen: [
    ['Mache ich später', 'Ich bin heute noch nicht zum Aufräumen gekommen. Ich kümmere mich später darum.'],
    ['Ist noch nicht erledigt', 'Ich hab’s heute nicht mehr geschafft aufzuräumen. Ich mache es morgen, versprochen.'],
    ['Kommt noch dran', 'Heute ist der Haushalt liegen geblieben. Ich räume später noch ein bisschen auf.'],
  ],
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
  const topic = topicInput.value.trim();
  const options = topic ? templates[occasion] : genericTemplates[occasion];

  if (!Array.isArray(options) || !options.length) {
    const fallbackExcuse = {
      occasion: occasion || 'Allgemein',
      topic,
      tone: toneInput.value,
      detail: detailInput.value,
      title: topic ? `Kurzes Update: ${topic}` : 'Kurzes Update',
      text: topic
        ? `Ich bin mit ${topic} noch nicht so weit wie geplant. Ich kümmere mich darum und melde mich, sobald ich einen neuen Stand habe.`
        : 'Ich bin heute nicht so weit gekommen wie geplant. Ich kümmere mich darum und melde mich, sobald ich einen neuen Stand habe.',
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
    title: topic ? `${title}: ${topic}` : title,
    text: topic ? template.replace(/\{topic\}/g, topic) : template,
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
