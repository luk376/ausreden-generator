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
    ['Der Klassiker', 'Ich wollte heute wirklich daran arbeiten, aber {topic} hat mich komplett aus dem Konzept gebracht. Ich setze mich später noch einmal konzentriert daran.'],
    ['Ein bisschen später', 'Ich bin heute mit {topic} in eine andere Richtung geraten und konnte mich nicht mehr richtig auf die Aufgaben fokussieren. Ich mache es gleich nach.'],
    ['Ich hole es nach', 'Ich hatte heute mit {topic} zu viel zu tun und konnte die Hausaufgaben nicht sauber abschließen. Ich hole sie später nach und mache sie ordentlich.'],
  ],
  'Zu spät': [
    ['Verzögerung', 'Es ist heute etwas Unvorhergesehenes mit {topic} dazwischengekommen, deshalb bin ich später los. Ich bin schon unterwegs und entschuldige mich.'],
    ['Kurz abgebremst', 'Heute hat {topic} mich kurz aus dem Takt gebracht. Ich bin schon auf dem Weg und beeile mich so gut ich kann.'],
    ['Nicht ganz so schnell', 'Ich musste mich heute wegen {topic} erst noch neu sortieren. Ich bin unterwegs und komme schnellstens.'],
  ],
  Verabredung: [
    ['Ich möchte ehrlich bleiben', 'Es tut mir leid, aber heute war {topic} plötzlich wichtiger und ich kann nicht wie geplant. Können wir einen neuen Termin finden?'],
    ['Ungeplante Situation', 'Heute hat sich mit {topic} alles kurzfristig verschoben. Ich möchte dich nicht im Unklaren lassen und schlage gern einen anderen Zeitpunkt vor.'],
    ['Ich brauche eine kleine Verschiebung', 'Ich wollte es wirklich schaffen, aber {topic} hat mich heute vollkommen ausgebremst. Ich würde gern einen neuen Termin mit dir vereinbaren.'],
  ],
  Arbeit: [
    ['Keine einfache Aufgabe', 'Ich konnte mich heute wegen {topic} nicht so konzentrieren, wie ich wollte. Ich arbeite den Rest schnell nach und melde mich mit einem Update.'],
    ['Prioritäten verschoben', 'Heute musste ich wegen {topic} meine Energie anders verteilen. Ich bin aber sofort wieder dran und mache den Rest so schnell wie möglich.'],
    ['Etwas aus dem Takt', 'Ich bin heute durch {topic} kurz aus dem Takt geraten, deshalb konnte ich nicht sauber weiterarbeiten. Ich hole es in den nächsten Schritten nach.'],
  ],
  Aufräumen: [
    ['Kurz nicht drin', 'Ich hätte es gern sofort gemacht, aber {topic} hat mich heute wirklich ausgebremst. Ich räume es später gezielt auf.'],
    ['Das Chaos war größer', 'Heute war {topic} einfach zu präsent und ich bin nicht richtig in den Haushalt gekommen. Ich mache es gleich nach und räume alles wieder auf.'],
    ['Ich komme noch dran', 'Ich wollte heute noch aufräumen, aber {topic} war unerwartet dazwischen. Ich mache es später und bringe alles wieder in Ordnung.'],
  ],
};

const genericTemplates = {
  Hausaufgaben: [
    ['Der Klassiker', 'Ich wollte heute wirklich daran arbeiten, aber heute lief alles ein bisschen anders und ich konnte mich nicht richtig fokussieren. Ich setze mich später noch einmal gezielt daran.'],
    ['Ein bisschen später', 'Es ist heute einfach zu viel auf einmal gewesen, deshalb bin ich mit den Hausaufgaben nicht weitergekommen. Ich mache sie gleich nach und hole das auf.'],
    ['Ich hole es nach', 'Ich hatte heute nicht die nötige Ruhe und Konzentration, um die Hausaufgaben ordentlich zu schaffen. Ich mache sie später noch einmal in Ruhe.'],
  ],
  'Zu spät': [
    ['Verzögerung', 'Heute ist etwas Unvorhergesehenes dazwischengekommen, deshalb bin ich später los. Ich bin schon unterwegs und entschuldige mich.'],
    ['Kurz abgebremst', 'Ich musste heute noch einmal kurz alles neu sortieren und bin dadurch später weg. Ich beeile mich so gut ich kann.'],
    ['Nicht ganz so schnell', 'Es hat heute eine kleine Verzögerung gegeben, aber ich bin auf dem Weg und komme so schnell wie möglich.'],
  ],
  Verabredung: [
    ['Ich möchte ehrlich bleiben', 'Es tut mir leid, aber heute geht es leider nicht. Ich möchte dich nicht im Unklaren lassen und schlage gern einen neuen Termin vor.'],
    ['Ungeplante Situation', 'Heute ist etwas dazwischengekommen, das ich kurzfristig nicht beeinflussen konnte. Ich würde gern einen anderen Zeitpunkt mit dir vereinbaren.'],
    ['Ich brauche eine kleine Verschiebung', 'Ich wollte es wirklich schaffen, aber heute hat sich leider alles anders entwickelt. Ich bin gern bereit, einen neuen Termin zu finden.'],
  ],
  Arbeit: [
    ['Keine einfache Aufgabe', 'Ich konnte mich heute nicht so fokussieren, wie ich wollte, und habe deshalb nicht alles so schnell geschafft. Ich arbeite den Rest nach und melde mich mit einem Update.'],
    ['Prioritäten verschoben', 'Heute mussten meine Prioritäten kurz anders gesetzt werden, deshalb konnte ich nicht wie geplant vorankommen. Ich mache den Rest so schnell wie möglich.'],
    ['Etwas aus dem Takt', 'Ich bin heute kurz aus dem Takt geraten und konnte deshalb nicht sauber weiterarbeiten. Ich hole es in den nächsten Schritten nach.'],
  ],
  Aufräumen: [
    ['Kurz nicht drin', 'Ich hätte es gern sofort gemacht, aber heute war einfach zu viel gleichzeitig. Ich räume es später gezielt auf.'],
    ['Das Chaos war größer', 'Heute ist alles etwas unordentlicher gelaufen und ich konnte nicht richtig zum Aufräumen kommen. Ich mache es gleich nach und bringe alles wieder in Ordnung.'],
    ['Ich komme noch dran', 'Ich wollte heute noch aufräumen, aber die Zeit war heute einfach nicht passend. Ich mache es später und räume alles wieder sauber.'],
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
      title: topic ? `Notfallplan: ${topic}` : 'Notfallplan',
      text: topic
        ? `Ich hatte heute mit ${topic} zu tun und konnte deshalb nicht wie geplant reagieren. Ich kümmere mich im nächsten Schritt darum.`
        : 'Heute ist leider etwas dazwischengekommen. Ich konnte deshalb nicht wie geplant reagieren und kümmere mich im nächsten Schritt darum.',
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
