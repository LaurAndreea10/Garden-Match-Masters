(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const stateKey = 'gmmModePatch';
  const state = JSON.parse(localStorage.getItem(stateKey) || '{}');
  const savePatchState = () => localStorage.setItem(stateKey, JSON.stringify(state));

  const pieces = ['🌸', '🍋', '🍫', '🌙', '🍓', '🌿'];
  const duelSkills = [
    { icon: '🌸', name: 'Bloom Strike', bonus: 32, reward: 'coins' },
    { icon: '🌙', name: 'Moon Shield', bonus: 24, reward: 'gems' },
    { icon: '🐝', name: 'Bee Rush', bonus: 28, reward: 'seeds' }
  ];

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

  function ensureDuelPanel() {
    const duel = $('#duel');
    const log = $('#duelLog');
    if (!duel || !log || $('#duelPowerPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'duelPowerPanel';
    panel.style.marginTop = '16px';
    panel.innerHTML = `
      <div class="card" style="padding:14px;margin-top:14px">
        <h3 style="margin-bottom:8px">⚡ Duel Powers</h3>
        <p style="margin-bottom:10px">Alege o abilitate înainte de Battle. Fiecare schimbă șansele și recompensa.</p>
        <div class="row" id="duelSkills"></div>
        <div class="progress" style="margin-top:12px"><i id="duelEnergy" style="width:100%"></i></div>
        <p id="duelRoundInfo" style="margin-top:8px">Energy: 100 · Win streak: 0</p>
      </div>
    `;
    log.insertAdjacentElement('afterend', panel);

    const skillWrap = $('#duelSkills');
    duelSkills.forEach((skill, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn' + (index === 0 ? ' primary' : '');
      button.textContent = `${skill.icon} ${skill.name}`;
      button.dataset.skill = String(index);
      button.addEventListener('click', () => {
        state.selectedDuelSkill = index;
        savePatchState();
        $$('#duelSkills .btn').forEach(btn => btn.classList.remove('primary'));
        button.classList.add('primary');
        notify(`${skill.name} pregătit ${skill.icon}`);
      });
      skillWrap.append(button);
    });
  }

  function updateDuelHud() {
    const energy = state.duelEnergy ?? 100;
    const streak = state.duelStreak ?? 0;
    const energyBar = $('#duelEnergy');
    const info = $('#duelRoundInfo');
    if (energyBar) energyBar.style.width = `${Math.max(0, Math.min(100, energy))}%`;
    if (info) info.textContent = `Energy: ${energy} · Win streak: ${streak}`;
  }

  function fixDuel() {
    ensureDuelPanel();
    updateDuelHud();
    const button = $('#duelBtn');
    if (!button || button.dataset.modeFixBound) return;
    button.dataset.modeFixBound = 'true';
    button.textContent = 'Battle ⚔️';

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      state.duelEnergy = state.duelEnergy ?? 100;
      if (state.duelEnergy < 15) {
        notify('Energy prea mică. Primești +35 energy pentru restart.');
        state.duelEnergy += 35;
      }

      const playerBoard = $('#pMini');
      const aiBoard = $('#aMini');
      miniBoard(playerBoard);
      miniBoard(aiBoard);

      const selected = duelSkills[state.selectedDuelSkill ?? 0] || duelSkills[0];
      const currentScore = readNumber('score');
      const streak = state.duelStreak ?? 0;
      const energyBonus = Math.round((state.duelEnergy || 0) / 5);
      const playerScore = Math.round(90 + Math.random() * 150 + currentScore / 6 + selected.bonus + streak * 8 + energyBonus);
      const aiScore = Math.round(95 + Math.random() * 190 + Math.max(0, streak - 1) * 10);
      const won = playerScore >= aiScore;

      state.duelEnergy = Math.max(0, (state.duelEnergy || 100) - 15 + (won ? 8 : 3));
      state.duelStreak = won ? streak + 1 : 0;
      savePatchState();

      if ($('#pDuel')) $('#pDuel').textContent = playerScore;
      if ($('#aDuel')) $('#aDuel').textContent = aiScore;

      const reward = won
        ? selected.reward === 'gems'
          ? { coins: 40, gems: 1, xp: 28 }
          : selected.reward === 'seeds'
            ? { coins: 45, seeds: 30, xp: 26 }
            : { coins: 75, xp: 24 }
        : { xp: 10, seeds: 5 };

      addResources(reward);
      updateDuelHud();

      if ($('#duelLog')) {
        const rewardText = Object.entries(reward).filter(([, v]) => v).map(([k, v]) => `+${v} ${k}`).join(', ');
        $('#duelLog').innerHTML = `
          <b>${won ? '✅ Victory!' : '🤖 Garden AI countered!'}</b><br>
          Skill: ${selected.icon} ${selected.name}<br>
          ${won ? 'Combo-ul tău a spart apărarea AI.' : 'AI a blocat ultima mutare, dar ai câștigat experiență.'}<br>
          Reward: ${rewardText}<br>
          ${state.duelStreak ? `🔥 Win streak: ${state.duelStreak}` : 'Streak reset.'}
        `;
      }
      notify(won ? `${selected.name}: victorie ⚔️` : 'Duel pierdut, dar ai progres');
    }, true);
  }

  function fixStory() {
    const story = $('#story');
    const speaker = $('#speaker');
    const text = $('#dialogText');
    const next = $('#nextStory');
    if (!story || !speaker || !text || !next) return;

    if (!$('#storyQuestPanel')) {
      const panel = document.createElement('div');
      panel.id = 'storyQuestPanel';
      panel.className = 'card';
      panel.style.marginTop = '14px';
      panel.innerHTML = `
        <h3>🌿 Story Quest</h3>
        <p id="storyQuestText">Capitolul curent deblochează mici recompense și direcții pentru modurile de joc.</p>
        <div class="progress"><i id="storyProgress"></i></div>
        <div class="row" style="margin-top:12px">
          <button type="button" class="btn primary" id="storyChoiceA">Ajută grădina 🌸</button>
          <button type="button" class="btn" id="storyChoiceB">Urmărește indiciul 🔎</button>
          <button type="button" class="btn warn" id="storyRewardBtn">Claim chapter reward</button>
        </div>
      `;
      story.append(panel);
    }

    const chapters = [
      { speaker: 'Flora', icon: '👩‍🌾', text: 'Greenhouse-ul pierde lumină. Fă match-uri de flori pentru a reaprinde rădăcinile magice.', reward: { seeds: 18, xp: 8 }, quest: 'Quest: câștigă un nivel Match sau folosește Hint o dată.' },
      { speaker: 'Luna', icon: '🧚‍♀️', text: 'În Moon Garden, fiecare combo deschide o poartă invizibilă. Ai nevoie de curaj și energie.', reward: { gems: 1, xp: 12 }, quest: 'Quest: intră în Duel și folosește o abilitate.' },
      { speaker: 'Bee', icon: '🐝', text: 'Bzz! Indiciile din Escape formează un cod. Nu toate obiectele sunt doar decor.', reward: { coins: 45, xp: 10 }, quest: 'Quest: găsește cel puțin un indiciu în Escape.' },
      { speaker: 'Kiko', icon: '🐶', text: 'Companionii nu sunt doar colecții. Selectează un pet activ pentru bonus de aventură.', reward: { coins: 25, seeds: 15 }, quest: 'Quest: intră în Pets și selectează un companion.' },
      { speaker: 'Mira', icon: '🐱', text: 'Grădina devine mai puternică atunci când o decorezi. Fiecare obiect spune o poveste.', reward: { seeds: 35, xp: 10 }, quest: 'Quest: intră în Decor și plantează ceva.' }
    ];

    function renderChapter() {
      const index = state.storyChapter ?? 0;
      const chapter = chapters[index % chapters.length];
      speaker.textContent = `${chapter.icon} ${chapter.speaker}`;
      text.textContent = chapter.text;
      const progress = $('#storyProgress');
      const questText = $('#storyQuestText');
      if (progress) progress.style.width = `${((index % chapters.length) + 1) / chapters.length * 100}%`;
      if (questText) questText.textContent = chapter.quest;
      next.textContent = index >= chapters.length - 1 ? 'Replay story' : 'Next chapter';
    }

    if (!story.dataset.modeFixStoryBound) {
      story.dataset.modeFixStoryBound = 'true';
      next.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        state.storyChapter = ((state.storyChapter ?? 0) + 1) % chapters.length;
        savePatchState();
        renderChapter();
        notify('Capitol nou deblocat 📖');
      }, true);

      $('#storyChoiceA')?.addEventListener('click', () => {
        addResources({ seeds: 8, xp: 4 });
        notify('Ai ales să ajuți grădina: +8 seeds, +4 XP 🌸');
      });

      $('#storyChoiceB')?.addEventListener('click', () => {
        addResources({ coins: 12, xp: 4 });
        notify('Ai urmărit indiciul: +12 coins, +4 XP 🔎');
      });

      $('#storyRewardBtn')?.addEventListener('click', () => {
        const index = state.storyChapter ?? 0;
        const key = `storyReward_${index}`;
        if (state[key]) {
          notify('Recompensa capitolului a fost deja luată.');
          return;
        }
        const reward = chapters[index % chapters.length].reward;
        addResources(reward);
        state[key] = true;
        savePatchState();
        const label = Object.entries(reward).map(([k, v]) => `+${v} ${k}`).join(', ');
        notify(`Story reward: ${label} 📖`);
      });
    }

    renderChapter();
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
    if (mode === 'story') fixStory();
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
    fixStory();
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
