const state = JSON.parse(sessionStorage.getItem('quizState') || 'null');
if (!state) {
  window.location.href = 'index.html';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

let correctCount = 0;
const wrongQuestions = [];

state.questions.forEach((q, index) => {
  const userAnswer = state.userAnswers[index];
  if (userAnswer === q.answer) {
    correctCount++;
  } else {
    wrongQuestions.push({ q, userAnswer });
  }
});

document.getElementById('score').textContent = `${correctCount} / ${state.questions.length} 問正解`;

const unresolved = JSON.parse(localStorage.getItem('unresolved') || '{}');
const now = new Date().toISOString();

state.questions.forEach((q, index) => {
  const userAnswer = state.userAnswers[index];
  if (userAnswer === q.answer) {
    if (unresolved[q.id]) {
      delete unresolved[q.id];
    }
  } else {
    if (unresolved[q.id]) {
      unresolved[q.id].wrongCount = (unresolved[q.id].wrongCount || 0) + 1;
      unresolved[q.id].lastShown = now;
    } else {
      unresolved[q.id] = { wrongCount: 1, lastShown: now };
    }
  }
});

localStorage.setItem('unresolved', JSON.stringify(unresolved));

const listEl = document.getElementById('wrong-list-items');

if (wrongQuestions.length === 0) {
  listEl.innerHTML = '<li class="all-correct">全問正解！</li>';
} else {
  wrongQuestions.forEach(({ q, userAnswer }) => {
    const li = document.createElement('li');

    const summary = document.createElement('button');
    summary.type = 'button';
    summary.className = 'wrong-item-summary';
    summary.textContent = q.question.length > 60 ? q.question.substring(0, 60) + '…' : q.question;

    const details = document.createElement('div');
    details.className = 'wrong-item-details';
    details.hidden = true;
    const userAnswerText = userAnswer === null
      ? '未回答'
      : `${userAnswer + 1}. ${escapeHtml(q.choices[userAnswer])}`;
    const questionImageHtml = q.questionImage
      ? `<img class="question-image" src="${escapeHtml(q.questionImage)}" alt="">`
      : '';
    details.innerHTML = `
      <p>${escapeHtml(q.question)}</p>
      ${questionImageHtml}
      <p>あなたの回答: ${userAnswerText}</p>
      <p class="correct-answer">正解: ${q.answer + 1}. ${escapeHtml(q.choices[q.answer])}</p>
      <p>${escapeHtml(q.explanation)}</p>
    `;

    summary.addEventListener('click', () => {
      details.hidden = !details.hidden;
    });

    li.appendChild(summary);
    li.appendChild(details);
    listEl.appendChild(li);
  });
}

document.getElementById('retry-button').addEventListener('click', () => {
  sessionStorage.removeItem('quizState');
  window.location.href = 'quiz.html';
});

document.getElementById('home-button').addEventListener('click', () => {
  sessionStorage.removeItem('quizState');
  window.location.href = 'index.html';
});
