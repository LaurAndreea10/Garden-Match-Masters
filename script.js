(() => {
  'use strict';

  const id = (name) => document.getElementById(name);
  window.$ = id;

  const state = JSON.parse(localStorage.getItem('gmm-live-state') || '{}');
  const game = Object.assign({
    name: 'Grădinarul',
    gender: 'n',
    avatar: '🌸',
    lang: 'ro',
    theme: 'dark',
    tutorialDone: false,
    tutorialStep: 0,
    coins: 340,
    seeds: 7,
    gems: 12,
    xp: 1240,
    level: 3,
    currentZone: 'gh',
    dailyClaimed: '',
    ownedPets: ['Kiko', 'Mira'],
    activePet: 'Kiko'
  }, state);

  const avatars = ['🌸', '👩‍🌾', '👨‍🌾', '🧑‍🌾', '🧚‍♀️', '🐝', '🐶', '🐱', '🦋', '🌙', '🍋', '🍓'];
  const tutorialSteps = [
    { title: 'Bun venit! 🌸', desc: 'Acesta este Garden Match Masters. Reconstruiești o grădină magică prin match-3, story, duel și mini-jocuri.', target: '#sh' },
    { title: 'Profilul tău 👤', desc: 'Apasă pe avatar ca să alegi numele, genul și avatarul grădinarului.', target: '#hub-av' },
    { title: 'Harta grădinii 🗺️', desc: 'Alege zonele de pe hartă pentru a schimba atmosfera și provocările.', target: '#gmap' },
    { title: 'Daily rewards 🎁', desc: 'Recompensa zilnică îți oferă monede, stele și semințe.', target: '#daily-btn' },
    { title: 'Match-3 🌼', desc: 'În Story faci potriviri de 3+ piese, aduni puncte și completezi obiective.', target: '#mb' },
    { title: 'Duel Masters ⚔️', desc: 'În Duel alegi personajul, pornești lupta și concurezi cu Garden AI.', target: '#sd' },
    { title: 'Decor & Pets 🐾', desc: 'Personalizează grădina, cumpără obiecte și deblochează animăluțe companion.', target: '#sdec' },
    { title: 'Gata de joc! 🌺', desc: 'Acum știi tot ce ai nevoie. Mult succes în reconstruirea grădinii tale magice! Joacă primul nivel pentru a câștiga animăluțul Kiko!', target: '#nav' }
  ];

  function save() {
    localStorage.setItem('gmm-live-state', JSON.stringify(game));
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function hardHide(el) {
    if (!el) return;
    el.classList.add('hidden', 'h');
    el.classList.remove('on', 'show');
    el.setAttribute('aria-hidden', 'true');
    el.style.pointerEvents = 'none';
    el.style.display = 'none';
  }

  function hardShow(el) {
    if (!el) return;
    el.classList.remove('hidden', 'h');
    el.removeAttribute('aria-hidden');
    el.style.pointerEvents = '';
    el.style.display = '';
  }

  function toast(message) {
    const el = id('tst') || id('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('on', 'show');
    el.style.display = '';
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('on', 'show'), 2200);
  }

  function syncResources() {
    const pairs = {
      hcoin: game.coins,
      hseed: game.seeds,
      hgem: game.gems,
      dcoin: game.coins,
      dseed: game.seeds,
      dgem: game.gems
    };
    Object.entries(pairs).forEach(([key, value]) => {
      const el = id(key);
      if (el) el.textContent = value;
    });
    const level = id('hub-plevel');
    if (level) level.textContent = `Nivel ${game.level} · ${game.xp} XP`;
    save();
  }

  function syncProfile() {
    const name = game.name || 'Grădinarul';
    const avatar = game.avatar || '🌸';
    const hubName = id('hub-pname');
    const hubAvatar = id('hub-av');
    const prevAv = id('prev-av');
    const prevName = id('prev-name');
    const prevGender = id('prev-gender');

    if (hubName) hubName.textContent = name;
    if (hubAvatar && hubAvatar.childNodes[0]) hubAvatar.childNodes[0].nodeValue = avatar;
    if (prevAv) prevAv.textContent = avatar;
    if (prevName) prevName.textContent = name;
    if (prevGender) prevGender.textContent = game.gender === 'f' ? 'Grădinăriță' : game.gender === 'm' ? 'Grădinar' : 'Neutru';
    const input = id('profile-name');
    if (input && !input.value) input.value = name;
  }

  function sw(screen) {
    const map = { hub: 'sh', story: 'ss', duel: 'sd', escape: 'se', decor: 'sdec', ach: 'sach', pets: 'spets', shop: 'sshop', stats: 'sstats', mini: 'smini', events: 'sevents', settings: 'ssettings', wall: 'swall', roadmap: 'sroadmap' };
    const targetId = map[screen] || screen;
    const target = id(targetId);
    if (!target) {
      toast('Modul nu este disponibil încă.');
      return;
    }
    qsa('.sc').forEach((screenEl) => screenEl.classList.remove('on'));
    target.classList.add('on');
    qsa('#nav .nb, #nav [data-screen]').forEach((btn) => {
      const bTarget = btn.dataset.screen || btn.getAttribute('onclick') || '';
      btn.classList.toggle('on', bTarget.includes(screen) || bTarget === targetId);
    });
    if (screen === 'duel') initDuelBoards();
    if (screen === 'pets') renderPets();
    if (screen === 'shop') renderShop();
    if (screen === 'stats') renderStats();
    if (screen === 'ach') renderAchievements();
  }

  function toggleLang() {
    game.lang = game.lang === 'ro' ? 'en' : 'ro';
    document.documentElement.dataset.lang = game.lang;
    const btn = id('lang-btn');
    if (btn) btn.textContent = `🌐 ${game.lang.toUpperCase()}`;
    save();
  }

  function toggleTheme() {
    game.theme = game.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = game.theme;
    const btn = id('theme-btn');
    if (btn) btn.textContent = game.theme === 'dark' ? '🌙' : '☀️';
    save();
  }

  function openProfile() {
    const modal = id('profile-modal');
    if (!modal) return;
    modal.classList.remove('h');
    modal.style.display = 'flex';
    modal.style.pointerEvents = '';
    renderAvatarGrid();
    syncProfile();
  }

  function closeProfile() {
    hardHide(id('profile-modal'));
  }

  function updateProfilePreview() {
    const input = id('profile-name');
    if (input) game.name = input.value.trim() || 'Grădinarul';
    syncProfile();
  }

  function selectGender(gender) {
    game.gender = gender;
    qsa('.gender-opt').forEach((el) => el.classList.toggle('on', el.dataset.g === gender));
    syncProfile();
  }

  function renderAvatarGrid() {
    const grid = id('avatar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    avatars.forEach((avatar) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'av-opt' + (avatar === game.avatar ? ' on' : '');
      button.textContent = avatar;
      button.addEventListener('click', () => {
        game.avatar = avatar;
        renderAvatarGrid();
        syncProfile();
      });
      grid.append(button);
    });
  }

  function saveProfile() {
    updateProfilePreview();
    game.profileDone = true;
    closeProfile();
    syncProfile();
    save();
    toast('Profil salvat 🌸');
  }

  function showTutorialStep() {
    const overlay = id('tut-overlay');
    const tooltip = id('tut-tooltip');
    const highlight = id('tut-highlight');
    const step = tutorialSteps[game.tutorialStep] || tutorialSteps[0];

    if (!overlay || !tooltip) return;
    hardShow(overlay);
    hardShow(tooltip);
    if (highlight) hardHide(highlight);

    const stepEl = id('tut-step');
    const titleEl = id('tut-title');
    const descEl = id('tut-desc');
    const nextBtn = id('tut-next-btn');
    const dots = id('tut-dots');

    if (stepEl) stepEl.textContent = `Pas ${game.tutorialStep + 1}/${tutorialSteps.length}`;
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.desc;
    if (nextBtn) nextBtn.textContent = game.tutorialStep === tutorialSteps.length - 1 ? 'Să jucăm! 🌺' : 'Înainte →';
    if (dots) {
      dots.innerHTML = tutorialSteps.map((_, i) => `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;margin:0 2px;background:${i === game.tutorialStep ? 'var(--accent2)' : 'rgba(255,255,255,.18)'}"></span>`).join('');
    }
  }

  function startTutorial() {
    game.tutorialStep = 0;
    showTutorialStep();
  }

  function closeTutorial() {
    hardHide(id('tut-overlay'));
    hardHide(id('tut-tooltip'));
    hardHide(id('tut-highlight'));
  }

  function closeAllIntroOverlays() {
    closeTutorial();
    closeProfile();
    const modal = id('modal');
    if (modal) hardHide(modal);
  }

  function skipTutorial() {
    game.tutorialDone = true;
    game.profileDone = true;
    game.tutorialStep = 0;
    closeAllIntroOverlays();
    save();
    toast('Tutorial închis. Hai la joc! 🌸');
    sw('story');
  }

  function nextTutStep() {
    if (game.tutorialStep >= tutorialSteps.length - 1) {
      skipTutorial();
      return;
    }
    game.tutorialStep += 1;
    showTutorialStep();
    save();
  }

  function startDaily() {
    const today = new Date().toISOString().slice(0, 10);
    if (game.dailyClaimed === today) {
      toast('Ai luat deja recompensa zilnică azi 🎁');
      return;
    }
    game.dailyClaimed = today;
    game.coins += 500;
    game.seeds += 2;
    game.gems += 1;
    syncResources();
    const btn = id('daily-btn');
    if (btn) btn.textContent = '✅ Revendicat';
    toast('+500 monede, +2 semințe, +1 gem 🎁');
  }

  function initDuelBoards() {
    ['dbp1', 'dbp2'].forEach((boardId) => {
      const board = id(boardId);
      if (!board) return;
      board.innerHTML = '';
      for (let i = 0; i < 36; i += 1) {
        const cell = document.createElement('span');
        cell.className = 'dt';
        cell.textContent = ['🌸', '🍋', '🍓', '🌿', '🍫', '🌙'][Math.floor(Math.random() * 6)];
        board.append(cell);
      }
    });
  }

  function startDuel() {
    initDuelBoards();
    const p = Math.round(90 + Math.random() * 180);
    const ai = Math.round(80 + Math.random() * 190);
    const pScore = id('dps1');
    const aiScore = id('dps2');
    const log = id('dlog');
    if (pScore) pScore.textContent = p;
    if (aiScore) aiScore.textContent = ai;
    if (log) log.textContent = p >= ai ? 'Ai câștigat duelul! +60 monede.' : 'AI a câștigat runda, dar ai primit XP.';
    if (p >= ai) game.coins += 60;
    else game.xp += 10;
    syncResources();
  }

  function renderPets() {
    const wrap = id('pets-body') || qs('.pets-body');
    if (!wrap) return;
    const pets = [
      ['Kiko', '🐶', 'Greenhouse', 0],
      ['Mira', '🐱', 'Lemon Meadow', 0],
      ['Bunny', '🐰', 'Choco Forest', 80],
      ['Kygo', '🦊', 'Moon Garden', 120],
      ['Bee', '🐝', 'Daily Quest', 60],
      ['Luma', '🦋', 'Event', 150]
    ];
    wrap.innerHTML = '';
    pets.forEach(([name, icon, zone, price]) => {
      const owned = game.ownedPets.includes(name);
      const card = document.createElement('article');
      card.className = `pet-card ${owned ? 'owned' : 'locked'}`;
      card.innerHTML = `<span class="pet-av">${icon}</span><div class="pet-name">${name}</div><div class="pet-zone">${zone}</div><button class="btn-daily" type="button">${owned ? (game.activePet === name ? 'Active ✓' : 'Select') : `Unlock ${price} 🪙`}</button>`;
      card.querySelector('button').addEventListener('click', () => {
        if (owned) {
          game.activePet = name;
          toast(`${name} este companionul activ 🐾`);
        } else if (game.coins >= price) {
          game.coins -= price;
          game.ownedPets.push(name);
          game.activePet = name;
          toast(`${name} deblocat 🐾`);
        } else {
          toast('Nu ai suficiente monede.');
        }
        syncResources();
        renderPets();
      });
      wrap.append(card);
    });
  }

  function renderShop() {
    const grid = id('shop-grid') || qs('.shop-grid');
    if (!grid) return;
    const items = [['🌷', 'Flower Pack', 40], ['🌳', 'Tree Pack', 80], ['⛲', 'Fountain', 120], ['🍄', 'Mushroom Set', 60]];
    grid.innerHTML = '';
    items.forEach(([icon, name, price]) => {
      const card = document.createElement('article');
      card.className = 'shop-item';
      card.innerHTML = `<span class="si-emoji">${icon}</span><div class="si-name">${name}</div><div class="si-price coins">${price} 🪙</div><button class="btn-buy coins" type="button">Buy</button>`;
      card.querySelector('button').addEventListener('click', () => {
        if (game.coins >= price) {
          game.coins -= price;
          game.seeds += 1;
          syncResources();
          toast(`${name} cumpărat!`);
        } else toast('Nu ai suficiente monede.');
      });
      grid.append(card);
    });
  }

  function renderStats() {
    const name = id('stats-name');
    if (name) name.textContent = game.name;
  }

  function renderAchievements() {
    const count = id('ach-count');
    if (count) count.textContent = `${game.tutorialDone ? 1 : 0}/24 deblocate`;
  }

  function safeStub(name, fn) {
    window[name] = fn || (() => toast('Funcție pregătită.'));
  }

  safeStub('sw', sw);
  safeStub('toggleLang', toggleLang);
  safeStub('toggleTheme', toggleTheme);
  safeStub('openProfile', openProfile);
  safeStub('updateProfilePreview', updateProfilePreview);
  safeStub('selectGender', selectGender);
  safeStub('saveProfile', saveProfile);
  safeStub('startTutorial', startTutorial);
  safeStub('nextTutStep', nextTutStep);
  safeStub('skipTutorial', skipTutorial);
  safeStub('closeTutorial', closeTutorial);
  safeStub('startDaily', startDaily);
  safeStub('startDuel', startDuel);
  safeStub('renderPets', renderPets);
  safeStub('renderShop', renderShop);
  safeStub('renderAchievements', renderAchievements);
  safeStub('renderStats', renderStats);
  ['nextRoom', 'submitCode', 'downloadGardenScreenshot', 'showSettings', 'toggleSound', 'toggleMusic', 'toggleReducedMotion'].forEach((name) => safeStub(name));

  function bindTutorialButtons() {
    const next = id('tut-next-btn');
    const skip = qs('.tut-skip');
    if (next) {
      next.type = 'button';
      next.onclick = null;
      next.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        nextTutStep();
      }, true);
    }
    if (skip) {
      skip.onclick = null;
      skip.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        skipTutorial();
      }, true);
    }
  }

  function bindProfileCancel() {
    document.querySelectorAll('button').forEach((button) => {
      if ((button.textContent || '').trim().toLowerCase().includes('anulează')) {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeProfile();
        }, true);
      }
    });
  }

  function boot() {
    document.documentElement.dataset.theme = game.theme;
    document.documentElement.dataset.lang = game.lang;
    syncProfile();
    syncResources();
    renderAvatarGrid();
    initDuelBoards();
    bindTutorialButtons();
    bindProfileCancel();

    if (!game.profileDone) {
      setTimeout(openProfile, 200);
    }
    if (!game.tutorialDone) {
      setTimeout(startTutorial, 350);
    } else {
      closeAllIntroOverlays();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
