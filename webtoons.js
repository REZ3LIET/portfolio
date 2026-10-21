(() => {
  const grid = document.querySelector('#webtoons-grid');
  if (!grid) return;

  const webtoons = window.WEBTOONS_DATA;
  if (!Array.isArray(webtoons)) {
    console.error('Webtoon data is missing or invalid.');
    grid.innerHTML = '<div class="empty-state"><p>Webtoons could not be loaded. Please try again shortly.</p></div>';
    return;
  }

  const formatDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const makeTag = value => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = value;
    return tag;
  };

  grid.replaceChildren();

  webtoons.forEach(webtoon => {
    const card = document.createElement('a');
    card.className = 'musing-card webtoon-card';
    card.href = `webtoon.html?episode=${encodeURIComponent(webtoon.id)}`;
    card.setAttribute('aria-label', `Read episode ${webtoon.episode}: ${webtoon.title}`);

    const imageWrap = document.createElement('div');
    imageWrap.className = 'webtoon-cover';
    const image = document.createElement('img');
    image.className = 'musing-image';
    image.src = webtoon.cover;
    image.alt = '';
    image.loading = 'lazy';
    const badge = document.createElement('span');
    badge.className = 'webtoon-badge';
    badge.textContent = `Episode ${String(webtoon.episode).padStart(2, '0')} · Webtoon`;
    imageWrap.append(image, badge);

    const body = document.createElement('div');
    body.className = 'musing-card-body';
    const meta = document.createElement('div');
    meta.className = 'musing-card-meta';
    const date = document.createElement('time');
    date.dateTime = webtoon.date;
    date.textContent = formatDate(webtoon.date);
    const tags = document.createElement('div');
    tags.className = 'tag-list';
    webtoon.tags.forEach(tag => tags.append(makeTag(tag)));
    meta.append(date, tags);

    const title = document.createElement('h2');
    title.textContent = webtoon.title;
    const preview = document.createElement('p');
    preview.textContent = webtoon.preview;
    const cue = document.createElement('span');
    cue.className = 'webtoon-read-cue';
    cue.textContent = 'Read episode →';

    body.append(meta, title, preview, cue);
    card.append(imageWrap, body);
    grid.append(card);
  });

  window.refreshWeatherDecor?.();
})();
