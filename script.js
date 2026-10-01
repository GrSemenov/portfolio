document.querySelectorAll('.case-card').forEach(function (card) {
  card.addEventListener('click', function () {
    var id = card.getAttribute('data-popup');
    var overlay = document.getElementById('popup-' + id);
    if (overlay) overlay.classList.add('open');
  });
});

document.querySelectorAll('.overlay').forEach(function (overlay) {
  var closeBtn = overlay.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      overlay.classList.remove('open');
    });
  }
  // закрытие по клику на затемнённый фон
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
