
  const paragraphs = [
    "There was once a slave who was treated cruelly by his master. One day, he couldn't take it anymore and ran away to the forest to escape. There he chanced upon a lion who couldn't walk because of the thorn in its paw. Although scared, the slave mustered his courage and took out the thorn in the lion's paw.",
    "Once there was a dog who wandered the streets night and day in search of food. One day, he found a big juicy bone and grabbed it between his mouth. On his way home, he crossed a river and saw another dog with a bone. He wanted that bone too. As he opened his mouth, his own bone fell into the river and sank.",
    "There was once a shepherd boy who liked to play tricks. One day while watching the herd, he cried wolf! wolf! The people rushed over but were disappointed to find no wolf. On the third day, a real wolf came and the boy cried for help but no one believed him.",
    "A crow was very thirsty. He flew around looking for water but could not find any. At last, he saw a pitcher of water. He picked up small stones one by one and dropped them into the pitcher. Slowly the water rose until he could drink and quench his thirst.",
    "A tortoise and a hare argued about who was faster. They decided to race. The hare ran fast and stopped to nap feeling confident. The tortoise kept walking slowly and steadily. When the hare woke up, the tortoise had already crossed the finish line."
  ];

  let text = '', index = 0, mistakes = 0, keyed = 0;
  let timeLeft = 60, started = false, over = false;
  let timer = null, pendingWPM = 0;

  const display    = document.getElementById('textDisplay');
  const timeEl     = document.getElementById('timeLeft');
  const timeStatItem = document.getElementById('timeStatItem');
  const mistakeEl  = document.getElementById('mistakeCount');
  const wpmEl      = document.getElementById('wpmCount');
  const refreshBtn = document.getElementById('refreshBtn');
  const nameModal  = document.getElementById('nameModal');
  const rankModal  = document.getElementById('rankModal');
  const nameInput  = document.getElementById('playerNameInput');
  const rankList   = document.getElementById('rankingList');
  const timeoutBadge = document.getElementById('timeoutBadge');

  function init() {
    clearInterval(timer);
    index = mistakes = keyed = 0;
    timeLeft = 60; started = over = false;
    timeEl.textContent = 60;
    mistakeEl.textContent = wpmEl.textContent = 0;
    timeStatItem.classList.remove('danger');
    timeoutBadge.classList.remove('show');
    refreshBtn.textContent = 'Refresh';

    text = paragraphs[Math.floor(Math.random() * paragraphs.length)];

    // Render: huruf pertama = current (tak blur), lain = blurred
    display.innerHTML = text.split('').map((c, i) =>
      `<span class="char ${i === 0 ? 'current' : 'blurred'}">${c}</span>`
    ).join('');
  }

  document.addEventListener('keydown', (e) => {
    if (over || e.ctrlKey || e.altKey || (e.key.length !== 1 && e.key !== 'Backspace')) return;

    // Mula timer & unblur SEMUA huruf bila mula taip
    if (!started) {
      started = true;
      refreshBtn.textContent = 'Restart';
      display.querySelectorAll('.blurred').forEach(s => s.classList.remove('blurred'));
      timer = setInterval(() => {
        timeEl.textContent = --timeLeft;
        calcWPM();
        if (timeLeft <= 10) timeStatItem.classList.add('danger');
        if (timeLeft <= 0) endGame(true);
      }, 1000);
    }

    const spans = display.querySelectorAll('span');

    if (e.key === 'Backspace' && index > 0) {
      spans[index].classList.remove('current');
      spans[--index].className = 'char current';
      return;
    }

    if (index >= text.length) return;

    spans[index].classList.remove('current');
    spans[index].classList.add(e.key === text[index] ? 'correct' : 'wrong');
    if (e.key !== text[index]) mistakeEl.textContent = ++mistakes;

    keyed++;
    calcWPM();

    if (++index < spans.length) spans[index].classList.add('current');
    else endGame(false);
  });

  function calcWPM() {
    const elapsed = 60 - timeLeft;
    if (elapsed > 0) wpmEl.textContent = Math.max(0, Math.round(((keyed - mistakes) / 5) / elapsed * 60));
  }

  function endGame(timeout) {
    clearInterval(timer);
    over = true;
    calcWPM();
    pendingWPM = +wpmEl.textContent;

    if (timeout) {
      timeoutBadge.classList.add('show');
      setTimeout(() => { timeoutBadge.classList.remove('show'); showNameModal(); }, 1200);
    } else {
      showNameModal();
    }
  }

  function showNameModal() {
    nameInput.value = '';
    nameModal.classList.add('show');
    nameInput.focus();
  }

  function save() {
    const name = nameInput.value.trim() || 'Guest';
    nameModal.classList.remove('show');

    let records = JSON.parse(localStorage.getItem('WPMrecord') || '[]');
    records.push({ name, wpm: pendingWPM });
    records = records.sort((a, b) => b.wpm - a.wpm).slice(0, 10);
    localStorage.setItem('WPMrecord', JSON.stringify(records));

    rankList.innerHTML = records.length
      ? records.map((r, i) => `
          <div class="rank-item">
            <span class="rank-num">${i + 1}</span>
            <span class="rank-name">${r.name}</span>
            <span class="rank-wpm">${r.wpm}<span class="rank-wpm-label"> WPM</span></span>
          </div>`).join('')
      : '<p class="rank-empty">Tiada rekod lagi.</p>';

    rankModal.classList.add('show');
  }

  document.getElementById('saveScoreBtn').addEventListener('click', save);
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
  document.getElementById('closeRankBtn').addEventListener('click', () => {
    rankModal.classList.remove('show');
    init();
  });
  refreshBtn.addEventListener('click', init);

  init();
