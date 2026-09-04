/* Garden Match Masters accessibility/PWA patch — v2.1 */
(()=>{"use strict";
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
if(!q(".skip-link")){const a=document.createElement("a");a.className="skip-link";a.href="#sh";a.textContent="Sari la joc";document.body.prepend(a)}
const live=document.createElement("div");live.className="sr-only";live.id="a11y-live";live.setAttribute("role","status");live.setAttribute("aria-live","polite");live.setAttribute("aria-atomic","true");document.body.append(live);
const label=(sel,text)=>{const e=q(sel);if(e&&!e.getAttribute("aria-label"))e.setAttribute("aria-label",text)};
label("#lang-btn","Schimbă limba");label("#theme-btn","Schimbă tema");label("#hub-av","Editează profilul jucătorului");
const avatar=q("#hub-av");if(avatar){avatar.setAttribute("role","button");avatar.tabIndex=0;avatar.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();avatar.click()}})}
qa("[onclick]").forEach(e=>{if(!["BUTTON","A","INPUT"].includes(e.tagName)&&!e.hasAttribute("role")){e.setAttribute("role","button");e.tabIndex=0;e.addEventListener("keydown",x=>{if(x.key==="Enter"||x.key===" "){x.preventDefault();e.click()}})}});
const canvas=q("#pcanv");if(canvas){canvas.setAttribute("aria-hidden","true")}
const score=q("#score"),moves=q("#moves");[score,moves].filter(Boolean).forEach(e=>{e.setAttribute("role","status");e.setAttribute("aria-live","polite")});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
})();