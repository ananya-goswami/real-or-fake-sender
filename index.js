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

const GAME_CATEGORY = 'scam-judge';

// --- Analytics bridge (Android WebView) ---
function sendGameEvent(functionName, dataArgs) {
  console.log(`%cANALYTICS: ${functionName}`, 'color: #386AF6; font-weight: bold;', dataArgs);
  const message = {
    functionName,
    args: dataArgs
  };
  const jsonString = JSON.stringify(message);
  if (window.AndroidBridge && window.AndroidBridge.postMessage) {
    window.AndroidBridge.postMessage(jsonString);
  }
}

function practiceActivityStarted(data) {
  sendGameEvent('practiceActivityStarted', data);
}

function practiceActivityCompleted(data) {
  sendGameEvent('practiceActivityCompleted', data);
}

function practiceQuestionAttempted(data) {
  sendGameEvent('practiceQuestionAttempted', data);
}

function closeActivity() {
  sendGameEvent('closeActivity', {});
}

// Timestamp of when play actually started (loader tapped), a one-shot guard so the
// completion event fires only once per play-through, and the learner's first-attempt
// correct count (each screen is answered once, so this is the run's real score).
let gameStartTime = 0;
let completionTracked = false;
let firstTryCorrectCount = 0;

function startAnalyticsRun() {
  gameStartTime = Date.now();
  completionTracked = false;
  firstTryCorrectCount = 0;
  practiceActivityStarted({
    category: GAME_CATEGORY,
    language: currentLanguage || initialLang
  });
}

function trackGameCompletion() {
  if (completionTracked) return;
  completionTracked = true;
  const elapsedSeconds = gameStartTime ? (Date.now() - gameStartTime) / 1000 : 0;
  practiceActivityCompleted({
    category: GAME_CATEGORY,
    language: currentLanguage || initialLang,
    timeSpent: Math.round(elapsedSeconds),
    totalQuestion: GAME_STEPS,
    correctQuestion: firstTryCorrectCount
  });
}

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

// Language handed in by the host app (getEnvironment), falling back to the bundled
// default. A saved in-game choice (localStorage) still wins in initialize().
let initialLang = 'en';
if (typeof window.getEnvironment === 'function') {
  try {
    const env = window.getEnvironment();
    if (env && env.app_language && Object.prototype.hasOwnProperty.call(supportedLanguages, env.app_language)) {
      initialLang = env.app_language;
    }
  } catch (error) {
    console.warn('Error calling getEnvironment(), falling back to default language.', error);
  }
}

const gameCopy = {
  en: {
    appTitle: 'Real or Fake Sender?',
    title: 'Real or Fake Sender?',
    subtitle: 'Read each message. Tap FAKE on the left or REAL on the right, then read the clue.',
    coachTitle: 'Safety Coach',
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
    exitFullscreen: 'Exit fullscreen'
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
  muted: false,
  voiceActivated: false
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

// First-screen voice prompt (behavior ported from the bubble-burst game): the
// mascot's first bubble invites a click to start the voiceover, since browsers
// block autoplay until the first user gesture.
const VOICE_PROMPT_HTML = 'Click anywhere on the page <em>except the bubbles</em> to activate voice.';
let voiceActivationHandler = null;

// "Tap to Open" startup gate (ported from the bubble-burst game). The loader
// overlay stays up showing the spinner + prompt, blurring the app behind it,
// until the first tap/keypress — which also doubles as the gesture that unlocks
// audio playback.
let startupGateRelease = null;

function clearVoiceActivation() {
  if (!voiceActivationHandler) return;
  document.removeEventListener('pointerdown', voiceActivationHandler);
  document.removeEventListener('touchstart', voiceActivationHandler);
  voiceActivationHandler = null;
}

// Arm a one-time "click anywhere (except the mute button) to start the voiceover".
function armVoiceActivation(onActivate) {
  if (voiceActivationHandler) return;
  voiceActivationHandler = (event) => {
    if (event?.target?.closest?.('#muteBtn')) return; // ignore the sound toggle
    clearVoiceActivation();
    state.voiceActivated = true;
    onActivate();
  };
  document.addEventListener('pointerdown', voiceActivationHandler);
  document.addEventListener('touchstart', voiceActivationHandler);
}

function clearStartupGateListeners() {
  if (!startupGateRelease) return;
  startupGateRelease();
  startupGateRelease = null;
}

function hideStartupGate() {
  clearStartupGateListeners();
  document.body.classList.remove('startup-gate-active');
  ui.loader?.classList.add('hidden');
}

// Spinner-only phase: the loader shows but is NOT clickable and hides the
// "Tap to Open" text until the game's assets have finished loading.
function setStartupGateLoading() {
  if (!ui.loader) return;
  clearStartupGateListeners();
  ui.loader.classList.remove('hidden');
  ui.loader.removeAttribute('role');
  ui.loader.removeAttribute('tabindex');
  ui.loader.setAttribute('aria-busy', 'true');
  ui.loader.setAttribute('aria-label', 'Loading');
  const text = ui.loader.querySelector('.loader-overlay-text');
  if (text) text.hidden = true;
  document.body.classList.add('startup-gate-active');
}

// Assets are ready: reveal "Tap to Open" and make the gate clickable.
function setStartupGateReady() {
  if (!ui.loader) return;
  ui.loader.classList.remove('hidden');
  ui.loader.setAttribute('role', 'button');
  ui.loader.setAttribute('tabindex', '0');
  ui.loader.setAttribute('aria-label', 'Tap to open the game');
  ui.loader.setAttribute('aria-busy', 'false');
  const text = ui.loader.querySelector('.loader-overlay-text');
  if (text) text.hidden = false;
  document.body.classList.add('startup-gate-active');
}

// Images the game shows across its screens, preloaded before the "Tap to Open"
// gate becomes clickable so nothing pops in mid-play.
const GAME_IMAGE_ASSETS = [
  './Assets/loader.webp',
  './Assets/logo.webp',
  './Assets/phone_outline.webp',
  './Assets/clue_box.webp',
  './Assets/background3.webp',
  './Assets/badge.webp',
  './Assets/target.webp',
  './Assets/final_shield_icon.webp',
  './Assets/final_badge.webp',
  './Assets/tej_15.webp',
  './Assets/tej_16.webp',
  './Assets/tej_19.webp',
  './Assets/tej_20.webp',
  './Assets/tej_21.webp'
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

// Resolves once the game's visible assets (images + fonts) are ready, so the
// "Tap to Open" gate only becomes clickable after everything has loaded.
async function waitForGameAssets() {
  const tasks = GAME_IMAGE_ASSETS.map(preloadImage);
  if (document.fonts && document.fonts.ready) {
    tasks.push(document.fonts.ready.catch(() => {}));
  }
  await Promise.all(tasks);
}

function activateStartupGate(onOpen) {
  if (!ui.loader) {
    onOpen?.();
    return;
  }
  clearStartupGateListeners();
  setStartupGateReady();
  const openGate = (event) => {
    if (event.type === 'keydown' && !['Enter', ' ', 'Spacebar'].includes(event.key)) return;
    event.preventDefault?.();
    hideStartupGate();
    onOpen?.();
  };
  ui.loader.addEventListener('pointerdown', openGate, { once: true });
  document.addEventListener('keydown', openGate);
  startupGateRelease = () => {
    ui.loader.removeEventListener('pointerdown', openGate);
    document.removeEventListener('keydown', openGate);
  };
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
      if (score) score.textContent = `${getScore()}/${GAME_STEPS}`;
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
  const audio = new Audio(file);
  // When muted, keep playing but at volume 0; unmute restores the normal level.
  audio.volume = state.muted ? 0 : 0.38;
  audio.play().catch(() => {});
}

// ===== Voiceover narration =====
const VO_PATH = './audio/voiceover/english/';
let currentVoice = null;
let currentVoiceKey = '';    // joined id of the current narration (avoids replays on re-render)
let voiceQueue = [];         // clips still waiting to play in the current narration

// Play one screen's narration. Pass a single key (e.g. 'complete') or an ordered
// list of keys to play back-to-back (e.g. ['intro', 'q_sbi']).
function playVoice(keys) {
  const list = Array.isArray(keys) ? keys : [keys];
  const id = list.join('>');
  if (id === currentVoiceKey) return; // don't replay the same screen's narration
  currentVoiceKey = id;
  stopVoice();
  // Always play (even when muted) so narration keeps advancing; mute just
  // drops the volume to 0 in playNextVoice().
  voiceQueue = list.slice();
  playNextVoice();
}

// Play the next queued clip; when it ends, the following clip starts automatically.
function playNextVoice() {
  const key = voiceQueue.shift();
  if (!key) {
    currentVoice = null;
    return;
  }
  const audio = new Audio(`${VO_PATH}${key}.ogg`);
  audio.volume = state.muted ? 0 : 0.95;
  currentVoice = audio;
  audio.addEventListener('ended', () => {
    if (currentVoice === audio) playNextVoice();
  });
  audio.play().catch(() => {});
}

function stopVoice() {
  voiceQueue = [];
  if (currentVoice) {
    currentVoice.pause();
    currentVoice = null;
  }
}

// Browsers block audio until the first user gesture; resume a clip that was
// blocked (created but never started) on the first tap anywhere.
function setupVoiceUnlock() {
  document.addEventListener('pointerdown', () => {
    // Resume a blocked clip even when muted — it just plays silently (volume 0).
    if (currentVoice && currentVoice.paused && currentVoice.currentTime === 0) {
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
          'Spot the scam messages and stay safe!'
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
  // Game finished — fire the completion analytics once (guarded internally).
  trackGameCompletion();
  // Content is unchanged from Activity 2; only the layout/positioning follows
  // Activity 4's "final-mission-stage" finale (side panel + board with absolutely
  // positioned heading, hero row, learned panel and play-again button).
  const learned = [
    { emoji: '🔗', title: 'Fake Links', detail: 'Check links before you trust them' },
    { emoji: '🚨', title: 'Scary Words', detail: 'Urgent words try to rush you' },
    { emoji: '🎁', title: 'Too-Good Offers', detail: 'Free prizes can be fake' }
  ];
  ui.host.innerHTML = `
    <section class="scam-game final-mission-stage">
      <div class="finale-confetti-layer" aria-hidden="true">${buildConfetti(64)}</div>
      <aside class="final-side-panel">
        <section class="final-side-mission-card">
          <img src="./Assets/final_shield_icon.webp" alt="" aria-hidden="true" />
          <strong>Mission <em>Complete!</em></strong>
          <span>You spotted the scams and stayed safe.</span>
        </section>
        <section class="final-found-card">
          <span class="final-target-icon" aria-hidden="true">&#127919;</span>
          <div>
            <strong>Screens Correct</strong>
            <b>${getScore()} / ${GAME_STEPS}</b>
            <span>Great Work!</span>
          </div>
        </section>
        <div class="sidebar-motto">Be <b>Smart.</b> Be <b>Safe.</b> Be <b>Secure.</b></div>
      </aside>
      <main class="final-board">
        <header class="final-heading">
          <h3>Great job, you saved <em>Tej!</em></h3>
          <p class="final-report">
            <span class="final-report-icon" aria-hidden="true">📞</span>
            <span class="final-report-text">Report cyber fraud in India at <b>cybercrime.gov.in</b> or call <b>1930</b>.</span>
          </p>
        </header>
        <img class="final-shield" src="./Assets/final_badge.webp" alt="Safety shield badge" />
        <div class="final-hero-row">
          <img class="final-zara" src="./Assets/tej_21.webp" alt="Tej celebrating" />
        </div>
        <section class="final-spotted-panel">
          <strong class="final-spotted-ribbon">Here's What You Learned:</strong>
          <div class="final-spotted-grid">
            ${learned.map((item) => `
              <article class="final-clue-card">
                <span class="final-clue-emoji" aria-hidden="true">${item.emoji}</span>
                <strong>${item.title}</strong>
                <small>${item.detail}</small>
              </article>
            `).join('')}
          </div>
        </section>
        <button class="final-play-again" type="button">&#8635; <span>${t('playAgain')}</span></button>
      </main>
    </section>
  `;
  ui.host.querySelector('.final-play-again').addEventListener('click', restartGame);
}

function renderGame() {
  document.title = t('appTitle');
  document.documentElement.lang = currentLanguage;
  ui.title.textContent = 'SPOT THE SCAMS!';
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

  if (state.showSummary) {
    setSidebarMode(true);
    setGuide(TEJ.done);
    renderComplete();
    // The finale renders its own side panel + in-board Play Again button, and the
    // app's left panel / footer are hidden via the .final-mission-stage CSS.
    setFooterButtons([]);
    playVoice('complete');
    return;
  }

  setSidebarMode(false);
  const screen = JUDGE_SCREENS[state.currentIndex];
  const currentAnswer = state.answers[state.currentIndex];
  setGuide(!currentAnswer ? TEJ.ask : (currentAnswer.correct ? TEJ.correct : TEJ.wrong));
  renderCoachTips(SCREEN_TIPS[state.currentIndex] || DEFAULT_TIPS);
  // The first judge screen is the activity's starting screen: it plays the welcome
  // intro and then this message's question clip back-to-back. Later screens play
  // just their question clip, and any answered screen plays its feedback clip.
  const isStartingScreen = state.currentIndex === 0 && !currentAnswer;
  if (isStartingScreen && !state.voiceActivated) {
    // First bubble shows the click-to-activate prompt; the voiceover stays silent
    // until the first click anywhere (except the mute button). On activation the
    // bubble is restored to its normal text and the intro + question clips play.
    if (ui.tejSpeech) {
      ui.tejSpeech.innerHTML = VOICE_PROMPT_HTML;
      ui.tejSpeech.classList.add('is-voice-prompt');
    }
    armVoiceActivation(() => {
      if (ui.tejSpeech) ui.tejSpeech.classList.remove('is-voice-prompt');
      setGuide(TEJ.ask);
      playVoice(['intro', `q_${screen.id}`]);
    });
  } else if (isStartingScreen) {
    playVoice(['intro', `q_${screen.id}`]);
  } else {
    playVoice(`${currentAnswer ? 'f' : 'q'}_${screen.id}`);
  }

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
  document.getElementById('langPopupTitle').textContent = t('languageTitle');
  document.getElementById('langPopupSubtitle').textContent = t('languageSubtitle');
  document.getElementById('langCancelBtn').textContent = t('cancel');
  document.getElementById('langApplyBtn').textContent = t('apply');
  document.getElementById('langSelectedTitle').textContent = t('languageSelectedTitle');
  document.getElementById('langSelectedMessageEnd').textContent = t('languageSelectedEnd');
  syncMuteIconState();
  syncFullscreenState();
}

function submitVerdict(verdict) {
  const screen = JUDGE_SCREENS[state.currentIndex];
  const correct = verdict === screen.verdict;
  // First (and only) attempt for this screen — buttons lock after answering, so
  // count it toward the completion event's score.
  const firstAttempt = !state.answers[state.currentIndex];
  state.answers[state.currentIndex] = { verdict, correct };
  state.answerEffectKey = `${screen.id}:${verdict}`;
  if (firstAttempt && correct) firstTryCorrectCount += 1;
  practiceQuestionAttempted({
    category: GAME_CATEGORY,
    question: state.currentIndex + 1,
    selectedAnswer: verdict,
    isCorrect: correct
  });
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
  state.started = true;
  state.showSummary = false;
  state.currentIndex = 0;
  state.answers = Array(GAME_STEPS).fill(null);
  state.answerEffectKey = '';
  state.feedback = null;
  // New play-through: start a fresh analytics run (resets timer/score/guard).
  startAnalyticsRun();
  renderGame();
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
  // Drive fullscreen-only layout tweaks (e.g. the finale panel lift) off the body.
  document.body.classList.toggle('is-app-fullscreen', active);
  btn.title = active ? t('exitFullscreen') : t('enterFullscreen');
  btn.setAttribute('aria-label', active ? t('exitFullscreen') : t('enterFullscreen'));
  if (enterIcon) enterIcon.style.display = active ? 'none' : 'block';
  if (exitIcon) exitIcon.style.display = active ? 'block' : 'none';
}

function setupControls() {
  ui.muteBtn.addEventListener('click', () => {
    // Audible click feedback on the sound toggle itself — plays in both
    // directions (muting and unmuting) so the tap always feels responsive.
    const click = new Audio('./audio/button-click.ogg');
    click.volume = 0.5;
    click.play().catch(() => {});
    state.muted = !state.muted;
    syncMuteIconState();
    // Don't stop the audio — keep it playing and just toggle its volume, so the
    // narration keeps advancing. Unmute restores the normal level.
    if (currentVoice) currentVoice.volume = state.muted ? 0 : 0.95;
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

async function initialize() {
  // Keep the loader spinner up and non-clickable until the game's assets have
  // finished loading; only then reveal the clickable "Tap to Open" gate.
  setStartupGateLoading();
  currentLanguage = initialLang;
  const savedLanguage = localStorage.getItem('activity_2_language');
  if (savedLanguage && supportedLanguages[savedLanguage]) {
    currentLanguage = savedLanguage;
  }
  buildProgressDots();
  setupControls();
  setupLanguageSwitcher();
  setupVoiceUnlock();
  // Activity 2 opens directly on the first judge screen (image 3). The How to Play
  // modal and the start screen are removed; the intro voiceover plays here instead.
  state.started = true;
  state.currentIndex = 0;
  renderGame();
  await waitForGameAssets();
  // Hold on the "Tap to Open" gate until the player taps. That tap is the first
  // user gesture, so it also unlocks audio and kicks off the intro voiceover.
  activateStartupGate(() => {
    startAnalyticsRun();
    if (state.voiceActivated) return;
    clearVoiceActivation();
    state.voiceActivated = true;
    if (ui.tejSpeech) ui.tejSpeech.classList.remove('is-voice-prompt');
    setGuide(TEJ.ask);
    const screen = JUDGE_SCREENS[state.currentIndex];
    playVoice(['intro', `q_${screen.id}`]);
  });
}

// Pause the narration when the tab is hidden, and resume the very same clip
// (from where it left off) when the tab becomes visible again. Short SFX
// (correct/wrong/click) are fire-and-forget, so only the voiceover is tracked.
let audioPausedForHiddenTab = [];

function pauseAudioForHiddenTab() {
  audioPausedForHiddenTab = [];
  if (currentVoice && !currentVoice.paused && !currentVoice.ended) {
    audioPausedForHiddenTab.push(currentVoice);
    currentVoice.pause();
  }
}

function resumeAudioForVisibleTab() {
  const clips = audioPausedForHiddenTab;
  audioPausedForHiddenTab = [];
  clips.forEach((audio) => {
    if (audio && audio.paused && !audio.ended) {
      audio.play().catch(() => {});
    }
  });
}

// NOTE: visibilitychange only pauses/resumes the audio in place — it must NOT
// re-render the game or restart narration.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseAudioForHiddenTab();
  } else {
    resumeAudioForVisibleTab();
  }
});

window.addEventListener('load', initialize);
