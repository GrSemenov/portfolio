// Измеряем высоту панели, даже если она сейчас скрыта (display:none)
function measurePane(pane) {
  var wasActive = pane.classList.contains('active');
  var prevStyle = pane.getAttribute('style');
  if (!wasActive) {
    pane.style.display = 'block';
    pane.style.visibility = 'hidden';
    pane.style.position = 'absolute';
    pane.style.left = '0';
    pane.style.right = '0';
  }
  var h = pane.offsetHeight;
  if (!wasActive) {
    if (prevStyle === null) pane.removeAttribute('style');
    else pane.setAttribute('style', prevStyle);
  }
  return h;
}

// Фиксируем высоту блока под вкладками по самой высокой из вкладок
// (Обо мне, Стэк, Контакты), чтобы при переключении подложка не прыгала
function lockTabContentHeight() {
  var tabContent = document.querySelector('.tab-content');
  if (!tabContent) return;
  var activeTab = document.querySelector('.tab.active');
  if (activeTab && activeTab.dataset.tab === 'process') return;

  tabContent.style.position = 'relative';
  var max = 0;
  ['about', 'stack', 'contacts'].forEach(function (id) {
    var pane = document.getElementById(id);
    if (pane) max = Math.max(max, measurePane(pane));
  });
  tabContent.style.height = max + 'px';
}
window.addEventListener('load', lockTabContentHeight);
window.addEventListener('resize', lockTabContentHeight);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(lockTabContentHeight);
}

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
