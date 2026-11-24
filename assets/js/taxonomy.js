// Mind-map explorer for assets/data/metacognition-taxonomy.md (modelled on the
// Causality-and-LLM survey site's taxonomy explorer).
// The markdown is the single source of truth: "#" is the title, "##"/"###"/"####" are levels of
// the tree, and bullets (indented 4 spaces per level) continue below the nearest heading.
// "####" headings are always end points (leaf nodes). The lines under one are its details, shown
// in its drawer, never map nodes: "Problem:" and "Source:" (dash optional; a source is
// "Paper title<tab or space>URL"), and any other bullet becomes a note.
// Branch nodes open/close on click; end points open a details drawer. The open end point is kept
// in the URL hash (#/reasoning/tasks/...), so a view can be shared.
(() => {
  const SOURCE = '../assets/data/metacognition-taxonomy.md';
  const NODE_WIDTH = 190;
  const ROOT_WIDTH = 208;
  const COLUMN_GAP = 242;
  const ROW_GAP = 76;
  const LEAF_HEADING_LEVEL = 4; // "####"
  const AREA_HUES = [195, 262, 150, 28, 330, 50, 100];

  const $ = id => document.getElementById(id);
  const viewport = $('mindmap-viewport');
  const sizer = $('mindmap-sizer');
  const canvas = $('mindmap-canvas');
  const edgesLayer = $('mindmap-edges');
  const nodesLayer = $('mindmap-nodes');
  const search = $('topic-search');
  const empty = $('topic-empty');
  const toggleAll = $('toggle-all');
  const drawer = $('topic-drawer');

  const state = { expanded: new Set(), matches: new Set(), selectedId: null, zoom: 1, width: 900, height: 620, entries: [] };
  const byId = new Map();
  let root = null;

  // ---------- parsing ----------
  // Light clean-up of inline maths such as "$\\pi$" and doubled spaces.
  const GREEK = { pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ', lambda: 'λ', mu: 'μ', sigma: 'σ', phi: 'φ' };
  const cleanText = text => text
    .replace(/\$([^$]*)\$/g, (_, maths) => maths.replace(/\\([a-z]+)/gi, (m, name) => GREEK[name.toLowerCase()] ?? name))
    .replace(/\s{2,}/g, ' ')
    .trim();

  const slugify = text => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';

  const parse = markdown => {
    const top = { name: 'Taxonomy', children: [] };
    const stack = [top];
    let headingDepth = 0;
    for (const raw of markdown.split(/\r?\n/)) {
      if (!raw.trim()) continue;
      const heading = /^(#{1,6})\s+(.*)$/.exec(raw);
      if (heading) {
        const level = heading[1].length;
        if (level === 1) { top.name = heading[2].trim(); continue; }
        const depth = Math.min(level - 1, stack.length);
        const node = { name: heading[2].trim(), children: [] };
        stack[depth - 1].children.push(node);
        stack.length = depth;
        stack[depth] = node;
        headingDepth = depth;
        continue;
      }
      const bullet = /^(\s*)(?:[-*+]\s+)?(.*)$/.exec(raw);
      const text = bullet[2].trim();
      if (!text) continue;
      const detail = /^(problem|source)\s*:\s*(.*)$/i.exec(text);
      const owner = stack[headingDepth];
      const ownerIsLeaf = headingDepth >= LEAF_HEADING_LEVEL - 1;
      if (!detail && ownerIsLeaf) {
        (owner.notes ||= []).push(cleanText(text));
        continue;
      }
      if (detail) {
        if (detail[1].toLowerCase() === 'problem') {
          owner.problem = owner.problem ? `${owner.problem} ${cleanText(detail[2])}` : cleanText(detail[2]);
        } else {
          const link = /^(.*?)\s+(https?:\/\/\S+)\s*$/.exec(detail[2]);
          (owner.sources ||= []).push(link ? { title: cleanText(link[1]), url: link[2] } : { title: cleanText(detail[2]), url: '' });
        }
        continue;
      }
      const indent = bullet[1].replace(/\t/g, '    ').length;
      const depth = Math.min(headingDepth + 1 + Math.floor(indent / 4), stack.length);
      const node = { name: text, children: [] };
      stack[depth - 1].children.push(node);
      stack.length = depth;
      stack[depth] = node;
    }
    return top;
  };

  const index = (node, parent, branch) => {
    node.parent = parent;
    node.branch = branch;
    node.depth = parent ? parent.depth + 1 : 0;
    const used = new Set();
    node.children.forEach((child, i) => {
      let slug = slugify(child.name);
      while (used.has(slug)) slug += '-';
      used.add(slug);
      child.id = node.id ? `${node.id}/${slug}` : slug;
      index(child, node, parent ? branch : i);
    });
    node.leaves = node.children.length ? node.children.reduce((sum, c) => sum + c.leaves, 0) : 1;
    node.papers = (node.sources?.length ?? 0) + node.children.reduce((sum, c) => sum + c.papers, 0);
    node.searchText = [node.name, node.problem, ...(node.notes ?? []), ...(node.sources ?? []).map(src => src.title)].filter(Boolean).join(' ').toLowerCase();
    byId.set(node.id, node);
  };

  const ancestors = node => {
    const list = [];
    for (let n = node.parent; n; n = n.parent) list.unshift(n);
    return list;
  };
  const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
  const hueOf = node => AREA_HUES[Math.max(0, node.branch ?? 0) % AREA_HUES.length];
  const branchIds = () => [...byId.values()].filter(n => n.children.length).map(n => n.id);
  const countLabel = node => (node.papers ? plural(node.papers, 'paper') : plural(node.leaves, 'topic'));
  const hostOf = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const allPapers = () => [...byId.values()].filter(n => n.sources?.length).flatMap(n => n.sources.map(src => ({ ...src, node: n })));
  const nodeButton = id => nodesLayer.querySelector(`[data-id="${CSS.escape(id)}"]`);

  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key === 'style') el.style.cssText = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? '' : value);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  };

  // ---------- layout: a column per depth, leaves stacked top to bottom, parents centred on children ----------
  const layout = () => {
    const entries = [];
    const links = [];
    let nextY = 56;
    let deepest = 0;
    const visit = node => {
      const entry = { node, x: 56 + node.depth * COLUMN_GAP, y: 0, width: node.depth === 0 ? ROOT_WIDTH : NODE_WIDTH };
      entries.push(entry);
      deepest = Math.max(deepest, node.depth);
      if (node.children.length && state.expanded.has(node.id)) {
        const kids = node.children.map(visit);
        entry.y = (kids[0].y + kids[kids.length - 1].y) / 2;
        kids.forEach(kid => links.push([entry, kid]));
      } else {
        entry.y = nextY;
        nextY += ROW_GAP;
      }
      return entry;
    };
    visit(root);
    const contentHeight = Math.max(ROW_GAP, nextY);
    const height = Math.max(viewport.clientHeight || 620, contentHeight + 40);
    const shift = Math.max(0, (height - contentHeight) / 2);
    entries.forEach(e => { e.y += shift; });
    state.width = 56 + deepest * COLUMN_GAP + NODE_WIDTH + 90;
    state.height = height;
    return { entries, links };
  };

  const render = () => {
    const { entries, links } = layout();
    state.entries = entries;
    const focusedId = document.activeElement?.closest?.('.mind-node')?.dataset.id;
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    edgesLayer.setAttribute('viewBox', `0 0 ${state.width} ${state.height}`);
    edgesLayer.setAttribute('width', state.width);
    edgesLayer.setAttribute('height', state.height);
    edgesLayer.replaceChildren(...links.map(([from, to]) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const startX = from.x + from.width;
      const endX = to.x;
      const bend = startX + (endX - startX) / 2;
      path.setAttribute('d', `M ${startX} ${from.y} C ${bend} ${from.y}, ${bend} ${to.y}, ${endX} ${to.y}`);
      path.setAttribute('class', `depth-${from.node.depth}`);
      path.style.setProperty('--hue', hueOf(to.node));
      return path;
    }));

    nodesLayer.replaceChildren(...entries.map(entry => {
      const { node } = entry;
      const hasKids = node.children.length > 0;
      const classes = ['mind-node'];
      if (node.depth === 0) classes.push('root-node');
      if (state.matches.has(node.id)) classes.push('is-match');
      if (state.selectedId === node.id) classes.push('is-selected');
      return h('button', {
        type: 'button', class: classes.join(' '), 'data-id': node.id, role: 'treeitem',
        'aria-level': String(node.depth + 1), 'aria-expanded': hasKids ? String(state.expanded.has(node.id)) : null,
        style: `left:${entry.x}px;top:${entry.y}px;width:${entry.width}px;--hue:${hueOf(node)}`,
        onclick: () => (hasKids ? toggle(node) : openTopic(node)),
      },
      h('span', {},
        h('span', { class: 'mind-label' }, node.name),
        h('span', { class: 'mind-count' }, countLabel(node))),
      h('span', { class: hasKids ? 'mind-toggle' : 'mind-leaf-arrow', 'aria-hidden': 'true' }, hasKids ? '+' : '→'));
    }));

    $('visible-topics').textContent = entries.length;
    toggleAll.textContent = state.expanded.size === branchIds().length ? 'Collapse all' : 'Expand all';
    applyZoom();
    if (focusedId != null) nodeButton(focusedId)?.focus({ preventScroll: true });
  };

  // ---------- zoom / pan ----------
  const applyZoom = () => {
    canvas.style.transform = `scale(${state.zoom})`;
    sizer.style.width = `${Math.max(viewport.clientWidth, state.width * state.zoom)}px`;
    sizer.style.height = `${Math.max(viewport.clientHeight, state.height * state.zoom)}px`;
  };

  const setZoom = value => {
    const previous = state.zoom;
    const cx = viewport.scrollLeft + viewport.clientWidth / 2;
    const cy = viewport.scrollTop + viewport.clientHeight / 2;
    state.zoom = Math.max(0.18, Math.min(1.4, value));
    applyZoom();
    viewport.scrollLeft = cx * (state.zoom / previous) - viewport.clientWidth / 2;
    viewport.scrollTop = cy * (state.zoom / previous) - viewport.clientHeight / 2;
  };

  const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

  const fitMap = () => {
    const scale = Math.min((viewport.clientWidth - 36) / state.width, (viewport.clientHeight - 36) / state.height, 1.08);
    state.zoom = Math.max(0.18, scale);
    applyZoom();
    viewport.scrollTo({ left: 0, top: Math.max(0, (state.height * state.zoom - viewport.clientHeight) / 2), behavior: smooth() });
  };

  // Scrolls the map so a node is in view, centred vertically. On wide maps it sits a little in
  // from the left so its parent stays visible; on narrow (phone) maps it is centred.
  const reveal = node => {
    const entry = state.entries.find(e => e.node === node);
    if (!entry) return;
    const narrow = viewport.clientWidth < 700;
    viewport.scrollTo({
      left: Math.max(0, narrow
        ? (entry.x + entry.width / 2) * state.zoom - viewport.clientWidth / 2
        : (entry.x - COLUMN_GAP * 0.6) * state.zoom),
      top: Math.max(0, entry.y * state.zoom - viewport.clientHeight / 2),
      behavior: smooth(),
    });
  };

  let pan = null;
  viewport.addEventListener('pointerdown', event => {
    if (event.target.closest('.mind-node') || event.button !== 0) return;
    pan = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.classList.add('is-panning');
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (!pan) return;
    viewport.scrollLeft = pan.left - (event.clientX - pan.x);
    viewport.scrollTop = pan.top - (event.clientY - pan.y);
  });
  const endPan = () => { pan = null; viewport.classList.remove('is-panning'); };
  viewport.addEventListener('pointerup', endPan);
  viewport.addEventListener('pointercancel', endPan);

  // ---------- actions ----------
  const toggle = node => {
    if (state.expanded.has(node.id)) {
      // closing a branch closes everything below it too
      [...state.expanded].forEach(id => {
        if (id === node.id || (node.id && id.startsWith(`${node.id}/`)) || node.depth === 0) state.expanded.delete(id);
      });
    } else {
      state.expanded.add(node.id);
    }
    render();
  };

  const setAll = open => {
    state.expanded = open ? new Set(branchIds()) : new Set(['']);
    if (beforeSearch) beforeSearch = new Set(state.expanded);
    if (!open) state.zoom = 1;
    render();
    if (open) setTimeout(fitMap, 0);
    else viewport.scrollTo({ left: 0, top: 0 });
  };

  // Search opens the branches leading to matches on top of the layout from before the search
  // started, so typing letter by letter doesn't leave everything open; clearing restores it.
  let beforeSearch = null;
  const runSearch = value => {
    const term = value.trim().toLowerCase();
    state.matches.clear();
    empty.hidden = true;
    if (term && !beforeSearch) beforeSearch = new Set(state.expanded);
    if (beforeSearch) state.expanded = new Set(beforeSearch);
    if (!term) beforeSearch = null;
    if (term) {
      byId.forEach(node => {
        if (node.depth > 0 && node.searchText.includes(term)) {
          state.matches.add(node.id);
          ancestors(node).forEach(a => state.expanded.add(a.id));
        }
      });
      empty.hidden = state.matches.size > 0;
    }
    render();
    const first = [...state.matches][0];
    if (first != null) reveal(byId.get(first));
  };

  const goToNode = node => {
    closeDrawer({ refocus: false });
    ancestors(node).forEach(a => state.expanded.add(a.id));
    if (node.children.length) state.expanded.add(node.id);
    render();
    reveal(node);
    nodeButton(node.id)?.focus({ preventScroll: true });
  };

  const openTopic = (node, { updateHash = true } = {}) => {
    state.selectedId = node.id;
    ancestors(node).forEach(a => state.expanded.add(a.id));
    drawer.hidden = false;
    drawer.style.setProperty('--hue', hueOf(node));
    const trail = ancestors(node).slice(1);
    $('breadcrumbs').replaceChildren(...trail.map(a => h('span', {}, a.name)));
    $('selected-title').textContent = node.name;
    $('selected-meta').textContent = node.sources?.length ? `${countLabel(node)} · ${trail[0]?.name ?? root.name}` : `${trail[0]?.name ?? root.name}`;
    $('copy-link').hidden = false;
    const siblings = node.parent.children.filter(s => s !== node);
    $('drawer-body').replaceChildren(...[
      node.problem ? h('section', {},
        h('p', { class: 'drawer-kicker' }, 'Problem'),
        h('p', { class: 'problem-text' }, node.problem)) : null,
      node.sources?.length ? h('section', {},
        h('p', { class: 'drawer-kicker' }, node.sources.length === 1 ? 'Source' : 'Sources'),
        h('div', { class: 'paper-list' }, node.sources.map(paperCard))) : null,
      node.notes?.length ? h('section', {},
        h('p', { class: 'drawer-kicker' }, 'Notes'),
        h('ul', { class: 'note-list' }, node.notes.map(note => h('li', {}, note)))) : null,
      h('section', {},
        h('p', { class: 'drawer-kicker' }, 'Where it sits'),
        h('ol', { class: 'leaf-path' },
          [...trail, node].map((n, i, all) => h('li', { class: i === all.length - 1 ? 'here' : null },
            i === all.length - 1 ? h('span', {}, n.name) : h('button', { type: 'button', onclick: () => goToNode(n) }, n.name))))),
      siblings.length ? h('section', {},
        h('p', { class: 'drawer-kicker' }, `Also under ${node.parent.name}`),
        h('ul', { class: 'sibling-list' }, siblings.map(s => h('li', {},
          h('button', { type: 'button', onclick: () => (s.children.length ? goToNode(s) : openTopic(s)) },
            h('span', {}, s.name), h('span', { class: 'sibling-meta' }, countLabel(s))))))) : null,
    ].filter(Boolean));
    if (updateHash) history.replaceState(null, '', `#/${node.id}`);
    render();
    drawer.scrollTop = 0;
    $('selected-title').focus({ preventScroll: true });
  };

  function paperCard(paper, i, list, { showPath = false } = {}) {
    return h('article', { class: 'paper-card' },
      list.length > 1 ? h('span', { class: 'paper-number' }, String(i + 1).padStart(2, '0')) : null,
      h('div', {},
        h('h3', { class: 'paper-title' }, paper.url
          ? h('a', { href: paper.url, target: '_blank', rel: 'noopener noreferrer' }, paper.title)
          : paper.title),
        h('p', { class: 'paper-meta' },
          showPath ? h('button', { type: 'button', class: 'paper-topic', onclick: () => openTopic(paper.node) },
            [...ancestors(paper.node).slice(1), paper.node].map(n => n.name).join(' › ')) : null,
          !showPath && paper.url ? hostOf(paper.url) : null)));
  }

  const showAllPapers = ({ updateHash = true } = {}) => {
    const papers = allPapers();
    state.selectedId = null;
    drawer.hidden = false;
    drawer.style.setProperty('--hue', 195);
    $('breadcrumbs').replaceChildren(h('span', {}, root.name));
    $('selected-title').textContent = 'All papers';
    $('selected-meta').textContent = `${plural(papers.length, 'paper')} indexed`;
    $('copy-link').hidden = false;
    $('drawer-body').replaceChildren(h('section', {},
      h('div', { class: 'paper-list' }, papers.map((paper, i, list) => paperCard(paper, i, list, { showPath: true })))));
    if (updateHash) history.replaceState(null, '', '#all-papers');
    render();
    drawer.scrollTop = 0;
    $('selected-title').focus({ preventScroll: true });
  };

  const closeDrawer = ({ refocus = true } = {}) => {
    if (drawer.hidden) return;
    const id = state.selectedId;
    drawer.hidden = true;
    state.selectedId = null;
    history.replaceState(null, '', location.pathname + location.search);
    render();
    if (refocus && id != null) nodeButton(id)?.focus({ preventScroll: true });
  };

  const restoreFromHash = () => {
    if (location.hash === '#all-papers') { showAllPapers({ updateHash: false }); return; }
    const node = byId.get(decodeURIComponent(location.hash.replace(/^#\/?/, '')));
    if (!node || node.depth === 0) return;
    if (node.children.length) goToNode(node);
    else {
      openTopic(node, { updateHash: false });
      requestAnimationFrame(() => reveal(node));
    }
  };

  // ---------- fullscreen ----------
  // Uses the browser's Fullscreen API when available; otherwise (e.g. iPhone Safari) the explorer
  // is pinned over the whole window with CSS. Either way the map grows to fill the space.
  const explorer = $('explorer');
  const fsButton = $('fullscreen');
  const isFullscreen = () => explorer.classList.contains('is-fullscreen');
  const setFullscreenUI = on => {
    explorer.classList.toggle('is-fullscreen', on);
    document.documentElement.classList.toggle('taxonomy-fullscreen', on);
    fsButton.setAttribute('aria-pressed', String(on));
    fsButton.querySelector('.fs-label').textContent = on ? 'Exit' : 'Fullscreen';
    fsButton.title = on ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)';
    if (root) requestAnimationFrame(() => { render(); });
  };
  const enterFullscreen = async () => {
    setFullscreenUI(true);
    try { await explorer.requestFullscreen?.({ navigationUI: 'hide' }); } catch { /* CSS fallback stays on */ }
  };
  const exitFullscreen = async () => {
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch { /* ignore */ } }
    setFullscreenUI(false);
  };
  fsButton.addEventListener('click', () => (isFullscreen() ? exitFullscreen() : enterFullscreen()));
  // Leaving native fullscreen with the browser's own Esc/gesture also leaves our mode.
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isFullscreen()) setFullscreenUI(false);
  });

  $('all-papers').addEventListener('click', () => showAllPapers());
  toggleAll.addEventListener('click', () => setAll(state.expanded.size !== branchIds().length));
  search.addEventListener('input', () => runSearch(search.value));
  $('zoom-in').addEventListener('click', () => setZoom(state.zoom + 0.12));
  $('zoom-out').addEventListener('click', () => setZoom(state.zoom - 0.12));
  $('fit-map').addEventListener('click', fitMap);
  $('close-drawer').addEventListener('click', () => closeDrawer());
  $('copy-link').addEventListener('click', async event => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(location.href);
      button.textContent = 'Link copied';
    } catch {
      button.textContent = 'Copy unavailable';
    }
    setTimeout(() => { button.textContent = 'Copy section link'; }, 1800);
  });
  document.addEventListener('keydown', event => {
    const typing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (event.key === '/' && !typing) { event.preventDefault(); search.focus(); }
    if ((event.key === 'f' || event.key === 'F') && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      isFullscreen() ? exitFullscreen() : enterFullscreen();
      return;
    }
    if (event.key === 'Escape' && !drawer.hidden) { closeDrawer(); return; }
    if (event.key === 'Escape' && isFullscreen() && !document.fullscreenElement && document.activeElement !== search) { exitFullscreen(); return; }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; runSearch(''); search.blur(); }
  });
  window.addEventListener('hashchange', restoreFromHash);
  window.addEventListener('resize', () => { if (root) render(); });

  // ---------- load ----------
  fetch(SOURCE, { cache: 'no-cache' })
    .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.text(); })
    .then(markdown => {
      root = parse(markdown);
      root.id = '';
      index(root, null, -1);
      let branches = 0;
      byId.forEach(n => { if (n.depth > 0 && n.children.length) branches += 1; });
      const papers = allPapers().length;
      $('taxonomy-stats').textContent = `${plural(root.children.length, 'area')} · ${branches} branches · ${plural(root.leaves, 'topic')}${papers ? ` · ${plural(papers, 'paper')}` : ''}`;
      $('all-papers').hidden = papers === 0;
      state.expanded.add('');
      render();
      restoreFromHash();
    })
    .catch(error => {
      empty.hidden = false;
      empty.textContent = `Couldn't load the taxonomy (${error.message}). If you opened this file directly, serve the folder over HTTP instead.`;
    });
})();
