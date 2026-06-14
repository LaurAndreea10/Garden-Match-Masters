(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const stateKey = 'gmmModePatch';
  const state = JSON.parse(localStorage.getItem(stateKey) || '{}');
  const savePatchState = () => localStorage.setItem(stateKey, JSON.stringify(state));

  const pieces = ['🌸', '🍋', '🍫', '🌙', '🍓', '🌿'];

  function notify(message) {
    const toast = $('#toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('on', 'show');
      clearTimeout(toast._modeFixTimer);
      toast._modeFixTimer = setTimeout(() => toast.classList.remove('on', 'show'), 2200);
    } else {
      console.log('[Garden Match Masters]', message);
    }
  }

  function readNumber(id, fallback = 0) {
    const el = document.getElementById(id);
    const value = Number((el?.textContent || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(value) ? value : fallback;
  }

  function writeNumber(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function addResources({ coins = 0, gems = 0, seeds = 0, xp = 0 } = {}) {
    writeNumber('coins', readNumber('coins') + coins);
    writeNumber('gems', readNumber('gems') + gems);
    writeNumber('seeds', readNumber('seeds') + seeds);
    writeNumber('xp', readNumber('xp') + xp);
  }

  function miniBoard(el) {
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 36; i += 1) {
      const cell = document.createElement('span');
      cell.textContent = pieces[Math.floor(Math.random() * pieces.length)];
      el.append(cell);
    }
  }

  function fixDuel() {
    const button = $('#duelBtn');
    if (!button || button.dataset.modeFixBound) return;
    button.dataset.modeFixBound = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const playerBoard = $('#pMini');
      const aiBoard = $('#aMini');
      miniBoard(playerBoard);
      miniBoard(aiBoard);

      const currentScore = readNumber('score');
      const playerScore = Math.round(80 + Math.random() * 180 + currentScore / 5);
      const aiScore = Math.round(75 + Math.random() * 190);
      const won = playerScore >= aiScore;

      if ($('#pDuel')) $('#pDuel').textContent = playerScore;
      if ($('#aDuel')) $('#aDuel').textContent = aiScore;
      if ($('#duelLog')) {
        $('#duelLog').innerHTML = won
          ? '✅ Ai câștigat duelul! +60 coins, +20 XP'
          : '🤖 Garden AI a câștigat. +8 XP pentru participare.';
      }
      addResources(won ? { coins: 60, xp: 20 } : { xp: 8 });
      notify(won ? 'Duel câștigat ⚔️' : 'Duel pierdut, dar ai primit XP');
    }, true);
  }

  function fixDaily() {
    const buttons = ['claimDaily', 'dailyBtn'].map(id => document.getElementById(id)).filter(Boolean);
    if (!buttons.length) return;

    const today = new Date().toISOString().slice(0, 10);
    const claimed = state.dailyDate === today;

    buttons.forEach((button) => {
      button.disabled = false;
      button.classList.toggle('done', claimed);
      button.textContent = claimed ? 'Claimed today ✓' : 'Claim reward';
      if (button.dataset.modeFixBound) return;
      button.dataset.modeFixBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const now = new Date().toISOString().slice(0, 10);
        if (state.dailyDate === now) {
          notify('Recompensa zilnică a fost deja luată azi 🎁');
          buttons.forEach(b => { b.textContent = 'Claimed today ✓'; b.classList.add('done'); });
          return;
        }
        state.dailyDate = now;
        savePatchState();
        addResources({ coins: 150, gems: 2, seeds: 25, xp: 15 });
        buttons.forEach(b => { b.textContent = 'Claimed today ✓'; b.classList.add('done'); });
        notify('+150 coins, +2 gems, +25 seeds 🎁');
      }, true);
    });
  }

  function fixEscape() {
    const room = $('#room');
    const solve = $('#solveBtn');
    const input = $('#codeInput');
    const clues = $('#clues');
    if (!room || !solve || !input || !clues) return;

    if (!room.dataset.modeFixReady) {
      room.dataset.modeFixReady = 'true';
      room.innerHTML = '';
      const clueData = [
        { icon: '🌸', digit: '2', x: 14, y: 18 },
        { icon: '🍋', digit: '4', x: 72, y: 25 },
        { icon: '🌙', digit: '1', x: 35, y: 62 },
        { icon: '🔑', digit: '3', x: 55, y: 70 }
      ];
      state.escapeFound = state.escapeFound || [];

      clueData.forEach((clue, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'robj obj';
        item.textContent = clue.icon;
        item.style.left = `${clue.x}%`;
        item.style.top = `${clue.y}%`;
        item.dataset.digit = clue.digit;
        item.dataset.index = String(index);
        if (state.escapeFound.includes(index)) item.classList.add('fd', 'found');
        item.addEventListener('click', () => {
          if (!state.escapeFound.includes(index)) {
            state.escapeFound.push(index);
            savePatchState();
            item.classList.add('fd', 'found');
            notify(`Indiciu găsit: ${clue.digit}`);
            updateEscapeText();
          }
        });
        room.append(item);
      });

      ['🌳', '🌻', '🍄', '🪨', '🦋'].forEach((icon, index) => {
        const deco = document.createElement('span');
        deco.className = 'robj obj';
        deco.textContent = icon;
        deco.style.left = `${8 + index * 18}%`;
        deco.style.top = `${42 + (index % 2) * 22}%`;
        deco.style.opacity = '0.45';
        room.append(deco);
      });
    }

    function updateEscapeText() {
      const found = state.escapeFound || [];
      const ordered = ['2', '4', '1', '3'];
      clues.innerHTML = `Clues: ${found.length}/4 · Codul final este <b>2413</b> după ce găsești indiciile.`;
      if (found.length >= 4 && !input.value) input.value = ordered.join('');
    }

    updateEscapeText();

    if (!solve.dataset.modeFixBound) {
      solve.dataset.modeFixBound = 'true';
      solve.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const code = input.value.trim();
        if (code === '2413' || (state.escapeFound || []).length >= 4) {
          addResources({ coins: 100, gems: 1, xp: 30 });
          notify('Escape complet! +100 coins, +1 gem 🔓');
          clues.innerHTML = '✅ Poarta grădinii este deblocată. Cod: <b>2413</b>';
        } else {
          notify('Codul corect este 2413. Găsește indiciile sau introdu codul.');
        }
      }, true);
    }
  }

  function fixPets() {
    const grid = $('#petGrid');
    if (!grid) return;

    const pets = [
      { icon: '🐶', name: 'Kiko', zone: 'Greenhouse', price: 0 },
      { icon: '🐱', name: 'Mira', zone: 'Lemon Meadow', price: 0 },
      { icon: '🐰', name: 'Bunny', zone: 'Choco Forest', price: 80 },
      { icon: '🦊', name: 'Kygo', zone: 'Moon Garden', price: 120 },
      { icon: '🐝', name: 'Bee', zone: 'Daily Quest', price: 60 },
      { icon: '🦋', name: 'Luma', zone: 'Event', price: 150 }
    ];

    state.ownedPets = state.ownedPets || ['Kiko', 'Mira'];
    state.activePet = state.activePet || state.ownedPets[0];
    savePatchState();

    grid.innerHTML = '';
    pets.forEach((pet) => {
      const owned = state.ownedPets.includes(pet.name);
      const card = document.createElement('article');
      card.className = `pet-card pet ${owned ? 'owned' : 'locked'}`;
      card.innerHTML = `
        <span class="pet-av big">${pet.icon}</span>
        <h3>${pet.name}</h3>
        <p>${pet.zone}</p>
        <button type="button" class="btn ${owned ? 'primary' : 'warn'}">
          ${owned ? (state.activePet === pet.name ? 'Active ✓' : 'Select') : `Unlock ${pet.price} 🪙`}
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (owned) {
          state.activePet = pet.name;
          savePatchState();
          notify(`${pet.name} este companionul activ 🐾`);
          fixPets();
          return;
        }
        const coins = readNumber('coins');
        if (coins >= pet.price) {
          writeNumber('coins', coins - pet.price);
          state.ownedPets.push(pet.name);
          state.activePet = pet.name;
          savePatchState();
          notify(`${pet.name} deblocat 🐾`);
          fixPets();
        } else {
          notify(`Ai nevoie de ${pet.price} coins pentru ${pet.name}.`);
        }
      });
      grid.append(card);
    });
  }

  function refreshMode(mode) {
    fixDaily();
    if (mode === 'duel') fixDuel();
    if (mode === 'escape') fixEscape();
    if (mode === 'pets') fixPets();
    if (mode === 'shop' && typeof window.renderShop === 'function') window.renderShop();
    if ((mode === 'ach' || mode === 'badges') && typeof window.renderAch === 'function') window.renderAch();
    if (mode === 'decor' && typeof window.renderDecor === 'function') window.renderDecor();
  }

  function showMode(mode) {
    const target = document.getElementById(mode);
    if (!target) {
      console.warn('[Garden Match Masters] Missing screen:', mode);
      return;
    }

    $$('[data-screen]').forEach((button) => {
      button.classList.toggle('on', button.dataset.screen === mode);
      button.classList.toggle('active', button.dataset.screen === mode);
      button.setAttribute('aria-current', button.dataset.screen === mode ? 'page' : 'false');
    });

    $$('.screen, .sc').forEach((screen) => {
      const isCurrent = screen.id === mode;
      screen.classList.toggle('on', isCurrent);
      screen.classList.toggle('active', isCurrent);
      screen.hidden = !isCurrent;
      screen.style.display = isCurrent ? '' : 'none';
    });

    target.hidden = false;
    target.style.display = '';
    refreshMode(mode);
  }

  function bindModeNavigation() {
    $$('[data-screen]').forEach((button) => {
      button.type = 'button';
      if (button.dataset.modeFixNavBound) return;
      button.dataset.modeFixNavBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showMode(button.dataset.screen);
      }, true);
    });

    $$('[data-go]').forEach((button) => {
      button.type = 'button';
      if (button.dataset.modeFixGoBound) return;
      button.dataset.modeFixGoBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showMode(button.dataset.go);
      }, true);
    });

    fixDaily();
    fixDuel();
    const current = document.querySelector('[data-screen].on, [data-screen].active')?.dataset.screen || 'hub';
    showMode(current);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindModeNavigation);
  } else {
    bindModeNavigation();
  }

  window.GMMShowMode = showMode;
})();
