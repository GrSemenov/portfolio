var tabContent = document.querySelector('.tab-content');

// Вкладки, на которых карточки проектов скрыты, а высота текста свободная
var TABS_WITHOUT_CARDS = ['process', 'stack'];

// Выполняет fn, пока панель отрисована (даже если сейчас она скрыта через display:none)
function measureInPane(pane, fn) {
  var wasActive = pane.classList.contains('active');
  var prevStyle = pane.getAttribute('style');
  if (!wasActive) {
    pane.style.display = 'block';
    pane.style.visibility = 'hidden';
    pane.style.position = 'absolute';
    pane.style.left = '0';
    pane.style.right = '0';
  }
  var result = fn(pane);
  if (!wasActive) {
    if (prevStyle === null) pane.removeAttribute('style');
    else pane.setAttribute('style', prevStyle);
  }
  return result;
}

// Высота "Обо мне" в свёрнутом виде: первый абзац + кнопка "Подробнее"
function aboutCollapsedHeight() {
  var pane = document.getElementById('about');
  var btn = pane.querySelector('.more-btn');
  return measureInPane(pane, function () {
    return btn.offsetTop + btn.offsetHeight;
  });
}

// Фиксированная высота блока под вкладками: самая высокая из вкладок с карточками
// (Обо мне в свёрнутом виде, Контакты), чтобы при переключении подложка не прыгала
function computeLockedHeight() {
  tabContent.style.position = 'relative';
  var contacts = document.getElementById('contacts');
  return Math.max(
    aboutCollapsedHeight(),
    measureInPane(contacts, function (p) { return p.offsetHeight; })
  );
}

function lockTabContentHeight() {
  if (!tabContent) return;
  var activeTab = document.querySelector('.tab.active');
  var key = activeTab ? activeTab.dataset.tab : 'about';
  tabContent.style.position = 'relative';
  if (TABS_WITHOUT_CARDS.indexOf(key) !== -1) return;
  if (key === 'about' && aboutExpanded) {
    tabContent.style.height = 'auto';
    return;
  }
  tabContent.style.height = computeLockedHeight() + 'px';
}
window.addEventListener('load', lockTabContentHeight);
window.addEventListener('resize', lockTabContentHeight);
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(lockTabContentHeight);
}

// ---------- "Обо мне": Подробнее / Свернуть ----------
var aboutExpanded = false;
var animTimer = null;
var animOnEnd = null;
var ANIM_MS = 450;
var aboutPane = document.getElementById('about');
var aboutMore = document.getElementById('about-more');
var moreBtn = aboutPane ? aboutPane.querySelector('.more-btn') : null;
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function stopHeightAnimation() {
  clearTimeout(animTimer);
  if (animOnEnd) {
    tabContent.removeEventListener('transitionend', animOnEnd);
    animOnEnd = null;
  }
  tabContent.classList.remove('animating');
}

// Плавно меняем высоту блока от from к to (в пикселях)
function animateTabContentHeight(from, to, done) {
  stopHeightAnimation();
  if (reduceMotion.matches || Math.abs(from - to) < 1) {
    tabContent.style.height = to + 'px';
    if (done) done();
    return;
  }
  tabContent.style.height = from + 'px';
  void tabContent.offsetHeight; // фиксируем стартовое значение
  tabContent.classList.add('animating');
  tabContent.style.height = to + 'px';

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    stopHeightAnimation();
    if (done) done();
  }
  animOnEnd = function (e) {
    if (e.target === tabContent && e.propertyName === 'height') finish();
  };
  tabContent.addEventListener('transitionend', animOnEnd);
  animTimer = setTimeout(finish, ANIM_MS + 150);
}

function applyAboutState(on) {
  aboutExpanded = on;
  aboutMore.classList.toggle('open', on);
  aboutMore.inert = !on;
  aboutMore.setAttribute('aria-hidden', on ? 'false' : 'true');
  moreBtn.textContent = on ? 'Свернуть' : 'Подробнее';
  moreBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
}

function toggleAbout() {
  var on = !aboutExpanded;
  var from = tabContent.getBoundingClientRect().height;
  var to = on
    ? Math.ceil(aboutPane.getBoundingClientRect().height)
    : computeLockedHeight();
  applyAboutState(on);
  animateTabContentHeight(from, to, function () {
    // после раскрытия отдаём высоту контенту, чтобы текст не обрезался при ресайзе
    if (on) tabContent.style.height = 'auto';
  });
}

// Мгновенный возврат в свёрнутое состояние (при смене вкладки)
function resetAbout() {
  if (!aboutPane) return;
  stopHeightAnimation();
  applyAboutState(false);
}

if (moreBtn) {
  moreBtn.addEventListener('click', toggleAbout);
}

document.querySelectorAll('.tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    if (tab.classList.contains('active')) return;
    resetAbout();

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    var cardsBlock = document.querySelector('.cards-block');
    if (TABS_WITHOUT_CARDS.indexOf(tab.dataset.tab) !== -1) {
      // на вкладках "Процесс работы" и "Стэк" карточки скрыты, высота свободная
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

// Мобильная версия: переворот карточки (фото находится на обороте)
(function () {
  var container = document.querySelector('.container');
  var content = document.querySelector('.content');
  var photo = document.querySelector('.photo');
  var flipBtn = document.querySelector('.flip-btn');
  if (!container || !content || !photo || !flipBtn) return;

  var mq = window.matchMedia('(max-width: 767px)');

  function setFlipped(on) {
    var flipped = on && mq.matches;
    container.classList.toggle('flipped', flipped);
    // скрытая сторона недоступна для фокуса и скринридеров
    content.inert = mq.matches && flipped;
    photo.inert = mq.matches && !flipped;
  }

  function syncPhotoRole() {
    if (mq.matches) {
      photo.setAttribute('role', 'button');
      photo.setAttribute('tabindex', '0');
      photo.setAttribute('aria-label', 'Вернуть карточку');
    } else {
      photo.removeAttribute('role');
      photo.removeAttribute('tabindex');
      photo.removeAttribute('aria-label');
    }
    setFlipped(false);
  }

  flipBtn.addEventListener('click', function () { setFlipped(true); });
  photo.addEventListener('click', function () { if (mq.matches) setFlipped(false); });
  photo.addEventListener('keydown', function (e) {
    if (mq.matches && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setFlipped(false);
    }
  });

  if (mq.addEventListener) mq.addEventListener('change', syncPhotoRole);
  else if (mq.addListener) mq.addListener(syncPhotoRole);
  syncPhotoRole();
})();
