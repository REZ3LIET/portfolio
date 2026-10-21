(() => {
  const episodes = window.WEBTOONS_DATA;
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('episode');
  const episode = Array.isArray(episodes)
    ? episodes.find(item => item.id === requestedId) || episodes[0]
    : null;

  const strip = document.querySelector('#webtoon-strip');
  if (!episode) {
    document.title = 'Episode unavailable — Samar Kale';
    document.querySelector('#reader-title').textContent = 'This episode could not be loaded.';
    strip.innerHTML = '<div class="webtoon-loading">Return to Musings and try again.</div>';
    return;
  }

  const formatDate = value => new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.title = `${episode.title} — Musings:Webtoons`;
  document.querySelector('#reader-series').textContent = episode.series;
  document.querySelector('#reader-episode').textContent = `Episode ${String(episode.episode).padStart(2, '0')}`;
  document.querySelector('#reader-title').textContent = episode.title;

  const date = document.querySelector('#reader-date');
  date.dateTime = episode.date;
  date.textContent = formatDate(episode.date);

  const tags = document.querySelector('#reader-tags');
  episode.tags.forEach(value => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = value;
    tags.append(tag);
  });

  const pdfLink = document.querySelector('#pdf-link');
  pdfLink.href = episode.pdf;
  pdfLink.download = `episode-${episode.episode}-${episode.id}.pdf`;

  strip.replaceChildren();
  episode.panels.forEach((panel, index) => {
    const image = document.createElement('img');
    image.src = panel.small;
    image.srcset = `${panel.small} 720w, ${panel.large} 1200w`;
    image.sizes = '(max-width: 760px) 100vw, 900px';
    image.alt = index === 0 ? `${episode.title}, episode artwork` : '';
    image.decoding = 'async';
    if (index > 0) image.loading = 'lazy';
    strip.append(image);
  });

  const transcript = document.querySelector('#transcript-body');
  episode.transcript.forEach(entry => {
    const block = document.createElement('div');
    block.className = 'transcript-entry';
    const label = document.createElement('h3');
    label.textContent = entry.label;
    const text = document.createElement('p');
    text.textContent = entry.text;
    block.append(label, text);
    if (entry.description) {
      const description = document.createElement('p');
      description.className = 'transcript-description';
      description.textContent = `Visual: ${entry.description}`;
      block.append(description);
    }
    transcript.append(block);
  });

  const progress = document.querySelector('#reading-progress');
  let ticking = false;
  const updateProgress = () => {
    const bounds = strip.getBoundingClientRect();
    const start = window.scrollY + bounds.top - window.innerHeight * 0.35;
    const end = start + strip.offsetHeight - window.innerHeight * 0.3;
    const value = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    progress.style.transform = `scaleX(${value})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
