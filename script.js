// Фиксируем высоту блока под вкладками по высоте текста "Обо мне",
// чтобы при переключении вкладок подложка не меняла размер
function lockTabContentHeight() {
  var tabContent = document.querySelector('.tab-content');
  var aboutPane = document.getElementById('about');
  if (!tabContent || !aboutPane) return;
  tabContent.style.height = 'auto';
  var h = aboutPane.offsetHeight;
  tabContent.style.height = h + 'px';
}
window.addEventListener('load', lockTabContentHeight);
window.addEventListener('resize', lockTabContentHeight);

document.querySelectorAll('.tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    var cardsBlock = document.querySelector('.cards-block');
    var tabContent = document.querySelector('.tab-content');
    if (tab.dataset.tab === 'process') {
      // на вкладке "Процесс работы" карточки скрыты, высота текста свободная
      if (cardsBlock) cardsBlock.style.display = 'none';
      if (tabContent) tabContent.style.height = 'auto';
    } else {
      if (cardsBlock) cardsBlock.style.display = '';
      lockTabContentHeight();
    }
  });
});

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
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
