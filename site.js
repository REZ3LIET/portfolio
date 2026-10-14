(() => {
  const themes = ['black', 'gray'];
  let activeTheme = 'black';

  try {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (themes.includes(savedTheme)) activeTheme = savedTheme;
  } catch (error) {
    console.warn('Theme preference could not be read.', error);
  }

  document.documentElement.dataset.theme = activeTheme;

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
    select.addEventListener('change', () => {
      document.documentElement.dataset.theme = select.value;
      try {
        localStorage.setItem('portfolio-theme', select.value);
      } catch (error) {
        console.warn('Theme preference could not be saved.', error);
      }
    });

    picker.append(label, select);
    navShell.insertBefore(picker, navToggle || navShell.querySelector('.nav-links'));
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
