const unresolved = JSON.parse(localStorage.getItem('unresolved') || '{}');
const totalUnresolved = Object.keys(unresolved).length;

const statsTotal = parseInt(localStorage.getItem('statsTotal') || '0', 10);
const statsCorrect = parseInt(localStorage.getItem('statsCorrect') || '0', 10);
if (statsTotal > 0) {
  const rate = ((statsCorrect / statsTotal) * 100).toFixed(1);
  const statsEl = document.getElementById('stats');
  statsEl.textContent = `累計 ${statsTotal} 問　正答率 ${rate}%（${statsCorrect} 問正解）`;
  statsEl.hidden = false;
}
const reviewCountEl = document.getElementById('count-review');
if (totalUnresolved > 0) {
  reviewCountEl.textContent = `${totalUnresolved}問`;
}

document.querySelectorAll('.menu-button[data-subject]').forEach((button) => {
  button.addEventListener('click', () => {
    const subject = button.dataset.subject;
    sessionStorage.setItem('selectedSubject', subject);
    sessionStorage.removeItem('quizState');
    window.location.href = 'quiz.html';
  });
});

document.getElementById('review-button').addEventListener('click', () => {
  if (totalUnresolved === 0) {
    alert('間違えた問題はまだありません');
    return;
  }
  window.location.href = 'review.html';
});
