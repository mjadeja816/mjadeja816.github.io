'use strict';
(() => {
  const nav = document.querySelector('#site-nav');
  const menu = document.querySelector('.menu-button');
  if (menu && nav) {
    const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); };
    menu.addEventListener('click', () => {
      const open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
    nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  }

  const dialog = document.querySelector('#photo-dialog');
  let galleryTrigger;
  if (dialog && typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-lightbox]').forEach(trigger => trigger.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); galleryTrigger = trigger;
      const image = dialog.querySelector('img');
      image.src = trigger.href; image.alt = trigger.querySelector('img').alt;
      dialog.querySelector('#lightbox-caption').textContent = trigger.dataset.caption;
      dialog.showModal(); dialog.querySelector('button').focus();
    }));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { if (galleryTrigger) galleryTrigger.focus(); });
  }

  document.querySelectorAll('[data-video-id]').forEach(trigger => trigger.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = trigger.dataset.videoId;
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) { window.location.href = trigger.href; return; }
    const frame = document.createElement('iframe');
    frame.className = 'video-player'; frame.title = trigger.dataset.videoTitle;
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true; frame.referrerPolicy = 'strict-origin-when-cross-origin';
    trigger.replaceWith(frame); frame.focus();
  }));

  const filters = document.querySelector('#talk-filters');
  if (filters) {
    const fields = Array.from(filters.querySelectorAll('input, select'));
    const rows = Array.from(document.querySelectorAll('[data-talk]'));
    const count = document.querySelector('#talk-count');
    const empty = document.querySelector('#no-talks');
    const applyFilters = (updateUrl = true) => {
      const data = new FormData(filters);
      const query = String(data.get('q') || '').trim().toLowerCase();
      const topic = data.get('topic'), year = data.get('year'), audience = data.get('audience');
      let visible = 0;
      rows.forEach(row => {
        const matches = (!query || query.split(/\s+/).every(word => row.dataset.search.includes(word))) && (!topic || row.dataset.topic === topic) && (!year || row.dataset.year === year) && (!audience || row.dataset.audience === audience);
        row.hidden = !matches; if (matches) visible += 1;
      });
      count.textContent = `Showing ${visible} of ${rows.length} sessions`;
      empty.hidden = visible !== 0;
      if (updateUrl) {
        const url = new URL(window.location.href);
        for (const [key, value] of data.entries()) { value ? url.searchParams.set(key, value) : url.searchParams.delete(key); }
        history.replaceState(null, '', url);
      }
    };
    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      fields.forEach(field => { field.value = params.get(field.name) || ''; });
      applyFilters(false);
    };
    fields.forEach(field => field.addEventListener(field.tagName === 'SELECT' ? 'change' : 'input', () => applyFilters()));
    filters.addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
    window.addEventListener('popstate', readUrl);
    readUrl();
  }

  const contact = document.querySelector('#contact-form');
  if (contact) {
    const email = 'mahipaljadeja.cse@mnit.ac.in';
    const status = document.querySelector('#contact-status');
    const requestedPurpose = new URLSearchParams(window.location.search).get('enquiry');
    const purpose = contact.elements.namedItem('purpose');
    if (requestedPurpose && Array.from(purpose.options).some(option => option.value === requestedPurpose)) purpose.value = requestedPurpose;
    const draft = () => {
      if (!contact.reportValidity()) return null;
      const data = new FormData(contact);
      const name = String(data.get('name')).trim();
      const from = String(data.get('email')).trim();
      const organization = String(data.get('organization')).trim();
      const subject = `${data.get('purpose')} — ${name}`;
      const body = `Dear Dr. Jadeja,\n\n${String(data.get('message')).trim()}\n\nBest regards,\n${name}${organization ? '\n' + organization : ''}\n${from}`;
      return { subject, body };
    };
    contact.addEventListener('submit', event => {
      event.preventDefault(); const message = draft(); if (!message) return;
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
      status.textContent = 'Your email app should open with a draft. Review it and press Send there. If it does not open, use Gmail or copy your message.';
    });
    document.querySelector('#gmail-compose').addEventListener('click', () => {
      const message = draft(); if (!message) return;
      const url = new URL('https://mail.google.com/mail/');
      url.search = new URLSearchParams({ view: 'cm', fs: '1', to: email, su: message.subject, body: message.body }).toString();
      window.open(url.href, '_blank', 'noopener,noreferrer');
      status.textContent = 'Gmail opens in a new tab. Review the draft and press Send there.';
    });
    const copy = async (text, success) => {
      try { await navigator.clipboard.writeText(text); status.textContent = success; }
      catch {
        const area = document.createElement('textarea'); area.value = text; area.setAttribute('aria-label', 'Text to copy'); area.style.cssText = 'position:fixed;inset:20px;width:calc(100% - 40px);height:180px;z-index:100;background:white;color:#10273b;padding:18px';
        document.body.appendChild(area); area.select();
        const copied = document.execCommand('copy');
        if (copied) { area.remove(); status.textContent = success; }
        else { status.textContent = 'Select and copy the text shown, then press Escape to close it.'; area.addEventListener('keydown', event => { if (event.key === 'Escape') area.remove(); }); }
      }
    };
    document.querySelector('#copy-message').addEventListener('click', () => { const message = draft(); if (message) copy(`To: ${email}\nSubject: ${message.subject}\n\n${message.body}`, 'Message copied. Paste it into your email service, review, and send.'); });
    document.querySelector('#copy-email').addEventListener('click', () => copy(email, 'Email address copied.'));
  }
})();
