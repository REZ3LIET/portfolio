(() => {
  const themes = ['spring', 'summer', 'monsoon', 'fall', 'winter', 'classic'];

  // Seasonal theme used by the "Auto" option. Edit this map to change the pairing.
  // Monsoon (rain) is not tied to a month here; visitors can still pick it by hand.
  const seasonThemes = { winter: 'winter', spring: 'spring', summer: 'summer', autumn: 'fall' };

  // Southern-hemisphere time zones get flipped seasons (December is summer there).
  const isSouthernHemisphere = () => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji|Noumea|Tongatapu|Port_Moresby)|^America\/(Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|Punta_Arenas)|^Africa\/(Johannesburg|Maputo|Harare|Windhoek|Gaborone|Maseru|Mbabane|Lusaka)|^Indian\/(Mauritius|Reunion|Antananarivo)/.test(zone);
    } catch (error) {
      return false;
    }
  };

  const currentSeason = (date = new Date()) => {
    // Jan..Dec. Winter runs Nov-Feb so the snow theme covers the cold months.
    const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'autumn', 'autumn', 'winter', 'winter'];
    const opposite = { winter: 'summer', summer: 'winter', spring: 'autumn', autumn: 'spring' };
    const season = seasons[date.getMonth()];
    return isSouthernHemisphere() ? opposite[season] : season;
  };

  const resolveTheme = preference => (preference === 'auto' ? seasonThemes[currentSeason()] : preference);

  const seasonalThemes = ['spring', 'summer', 'monsoon', 'fall', 'winter'];
  // Local hours counted as daytime in Auto mode: [sunrise, sunset). Rough, so days are longer in summer.
  const daylightHours = { spring: [6, 19], summer: [6, 20], monsoon: [6, 19], fall: [7, 18], winter: [7, 17] };
  // Classic has no season of its own, so it uses the daylight hours of the current season.
  const daylightFor = theme => daylightHours[theme] || daylightHours[seasonThemes[currentSeason()]];
  const modes = ['day', 'night'];

  // Every theme has a day and a night look. Classic is plain: White by day, Black by night.
  const resolveMode = (preference, theme, date = new Date()) => {
    if (modes.includes(preference)) return preference;
    const [sunrise, sunset] = daylightFor(theme);
    const hour = date.getHours() + date.getMinutes() / 60;
    return hour >= sunrise && hour < sunset ? 'day' : 'night';
  };

  // preference is what the visitor chose ('auto' or a theme); activeTheme is what is shown.
  let themePreference = 'auto';
  let modePreference = 'auto';

  try {
    const savedTheme = localStorage.getItem('portfolio-theme');
    // Older theme names, kept so returning visitors keep their choice.
    const renamedThemes = { storm: 'monsoon', shower: 'monsoon', snow: 'winter' };
    // Black, Gray and White became one Classic theme; keep their look through the mode.
    const classicModes = { black: 'night', gray: 'night', white: 'day' };
    if (renamedThemes[savedTheme]) {
      themePreference = renamedThemes[savedTheme];
      localStorage.setItem('portfolio-theme', themePreference);
    } else if (classicModes[savedTheme]) {
      themePreference = 'classic';
      localStorage.setItem('portfolio-theme', 'classic');
      localStorage.setItem('portfolio-mode', classicModes[savedTheme]);
      localStorage.removeItem('portfolio-gray-level');
    } else if (savedTheme === 'auto' || themes.includes(savedTheme)) {
      themePreference = savedTheme;
    }
    const savedMode = localStorage.getItem('portfolio-mode');
    if (savedMode === 'auto' || modes.includes(savedMode)) modePreference = savedMode;
  } catch (error) {
    console.warn('Theme preference could not be read.', error);
  }

  let activeTheme = resolveTheme(themePreference);
  let activeMode = resolveMode(modePreference, activeTheme);

  // Classic is drawn by the stylesheet's White (day) and Black (night) looks.
  const setThemeAttributes = () => {
    const shownTheme = activeTheme === 'classic' ? (activeMode === 'day' ? 'white' : 'black') : activeTheme;
    document.documentElement.dataset.theme = shownTheme;
    document.documentElement.dataset.mode = activeMode;
  };
  setThemeAttributes();

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

  const leafColors = ['#c9503a', '#e8893a', '#d9a441', '#a8432f', '#b8742a'];
  // Similar keys hash to nearby values, so spread with a large multiplier before taking the remainder.
  const pickLeafColor = key => leafColors[Math.floor(seededValue(key) * 9973) % leafColors.length];

  const pickLeafShape = key => (Math.floor(seededValue(key) * 9973) % 2 ? 'leaf-broad' : 'leaf-slim');

  const blossomColors = ['#e07a9a', '#f0b429', '#a98bd6', '#f29e6d'];
  const pickBlossomColor = key => blossomColors[Math.floor(seededValue(key) * 9973) % blossomColors.length];

  const summerColors = ['#e2683c', '#0f8a9c', '#f0b429', '#3a8fd6'];
  const pickSummerColor = key => summerColors[Math.floor(seededValue(key) * 9973) % summerColors.length];

  const createWeatherProp = key => {
    const currentTheme = document.documentElement.dataset.theme;
    if (currentTheme === 'summer') {
      const prop = document.createElement('span');
      prop.className = 'weather-prop summer-ball';
      prop.style.setProperty('--summer-color', pickSummerColor(`color:${key}`));
      prop.style.setProperty('--prop-rotate', `${Math.round(seededValue(`rotate:${key}`) * 30 - 15)}deg`);
      prop.setAttribute('aria-hidden', 'true');
      return prop;
    }
    if (currentTheme === 'spring') {
      const isFlower = Math.floor(seededValue(`spring-type:${key}`) * 9973) % 2 === 0;
      const prop = document.createElement('span');
      prop.className = `weather-prop ${isFlower ? 'spring-flower' : 'spring-twig'}`;
      if (isFlower) prop.style.setProperty('--blossom-color', pickBlossomColor(`color:${key}`));
      prop.style.setProperty('--prop-rotate', `${Math.round(seededValue(`rotate:${key}`) * 50 - 25)}deg`);
      prop.setAttribute('aria-hidden', 'true');
      return prop;
    }
    if (currentTheme === 'fall') {
      const leaf = document.createElement('span');
      leaf.className = `weather-prop fallen-leaf ${pickLeafShape(`shape:${key}`)}`;
      leaf.style.setProperty('--leaf-color', pickLeafColor(`color:${key}`));
      leaf.style.setProperty('--prop-rotate', `${Math.round(seededValue(`rotate:${key}`) * 120 - 60)}deg`);
      leaf.setAttribute('aria-hidden', 'true');
      return leaf;
    }
    const propTypes = ['binoculars', 'telescope'];
    const typeIndex = Math.min(propTypes.length - 1, Math.floor(seededValue(`type:${key}`) * propTypes.length));
    const prop = document.createElement('span');
    prop.className = `weather-prop ${propTypes[typeIndex]}`;
    prop.style.setProperty('--prop-rotate', `${Math.round(seededValue(`rotate:${key}`) * 30 - 15)}deg`);
    prop.setAttribute('aria-hidden', 'true');
    return prop;
  };

  const decorateCardProps = () => {
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

  // Night extras. Fireflies wander and pulse; stars twinkle in the upper half of the sky.
  const appendFireflies = (fragment, count) => {
    for (let index = 0; index < count; index += 1) {
      const key = `firefly:${index}`;
      // Outer span glows and wanders; the inner span is the firefly shape (a mask would clip the glow).
      const firefly = document.createElement('span');
      const body = document.createElement('span');
      firefly.className = 'firefly';
      body.className = 'firefly-body';
      firefly.append(body);
      firefly.style.setProperty('--ff-size', `${16 + seededValue(`size:${key}`) * 8}px`);
      firefly.style.setProperty('--ff-tilt', `${Math.round(seededValue(`tilt:${key}`) * 60 - 30)}deg`);
      firefly.style.setProperty('--ff-x', `${((index + seededValue(`x:${key}`)) / count) * 96 + 2}vw`);
      firefly.style.setProperty('--ff-y', `${30 + ((index * 0.61803398875 + seededValue(`y:${key}`) * 0.1) % 1) * 62}vh`);
      firefly.style.setProperty('--ff-dx', `${(seededValue(`dx:${key}`) * 2 - 1) * 6}vw`);
      firefly.style.setProperty('--ff-dy', `${(seededValue(`dy:${key}`) * 2 - 1) * 8}vh`);
      firefly.style.setProperty('--ff-wander', `${9 + seededValue(`wander:${key}`) * 9}s`);
      firefly.style.setProperty('--ff-glow', `${1.6 + seededValue(`glow:${key}`) * 2.4}s`);
      firefly.style.setProperty('--ff-delay', `${-seededValue(`delay:${key}`) * 18}s`);
      fragment.append(firefly);
    }
  };

  // Bats zigzag across the night sky. Outer span follows the flight path,
  // inner span flaps (squashes) the wings and mirrors the bat when it flies left.
  const appendBats = (fragment, count) => {
    for (let index = 0; index < count; index += 1) {
      const key = `bat:${index}`;
      const bat = document.createElement('span');
      const wings = document.createElement('span');
      const speed = 11 + seededValue(`speed:${key}`) * 9;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.1) % 1;
      bat.className = `night-bat ${index % 2 === 0 ? 'bat-ltr' : 'bat-rtl'}`;
      wings.className = 'bat-wings';
      bat.append(wings);
      bat.style.setProperty('--bat-y', `${12 + ((index * 0.61803398875 + 0.2) % 1) * 34}vh`);
      bat.style.setProperty('--bat-size', `${32 + seededValue(`size:${key}`) * 14}px`);
      bat.style.setProperty('--bat-speed', `${speed}s`);
      bat.style.setProperty('--bat-delay', `${-phase * speed}s`);
      wings.style.setProperty('--bat-flap', `${0.24 + seededValue(`flap:${key}`) * 0.14}s`);
      fragment.append(bat);
    }
  };

  // Owls glide across winter nights now and then. Outer span follows the glide path;
  // inner span is the drawing (assets/images/icons/flying-owl.svg), mirrored when flying left.
  const appendOwls = (fragment, count) => {
    for (let index = 0; index < count; index += 1) {
      const key = `owl:${index}`;
      const owl = document.createElement('span');
      const drawing = document.createElement('span');
      // Same cycle for every owl, so the spacing below holds forever.
      const cycle = 30;
      owl.className = `night-owl ${index % 2 === 0 ? 'owl-ltr' : 'owl-rtl'}`;
      drawing.className = 'owl-drawing';
      owl.append(drawing);
      // Own height band per owl (top, middle, lower sky) so they never overlap.
      owl.style.setProperty('--owl-y', `${[10, 29, 48][index % 3] + seededValue(`y:${key}`) * 3}vh`);
      owl.style.setProperty('--owl-size', `${100 + seededValue(`size:${key}`) * 30}px`);
      owl.style.setProperty('--owl-cycle', `${cycle}s`);
      // Staggered evenly through the cycle: usually one or two owls are in the sky at once.
      owl.style.setProperty('--owl-delay', `${-(index / count) * cycle}s`);
      fragment.append(owl);
    }
  };

  const renderNightSky = () => {
    const fragment = document.createDocumentFragment();
    const starCount = 70;
    for (let index = 0; index < starCount; index += 1) {
      const key = `star:${index}`;
      const star = document.createElement('span');
      // About one star in six is a star shape; the rest stay as small dots so the sky stays calm.
      const isShape = index % 6 === 0;
      star.className = isShape ? `night-star star-icon ${index % 12 === 0 ? 'star-solid' : 'star-outline'}` : 'night-star';
      star.style.setProperty('--star-x', `${((index + seededValue(`x:${key}`)) / starCount) * 100}vw`);
      star.style.setProperty('--star-y', `${((index * 0.61803398875 + seededValue(`y:${key}`) * 0.05) % 1) * 55}vh`);
      star.style.setProperty('--star-size', isShape ? `${11 + seededValue(`size:${key}`) * 6}px` : `${1 + seededValue(`size:${key}`) * 1.8}px`);
      if (isShape) star.style.setProperty('--star-rotate', `${Math.round(seededValue(`rotate:${key}`) * 40 - 20)}deg`);
      star.style.setProperty('--star-opacity', String(0.35 + seededValue(`opacity:${key}`) * 0.6));
      star.style.setProperty('--star-speed', `${2 + seededValue(`speed:${key}`) * 4}s`);
      star.style.setProperty('--star-delay', `${-seededValue(`delay:${key}`) * 6}s`);
      fragment.append(star);
    }
    const moonGlow = document.createElement('span');
    const moonShape = document.createElement('span');
    moonGlow.className = 'night-moon';
    moonShape.className = 'night-moon-shape';
    moonGlow.append(moonShape);
    fragment.append(moonGlow);
    weatherLayer.prepend(fragment);
  };

  // Day counterpart to the moon: a glowing core behind a slowly turning sun (assets/images/icons/sun.svg).
  const renderDaySky = () => {
    const sun = document.createElement('span');
    const core = document.createElement('span');
    const rays = document.createElement('span');
    sun.className = 'day-sun';
    core.className = 'day-sun-core';
    rays.className = 'day-sun-rays';
    sun.append(core, rays);
    weatherLayer.prepend(sun);
  };

  const renderShower = () => {
    const fragment = document.createDocumentFragment();
    const dropCount = 140;
    for (let index = 0; index < dropCount; index += 1) {
      const drop = document.createElement('span');
      const key = `rain:${index}`;
      const speed = 0.58 + seededValue(`speed:${key}`) * 0.72;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.14) % 1;
      const xPosition = ((index + seededValue(`x:${key}`) * 0.88) / dropCount) * 112 - 6;
      drop.className = 'rain-drop';
      drop.style.setProperty('--rain-left', `${xPosition}%`);
      drop.style.setProperty('--rain-width', `${0.7 + seededValue(`width:${key}`) * 1.15}px`);
      drop.style.setProperty('--rain-length', `${32 + seededValue(`length:${key}`) * 72}px`);
      drop.style.setProperty('--rain-speed', `${speed}s`);
      drop.style.setProperty('--rain-delay', `${-phase * speed}s`);
      drop.style.setProperty('--rain-opacity', String(0.18 + seededValue(`opacity:${key}`) * 0.68));
      fragment.append(drop);
    }
    if (activeMode === 'day') {
      // A faint rainbow over the rain by day.
      const rainbow = document.createElement('span');
      rainbow.className = 'monsoon-rainbow';
      fragment.prepend(rainbow);
    } else {
      // Two storm clouds that light up with the lightning flickers (first and second flash).
      ['strike-a', 'strike-b'].forEach((strike, index) => {
        const key = `lightning:${index}`;
        const cloud = document.createElement('span');
        cloud.className = `lightning-cloud ${strike}`;
        cloud.style.setProperty('--bolt-x', `${(index === 0 ? 8 : 52) + seededValue(`x:${key}`) * 36}vw`);
        // Fixed offsets per cloud; similar seed keys can hash to near-identical values.
        cloud.style.setProperty('--bolt-y', `${(index === 0 ? 11 : 19) + seededValue(`y:${key}`) * 7}vh`);
        cloud.style.setProperty('--bolt-size', `${80 + seededValue(`size:${key}`) * 40}px`);
        fragment.prepend(cloud);
      });
    }
    weatherLayer.append(fragment);
    decorateCardProps();
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
    if (activeMode === 'night') appendOwls(fragment, 3);
    weatherLayer.append(fragment);
    decorateSnowSections();
  };

  const renderLeaves = () => {
    const fragment = document.createDocumentFragment();
    const leafCount = 56;
    for (let index = 0; index < leafCount; index += 1) {
      const leaf = document.createElement('span');
      const key = `leaf:${index}`;
      const speed = 9 + seededValue(`speed:${key}`) * 9;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.12) % 1;
      const spinDirection = seededValue(`spin-dir:${key}`) > 0.5 ? 1 : -1;
      leaf.className = `falling-leaf ${pickLeafShape(`shape:${key}`)}`;
      leaf.style.setProperty('--leaf-x', `${((index + seededValue(`x:${key}`)) / leafCount) * 104 - 2}vw`);
      leaf.style.setProperty('--leaf-size', `${14 + seededValue(`size:${key}`) * 14}px`);
      leaf.style.setProperty('--leaf-color', pickLeafColor(`color:${key}`));
      leaf.style.setProperty('--leaf-speed', `${speed}s`);
      leaf.style.setProperty('--leaf-delay', `${-phase * speed}s`);
      leaf.style.setProperty('--leaf-sway', `${3 + seededValue(`sway:${key}`) * 6}vw`);
      leaf.style.setProperty('--leaf-spin', `${spinDirection * (300 + seededValue(`spin:${key}`) * 500)}deg`);
      leaf.style.setProperty('--leaf-opacity', String(0.55 + seededValue(`opacity:${key}`) * 0.4));
      fragment.append(leaf);
    }
    if (activeMode === 'night') appendBats(fragment, 5);
    weatherLayer.append(fragment);
    decorateCardProps();
  };

  const renderSpring = () => {
    const fragment = document.createDocumentFragment();

    // Bees go home at night; fireflies come out instead.
    if (activeMode === 'night') appendFireflies(fragment, 22);
    const beeCount = activeMode === 'night' ? 0 : 9;
    for (let index = 0; index < beeCount; index += 1) {
      const bee = document.createElement('span');
      const key = `bee:${index}`;
      const speed = 16 + seededValue(`speed:${key}`) * 14;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.2) % 1;
      const leftToRight = seededValue(`dir:${key}`) > 0.4;
      bee.className = `spring-bee ${leftToRight ? 'bee-ltr' : 'bee-rtl'}`;
      // Golden-ratio steps spread bees evenly from top to bottom; the seed adds a little jitter.
      bee.style.setProperty('--bee-y', `${8 + ((index * 0.61803398875 + seededValue(`y:${key}`) * 0.08) % 1) * 80}vh`);
      bee.style.setProperty('--bee-bob', `${2 + seededValue(`bob:${key}`) * 6}vh`);
      bee.style.setProperty('--bee-size', `${18 + seededValue(`size:${key}`) * 10}px`);
      bee.style.setProperty('--bee-speed', `${speed}s`);
      bee.style.setProperty('--bee-delay', `${-phase * speed}s`);
      fragment.append(bee);
    }

    const blossomCount = 22;
    for (let index = 0; index < blossomCount; index += 1) {
      const blossom = document.createElement('span');
      const key = `blossom:${index}`;
      const speed = 14 + seededValue(`speed:${key}`) * 12;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.12) % 1;
      blossom.className = 'spring-blossom';
      blossom.style.setProperty('--leaf-x', `${((index + seededValue(`x:${key}`)) / blossomCount) * 104 - 2}vw`);
      blossom.style.setProperty('--leaf-size', `${10 + seededValue(`size:${key}`) * 10}px`);
      blossom.style.setProperty('--blossom-color', pickBlossomColor(`color:${key}`));
      blossom.style.setProperty('--leaf-speed', `${speed}s`);
      blossom.style.setProperty('--leaf-delay', `${-phase * speed}s`);
      blossom.style.setProperty('--leaf-sway', `${2 + seededValue(`sway:${key}`) * 5}vw`);
      blossom.style.setProperty('--leaf-spin', `${(seededValue(`spin-dir:${key}`) > 0.5 ? 1 : -1) * (120 + seededValue(`spin:${key}`) * 240)}deg`);
      blossom.style.setProperty('--leaf-opacity', String(0.5 + seededValue(`opacity:${key}`) * 0.4));
      fragment.append(blossom);
    }

    weatherLayer.append(fragment);
    decorateCardProps();
  };

  // Each ball is three nested spans: the outer one travels across, the middle one
  // bounces up and down, the inner one spins. Splitting them keeps each motion simple.
  const renderSummer = () => {
    const fragment = document.createDocumentFragment();
    if (activeMode === 'night') {
      // The beach is empty at night: no balls, hats or breeze, just fireflies under the stars.
      appendFireflies(fragment, 26);
      appendBats(fragment, 3);
      weatherLayer.append(fragment);
      decorateCardProps();
      return;
    }
    const ballCount = 5;
    for (let index = 0; index < ballCount; index += 1) {
      const key = `ball:${index}`;
      const track = document.createElement('span');
      const bounce = document.createElement('span');
      const ball = document.createElement('span');
      const travel = 22 + seededValue(`travel:${key}`) * 16;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.1) % 1;
      const leftToRight = index % 2 === 0;
      track.className = `beach-ball-track ${leftToRight ? 'ball-ltr' : 'ball-rtl'}`;
      bounce.className = 'beach-ball-bounce';
      ball.className = 'beach-ball';
      track.style.setProperty('--ball-floor', `${3 + ((index * 0.61803398875) % 1) * 9}vh`);
      track.style.setProperty('--ball-size', `${24 + seededValue(`size:${key}`) * 16}px`);
      track.style.setProperty('--ball-travel', `${travel}s`);
      track.style.setProperty('--ball-delay', `${-phase * travel}s`);
      bounce.style.setProperty('--ball-height', `${8 + seededValue(`height:${key}`) * 12}vh`);
      bounce.style.setProperty('--ball-hop', `${1.4 + seededValue(`hop:${key}`) * 0.9}s`);
      ball.style.setProperty('--summer-color', pickSummerColor(`color:${key}`));
      ball.style.setProperty('--ball-spin', `${leftToRight ? 360 : -360}deg`);
      bounce.append(ball);
      track.append(bounce);
      fragment.append(track);
    }
    const hatCount = 4;
    for (let index = 0; index < hatCount; index += 1) {
      const key = `hat:${index}`;
      // Outer span is carried by the wind (gusts and lulls); inner span tumbles in step with it.
      const hat = document.createElement('span');
      const tumble = document.createElement('span');
      const speed = 22 + seededValue(`speed:${key}`) * 12;
      const phase = (index * 0.61803398875 + seededValue(`phase:${key}`) * 0.1) % 1;
      hat.className = `summer-flying-hat ${index % 2 === 0 ? 'hat-ltr' : 'hat-rtl'}`;
      tumble.className = 'hat-tumble';
      hat.append(tumble);
      hat.style.setProperty('--hat-y', `${20 + ((index * 0.61803398875 + 0.3) % 1) * 20}vh`);
      hat.style.setProperty('--hat-bob', `${3 + seededValue(`bob:${key}`) * 5}vh`);
      hat.style.setProperty('--hat-size', `${34 + seededValue(`size:${key}`) * 16}px`);
      hat.style.setProperty('--hat-speed', `${speed}s`);
      hat.style.setProperty('--hat-delay', `${-phase * speed}s`);
      hat.style.setProperty('--summer-color', pickSummerColor(`color:${key}`));
      fragment.append(hat);
    }

    // Faint streaks that sweep across the top so the breeze itself is visible.
    const streakCount = 7;
    for (let index = 0; index < streakCount; index += 1) {
      const key = `wind:${index}`;
      const streak = document.createElement('span');
      const cycle = 5 + seededValue(`cycle:${key}`) * 5;
      streak.className = `wind-streak ${index % 2 === 0 ? 'wind-ltr' : 'wind-rtl'}`;
      streak.style.setProperty('--wind-y', `${4 + ((index * 0.61803398875 + 0.1) % 1) * 38}vh`);
      streak.style.setProperty('--wind-length', `${90 + seededValue(`length:${key}`) * 140}px`);
      streak.style.setProperty('--wind-cycle', `${cycle}s`);
      streak.style.setProperty('--wind-delay', `${-((index * 0.61803398875) % 1) * cycle}s`);
      fragment.append(streak);
    }

    weatherLayer.append(fragment);
    decorateCardProps();
  };

  const updateWeather = theme => {
    weatherLayer.replaceChildren();
    clearWeatherProps();
    if (theme === 'monsoon') renderShower();
    if (theme === 'winter') renderSnow();
    if (theme === 'fall') renderLeaves();
    if (theme === 'spring') renderSpring();
    if (theme === 'summer') renderSummer();
    // Sun, moon and stars belong to the clear-sky seasons; Classic stays plain.
    const clearSky = seasonalThemes.includes(theme) && theme !== 'monsoon';
    if (clearSky && activeMode === 'night') renderNightSky();
    if (clearSky && activeMode === 'day') renderDaySky();
  };

  // Hooks the nav controls register so labels stay in sync when the clock changes the theme.
  let syncControls = () => {};

  const applyAppearance = () => {
    activeTheme = resolveTheme(themePreference);
    activeMode = resolveMode(modePreference, activeTheme);
    setThemeAttributes();
    syncControls();
    updateWeather(activeTheme);
  };

  // Auto theme and Auto mode depend on the date and time, so re-check once a minute
  // and switch at dusk or dawn without a reload.
  window.setInterval(() => {
    const nextTheme = resolveTheme(themePreference);
    const nextMode = resolveMode(modePreference, nextTheme);
    if (nextTheme !== activeTheme || nextMode !== activeMode) applyAppearance();
  }, 60 * 1000);

  window.refreshWeatherDecor = () => {
    const theme = document.documentElement.dataset.theme;
    if (theme === 'monsoon' || theme === 'fall' || theme === 'spring' || theme === 'summer') decorateCardProps();
    if (theme === 'winter') decorateSnowSections();
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

    const themeNames = { spring: 'Spring', summer: 'Summer', monsoon: 'Monsoon', fall: 'Fall', winter: 'Winter', classic: 'Classic' };
    const makeOption = (value, name) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = name;
      return option;
    };
    const autoThemeOption = makeOption('auto', 'Auto');
    const seasonsGroup = document.createElement('optgroup');
    seasonsGroup.label = 'Seasons';
    seasonalThemes.forEach(value => seasonsGroup.append(makeOption(value, themeNames[value])));
    select.append(autoThemeOption, seasonsGroup, makeOption('classic', themeNames.classic));

    // Mode: day or night, for every theme.
    const modePicker = document.createElement('label');
    modePicker.className = 'theme-picker mode-picker';
    const modeLabel = document.createElement('span');
    modeLabel.textContent = 'Mode';
    const modeSelect = document.createElement('select');
    modeSelect.setAttribute('aria-label', 'Day or night mode');
    const autoModeOption = makeOption('auto', 'Auto');
    // U+FE0E asks for the plain-text sun and moon rather than colour emoji.
    const sun = '\u2600\uFE0E';
    const moon = '\u263E\uFE0E';
    modeSelect.append(autoModeOption, makeOption('day', `${sun} Day`), makeOption('night', `${moon} Night`));
    modeSelect.value = modePreference;
    modePicker.append(modeLabel, modeSelect);

    select.value = themePreference;
    syncControls = () => {
      const season = currentSeason();
      const autoTheme = seasonThemes[season];
      autoThemeOption.textContent = `Auto · ${themeNames[autoTheme]}`;
      autoThemeOption.title = `Follows the season (${season}: ${themeNames[autoTheme]})`;
      const autoMode = resolveMode('auto', activeTheme);
      const [sunrise, sunset] = daylightFor(activeTheme);
      autoModeOption.textContent = `Auto ${autoMode === 'day' ? sun : moon}`;
      autoModeOption.title = `Day from ${sunrise}:00 to ${sunset}:00 local time`;
    };
    syncControls();

    const savePreference = (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Theme preference could not be saved.', error);
      }
    };

    select.addEventListener('change', () => {
      themePreference = select.value;
      savePreference('portfolio-theme', themePreference);
      applyAppearance();
    });

    modeSelect.addEventListener('change', () => {
      modePreference = modeSelect.value;
      savePreference('portfolio-mode', modePreference);
      applyAppearance();
    });

    picker.append(label, select);
    const navAnchor = navToggle || navShell.querySelector('.nav-links');
    navShell.insertBefore(picker, navAnchor);
    navShell.insertBefore(modePicker, navAnchor);
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
