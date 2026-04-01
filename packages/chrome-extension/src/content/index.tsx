// ─── Content script entry point ───────────────────────────────────
import { createRoot } from 'react-dom/client';
import App from './App';
import { createShadowHost } from './utils/shadowDom';
// Import CSS as a string so we can inject it into Shadow DOM
import contentCss from './styles/content.css?inline';

function mount() {
  const { shadow } = createShadowHost();

  // Inject font-face rules with resolved chrome-extension:// URLs
  const fontCss = [
    ['400', 'Poppins-Regular'],
    ['500', 'Poppins-Medium'],
    ['600', 'Poppins-SemiBold'],
    ['700', 'Poppins-Bold'],
  ].map(([weight, file]) =>
    `@font-face { font-family: 'Poppins'; font-weight: ${weight}; font-style: normal; font-display: swap; src: url('${chrome.runtime.getURL(`fonts/${file}.woff2`)}') format('woff2'); }`
  ).join('\n');

  // Inject all CSS into the shadow root
  const style = document.createElement('style');
  style.textContent = fontCss + '\n' + contentCss;

  // React mount point inside the shadow root
  const mountPoint = document.createElement('div');
  mountPoint.id = 'textcoach-root';
  shadow.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(<App />);
}

// Wait for the page to be ready before injecting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
