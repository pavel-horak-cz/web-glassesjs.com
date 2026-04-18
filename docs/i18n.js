/**
 * GlassesJS — Internationalization
 *
 * CZ/EN translations for the website.
 */

const i18n = {
  en: {
    // Nav
    navDemo: 'Live Demo',
    navHow: 'How It Works',
    navApi: 'API',
    navInstall: 'Install',
    navGithub: 'GitHub',

    // Hero
    heroTitle: 'GlassesJS',
    heroTagline: 'Zero-model glasses detection for the browser',
    heroDescription: 'Detect whether a person is wearing glasses using webcam video and facial landmarks. No AI models, no server, no dependencies — pure math.',
    heroDemo: 'Try Live Demo',
    heroInstall: 'npm install glassesjs',

    // Demo
    demoTitle: 'Live Demo',
    demoDescription: 'Enable your webcam to see real-time glasses detection with confidence score and per-method breakdown.',
    demoStart: 'Start Webcam',
    demoStop: 'Stop',
    demoResult: 'Result',
    demoGlasses: 'Glasses detected',
    demoNoGlasses: 'No glasses detected',
    demoConfidence: 'Confidence',
    demoFrames: 'Frames analyzed',
    demoWaiting: 'Waiting for data...',
    demoInitializing: 'Initializing MediaPipe...',
    demoError: 'Could not access webcam. Please allow camera access and try again.',
    demoNotSupported: 'Your browser does not support webcam access.',

    // Methods
    methodsTitle: 'How It Works',
    methodsDescription: 'GlassesJS combines 6 independent detection methods, each returning a score 0–100. The final confidence is a weighted average.',
    methodBridge: 'Bridge Edge Detection',
    methodBridgeDesc: 'Horizontal Sobel edge detection on the nose bridge area. Glasses frames create strong horizontal edges where they sit on the nose.',
    methodTemple: 'Temple Symmetry',
    methodTempleDesc: 'Vertical edge analysis at both temples. Glasses arms create symmetric vertical edge patterns on both sides of the face.',
    methodIris: 'Iris Stability',
    methodIrisDesc: 'Tracks iris position variance over multiple frames. Glasses lenses refract light, causing higher variance in detected iris position.',
    methodDepth: 'Z-Depth Profile',
    methodDepthDesc: 'Analyzes Z-coordinate discontinuities across eye landmarks. Glasses create a false plane in front of the face.',
    methodContrast: 'Local Contrast',
    methodContrastDesc: 'Compares pixel contrast in the eye region vs. cheeks. Glass lenses alter local contrast through reflections and tinting.',
    methodColor: 'Color Anomaly',
    methodColorDesc: 'Samples colors across the eye region and compares with skin baseline. Coated lenses shift color temperature.',

    // API
    apiTitle: 'API Reference',
    apiLightweight: 'Lightweight Mode',
    apiLightweightDesc: 'You already have MediaPipe landmarks — just pass them in.',
    apiStandalone: 'Standalone Mode',
    apiStandaloneDesc: 'Library handles MediaPipe internally. Just provide a video element.',
    apiSingle: 'Single Frame (fast)',
    apiAccumulated: 'Accumulated (accurate)',
    apiContinuous: 'Continuous Detection',

    // Install
    installTitle: 'Install',
    installNpm: 'npm',
    installCdn: 'CDN',
    installEsm: 'ES Module',

    // Footer
    footerLicense: 'MIT License',
    footerMoreProjects: 'More projects',
    footerCopyright: '\u00A9 2026 Pavel Horak.',
    footerBuilt: 'Built with math, not AI.',
  },

  cs: {
    // Nav
    navDemo: 'Živé Demo',
    navHow: 'Jak to funguje',
    navApi: 'API',
    navInstall: 'Instalace',
    navGithub: 'GitHub',

    // Hero
    heroTitle: 'GlassesJS',
    heroTagline: 'Detekce brýlí v prohlížeči bez umělé inteligence',
    heroDescription: 'Zjistěte, zda člověk nosí brýle pomocí webkamery a bodů obličeje. Žádné AI modely, žádný server, žádné závislosti — čistá matematika.',
    heroDemo: 'Vyzkoušet Demo',
    heroInstall: 'npm install glassesjs',

    // Demo
    demoTitle: 'Živé Demo',
    demoDescription: 'Zapněte webkameru a sledujte detekci brýlí v reálném čase s výsledkem spolehlivosti a rozpisem jednotlivých metod.',
    demoStart: 'Spustit Kameru',
    demoStop: 'Zastavit',
    demoResult: 'Výsledek',
    demoGlasses: 'Brýle detekovány',
    demoNoGlasses: 'Brýle nedetekovány',
    demoConfidence: 'Spolehlivost',
    demoFrames: 'Analyzovaných snímků',
    demoWaiting: 'Čekám na data...',
    demoInitializing: 'Inicializuji MediaPipe...',
    demoError: 'Nelze přistoupit ke kameře. Povolte přístup ke kameře a zkuste to znovu.',
    demoNotSupported: 'Váš prohlížeč nepodporuje přístup k webkameře.',

    // Methods
    methodsTitle: 'Jak to funguje',
    methodsDescription: 'GlassesJS kombinuje 6 nezávislých detekčních metod, každá vrací skóre 0–100. Výsledná spolehlivost je vážený průměr.',
    methodBridge: 'Detekce hran na nosním můstku',
    methodBridgeDesc: 'Horizontální Sobelova detekce hran v oblasti nosního můstku. Obroučky brýlí vytvářejí silné horizontální hrany tam, kde sedí na nose.',
    methodTemple: 'Symetrie spánků',
    methodTempleDesc: 'Analýza vertikálních hran na obou spáncích. Straničky brýlí vytvářejí symetrické vertikální vzory na obou stranách obličeje.',
    methodIris: 'Stabilita duhovky',
    methodIrisDesc: 'Sleduje varianci pozice duhovky přes více snímků. Skla brýlí lámou světlo, což způsobuje vyšší varianci detekované pozice duhovky.',
    methodDepth: 'Z-hloubkový profil',
    methodDepthDesc: 'Analyzuje nespojitosti Z-souřadnic přes body očí. Brýle vytvářejí falešnou rovinu před obličejem.',
    methodContrast: 'Lokální kontrast',
    methodContrastDesc: 'Porovnává kontrast pixelů v oblasti očí vs. tváře. Skla brýlí mění lokální kontrast odlesky a tónováním.',
    methodColor: 'Barevná anomálie',
    methodColorDesc: 'Vzorkuje barvy v oblasti očí a porovnává s barvou kůže. Povrstvená skla posouvají barevnou teplotu.',

    // API
    apiTitle: 'API Reference',
    apiLightweight: 'Odlehčený režim',
    apiLightweightDesc: 'Už máte MediaPipe body — stačí je předat.',
    apiStandalone: 'Samostatný režim',
    apiStandaloneDesc: 'Knihovna se postará o MediaPipe interně. Stačí dodat video element.',
    apiSingle: 'Jeden snímek (rychlý)',
    apiAccumulated: 'Akumulovaný (přesný)',
    apiContinuous: 'Kontinuální detekce',

    // Install
    installTitle: 'Instalace',
    installNpm: 'npm',
    installCdn: 'CDN',
    installEsm: 'ES Module',

    // Footer
    footerLicense: 'MIT Licence',
    footerMoreProjects: 'Další projekty',
    footerCopyright: '\u00A9 2026 Pavel Horak.',
    footerBuilt: 'Postaveno na matematice, ne na AI.',
  },
};

// ─── Language management ─────────────────────────────────────────────

let currentLang = 'en';

/**
 * Get current language.
 */
function getLang() {
  return currentLang;
}

/**
 * Set language and update all translated elements.
 */
function setLang(lang) {
  if (!i18n[lang]) return;
  currentLang = lang;

  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  // Update all elements with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && i18n[lang][key]) {
      el.setAttribute('placeholder', i18n[lang][key]);
    }
  });

  // Update lang attribute on html
  document.documentElement.lang = lang === 'cs' ? 'cs' : 'en';

  // Store preference
  try {
    localStorage.setItem('glassesjs-lang', lang);
  } catch {}

  // Update toggle button states
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/**
 * Get a translation string by key.
 */
function t(key) {
  return i18n[currentLang][key] || i18n['en'][key] || key;
}

/**
 * Initialize language from stored preference or browser locale.
 */
function initLang() {
  let lang = 'en';

  // Check stored preference
  try {
    const stored = localStorage.getItem('glassesjs-lang');
    if (stored && i18n[stored]) {
      lang = stored;
    }
  } catch {}

  // Check browser locale if no stored preference
  if (!localStorage.getItem('glassesjs-lang')) {
    const browserLang = navigator.language?.toLowerCase();
    if (browserLang?.startsWith('cs')) {
      lang = 'cs';
    }
  }

  setLang(lang);
}
