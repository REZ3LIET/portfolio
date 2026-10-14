(() => {
  const themes = ['black', 'gray', 'white', 'shower', 'snow'];
  let activeTheme = 'black';
  let grayLevel = 18;

  try {
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'storm') {
      activeTheme = 'shower';
      localStorage.setItem('portfolio-theme', 'shower');
    } else if (themes.includes(savedTheme)) {
      activeTheme = savedTheme;
    }
    const savedGrayLevel = Number.parseInt(localStorage.getItem('portfolio-gray-level'), 10);
    if (savedGrayLevel >= 10 && savedGrayLevel <= 32) grayLevel = savedGrayLevel;
  } catch (error) {
    console.warn('Theme preference could not be read.', error);
  }

  document.documentElement.dataset.theme = activeTheme;
  document.documentElement.style.setProperty('--gray-level', `${grayLevel}%`);

  const weatherLayer = document.createElement('div');
  weatherLayer.className = 'weather-layer';
  weatherLayer.setAttribute('aria-hidden', 'true');
  document.body.prepend(weatherLayer);

  let weatherSeed = String(Date.now());
  try {
    const savedSeed = sessionStorage.getItem('portfolio-weather-seed');
    if (savedSeed) {
      weatherSeed = savedSeed;
    } else {
      sessionStorage.setItem('portfolio-weather-seed', weatherSeed);
    }
  } catch (error) {
    console.warn('Weather layout could not be persisted for this visit.', error);
  }

  const seededValue = key => {
    const input = `${weatherSeed}:${key}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
      hash ^= input.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  };

  const clearWeatherProps = () => {
    document.querySelectorAll('.weather-prop, .snow-cap, .snowman').forEach(prop => prop.remove());
    document.querySelectorAll('.weather-host').forEach(host => host.classList.remove('weather-host'));
    document.querySelectorAll('.snow-host').forEach(host => host.classList.remove('snow-host'));
  };

  const createWeatherProp = key => {
    const propTypes = ['binoculars', 'telescope'];
    const typeIndex = Math.min(propTypes.length - 1, Math.floor(seededValue(`type:${key}`) * propTypes.length));
    const prop = document.createElement('span');
    prop.className = `weather-prop ${propTypes[typeIndex]}`;
    prop.style.setProperty('--prop-rotate', `${Math.round(seededValue(`rotate:${key}`) * 30 - 15)}deg`);
    prop.setAttribute('aria-hidden', 'true');
    return prop;
  };

  const decorateShowerSections = () => {
    clearWeatherProps();
    const anchors = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    const pageKey = window.location.pathname || 'index';

    document.querySelectorAll('main > section').forEach((section, sectionIndex) => {
      const sectionKey = `${pageKey}:section:${section.id || sectionIndex}`;
      const cardSelector = '.contact-panel, .project-card, .focus-card, .timeline-card, .detail-card, .musing-card, .toolkit';
      const cards = Array.from(section.querySelectorAll(cardSelector))
        .map((card, cardIndex) => ({ card, order: seededValue(`${sectionKey}:card:${cardIndex}`) }))
        .sort((first, second) => first.order - second.order)
        .map(({ card }) => card);

      if (!cards.length) return;

      const objectCount = 2;
      const usedAnchors = new Map();

      for (let index = 0; index < objectCount; index += 1) {
        const host = cards[index % cards.length];
        const hostAnchors = usedAnchors.get(host) || [];
        const availableAnchors = anchors.filter(anchor => !hostAnchors.includes(anchor));
        const anchorPool = availableAnchors.length ? availableAnchors : anchors;
        const key = `${sectionKey}:object:${index}`;
        const anchorIndex = Math.min(anchorPool.length - 1, Math.floor(seededValue(`anchor:${key}`) * anchorPool.length));
        const anchor = anchorPool[anchorIndex];
        const prop = createWeatherProp(key);

        prop.classList.add(`anchor-${anchor}`);
        usedAnchors.set(host, [...hostAnchors, anchor]);
        host.classList.add('weather-host');
        host.append(prop);
      }
    });
  };

  const renderShower = () => {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 76; index += 1) {
      const drop = document.createElement('span');
      drop.className = 'rain-drop';
      drop.style.setProperty('--rain-left', `${seededValue(`rain-left:${index}`) * 115 - 5}%`);
      drop.style.setProperty('--rain-length', `${36 + seededValue(`rain-length:${index}`) * 62}px`);
      drop.style.setProperty('--rain-speed', `${0.65 + seededValue(`rain-speed:${index}`) * 0.8}s`);
      drop.style.setProperty('--rain-delay', `${seededValue(`rain-delay:${index}`) * -3}s`);
      drop.style.setProperty('--rain-opacity', String(0.28 + seededValue(`rain-opacity:${index}`) * 0.56));
      fragment.append(drop);
    }
    weatherLayer.append(fragment);
    decorateShowerSections();
  };

  const decorateSnowSections = () => {
    clearWeatherProps();
    const pageKey = window.location.pathname || 'index';
    const cardSelector = '.contact-panel, .project-card, .focus-card, .timeline-card, .detail-card, .musing-card, .toolkit';

    document.querySelectorAll('main > section').forEach((section, sectionIndex) => {
      const sectionKey = `${pageKey}:snow-section:${section.id || sectionIndex}`;
      const cards = Array.from(section.querySelectorAll(cardSelector));

      if (!cards.length) return;

      cards.forEach((card, cardIndex) => {
        const key = `${sectionKey}:card:${cardIndex}`;
        const width = 42 + seededValue(`snow-width:${key}`) * 42;
        const cap = document.createElement('span');
        cap.className = 'snow-cap';
        cap.style.setProperty('--snow-width', `${width}%`);
        cap.style.setProperty('--snow-left', `${4 + seededValue(`snow-left:${key}`) * (92 - width)}%`);
        cap.style.setProperty('--snow-depth', `${8 + seededValue(`snow-depth:${key}`) * 8}px`);
        cap.setAttribute('aria-hidden', 'true');
        card.classList.add('snow-host');
        card.append(cap);
      });

      const snowmanIndex = Math.min(cards.length - 1, Math.floor(seededValue(`${sectionKey}:snowman-card`) * cards.length));
      const snowmanHost = cards[snowmanIndex];
      const snowman = document.createElement('span');
      const side = seededValue(`${sectionKey}:snowman-side`) > 0.5 ? 'right' : 'left';
      const head = document.createElement('span');
      const body = document.createElement('span');
      snowman.className = `snowman snowman-${side}`;
      head.className = 'snowman-head';
      body.className = 'snowman-body';
      snowman.style.setProperty('--snowman-tilt', `${Math.round(seededValue(`${sectionKey}:snowman-tilt`) * 10 - 5)}deg`);
      snowman.setAttribute('aria-hidden', 'true');
      snowman.append(head, body);
      snowmanHost.append(snowman);
    });
  };

  const renderSnow = () => {
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 200; index += 1) {
      const flake = document.createElement('span');
      const key = `snowflake:${index}`;
      const speed = 10 + seededValue(`speed:${key}`) * 20;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.12) % 1;
      const xPosition = ((index + seededValue(`x:${key}`) * 0.9) / 200) * 100;
      const drift = seededValue(`drift:${key}`) * 6 - 3;
      flake.className = 'snowflake';
      flake.style.setProperty('--snow-x', `${xPosition}vw`);
      flake.style.setProperty('--snow-scale', String(0.08 + seededValue(`scale:${key}`) * 0.92));
      flake.style.setProperty('--snow-speed', `${speed}s`);
      flake.style.setProperty('--snow-delay', `${-phase * speed}s`);
      flake.style.setProperty('--snow-drift', `${drift}vw`);
      flake.style.setProperty('--snow-drift-end', `${drift / 2}vw`);
      flake.style.setProperty('--snow-yoyo-y', `${30 + seededValue(`yoyo:${key}`) * 50}vh`);
      flake.style.setProperty('--snow-opacity', String(0.08 + seededValue(`opacity:${key}`) * 0.92));
      fragment.append(flake);
    }
    weatherLayer.append(fragment);
    decorateSnowSections();
  };

  const updateWeather = theme => {
    weatherLayer.replaceChildren();
    clearWeatherProps();
    if (theme === 'shower') renderShower();
    if (theme === 'snow') renderSnow();
  };

  window.refreshWeatherDecor = () => {
    if (document.documentElement.dataset.theme === 'shower') decorateShowerSections();
    if (document.documentElement.dataset.theme === 'snow') decorateSnowSections();
  };

  const navShell = document.querySelector('.nav-shell');
  const navToggle = document.querySelector('.nav-toggle');

  if (navShell) {
    const picker = document.createElement('label');
    picker.className = 'theme-picker';
    const label = document.createElement('span');
    label.textContent = 'Theme';
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Color theme');

    [['black', 'Black'], ['gray', 'Gray'], ['white', 'White'], ['shower', 'Shower'], ['snow', 'Snow']].forEach(([value, name]) => {
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
      updateWeather(select.value);
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

  updateWeather(activeTheme);
})();
