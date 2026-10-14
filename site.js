(() => {
  const themes = ['black', 'gray'];
  let activeTheme = 'black';
  let grayLevel = 18;

  try {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (themes.includes(savedTheme)) activeTheme = savedTheme;
    const savedGrayLevel = Number.parseInt(localStorage.getItem('portfolio-gray-level'), 10);
    if (savedGrayLevel >= 10 && savedGrayLevel <= 32) grayLevel = savedGrayLevel;
  } catch (error) {
    console.warn('Theme preference could not be read.', error);
  }

  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.style.setProperty('--gray-level', `${grayLevel}%`);

  const navShell = document.querySelector('.nav-shell');
  const navToggle = document.querySelector('.nav-toggle');

  if (navShell) {
    const picker = document.createElement('label');
    picker.className = 'theme-picker';
    const label = document.createElement('span');
    label.textContent = 'Theme';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Color theme');

    [['black', 'Black'], ['gray', 'Gray']].forEach(([value, name]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      select.append(option);
    });

    select.value = activeTheme;
    const tuner = document.createElement('details');
    tuner.className = 'gray-tuner';
    tuner.hidden = activeTheme !== 'gray';
    const tunerSummary = document.createElement('summary');
    tunerSummary.textContent = 'Shade';
    const tunerPanel = document.createElement('div');
    tunerPanel.className = 'gray-tuner-panel';
    const tunerLabel = document.createElement('label');
    tunerLabel.htmlFor = 'gray-level';
    tunerLabel.append(document.createTextNode('Gray level'));
    const tunerOutput = document.createElement('output');
    tunerOutput.value = `${grayLevel}%`;
    tunerOutput.textContent = `${grayLevel}%`;
    tunerLabel.append(tunerOutput);
    const tunerInput = document.createElement('input');
    tunerInput.id = 'gray-level';
    tunerInput.type = 'range';
    tunerInput.min = '10';
    tunerInput.max = '32';
    tunerInput.value = String(grayLevel);
    tunerInput.setAttribute('aria-label', 'Gray theme brightness');
    tunerInput.addEventListener('input', () => {
      grayLevel = Number.parseInt(tunerInput.value, 10);
      document.documentElement.style.setProperty('--gray-level', `${grayLevel}%`);
      tunerOutput.value = `${grayLevel}%`;
      tunerOutput.textContent = `${grayLevel}%`;
      try {
        localStorage.setItem('portfolio-gray-level', String(grayLevel));
      } catch (error) {
        console.warn('Gray preference could not be saved.', error);
      }
    });
    tunerPanel.append(tunerLabel, tunerInput);
    tuner.append(tunerSummary, tunerPanel);

    select.addEventListener('change', () => {
      document.documentElement.dataset.theme = select.value;
      tuner.hidden = select.value !== 'gray';
      if (tuner.hidden) tuner.removeAttribute('open');
      try {
        localStorage.setItem('portfolio-theme', select.value);
      } catch (error) {
        console.warn('Theme preference could not be saved.', error);
      }
    });

    picker.append(label, select);
    navShell.insertBefore(picker, navToggle || navShell.querySelector('.nav-links'));
    navShell.insertBefore(tuner, navToggle || navShell.querySelector('.nav-links'));
  }

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
      document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      links.classList.toggle('open', !isOpen);
      document.body.classList.toggle('nav-open', !isOpen);
    });

    links.addEventListener('click', event => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeMenu();
        toggle.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  document.querySelectorAll('[data-current-year]').forEach(element => {
    element.textContent = new Date().getFullYear();
  });
})();
