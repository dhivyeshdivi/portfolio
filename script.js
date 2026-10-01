/* Dhivyesh S portfolio: interactions
   Features: theme toggle, mobile menu, active nav link, interactive terminal,
   skill filter, copy email, contact form (opens email app), footer year. */

(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const EMAIL = 'dhivyeshdivi@gmail.com';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeBtn = $('#theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');

  function readTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function saveTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage unavailable */ }
  }
  function applyTheme(theme) {
    root.dataset.theme = theme;
    themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
    $('.label', themeBtn).textContent = theme === 'light' ? 'Dark mode' : 'Light mode';
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f4f7fb' : '#0a1020');
  }
  function toggleTheme() {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    saveTheme(next);
    return next;
  }

  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(readTheme() || (prefersLight ? 'light' : 'dark'));
  themeBtn.addEventListener('click', toggleTheme);

  /* ---------- Mobile menu ---------- */
  const nav = $('#site-nav');
  const navToggle = $('#nav-toggle');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('a', nav);
  const sections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Interactive terminal ---------- */
  const outEl = $('#term-output');
  const bodyEl = $('#term-body');
  const formEl = $('#term-form');
  const inputEl = $('#term-input');

  const history = [];
  let historyIndex = 0;
  let booting = true;

  const scrollDown = () => { bodyEl.scrollTop = bodyEl.scrollHeight; };

  function print(lines, cls = '') {
    const frag = document.createDocumentFragment();
    lines.forEach((text) => {
      const div = document.createElement('div');
      div.className = ('out ' + cls).trim();
      div.textContent = text === '' ? '\u00a0' : text;
      frag.appendChild(div);
    });
    outEl.appendChild(frag);
    scrollDown();
  }

  function echo(cmd) {
    const div = document.createElement('div');
    div.className = 'echo';
    div.setAttribute('aria-hidden', 'true');
    div.textContent = '$ ' + cmd;
    outEl.appendChild(div);
    scrollDown();
  }

  const helpText = {
    whoami: 'a short introduction',
    about: 'what I am interested in',
    education: 'where I study',
    skills: 'what I am learning and using',
    projects: 'projects and activities',
    focus: 'what I am working on now',
    contact: 'how to reach me',
    theme: 'switch light and dark mode',
    clear: 'clear the terminal',
  };

  const commands = {
    help: () => [
      'Available commands:',
      ...Object.keys(helpText).map((name) => '  ' + name.padEnd(11) + helpText[name]),
      '',
      'Tip: press Tab to complete a command, and the up arrow for history.',
    ],
    whoami: () => [
      'Dhivyesh S',
      'B.Tech Information Technology, 2nd year',
      'KGiSL Institute of Technology, Coimbatore',
    ],
    about: () => [
      'I am interested in cybersecurity, ethical hacking, networking and',
      'software development. I learn by building projects and finding out',
      'how systems work.',
      '',
      'Goal: grow into a cybersecurity or software engineering role.',
    ],
    education: () => [
      'B.Tech in Information Technology (2nd year)',
      'KGiSL Institute of Technology, Coimbatore',
    ],
    skills: () => [
      'Programming   Python, C, C++, Java (foundational)',
      'Security       security fundamentals, ethical hacking concepts',
      'Systems        networking fundamentals, Linux basics, command line',
      'Tools          Git, GitHub, VS Code',
    ],
    projects: () => [
      '- AI Lost-Item Reunion System (concept)',
      '  Match lost and found items by image similarity, location and time.',
      '- Dynamic Bus-Bunching Corrector (concept)',
      '  Detect bus bunching and suggest schedule adjustments.',
      '- E-Mobility HackFest 2026 (hackathon)',
      '  Team MEGA MINDS, shortlisted for the final round.',
    ],
    focus: () => [
      '- Programming and problem-solving fundamentals',
      '- Linux and computer networking',
      '- Cybersecurity through legal, authorised labs',
      '- Building and documenting practical projects',
      '- Communication and technical presentation skills',
    ],
    contact: () => [
      'Email: ' + EMAIL,
      'Scroll to the Contact section to copy it or write a message.',
    ],
    theme: () => ['Switched to ' + toggleTheme() + ' mode.'],
    clear: () => { outEl.replaceChildren(); return null; },
    sudo: () => ['Permission denied. Nice try though.'],
  };

  function run(raw) {
    const name = raw.trim().toLowerCase().split(/\s+/)[0];
    if (!name) return;
    const fn = Object.prototype.hasOwnProperty.call(commands, name) ? commands[name] : null;
    if (!fn) {
      print(['command not found: ' + name + '. Type "help" to see what is available.'], 'err');
      return;
    }
    const lines = fn();
    if (lines) print(lines);
  }

  function execute(cmd) {
    if (booting) return;
    echo(cmd);
    run(cmd);
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = inputEl.value.trim();
    inputEl.value = '';
    if (!value) return;
    history.push(value);
    historyIndex = history.length;
    execute(value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) historyIndex -= 1;
      inputEl.value = history[historyIndex] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length) historyIndex += 1;
      inputEl.value = history[historyIndex] || '';
    } else if (e.key === 'Tab') {
      const typed = inputEl.value.trim().toLowerCase();
      if (!typed) return;
      const match = Object.keys(commands).filter((c) => c !== 'sudo' && c.startsWith(typed));
      if (match.length === 1) {
        e.preventDefault();
        inputEl.value = match[0];
      }
    }
  });

  // Clicking anywhere in the terminal focuses the input
  bodyEl.addEventListener('click', () => {
    if (!window.getSelection().toString()) inputEl.focus({ preventScroll: true });
  });

  $$('.term-shortcuts button').forEach((btn) => {
    btn.addEventListener('click', () => execute(btn.dataset.cmd));
  });

  // Intro: type "whoami" once, then show the result
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function boot() {
    const line = document.createElement('div');
    line.className = 'echo';
    line.setAttribute('aria-hidden', 'true');
    outEl.appendChild(line);

    const text = 'whoami';
    if (reduceMotion) {
      line.textContent = '$ ' + text;
    } else {
      line.textContent = '$ ';
      await sleep(500);
      for (const ch of text) {
        line.textContent += ch;
        await sleep(90);
      }
      await sleep(250);
    }

    print(commands.whoami());
    print(['', 'Type "help" to see what else you can ask.'], 'dim');
    booting = false;
  }
  boot();

  /* ---------- Skill filter ---------- */
  const filterBtns = $$('.filter');
  const skillItems = $$('#skill-list li');
  const skillCount = $('#skill-count');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      let shown = 0;
      skillItems.forEach((item) => {
        const visible = filter === 'all' || item.dataset.cat === filter;
        item.hidden = !visible;
        if (visible) shown += 1;
      });
      skillCount.textContent = 'Showing ' + shown + ' skills';
    });
  });

  /* ---------- Copy email ---------- */
  const copyBtn = $('#copy-email');
  const copyStatus = $('#copy-status');
  let copyTimer;

  function showCopyStatus(message) {
    copyStatus.textContent = message;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyStatus.textContent = ''; }, 2500);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      showCopyStatus('Email copied to clipboard.');
    } catch (err) {
      // Fallback for browsers without clipboard access
      const temp = document.createElement('textarea');
      temp.value = EMAIL;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      temp.remove();
      showCopyStatus(ok ? 'Email copied to clipboard.' : 'Could not copy. Please copy it manually.');
    }
  }
  copyBtn.addEventListener('click', copyEmail);

  /* ---------- Contact form (opens the visitor's email app) ---------- */
  $('#contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#cf-name').value.trim();
    const message = $('#cf-message').value.trim();
    if (!name || !message) return;
    const subject = 'Portfolio message from ' + name;
    const body = message + '\n\n' + name;
    window.location.href =
      'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
