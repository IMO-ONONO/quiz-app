const unresolved = JSON.parse(localStorage.getItem('unresolved') || '{}');
const totalUnresolved = Object.keys(unresolved).length;
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

document.getElementById('test-image-button').addEventListener('click', () => {
  sessionStorage.setItem('selectedSubject', 'reasoning');
  sessionStorage.setItem('testMode', 'image');
  sessionStorage.removeItem('quizState');
  window.location.href = 'quiz.html';
});
