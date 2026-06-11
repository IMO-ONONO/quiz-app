const SUBJECTS = [
  { id: 'reasoning', label: '数的・判断推理', file: 'data/reasoning.json', categoryGroup: true },
  { id: 'memory', label: '暗記', file: 'data/memory.json', categoryGroup: true },
  { id: 'japanese', label: '日本語', file: 'data/japanese.json', categoryGroup: true },
];

const CATEGORY_LABELS = {
  numerical: '数的推理',
  judgment: '判断推理',
  japanese_history: '日本史',
  world_history: '世界史',
  geography: '地理',
  biology: '生物',
  physics: '物理',
  chemistry: '化学',
  earth_science: '地学',
  kanji: '漢字',
  idiom: '四字熟語',
  grammar: '文法・敬語',
  vocabulary: '語彙',
  literature: '文学常識',
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function createQuestionItem(q, meta) {
  const li = document.createElement('li');

  const summary = document.createElement('button');
  summary.type = 'button';
  summary.className = 'review-item-summary';
  summary.textContent = q.question.length > 60 ? q.question.substring(0, 60) + '…' : q.question;

  const details = document.createElement('div');
  details.className = 'review-item-details';
  details.hidden = true;
  details.innerHTML = `
    <p>${escapeHtml(q.question)}</p>
    <p class="meta">間違えた回数: ${meta.wrongCount || 1}</p>
    <p class="correct-answer">正解: ${q.answer + 1}. ${escapeHtml(q.choices[q.answer])}</p>
    <p>${escapeHtml(q.explanation)}</p>
  `;

  const masteredBtn = document.createElement('button');
  masteredBtn.type = 'button';
  masteredBtn.className = 'mastered-button';
  masteredBtn.textContent = '習得済みにする';
  masteredBtn.addEventListener('click', () => {
    const current = JSON.parse(localStorage.getItem('unresolved') || '{}');
    delete current[q.id];
    localStorage.setItem('unresolved', JSON.stringify(current));
    li.remove();
  });
  details.appendChild(masteredBtn);

  summary.addEventListener('click', () => {
    details.hidden = !details.hidden;
  });

  li.appendChild(summary);
  li.appendChild(details);
  return li;
}

async function init() {
  const unresolved = JSON.parse(localStorage.getItem('unresolved') || '{}');
  const unresolvedIds = Object.keys(unresolved);
  const contentEl = document.getElementById('review-content');

  if (unresolvedIds.length === 0) {
    contentEl.innerHTML = '<p class="empty">未克服の問題はまだありません</p>';
    return;
  }

  for (const s of SUBJECTS) {
    let data;
    try {
      const response = await fetch(s.file);
      if (!response.ok) continue;
      data = await response.json();
    } catch (e) {
      continue;
    }

    const questions = (data.questions || []).filter((q) => unresolvedIds.includes(q.id));
    if (questions.length === 0) continue;

    const section = document.createElement('section');
    section.className = 'review-section';

    const h2 = document.createElement('h2');
    h2.textContent = `${s.label}（${questions.length}問）`;
    section.appendChild(h2);

    if (s.categoryGroup) {
      const byCategory = {};
      questions.forEach((q) => {
        const cat = q.category || 'unknown';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(q);
      });

      Object.keys(byCategory).forEach((cat) => {
        const subsection = document.createElement('div');
        subsection.className = 'review-subsection';

        const h3 = document.createElement('h3');
        h3.textContent = `${CATEGORY_LABELS[cat] || cat}（${byCategory[cat].length}問）`;
        subsection.appendChild(h3);

        const ul = document.createElement('ul');
        byCategory[cat].forEach((q) => {
          ul.appendChild(createQuestionItem(q, unresolved[q.id]));
        });
        subsection.appendChild(ul);

        section.appendChild(subsection);
      });
    } else {
      const ul = document.createElement('ul');
      questions.forEach((q) => {
        ul.appendChild(createQuestionItem(q, unresolved[q.id]));
      });
      section.appendChild(ul);
    }

    contentEl.appendChild(section);
  }
}

init();
