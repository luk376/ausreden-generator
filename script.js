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

const toneLabels = {
  locker: 'Locker',
  glaubwürdig: 'Glaubwürdig',
  dramatisch: 'Dramatisch',
};

const detailLabels = {
  kurz: 'Kurz & knapp',
  normal: 'Mit etwas Kontext',
  ausführlich: 'Ausführlich',
};

const tonePhrases = {
  locker: 'Ich bin heute ein bisschen im Stress und konnte deshalb nicht wie geplant reagieren.',
  glaubwürdig: 'Ich hatte heute einen kurzfristigen Gegenstopp und konnte deshalb nicht wie geplant reagieren.',
  dramatisch: 'Ein unerwarteter Zwischenfall hat meinen Plan heute komplett aus dem Takt gebracht.',
};

const detailPhrases = {
  kurz: 'Ich mache es schnell nach.',
  normal: 'Ich kümmere mich direkt darum und mache es so bald wie möglich nach.',
  ausführlich: 'Ich schaue es mir sofort an, kümmere mich persönlich darum und melde mich mit einem Update, sobald ich wieder auf Kurs bin.',
};

const templates = {
  Hausaufgaben: [['Der Klassiker', 'Ich wollte es wirklich machen, aber {topic} hat mich komplett aus dem Konzept gebracht. Ich hole es zuverlässig nach.'], ['Fast geschafft', 'Ich habe bei {topic} heute eine unerwartete Pause gebraucht und konnte daraus keinen festen Plan mehr machen. Ich komme sofort wieder dran.'], ['Voller Fokus', 'Das war heute ein echter Ausrutscher wegen {topic}. Ich bin aber gleich wieder bei der Sache und mache es danach sauber.']],
  'Zu spät': [['Knapp daneben', 'Wegen {topic} hat sich heute alles verzögert. Ich bin schon unterwegs und beeile mich, so gut es geht.'], ['Ungeplante Pause', 'Ich hatte wegen {topic} eine kleine Blockade und konnte nicht rechtzeitig losfahren. Ich bin auf dem Weg und komme so schnell wie möglich.'], ['Spät dran', 'Ich wurde heute durch {topic} aus dem Rhythmus gebracht und bin deshalb später dran. Ich bin schon unterwegs und mache mich sofort auf den Weg.']],
  Verabredung: [['Ungeplante Wendung', 'Es tut mir leid, aber wegen {topic} schaffe ich es heute leider nicht. Können wir einen neuen Termin finden?'], ['Ehrlich gesagt', 'Heute kommt mir {topic} dazwischen, deshalb kann ich die Verabredung nicht wie geplant einhalten. Ich würde mich gern bald neu verabreden.'], ['Konkret', 'Ich musste mich heute wegen {topic} kurzfristig neu sortieren und kann deshalb nicht erscheinen. Lass uns gern einen neuen Zeitpunkt finden.']],
  Arbeit: [['Kurze Erklärung', 'Ich kann mich heute wegen {topic} nicht so konzentrieren wie sonst. Ich kümmere mich darum und melde mich mit einem Update.'], ['Prioritäten', 'Wegen {topic} musste ich heute meine Prioritäten neu setzen und konnte den Plan nicht so umsetzen, wie ich wollte. Ich bin direkt wieder dran.'], ['Offene Baustelle', 'Ich hatte heute mit {topic} eine kurzfristige Verzögerung und konnte deshalb nicht wie geplant weiterarbeiten. Ich ziehe die Sache sofort wieder auf.']],
  Aufräumen: [['Haushaltsdiplomatie', 'Ich würde ja, aber {topic} ist gerade wirklich dazwischengekommen. Ich mache es später heute auf jeden Fall noch.'], ['Fast ordentlich', 'Wegen {topic} bin ich heute nicht so weit gekommen, wie ich wollte. Ich räume es im nächsten Schritt wieder auf.'], ['Plan B', 'Ich war heute mit {topic} kurzfristig überlastet und konnte deshalb nicht wie geplant aufräumen. Ich mache es gleich danach wieder.']],
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
      const tone = escapeHtml(toneLabels[excuse.tone] || excus
        .tone || '—');
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

function buildExcuseText(template, topic, tone, detail) {
  const sentence = template.replace(/\{topic\}/g, topic).trim();
  const tonePhrase = tonePhrases[tone] || tonePhrases.glaubwürdig;
  const detailPhrase = detailPhrases[detail] || detailPhrases.normal;

  return `${sentence} ${tonePhrase} ${detailPhrase}`;
}

function createExcuse() {
  const occasion = occasionInput.value;
  const tone = toneInput.value || 'glaubwürdig';
  const detail = detailInput.value || 'normal';
  const topic = topicInput.value.trim() || 'ein unerwarteter Zwischenfall';
  const options = templates[occasion];

  if (!Array.isArray(options) || !options.length) {
    const fallbackExcuse = {
      occasion: occasion || 'Allgemein',
      topic,
      tone,
      detail,
      title: `Notfallplan: ${topic}`,
      text: buildExcuseText(
        `Ich hatte heute mit {topic} zu tun und konnte deshalb nicht wie geplant reagieren.`,
        topic,
        tone,
        detail,
      ),
    };

    renderResult(fallbackExcuse);
    saveHistory(fallbackExcuse);
    return;
  }

  const [title, template] = options[Math.floor(Math.random() * options.length)];
  const excuse = {
    occasion,
    topic,
    tone,
    detail,
    title: `${title}: ${topic}`,
    text: buildExcuseText(template, topic, tone, detail),
  };

  renderResult(excuse);
  saveHistory(excuse);
}

function renderResult(excuse) {
  emptyState.hidden = true;
  resultState.hidden = false;
  resultOccasion.textContent = excuse.occasion;
  resultMeta.textContent = `${toneLabels[excuse.tone] || excuse.tone} · ${detailLabels[excuse.detail] || excuse.detail}`;
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
