(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

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

    try {
      if (mode === 'pets' && typeof window.renderPets === 'function') window.renderPets();
      if (mode === 'shop' && typeof window.renderShop === 'function') window.renderShop();
      if ((mode === 'ach' || mode === 'badges') && typeof window.renderAch === 'function') window.renderAch();
      if (mode === 'decor' && typeof window.renderDecor === 'function') window.renderDecor();
      if (mode === 'escape' && typeof window.room === 'function') window.room();
      if (mode === 'duel' && typeof window.mini === 'function') {
        const p = document.getElementById('pMini');
        const a = document.getElementById('aMini');
        if (p) window.mini(p);
        if (a) window.mini(a);
      }
      if (typeof window.sync === 'function') window.sync();
    } catch (error) {
      console.warn('[Garden Match Masters] Mode refresh failed:', mode, error);
    }
  }

  function bindModeNavigation() {
    $$('[data-screen]').forEach((button) => {
      button.type = 'button';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showMode(button.dataset.screen);
      }, true);
    });

    $$('[data-go]').forEach((button) => {
      button.type = 'button';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const targetButton = document.querySelector(`[data-screen="${button.dataset.go}"]`);
        if (targetButton) showMode(button.dataset.go);
      }, true);
    });

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
