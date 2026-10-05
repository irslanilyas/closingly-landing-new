/* Google Analytics 4 (property "Closingly", stream closingly.app, G-9S64ZB03KB)
   with Google Consent Mode v2.

   - Analytics only. Advertising storage, ad personalisation and Google
     signals are off everywhere: Closingly runs no ads.
   - Visitors in the EEA, the UK and Switzerland are asked first. Until they
     accept, Google applies "denied" by region and receives cookieless pings,
     and no analytics cookies are set. Everyone else is measured by default.
   - The notice is shown to browsers on a European time zone; the regional
     default above protects anyone it misses. The choice is remembered in this
     browser and can be changed from any [data-cookie-settings] button.

   Events use Google's recommended names so the standard reports work:
     generate_lead   a beta application went through (key event; beta.js)
     cta_click       a link to the beta page, with where it sits (cta_location)
     video_start     the hero demo was played with sound (components/home/hero)
     select_content  a workspace feature tab or an FAQ question was opened (their components)
   Page views, scrolls and outbound clicks come from enhanced measurement.

   Google's tag itself (gtag.js, about 150 KB) loads after the visitor first
   interacts with the page, or five seconds after load, so it never competes
   with the page for the first paint. Events sent before then wait in dataLayer. */
(() => {
 const MEASUREMENT_ID = 'G-9S64ZB03KB';
 const STORE = 'closingly-consent';
 const ASK_FIRST = ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'];

 // Only the live site reports; local and preview copies never send a hit.
 const LIVE = location.hostname === 'closingly.app';
 if (!LIVE) window[`ga-disable-${MEASUREMENT_ID}`] = true;

 window.dataLayer = window.dataLayer || [];
 function gtag() {dataLayer.push(arguments);}
 window.gtag = gtag;

 const noAds = {ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied'};
 gtag('consent', 'default', {...noAds, analytics_storage:'denied', region:ASK_FIRST});
 gtag('consent', 'default', {...noAds, analytics_storage:'granted'});
 let choice = null;
 try {choice = localStorage.getItem(STORE);} catch {}
 if (choice === 'granted' || choice === 'denied') gtag('consent', 'update', {analytics_storage:choice});

 gtag('js', new Date());
 gtag('config', MEASUREMENT_ID, {
  allow_google_signals:false,
  allow_ad_personalization_signals:false,
  cookie_expires:60 * 60 * 24 * 395 // about 13 months, as the Privacy Policy says
 });
 if (LIVE) {
  let loaded = false;
  const load = () => {
   if (loaded) return;
   loaded = true;
   const tag = document.createElement('script');
   tag.async = true;
   tag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
   document.head.append(tag);
  };
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(type => addEventListener(type, load, {once:true, passive:true}));
  const later = () => setTimeout(load, 5000);
  if (document.readyState === 'complete') later(); else addEventListener('load', later, {once:true});
 }

 /* ── The cookie notice ───────────────────────────────────────────────── */
 const zone = (() => {try {return Intl.DateTimeFormat().resolvedOptions().timeZone || '';} catch {return '';}})();
 const european = /^Europe\//.test(zone) || /^Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe)$/.test(zone);

 function forgetCookies() {
  const hosts = ['', location.hostname, `.${location.hostname.replace(/^www\./, '')}`];
  document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(name => /^_ga/.test(name)).forEach(name => {
   hosts.forEach(domain => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
   });
  });
 }
 function decide(value) {
  choice = value;
  try {localStorage.setItem(STORE, value);} catch {}
  gtag('consent', 'update', {analytics_storage:value});
  if (value === 'denied') forgetCookies();
  hideNotice();
 }

 let notice = null;
 function showNotice() {
  if (notice) return;
  if (!document.getElementById('cookie-note-style')) {
   const style = document.createElement('style');
   style.id = 'cookie-note-style';
   style.textContent = `
.cookie-note{position:fixed;left:16px;bottom:16px;z-index:60;width:min(400px,calc(100% - 32px));padding:18px 18px 16px;border:1px solid #ececea;border-radius:14px;background:#fff;box-shadow:0 18px 44px -18px rgba(35,37,34,.32),0 4px 12px -6px rgba(35,37,34,.12);color:#232522;font-family:var(--font-sans),system-ui,sans-serif;font-size:14px;line-height:1.5;letter-spacing:-.14px;animation:cookie-note-in .45s cubic-bezier(.16,1,.3,1) both}
.cookie-note p{margin:0}
.cookie-note a{color:inherit;text-decoration:underline;text-underline-offset:3px}
.cookie-note a:hover{color:#ff4601}
.cookie-note-actions{display:flex;gap:8px;margin-top:14px}
.cookie-note button{flex:1;min-height:40px;padding:0 14px;border-radius:9px;font:500 14px/1 var(--font-sans),system-ui,sans-serif;letter-spacing:-.28px;cursor:pointer;transition:background-color .2s,border-color .2s}
.cookie-note [data-consent="denied"]{border:1px solid #e3e3de;background:#fff;color:#232522}
.cookie-note [data-consent="denied"]:hover{border-color:#cfcfc8;background:#fafaf7}
.cookie-note [data-consent="granted"]{border:1px solid #232522;background:#232522;color:#fff}
.cookie-note [data-consent="granted"]:hover{background:#000}
.cookie-note button:focus-visible{outline:2px solid #232522;outline-offset:3px}
@keyframes cookie-note-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.cookie-note{animation:none}}
@media(max-width:767px){.cookie-note{left:12px;bottom:12px;width:calc(100% - 24px);font-size:13px}}`;
   document.head.append(style);
  }
  notice = document.createElement('section');
  notice.className = 'cookie-note';
  notice.setAttribute('aria-label', 'Cookie choice');
  notice.innerHTML = '<p>We use Google Analytics to see how people find and use this site. No ads, and nothing that follows you to other sites. <a href="/privacy#analytics">Privacy Policy</a></p><div class="cookie-note-actions"><button type="button" data-consent="denied">Decline</button><button type="button" data-consent="granted">Accept</button></div>';
  notice.addEventListener('click', event => {
   const button = event.target.closest('[data-consent]');
   if (button) decide(button.dataset.consent);
  });
  document.body.append(notice);
 }
 function hideNotice() {
  notice?.remove();
  notice = null;
 }

 /* ── Events ──────────────────────────────────────────────────────────── */
 function where(el) {
  if (el.closest('header')) return 'navigation';
  if (el.closest('footer')) return 'footer';
  return el.closest('section[id]')?.id || 'page';
 }
 function onClick(event) {
  const el = event.target instanceof Element ? event.target : null;
  if (!el) return;
  if (el.closest('[data-cookie-settings]')) {
   event.preventDefault();
   showNotice();
   notice?.querySelector(`[data-consent="${choice === 'denied' ? 'denied' : 'granted'}"]`)?.focus();
   return;
  }
  const link = el.closest('a[href]');
  if (link && /^\/?beta(\?|$)/.test(link.getAttribute('href')) && !location.pathname.startsWith('/beta')) {
   gtag('event', 'cta_click', {cta_location:where(link), link_text:link.innerText.trim().replace(/\s+/g, ' ').slice(0, 100)});
  }
 }

 function start() {
  document.addEventListener('click', onClick);
  if (european && !choice) showNotice();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
 else start();
})();
