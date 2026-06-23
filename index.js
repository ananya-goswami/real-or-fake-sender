const JUDGE_SCREENS = [
  {
    id: 'sbi',
    platform: 'Text Message',
    avatar: 'SBI',
    sender: 'SBI',
    message: 'Your bank account needs checking today. Please verify your details now at sbi-secure.xyz to keep using your account.',
    verdict: 'fake',
    warning: 'Fake Bank Link',
    explanation: 'The link is not from the real bank website. Fake links copy trusted names to trick people.'
  },
  {
    id: 'hdfc',
    platform: 'Text Message',
    avatar: 'HD',
    sender: 'HDFC Bank',
    message: 'A payment of 500 rupees was made from your account today. If this was not you, call the bank help number printed on your card.',
    verdict: 'real',
    warning: 'Transaction Alert',
    explanation: 'This message only tells you about a payment. It does not ask for a password or send you to a strange link.'
  },
  {
    id: 'jio',
    platform: 'Text Message',
    avatar: 'JIO',
    sender: 'Jio',
    message: 'You have won free mobile data for many days. Click now and fill in your details before this special offer ends.',
    verdict: 'fake',
    warning: 'Too Good and Rushed',
    explanation: 'Free data plus "click now" is a pressure trick. Real offers should be checked in the official company app.'
  },
  {
    id: 'amazon',
    platform: 'Text Message',
    avatar: 'AZ',
    sender: 'Amazon',
    message: 'Your order number XD8821 has shipped and is on the way. You can check delivery updates in your shopping app.',
    verdict: 'real',
    warning: 'Order Update',
    explanation: 'This is a simple shipping update. It does not ask you to click a strange link, pay money, or share private details.'
  },
  {
    id: 'upi',
    platform: 'Text Message',
    avatar: 'UPI',
    sender: 'UPI Alert',
    message: 'Your payment app is in danger and may stop working soon. Reset it right now using this link: upipay.net',
    verdict: 'fake',
    warning: 'Fear and Fake Link',
    explanation: 'Scammers use scary words to make you hurry. The reset link is not from a real bank or payment app.'
  }
];

const GAME_STEPS = JUDGE_SCREENS.length;

// Detective tips shown in the sidebar — 3 short, complete tips per screen,
// each naming a real clue in THAT message (Activity 3 style). Order matches
// JUDGE_SCREENS: sbi, hdfc, jio, amazon, upi. Easy English for Class 6-8.
const SCREEN_TIPS = [
  // 1 · SBI (FAKE) — "verify at sbi-secure.xyz", urgent
  [
    { emoji: '🔗', text: "Strange links can trick you" },
    { emoji: '⏰', text: "Urgent words rush you" },
    { emoji: '🏦', text: "Banks never ask this way" }
  ],
  // 2 · HDFC (REAL) — payment alert, asks nothing
  [
    { emoji: '✅', text: "Real alerts only inform you" },
    { emoji: '🔒', text: "It asks for no password" },
    { emoji: '📞', text: "Call the bank yourself" }
  ],
  // 3 · Jio (FAKE) — "you won free data, click now"
  [
    { emoji: '🎁', text: "Free prizes can be fake" },
    { emoji: '⏰', text: "It rushes you to click" },
    { emoji: '🚫', text: "Never share your details" }
  ],
  // 4 · Amazon (REAL) — order shipped, check in app
  [
    { emoji: '📦', text: "It only shares order news" },
    { emoji: '💸', text: "It never asks for money" },
    { emoji: '📱', text: "Check the real app" }
  ],
  // 5 · UPI (FAKE) — "app in danger, reset now via link"
  [
    { emoji: '😨', text: "Scary words create panic" },
    { emoji: '🔗', text: "The reset link is fake" },
    { emoji: '🧑‍🏫', text: "Ask a trusted adult" }
  ]
];

// Generic tips for the start screen (before any message is shown).
const DEFAULT_TIPS = [
  { emoji: '🔗', text: "Strange links can trick you" },
  { emoji: '⚠️', text: "Scary words rush you" },
  { emoji: '🎁', text: "Free prizes can be fake" }
];

const supportedLanguages = {
  en: 'English',
  gu: 'Gujarati',
  hi: 'Hindi',
  mr: 'Marathi',
  te: 'Telugu'
};

const gameCopy = {
  en: {
    appTitle: 'Real or Fake Sender?',
    title: 'Real or Fake Sender?',
    subtitle: 'Read each message. Tap FAKE on the left or REAL on the right, then read the clue.',
    coachTitle: 'Detective Tip',
    coach: 'Fake messages often use strange links, scary words, big rewards, or hurry-up words. Real alerts are usually simple and do not ask for private details.',
    boardTitle: 'Activity 2: Fake or Real?',
    start: 'Start',
    continue: 'Next Screen',
    playAgain: 'Play Again',
    fake: 'FAKE',
    real: 'REAL',
    correct: 'Correct choice!',
    wrong: 'Not quite. Read the clue and try the next one.',
    completeTitle: 'Phishing Message Judge Complete',
    completeCoach: 'You judged each phone message by checking links, pressure words, and whether it asked for unsafe action.',
    completeBoard: 'Complete',
    languageTitle: 'Choose Language',
    languageSubtitle: 'Switch the interface language for this activity.',
    languageSelectedTitle: 'Language Selected!',
    languageSelectedStart: 'Your activity is now in {language}.',
    languageSelectedEnd: 'Let us keep detecting scams.',
    cancel: 'Cancel',
    apply: 'Apply',
    rotateTitle: 'Please Rotate Your Device',
    rotateMessage: 'This activity is best experienced in landscape mode.',
    muted: 'Turn sound on',
    unmuted: 'Turn sound off',
    enterFullscreen: 'Enter fullscreen',
    exitFullscreen: 'Exit fullscreen',
    tutorialTitle: 'How to Play',
    tutorialStep1: 'Read the message shown inside the phone.',
    tutorialStep2: 'Tap FAKE on the left or REAL on the right.',
    tutorialStep3: 'Read the clue card to learn the warning sign.',
    tutorialStep4: 'Judge all 5 messages to finish Activity 2.'
  }
};

let currentLanguage = 'en';

const state = {
  started: false,
  showSummary: false,
  currentIndex: 0,
  answers: Array(GAME_STEPS).fill(null),
  answerEffectKey: '',
  feedback: null,
  muted: false
};

const ui = {
  loader: document.getElementById('loader-overlay'),
  progressDots: document.getElementById('progressDots'),
  title: document.getElementById('activityTitle'),
  subtitle: document.getElementById('activitySubtitle'),
  sideProgress: document.getElementById('activitySideProgress'),
  coach: document.getElementById('activityCoach'),
  coachList: document.getElementById('coachList'),
  coachEyebrow: document.querySelector('#coachCard .section-eyebrow'),
  canvasTitle: document.getElementById('activityCanvasTitle'),
  host: document.getElementById('interactionHost'),
  footerActions: document.getElementById('footerActions'),
  tutorialOverlay: document.getElementById('tutorialOverlay'),
  muteBtn: document.getElementById('muteBtn'),
  langBtn: document.getElementById('langBtn'),
  tejImage: document.querySelector('.detective-guide-image'),
  tejSpeech: document.querySelector('.detective-speech')
};

// Tej guide poses mapped to game moments
const TEJ = {
  intro: { img: 'tej_15.webp', speech: 'Some messages try to trick you. <strong>Can you catch the fakes?</strong>' },
  ask: { img: 'tej_20.webp', speech: 'Read it closely. <strong>Is this one real or fake?</strong>' },
  correct: { img: 'tej_19.webp', speech: 'Nice catch! <strong>You spotted it!</strong>' },
  wrong: { img: 'tej_16.webp', speech: 'Almost! Read the clue, <strong>then try the next one.</strong>' },
  done: { img: 'tej_21.webp', speech: 'You did it! <strong>You\'re a true scam detective!</strong>' }
};

function setGuide(pose) {
  if (ui.tejImage) ui.tejImage.src = `./Assets/${pose.img}`;
  if (ui.tejSpeech) ui.tejSpeech.innerHTML = pose.speech;
}

function renderCoachTips(tips) {
  if (!ui.coachList) return;
  ui.coachList.innerHTML = tips.map((tip) => `
      <li><span class="coach-emoji" aria-hidden="true">${tip.emoji}</span> ${tip.text}</li>
    `).join('');
}

// Festive confetti pieces for the finish screen (pure CSS animation).
function buildConfetti(count) {
  const colors = ['#ef5266', '#f4c44e', '#4d8dff', '#22c55e', '#c85ef4', '#ff9900'];
  return Array.from({ length: count }, (_, i) => {
    const x = (i * 37) % 100;
    const delay = (i % 9) * -0.4;
    const dur = 3.2 + (i % 6) * 0.35;
    const spin = 90 + (i % 7) * 60;
    const color = colors[i % colors.length];
    const star = i % 7 === 0 ? ' finale-confetti--star' : '';
    return `<i class="finale-confetti${star}" style="--x:${x}%;--delay:${delay}s;--dur:${dur}s;--spin:${spin}deg;background:${color};"></i>`;
  }).join('');
}

// On the finish screen the left sidebar becomes a Mission Complete panel
// (badge + score) and Tej moves to centre stage, like Activity 3.
function setSidebarMode(complete) {
  const qcard = document.querySelector('.question-card');
  const guide = document.querySelector('.detective-guide');
  const coach = document.getElementById('coachCard');
  const mc = document.getElementById('missionCompleteCard');
  if (qcard) qcard.style.display = complete ? 'none' : '';
  if (guide) guide.hidden = complete;
  if (coach) coach.hidden = complete;
  if (mc) {
    mc.hidden = !complete;
    if (complete) {
      const score = document.getElementById('missionScoreValue');
      if (score) score.textContent = `${GAME_STEPS}/${GAME_STEPS}`;
    }
  }
}

function t(key, replacements = {}) {
  let value = gameCopy[currentLanguage]?.[key] || gameCopy.en[key] || key;
  Object.entries(replacements).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, replacement);
  });
  return value;
}

function buildProgressDots() {
  ui.progressDots.innerHTML = '';
  for (let index = 0; index < GAME_STEPS; index += 1) {
    const dot = document.createElement('span');
    dot.className = 'progress-dot';
    dot.setAttribute('aria-label', `Screen ${index + 1}`);
    ui.progressDots.appendChild(dot);
  }
}

function updateProgressDots() {
  ui.progressDots.querySelectorAll('.progress-dot').forEach((dot, index) => {
    const answered = Boolean(state.answers[index]);
    dot.classList.toggle('current', state.started && index === state.currentIndex && !state.showSummary);
    dot.classList.toggle('active', answered);
  });
}

function setFooterButtons(buttons) {
  ui.footerActions.innerHTML = '';
  buttons.forEach((buttonConfig) => {
    const button = document.createElement('button');
    button.className = `btn${buttonConfig.secondary ? ' secondary' : ''}`;
    button.type = 'button';
    button.textContent = buttonConfig.label;
    button.disabled = Boolean(buttonConfig.disabled);
    button.addEventListener('click', buttonConfig.onClick);
    ui.footerActions.appendChild(button);
  });
}

function playAudio(file) {
  if (state.muted) return;
  const audio = new Audio(file);
  audio.volume = 0.38;
  audio.play().catch(() => {});
}

// ===== Voiceover narration =====
const VO_PATH = './audio/voiceover/english/';
let currentVoice = null;
let currentVoiceKey = '';

function playVoice(key) {
  if (key === currentVoiceKey) return; // don't replay the same screen's narration
  currentVoiceKey = key;
  if (currentVoice) {
    currentVoice.pause();
    currentVoice = null;
  }
  if (state.muted) return;
  const audio = new Audio(`${VO_PATH}${key}.ogg`);
  audio.volume = 0.95;
  currentVoice = audio;
  audio.play().catch(() => {});
}

function stopVoice() {
  if (currentVoice) {
    currentVoice.pause();
    currentVoice = null;
  }
}

// Browsers block audio until the first user gesture; resume a clip that was
// blocked (created but never started) on the first tap anywhere.
function setupVoiceUnlock() {
  document.addEventListener('pointerdown', () => {
    if (!state.muted && currentVoice && currentVoice.paused && currentVoice.currentTime === 0) {
      currentVoice.play().catch(() => {});
    }
  });
}

function isComplete() {
  return state.answers.every(Boolean);
}

function getScore() {
  return state.answers.filter((answer) => answer?.correct).length;
}

function formatMessage(message) {
  return message.replace(/([a-z0-9-]+\.[a-z]{2,})/gi, '<span class="message-link">$1</span>');
}

function renderPhoneScreen(screen) {
  const themeClass = `phone-${screen.id}`;
  return `
    <article class="phone-mockup ${themeClass}" aria-label="${screen.platform} screen">
      <div class="phone-screen">
        <div class="phone-app-bar">
          <span class="app-dot">${screen.avatar}</span>
          <div>
            <strong>${screen.sender}</strong>
            <small>${screen.platform}</small>
          </div>
        </div>
        <div class="phone-content">
          <div class="msg-bubble">
            <p>${formatMessage(screen.message)}</p>
          </div>
        </div>
      </div>
      <img class="phone-frame-img" src="./Assets/phone_outline.webp" alt="" aria-hidden="true" />
    </article>
  `;
}

function renderStartScreen() {
  ui.host.innerHTML = `
    <section class="scam-game activity-stage">
      <div class="activity-panel start-panel">
        <header class="mobile-mission-banner">
          <span class="mission-bubble" aria-hidden="true">&#128373;&#65039;</span>
          <div>
            <strong><span class="real-word">Real</span> or <span class="fake-word">Fake</span> Sender?</strong>
            <small>Spot the scam messages and stay safe!</small>
          </div>
        </header>
        <div class="start-hero">
          <div class="intro-copy">
            <h4>Ready to catch some scams, Detective?</h4>
            <p>Read each message, then tap <b class="fake-word">FAKE</b> or <b class="real-word">REAL</b>. Watch out for these four clues:</p>
          </div>
          <div class="detective-board">
            <div class="case-file case-file-red"><span class="case-emoji">&#128279;</span> Strange Link</div>
            <div class="case-file case-file-yellow"><span class="case-emoji">&#128561;</span> Scary Words</div>
            <div class="case-file case-file-blue"><span class="case-emoji">&#127873;</span> Huge Offer</div>
            <div class="case-file case-file-green"><span class="case-emoji">&#9989;</span> Simple Update</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderMissionBanner(title, subtitle) {
  return `
    <header class="mobile-mission-banner${subtitle ? '' : ' mobile-mission-banner--compact'}">
      <span class="mission-bubble" aria-hidden="true">&#128373;&#65039;</span>
      <div>
        <strong>${title}</strong>
        ${subtitle ? `<small>${subtitle}</small>` : ''}
      </div>
    </header>
  `;
}

function renderScreenProgress(label, allDone = false) {
  let dots = '';
  for (let index = 0; index < GAME_STEPS; index += 1) {
    const isCurrent = !allDone && index === state.currentIndex;
    const isDone = allDone || Boolean(state.answers[index]);
    dots += `<i class="${isCurrent ? 'current' : (isDone ? 'done' : '')}"></i>`;
  }
  return `
    <div class="mobile-screen-progress">
      <strong>${label}</strong>
      <div class="mobile-progress-dots">${dots}</div>
    </div>
  `;
}

function renderJudgeScreen() {
  const screen = JUDGE_SCREENS[state.currentIndex];
  const answer = state.answers[state.currentIndex];
  const hasFeedback = Boolean(answer);
  const fakeResultClass = answer?.verdict === 'fake' ? ` selected ${answer.correct ? 'good' : 'bad'}` : '';
  const realResultClass = answer?.verdict === 'real' ? ` selected ${answer.correct ? 'good' : 'bad'}` : '';
  const fakeEffectClass = state.answerEffectKey === `${screen.id}:fake` && answer?.correct ? ' sparkle' : '';
  const realEffectClass = state.answerEffectKey === `${screen.id}:real` && answer?.correct ? ' sparkle' : '';

  ui.host.innerHTML = `
    <section class="scam-game activity-stage">
      <div class="activity-panel judge-panel">
        ${renderMissionBanner(
          '<span class="real-word">Real</span> or <span class="fake-word">Fake</span>?',
          state.currentIndex === 0 ? 'Spot the scam messages and stay safe!' : ''
        )}
        ${renderScreenProgress(`Screen ${state.currentIndex + 1}/${GAME_STEPS}`)}
        <div class="judge-hero">
          <div class="judge-layout">
            ${renderPhoneScreen(screen)}
            <div class="verdict-panel">
              <div class="verdict-question">
                <span>Your Choice</span>
                <h4>Is this message fake or real?</h4>
              </div>
              <div class="verdict-buttons" role="group" aria-label="Choose fake or real">
                <button class="verdict-btn fake${fakeResultClass}${fakeEffectClass}" type="button" data-verdict="fake" ${hasFeedback ? 'disabled' : ''}>${t('fake')}</button>
                <button class="verdict-btn real${realResultClass}${realEffectClass}" type="button" data-verdict="real" ${hasFeedback ? 'disabled' : ''}>${t('real')}</button>
              </div>
              <div class="feedback-card ${hasFeedback ? 'show ' + (answer.correct ? 'correct' : 'wrong') : 'placeholder'}" aria-live="polite">
                ${hasFeedback ? `
                  <span><i class="feedback-emoji">${answer.correct ? '🎉' : '🚨'}</i> ${answer.correct ? t('correct') : t('wrong')}</span>
                  <h5>${screen.warning}</h5>
                  <p>${screen.explanation}</p>
                ` : `
                  <div class="clue-waiting">
                    <img class="clue-waiting-img" src="./Assets/clue_box.webp" alt="" aria-hidden="true" />
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  ui.host.querySelectorAll('.verdict-btn').forEach((button) => {
    button.addEventListener('click', () => submitVerdict(button.dataset.verdict));
  });
}

function renderComplete() {
  ui.host.innerHTML = `
    <section class="scam-game activity-stage finale">
      <div class="finale-confetti-layer" aria-hidden="true">${buildConfetti(64)}</div>
      <div class="activity-panel complete-panel">
        <h2 class="finale-title">Great job, you saved Tej!</h2>
        <div class="finale-stage">
          <div class="finale-tej-wrap">
            <img class="finale-tej" src="./Assets/tej_21.webp" alt="Tej celebrating" />
          </div>
          <div class="finale-learned">
            <img class="finale-shield" src="./Assets/mission-shield.webp" alt="" aria-hidden="true" />
            <div class="finale-learned-head">HERE'S WHAT YOU LEARNED:</div>
            <div class="finale-learned-grid">
              <div class="finale-learned-card">
                <span class="finale-learned-emoji">🔗</span>
                <b>Fake Links</b>
                <small>Check links before you trust them</small>
              </div>
              <div class="finale-learned-card">
                <span class="finale-learned-emoji">🚨</span>
                <b>Scary Words</b>
                <small>Urgent words try to rush you</small>
              </div>
              <div class="finale-learned-card">
                <span class="finale-learned-emoji">🎁</span>
                <b>Too-Good Offers</b>
                <small>Free prizes can be fake</small>
              </div>
            </div>
            <p class="finale-note">Report cyber fraud in India at <b>cybercrime.gov.in</b> or call <b>1930</b>.</p>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderGame() {
  document.title = t('appTitle');
  document.documentElement.lang = currentLanguage;
  ui.title.textContent = 'Spot the Scams!';
  ui.subtitle.textContent = state.showSummary ? t('completeCoach') : t('subtitle');
  ui.coachEyebrow.textContent = t('coachTitle');
  ui.coach.textContent = t('coach');
  ui.canvasTitle.textContent = state.showSummary
    ? 'Final Score'
    : (state.started ? t('boardTitle') : 'Get Ready!');
  ui.sideProgress.hidden = !state.started || state.showSummary;
  ui.sideProgress.textContent = state.showSummary
    ? `Score ${getScore()} of ${GAME_STEPS}`
    : `Screen ${state.currentIndex + 1} of ${GAME_STEPS}`;

  updateStaticText();
  updateProgressDots();

  if (!state.started && !state.showSummary) {
    setSidebarMode(false);
    setGuide(TEJ.intro);
    renderCoachTips(DEFAULT_TIPS);
    renderStartScreen();
    setFooterButtons([{ label: t('start'), onClick: startGame }]);
    playVoice('intro');
    return;
  }

  if (state.showSummary) {
    setSidebarMode(true);
    setGuide(TEJ.done);
    renderComplete();
    setFooterButtons([{ label: t('playAgain'), secondary: true, onClick: restartGame }]);
    playVoice('complete');
    return;
  }

  setSidebarMode(false);
  const screen = JUDGE_SCREENS[state.currentIndex];
  const currentAnswer = state.answers[state.currentIndex];
  setGuide(!currentAnswer ? TEJ.ask : (currentAnswer.correct ? TEJ.correct : TEJ.wrong));
  renderCoachTips(SCREEN_TIPS[state.currentIndex] || DEFAULT_TIPS);
  playVoice(`${currentAnswer ? 'f' : 'q'}_${screen.id}`);

  renderJudgeScreen();
  setFooterButtons([{
    label: t('continue'),
    disabled: !state.answers[state.currentIndex],
    onClick: nextScreen
  }]);
}

function updateStaticText() {
  document.querySelector('[data-i18n="rotateTitle"]').textContent = t('rotateTitle');
  document.querySelector('[data-i18n="rotateMessage"]').textContent = t('rotateMessage');
  document.getElementById('tutorialTitle').textContent = t('tutorialTitle');
  for (let index = 1; index <= 4; index += 1) {
    document.getElementById(`tutorialStep${index}`).textContent = t(`tutorialStep${index}`);
  }
  document.getElementById('langPopupTitle').textContent = t('languageTitle');
  document.getElementById('langPopupSubtitle').textContent = t('languageSubtitle');
  document.getElementById('langCancelBtn').textContent = t('cancel');
  document.getElementById('langApplyBtn').textContent = t('apply');
  document.getElementById('langSelectedTitle').textContent = t('languageSelectedTitle');
  document.getElementById('langSelectedMessageEnd').textContent = t('languageSelectedEnd');
  syncMuteIconState();
  syncFullscreenState();
}

function startGame() {
  state.started = true;
  state.showSummary = false;
  state.currentIndex = 0;
  renderGame();
}

function submitVerdict(verdict) {
  const screen = JUDGE_SCREENS[state.currentIndex];
  const correct = verdict === screen.verdict;
  state.answers[state.currentIndex] = { verdict, correct };
  state.answerEffectKey = `${screen.id}:${verdict}`;
  playAudio(correct ? './audio/mixkit-winning-notification-2018.ogg' : './audio/incorrect-answer.ogg');
  renderGame();
}

function nextScreen() {
  if (state.currentIndex < GAME_STEPS - 1) {
    state.currentIndex += 1;
    renderGame();
    return;
  }
  state.showSummary = true;
  renderGame();
  playAudio('./audio/mixkit-winning-notification-2018.ogg');
}

function restartGame() {
  state.started = false;
  state.showSummary = false;
  state.currentIndex = 0;
  state.answers = Array(GAME_STEPS).fill(null);
  state.answerEffectKey = '';
  state.feedback = null;
  renderGame();
}

function setupTutorial() {
  const openTutorialBtn = document.getElementById('openTutorialBtn');
  if (openTutorialBtn) {
    openTutorialBtn.addEventListener('click', () => {
      ui.tutorialOverlay.style.display = 'flex';
    });
  }
  const closeTutorial = () => {
    ui.tutorialOverlay.style.display = 'none';
    // first user interaction — (re)start the intro narration if still on the start screen
    if (!state.started && !state.showSummary) {
      currentVoiceKey = '';
      playVoice('intro');
    }
  };
  document.getElementById('closeTutorialBtn').addEventListener('click', closeTutorial);
  ui.tutorialOverlay.addEventListener('click', (event) => {
    if (event.target === ui.tutorialOverlay) closeTutorial();
  });
}

function setupLanguageSwitcher() {
  const overlay = document.getElementById('languagePopupOverlay');
  const trigger = document.getElementById('customSelectTrigger');
  const selectedText = document.getElementById('selectedLangText');
  const options = document.getElementById('customSelectOptions');
  const applyBtn = document.getElementById('langApplyBtn');
  const cancelBtn = document.getElementById('langCancelBtn');
  const closeBtn = document.getElementById('langPopupCloseBtn');
  const mainPanel = document.getElementById('langMainPanel');
  const confirmPanel = document.getElementById('langConfirmPanel');
  const popup = document.getElementById('languagePopup');
  let pendingLanguage = currentLanguage;

  const toggleDropdown = (open) => {
    const nextOpen = typeof open === 'boolean' ? open : !trigger.classList.contains('open');
    trigger.classList.toggle('open', nextOpen);
    options.classList.toggle('open', nextOpen);
    trigger.setAttribute('aria-expanded', String(nextOpen));
  };

  const populateOptions = () => {
    options.innerHTML = '';
    selectedText.textContent = supportedLanguages[pendingLanguage] || supportedLanguages.en;
    Object.entries(supportedLanguages).forEach(([code, name]) => {
      const option = document.createElement('div');
      option.className = 'custom-select-option';
      option.dataset.lang = code;
      option.textContent = name;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(code === pendingLanguage));
      option.classList.toggle('selected', code === pendingLanguage);
      option.addEventListener('click', () => {
        pendingLanguage = code;
        selectedText.textContent = name;
        applyBtn.disabled = pendingLanguage === currentLanguage;
        populateOptions();
        toggleDropdown(false);
      });
      options.appendChild(option);
    });
  };

  const closePopup = () => {
    popup.classList.remove('confirm-only');
    toggleDropdown(false);
    overlay.style.display = 'none';
  };

  if (ui.langBtn) {
    ui.langBtn.addEventListener('click', () => {
      pendingLanguage = currentLanguage;
      applyBtn.disabled = true;
      mainPanel.hidden = false;
      confirmPanel.hidden = true;
      confirmPanel.classList.remove('show');
      popup.classList.remove('confirm-only');
      populateOptions();
      overlay.style.display = 'flex';
    });
  }

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleDropdown();
  });
  cancelBtn.addEventListener('click', closePopup);
  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closePopup();
  });
  applyBtn.addEventListener('click', () => {
    currentLanguage = pendingLanguage;
    localStorage.setItem('activity_2_language', currentLanguage);
    renderGame();
    document.getElementById('langSelectedMessageStart').textContent = t('languageSelectedStart', {
      language: supportedLanguages[currentLanguage]
    });
    mainPanel.hidden = true;
    confirmPanel.hidden = false;
    confirmPanel.classList.add('show');
    popup.classList.add('confirm-only');
    window.setTimeout(closePopup, 1400);
  });
}

function syncMuteIconState() {
  const onIcon = ui.muteBtn.querySelector('.mute-on-icon');
  const offIcon = ui.muteBtn.querySelector('.mute-off-icon');
  ui.muteBtn.classList.toggle('is-muted', state.muted);
  ui.muteBtn.title = state.muted ? t('muted') : t('unmuted');
  ui.muteBtn.setAttribute('aria-label', state.muted ? t('muted') : t('unmuted'));
  if (onIcon) onIcon.style.display = state.muted ? 'none' : 'block';
  if (offIcon) offIcon.style.display = state.muted ? 'block' : 'none';
}

function syncFullscreenState() {
  const btn = document.getElementById('fullscreenBtn');
  if (!btn) return;
  const enterIcon = btn.querySelector('.fullscreen-enter-icon');
  const exitIcon = btn.querySelector('.fullscreen-exit-icon');
  const active = Boolean(document.fullscreenElement);
  btn.classList.toggle('is-fullscreen', active);
  btn.title = active ? t('exitFullscreen') : t('enterFullscreen');
  btn.setAttribute('aria-label', active ? t('exitFullscreen') : t('enterFullscreen'));
  if (enterIcon) enterIcon.style.display = active ? 'none' : 'block';
  if (exitIcon) exitIcon.style.display = active ? 'block' : 'none';
}

function setupControls() {
  ui.muteBtn.addEventListener('click', () => {
    state.muted = !state.muted;
    syncMuteIconState();
    if (state.muted) {
      stopVoice();
    } else if (currentVoiceKey) {
      const key = currentVoiceKey;
      currentVoiceKey = '';
      playVoice(key);
    }
  });
  const resetGameBtn = document.getElementById('resetGameBtn');
  if (resetGameBtn) resetGameBtn.addEventListener('click', restartGame);
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      } else {
        await document.documentElement.requestFullscreen?.();
      }
      syncFullscreenState();
    });
    document.addEventListener('fullscreenchange', syncFullscreenState);
  }
}

function initialize() {
  const savedLanguage = localStorage.getItem('activity_2_language');
  if (savedLanguage && supportedLanguages[savedLanguage]) {
    currentLanguage = savedLanguage;
  }
  buildProgressDots();
  setupControls();
  setupTutorial();
  setupLanguageSwitcher();
  setupVoiceUnlock();
  state.started = false;
  renderGame();
  ui.tutorialOverlay.style.display = 'flex';
  playVoice('how_to_play');
  window.setTimeout(() => ui.loader.classList.add('hidden'), 250);
}

window.addEventListener('load', initialize);
