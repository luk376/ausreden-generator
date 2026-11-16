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
    ['Heute nicht geschafft', 'Ich bin mit {topic} heute nicht so weit gekommen, wie ich wollte. Ich setze mich später noch mal in Ruhe dran.'],
    ['Ich hole es nach', 'Bei {topic} bin ich irgendwie hängen geblieben und dann war die Zeit plötzlich weg. Ich mache später weiter.'],
    ['Kopf war woanders', 'Ich konnte mich heute bei {topic} einfach nicht richtig konzentrieren. Ich schaue es mir morgen noch mal an.'],
  ],
  'Zu spät': [
    ['Bin unterwegs', 'Ich bin leider später dran als gedacht und schon unterwegs. Sorry, dass du warten musst.'],
    ['Komme später', 'Bei mir hat sich gerade alles verzögert. Ich beeile mich – bin so schnell da, wie ich kann.'],
    ['Kleine Verspätung', 'Ich schaffe es nicht ganz pünktlich. Ich bin unterwegs und melde mich, wenn ich da bin.'],
  ],
  Verabredung: [
    ['Können wir verschieben?', 'Hey, tut mir leid, aber heute schaffe ich es doch nicht. Können wir uns an einem anderen Tag treffen?'],
    ['Heute klappt es leider nicht', 'Ich muss für heute leider absagen. Tut mir leid, dass ich dir so kurzfristig Bescheid sage. Passt dir ein anderer Tag?'],
    ['Lass uns einen neuen Termin finden', 'Bei mir ist heute etwas dazwischengekommen. Ich würde dich aber gern sehen – wollen wir einen neuen Termin ausmachen?'],
  ],
  Arbeit: [
    ['Kurzes Update', 'Ich bin mit {topic} noch nicht ganz fertig. Ich mache weiter und gebe dir Bescheid, sobald ich einen verlässlichen Stand habe.'],
    ['Brauche noch etwas Zeit', 'Für {topic} brauche ich noch ein bisschen länger als gedacht. Ich melde mich, sobald ich fertig bin.'],
    ['Ich kümmere mich darum', 'Ich bin bei {topic} heute nicht so weit gekommen wie geplant. Ich nehme es als Nächstes in Angriff und halte dich auf dem Laufenden.'],
  ],
  Aufräumen: [
    ['Mache ich später', 'Ich bin heute noch nicht zum Aufräumen gekommen. Ich mach’s später noch.'],
    ['Ist noch nicht erledigt', 'Ich hab’s heute nicht mehr geschafft aufzuräumen. Ich kümmere mich morgen darum.'],
    ['Kommt noch dran', 'Heute ist der Haushalt liegen geblieben. Ich räume später noch ein bisschen auf.'],
  ],
};

const genericTemplates = {
  Hausaufgaben: [
    ['Heute nicht geschafft', 'Ich bin heute nicht so weit gekommen, wie ich wollte. Ich setze mich später noch mal in Ruhe dran.'],
    ['Ich hole es nach', 'Ich bin bei den Aufgaben irgendwie hängen geblieben und dann war die Zeit plötzlich weg. Ich mache später weiter.'],
    ['Kopf war woanders', 'Ich konnte mich heute einfach nicht richtig konzentrieren. Ich schaue es mir morgen noch mal an.'],
  ],
  'Zu spät': [
    ['Bin unterwegs', 'Ich bin leider später dran als gedacht und schon unterwegs. Sorry, dass du warten musst.'],
    ['Komme später', 'Bei mir hat sich gerade alles verzögert. Ich beeile mich – bin so schnell da, wie ich kann.'],
    ['Kleine Verspätung', 'Ich schaffe es nicht ganz pünktlich. Ich bin unterwegs und melde mich, wenn ich da bin.'],
  ],
  Verabredung: [
    ['Können wir verschieben?', 'Hey, tut mir leid, aber heute schaffe ich es doch nicht. Können wir uns an einem anderen Tag treffen?'],
    ['Heute klappt es leider nicht', 'Ich muss für heute leider absagen. Tut mir leid, dass ich dir so kurzfristig Bescheid sage. Passt dir ein anderer Tag?'],
    ['Lass uns einen neuen Termin finden', 'Heute ist bei mir einfach zu viel los. Ich würde dich aber gern sehen – wollen wir einen neuen Termin ausmachen?'],
  ],
  Arbeit: [
    ['Kurzes Update', 'Ich bin heute noch nicht so weit gekommen, wie ich wollte. Ich mache weiter und gebe dir Bescheid, sobald ich einen verlässlichen Stand habe.'],
    ['Brauche noch etwas Zeit', 'Dafür brauche ich noch ein bisschen länger als gedacht. Ich melde mich, sobald ich fertig bin.'],
    ['Ich kümmere mich darum', 'Ich bin heute nicht so weit gekommen wie geplant. Ich nehme es als Nächstes in Angriff und halte dich auf dem Laufenden.'],
  ],
  Aufräumen: [
    ['Mache ich später', 'Ich bin heute noch nicht zum Aufräumen gekommen. Ich mach’s später noch.'],
    ['Ist noch nicht erledigt', 'Ich hab’s heute nicht mehr geschafft aufzuräumen. Ich kümmere mich morgen darum.'],
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
        ? `Ich bin mit ${topic} noch nicht ganz fertig. Ich mache weiter und melde mich, sobald ich einen neuen Stand habe.`
        : 'Ich bin heute noch nicht ganz so weit gekommen wie geplant. Ich mache weiter und melde mich, sobald ich einen neuen Stand habe.',
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
