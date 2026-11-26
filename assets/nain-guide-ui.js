const directory = document.querySelector('#directory');
const directoryInput = document.querySelector('#directory-search');
const directoryLinks = [...directory.querySelectorAll('[data-topic]')];
document.querySelectorAll('[data-directory]').forEach((button) => {
  button.addEventListener('click', () => {
    directory.showModal();
    directoryInput.focus();
  });
});
const normalize = (value) => value.toLowerCase().replace(/[\s·-]/g, '');
directoryInput.addEventListener('input', () => {
  const query = normalize(directoryInput.value);
  for (const link of directoryLinks) link.hidden = !normalize(link.textContent).includes(query);
  directory.querySelector('[data-no-results]').hidden = directoryLinks.some((link) => !link.hidden);
});

const lightbox = document.querySelector('#lightbox');
if (lightbox) {
  for (const button of document.querySelectorAll('[data-photo]')) {
    button.addEventListener('click', () => {
      const image = lightbox.querySelector('img');
      lightbox.querySelector('h2').textContent = button.dataset.caption;
      image.alt = button.dataset.caption;
      image.src = button.dataset.photo;
      lightbox.showModal();
    });
  }
}
const filters = [...document.querySelectorAll('[data-filter]')];
for (const filter of filters) {
  filter.addEventListener('click', () => {
    for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
    for (const photo of document.querySelectorAll('[data-category]')) {
      photo.hidden = filter.dataset.filter !== 'all' && photo.dataset.category !== filter.dataset.filter;
    }
  });
}

const chat = document.querySelector('#consultation');
const log = chat.querySelector('[role="log"]');
document.querySelector('[data-chat]').addEventListener('click', () => chat.showModal());
const appendBubble = (text, side) => {
  const bubble = document.createElement('p');
  bubble.className = 'bubble';
  bubble.dataset.side = side;
  bubble.textContent = text;
  log.append(bubble);
};
for (const button of chat.querySelectorAll('[data-reply]')) {
  button.addEventListener('click', () => {
    appendBubble(button.textContent, 'user');
    appendBubble(button.dataset.reply, 'agent');
    log.scrollTop = log.scrollHeight;
  });
}
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const guideProgress = document.querySelector('[data-guide-progress]');
if (guideProgress) {
  const items = [...document.querySelectorAll('.guide-checklist input')];
  const updateProgress = () => {
    const checked = items.filter((item) => item.checked).length;
    guideProgress.textContent = `완료 ${checked} / ${items.length}`;
  };
  for (const item of items) item.addEventListener('change', updateProgress);
  updateProgress();
}

const guideResults = document.querySelector('[data-guide-results]');
if (guideResults && typeof nainGuideIndex !== 'undefined') {
  const catalogStatus = guideResults.querySelector('[data-result-count]');
  const catalogLinks = guideResults.querySelector('[data-guide-links]');
  const root = new URL(guideResults.dataset.root, document.baseURI);
  const terms = (entry) => normalize(entry.title + ' ' + entry.family + ' ' + entry.intro);
  const catalog = nainGuideIndex.map((entry) => ({...entry, terms: terms(entry)}));
  directoryInput.addEventListener('input', () => {
    const query = normalize(directoryInput.value);
    const matched = query ? catalog.filter((entry) => entry.terms.includes(query)) : [];
    const fragment = document.createDocumentFragment();
    for (const entry of matched.slice(0, 12)) {
      const link = document.createElement('a');
      const category = document.createElement('span');
      category.textContent = entry.family;
      link.href = new URL(entry.path, root).href;
      link.append(category, entry.title);
      fragment.append(link);
    }
    catalogLinks.replaceChildren(fragment);
    guideResults.hidden = matched.length === 0;
    catalogStatus.textContent = matched.length > 12 ? `${matched.length}개 중 12개 표시. 검색어를 좁혀보세요.` : `${matched.length}개`;
    directory.querySelector('[data-no-results]').hidden = matched.length !== 0 || directoryLinks.some((link) => !link.hidden);
  });
}
