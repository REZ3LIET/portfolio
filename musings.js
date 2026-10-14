(() => {
  const grid = document.querySelector('#musings-grid');
  const filterRow = document.querySelector('#filter-row');
  const dialog = document.querySelector('#musing-dialog');
  const rawButton = document.querySelector('#mode-raw');
  const refinedButton = document.querySelector('#mode-refined');
  let musings = [];
  let activeMusing = null;

  const formatDate = value => {
    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const makeTag = value => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = value;
    return tag;
  };

  const renderCards = entries => {
    grid.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<p>No musings match this filter.</p>';
      grid.append(empty);
      return;
    }

    entries.forEach(musing => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'musing-card';
      card.setAttribute('aria-label', `Read ${musing.title}`);

      if (musing.image) {
        const image = document.createElement('img');
        image.className = 'musing-image';
        image.src = musing.image;
        image.alt = '';
        image.loading = 'lazy';
        image.addEventListener('error', () => {
          image.replaceWith(Object.assign(document.createElement('div'), { className: 'musing-image-placeholder' }));
        });
        card.append(image);
      } else {
        card.append(Object.assign(document.createElement('div'), { className: 'musing-image-placeholder' }));
      }

      const body = document.createElement('div');
      body.className = 'musing-card-body';

      const meta = document.createElement('div');
      meta.className = 'musing-card-meta';
      const date = document.createElement('time');
      date.dateTime = musing.date;
      date.textContent = formatDate(musing.date);
      const tags = document.createElement('div');
      tags.className = 'tag-list';
      musing.tags.forEach(tag => tags.append(makeTag(tag)));
      meta.append(date, tags);

      const title = document.createElement('h2');
      title.textContent = musing.title;
      const preview = document.createElement('p');
      preview.textContent = musing.preview;

      body.append(meta, title, preview);
      card.append(body);
      card.addEventListener('click', () => openMusing(musing));
      grid.append(card);
    });
  };

  const renderFilters = () => {
    const tags = [...new Set(musings.flatMap(musing => musing.tags))].sort();
    tags.forEach(tag => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-btn';
      button.dataset.tag = tag;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = tag;
      filterRow.append(button);
    });

    filterRow.addEventListener('click', event => {
      const button = event.target.closest('.filter-btn');
      if (!button) return;
      filterRow.querySelectorAll('.filter-btn').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      const tag = button.dataset.tag;
      renderCards(tag === 'all' ? musings : musings.filter(musing => musing.tags.includes(tag)));
    });
  };

  const setMode = mode => {
    if (!activeMusing) return;
    const content = document.querySelector('#dialog-content');
    const isRaw = mode === 'raw';
    rawButton.setAttribute('aria-pressed', String(isRaw));
    refinedButton.setAttribute('aria-pressed', String(!isRaw));
    content.classList.toggle('raw', isRaw);
    content.replaceChildren();

    const text = isRaw ? activeMusing.raw : activeMusing.refined;
    text.split(/\n\n+/).forEach(paragraph => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      content.append(element);
    });
  };

  const openMusing = musing => {
    activeMusing = musing;
    const cover = document.querySelector('#dialog-cover');
    cover.replaceChildren();
    if (musing.image) {
      const image = document.createElement('img');
      image.className = 'dialog-cover';
      image.src = musing.image;
      image.alt = '';
      cover.append(image);
    } else {
      cover.append(Object.assign(document.createElement('div'), { className: 'dialog-cover-placeholder' }));
    }

    document.querySelector('#dialog-title').textContent = musing.title;
    const date = document.querySelector('#dialog-date');
    date.dateTime = musing.date;
    date.textContent = formatDate(musing.date);
    const tags = document.querySelector('#dialog-tags');
    tags.replaceChildren(...musing.tags.map(makeTag));
    setMode('raw');
    dialog.showModal();
  };

  rawButton.addEventListener('click', () => setMode('raw'));
  refinedButton.addEventListener('click', () => setMode('refined'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  if (Array.isArray(window.MUSINGS_DATA)) {
    musings = window.MUSINGS_DATA;
    renderFilters();
    renderCards(musings);
  } else {
    console.error('Musings data is missing or invalid.');
    grid.innerHTML = '<div class="empty-state"><p>Musings could not be loaded. Please try again shortly.</p></div>';
  }
})();
