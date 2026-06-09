const subject = sessionStorage.getItem('selectedSubject');
if (!subject) {
  window.location.href = 'index.html';
}

let state = JSON.parse(sessionStorage.getItem('quizState') || 'null');

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveState() {
  sessionStorage.setItem('quizState', JSON.stringify(state));
}

async function initState() {
  const response = await fetch(`data/${subject}.json`);
  const data = await response.json();
  const allQuestions = data.questions || [];

  const unresolved = JSON.parse(localStorage.getItem('unresolved') || '{}');
  const unresolvedIds = Object.keys(unresolved).filter((id) =>
    allQuestions.some((q) => q.id === id)
  );

  const unresolvedQuestions = unresolvedIds
    .map((id) => {
      const q = allQuestions.find((qq) => qq.id === id);
      return { ...q, _lastShown: unresolved[id].lastShown || '' };
    })
    .sort((a, b) => a._lastShown.localeCompare(b._lastShown))
    .slice(0, 10);

  const remaining = 10 - unresolvedQuestions.length;
  const otherQuestions = allQuestions.filter((q) => !unresolvedIds.includes(q.id));
  const additional = shuffle(otherQuestions).slice(0, Math.max(0, remaining));

  const combined = shuffle([...unresolvedQuestions, ...additional]);

  const cleanedQuestions = combined.map((q) => ({
    id: q.id,
    category: q.category || null,
    question: q.question,
    choices: q.choices,
    answer: q.answer,
    explanation: q.explanation,
  }));

  state = {
    subject,
    questions: cleanedQuestions,
    currentIndex: 0,
    userAnswers: cleanedQuestions.map(() => null),
    showExplanation: false,
  };
  saveState();
}

function renderQuestion() {
  const total = state.questions.length;
  if (total === 0) {
    document.getElementById('question').textContent = 'この項目に問題がありません。';
    document.getElementById('choices').innerHTML = '';
    document.getElementById('next-button').disabled = true;
    document.getElementById('prev-button').disabled = true;
    document.getElementById('progress').textContent = '0/0';
    return;
  }

  document.getElementById('progress').textContent = `${state.currentIndex + 1}/${total}`;

  const q = state.questions[state.currentIndex];
  document.getElementById('question').textContent = q.question;

  const choicesEl = document.getElementById('choices');
  choicesEl.innerHTML = '';
  q.choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'choice-button';
    btn.textContent = `${index + 1}. ${choice}`;
    btn.type = 'button';

    if (state.userAnswers[state.currentIndex] === index) {
      btn.classList.add('selected');
    }
    if (state.showExplanation) {
      btn.disabled = true;
      if (index === q.answer) {
        btn.classList.add('correct');
      } else if (state.userAnswers[state.currentIndex] === index) {
        btn.classList.add('incorrect');
      }
    }

    btn.addEventListener('click', () => {
      if (state.showExplanation) return;
      state.userAnswers[state.currentIndex] = index;
      saveState();
      renderQuestion();
    });

    choicesEl.appendChild(btn);
  });

  const explanationEl = document.getElementById('explanation');
  if (state.showExplanation) {
    const isCorrect = state.userAnswers[state.currentIndex] === q.answer;
    const resultLabelEl = document.getElementById('result-label');
    resultLabelEl.textContent = isCorrect ? '正解' : '不正解';
    resultLabelEl.className = 'result-label ' + (isCorrect ? 'correct' : 'incorrect');
    document.getElementById('correct-answer').textContent = `正解：${q.answer + 1}. ${q.choices[q.answer]}`;
    document.getElementById('explanation-text').textContent = q.explanation;
    explanationEl.hidden = false;
  } else {
    explanationEl.hidden = true;
  }

  updateButtons();
}

function updateButtons() {
  const prevBtn = document.getElementById('prev-button');
  const nextBtn = document.getElementById('next-button');

  prevBtn.disabled = state.currentIndex === 0 || state.showExplanation;

  if (state.showExplanation) {
    nextBtn.textContent = state.currentIndex === state.questions.length - 1 ? '結果へ' : '次へ';
    nextBtn.disabled = false;
  } else {
    nextBtn.textContent = '決定';
    nextBtn.disabled = state.userAnswers[state.currentIndex] === null;
  }
}

document.getElementById('prev-button').addEventListener('click', () => {
  if (state.currentIndex > 0 && !state.showExplanation) {
    state.currentIndex--;
    state.showExplanation = false;
    saveState();
    renderQuestion();
  }
});

document.getElementById('next-button').addEventListener('click', () => {
  if (!state.showExplanation) {
    if (state.userAnswers[state.currentIndex] === null) return;
    state.showExplanation = true;
    saveState();
    renderQuestion();
  } else {
    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex++;
      state.showExplanation = false;
      saveState();
      renderQuestion();
    } else {
      window.location.href = 'result.html';
    }
  }
});

(async function init() {
  if (!state || state.subject !== subject) {
    await initState();
  }
  renderQuestion();
})();
