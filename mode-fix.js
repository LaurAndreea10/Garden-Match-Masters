// ── PROFILE ──
const AVATARS_F=['👩‍🌾','🧚‍♀️','🧝‍♀️','🌺','🦋','🌸','🍬','🌙','👸','🌻','🎀','💐'];
const AVATARS_M=['👨‍🌾','🧙‍♂️','🦸‍♂️','🌵','🐝','🍀','🌿','🦉','🧑‍🚀','🌲','🍄','⚡'];
const AVATARS_N=['🧑‍🌾','🌈','✨','🌟','🎪','🦄','🔮','🌊','🎭','🦊','🐱','🌙'];

let selGender='n',selAvatar='🧑‍🌾';

function openProfile(){
  // pre-fill
  $('profile-name').value=PLAYER.name||'';
  selGender=PLAYER.gender||'n';
  selAvatar=PLAYER.avatar||'🧑‍🌾';
  renderGenderOpts();
  renderAvatarGrid();
  updateProfilePreview();
  $('profile-modal').classList.remove('h');
  sfxClick();
  setTimeout(()=>$('profile-name').focus(),200);
}

function selectGender(g){
  selGender=g;
  selAvatar=g==='f'?AVATARS_F[0]:g==='m'?AVATARS_M[0]:AVATARS_N[0];
  renderGenderOpts();renderAvatarGrid();updateProfilePreview();sfxClick();
}

function renderGenderOpts(){
  document.querySelectorAll('.gender-opt').forEach(el=>{
    el.classList.toggle('on',el.dataset.g===selGender);
  });
}

function renderAvatarGrid(){
  const grid=$('avatar-grid');grid.innerHTML='';
  const pool=selGender==='f'?AVATARS_F:selGender==='m'?AVATARS_M:AVATARS_N;
  pool.forEach(av=>{
    const d=document.createElement('div');d.className='av-opt'+(av===selAvatar?' on':'');
    d.textContent=av;d.onclick=()=>{selAvatar=av;renderAvatarGrid();updateProfilePreview();sfxClick();};
    grid.appendChild(d);
  });
}

function updateProfilePreview(){
  const name=$('profile-name').value.trim()||'Grădinarul';
  const gLabel=selGender==='f'?'Grădinăriță':selGender==='m'?'Grădinar':'Jucător';
  $('prev-av').textContent=selAvatar;
  $('prev-name').textContent=name;
  $('prev-gender').textContent=gLabel;
}

function saveProfile(){
  const name=$('profile-name').value.trim();
  if(!name){$('profile-name').style.borderColor='var(--coral)';$('profile-name').focus();toast('✏️ Introdu un nume!');return;}
  PLAYER.name=name;PLAYER.gender=selGender;PLAYER.avatar=selAvatar;PLAYER.profileSet=true;
  $('hub-av').textContent=selAvatar;
  $('hub-pname').textContent=name;
  const gLabel=selGender==='f'?'Grădinăriță':selGender==='m'?'Grădinar':'Jucător';
  $('hub-plevel').textContent=`${gLabel} · Nivel ${PLAYER.level} · ${PLAYER.xp} XP`;
  $('profile-modal').classList.add('h');
  toast('✅ Profil salvat! Bun venit, '+name+'!');sfxWin();burst(innerWidth/2,innerHeight*.3);
}

// auto-open profile on first visit
window.addEventListener('load',()=>{
  setTimeout(()=>{if(!PLAYER.profileSet)openProfile();},600);
});

// ══════════════════════════════════════
// GLOBALS
// ══════════════════════════════════════
const $=id=>document.getElementById(id);
const rnd=n=>Math.floor(Math.random()*n);
const wait=ms=>new Promise(r=>setTimeout(r,ms));

// player state
const PLAYER={
  coins:340,seeds:7,gems:12,xp:1240,level:3,
  name:'',gender:'',avatar:'🌸',profileSet:false,
  totalScore:0,wins:0,combos:0,escapesSolved:0,
  starsTotal:18,dailyDone:false,
  zonesUnlocked:['gh','lm'],
  achievementsUnlocked:new Set(['first_match','combo3']),
  gardenItems:[
    {e:'🌷',n:'Lalele',x:60,y:80,z:'gh'},
    {e:'🌼',n:'Margarete',x:160,y:120,z:'gh'},
    {e:'🏮',n:'Felinar',x:280,y:90,z:'gh'},
    {e:'🏡',n:'Seră',x:80,y:180,z:'gh'},
    {e:'⛲',n:'Fântâna',x:200,y:160,z:'lm'},
    {e:'🌙',n:'Cristal',x:120,y:200,z:'mn'},
  ],
};

let curTheme='dark',curZone='gh';

// ══════════════════════════════════════
// AUDIO ENGINE (Web Audio API)
// ══════════════════════════════════════
let audioCtx=null;
function getAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx;}
function playTone(freq,type='sine',dur=0.12,vol=0.15,delay=0){
  try{const ac=getAudio();const o=ac.createOscillator();const g=ac.createGain();
    o.connect(g);g.connect(ac.destination);o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(0,ac.currentTime+delay);g.gain.linearRampToValueAtTime(vol,ac.currentTime+delay+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+delay+dur);
    o.start(ac.currentTime+delay);o.stop(ac.currentTime+delay+dur+0.05);}catch(e){}
}
function sfxMatch(){playTone(520,'sine',0.1,0.12);playTone(650,'sine',0.1,0.1,0.08);}
function sfxCombo(n){const freqs=[400,500,600,700,800,900];for(let i=0;i<Math.min(n,6);i++)playTone(freqs[i],'triangle',0.12,0.14,i*0.06);}
function sfxWin(){[520,660,780,1040].forEach((f,i)=>playTone(f,'sine',0.2,0.18,i*0.1));}
function sfxLose(){[400,350,300].forEach((f,i)=>playTone(f,'sawtooth',0.15,0.12,i*0.12));}
function sfxClick(){playTone(800,'sine',0.05,0.08);}
function sfxUnlock(){[600,750,900,1100].forEach((f,i)=>playTone(f,'sine',0.18,0.2,i*0.08));}
function sfxBoss(){playTone(150,'sawtooth',0.3,0.2);playTone(100,'square',0.2,0.15,0.1);}
function sfxPlace(){playTone(440,'sine',0.08,0.1);playTone(554,'sine',0.08,0.08,0.05);}

// ══════════════════════════════════════
// PARTICLES
// ══════════════════════════════════════
const pc=$('pcanv'),pctx=pc.getContext('2d');let PS=[];
function szPC(){pc.width=innerWidth;pc.height=innerHeight;}szPC();window.addEventListener('resize',szPC);
function addP(x,y,col,n=8){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*6;PS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1.5,life:1,dec:.025+Math.random()*.02,sz:5+Math.random()*8,col});}}
function addEmP(x,y,ems,n=8){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*7;PS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:1,dec:.02+Math.random()*.015,sz:8+Math.random()*10,em:ems[rnd(ems.length)]});}}
function burst(x,y){
  const cols=['#ff85c2','#ffe066','#5effa0','#7c6fff','#ff6b6b','#87e8ff'];
  const ems=['🌸','✨','⭐','🌟','💫','🎊'];
  for(let i=0;i<55;i++){const a=(i/55)*Math.PI*2,s=4+Math.random()*10;
    PS.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:1,dec:.012+Math.random()*.015,sz:8+Math.random()*12,em:ems[rnd(ems.length)]});}
}
(function rf(){pctx.clearRect(0,0,pc.width,pc.height);PS=PS.filter(p=>p.life>0);
  PS.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.life-=p.dec;pctx.globalAlpha=Math.max(0,p.life);
    if(p.em){pctx.font=`${p.sz*1.4}px serif`;pctx.fillText(p.em,p.x,p.y);}
    else{pctx.fillStyle=p.col;pctx.beginPath();pctx.arc(p.x,p.y,p.sz/2,0,Math.PI*2);pctx.fill();}
  });pctx.globalAlpha=1;requestAnimationFrame(rf);})();

// ══════════════════════════════════════
// THEME & ZONE
// ══════════════════════════════════════
function toggleTheme(){
  curTheme=curTheme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=curTheme;
  $('theme-btn').textContent=curTheme==='dark'?'🌙':'☀️';
  sfxClick();
}
function setZone(z){
  curZone=z;
  document.documentElement.dataset.zone=z;
  ['sh','ss','sd'].forEach(id=>{const el=$(id);if(el)el.dataset.zone=z;});
}

// ══════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════
let cur='hub';
const SM={hub:'sh',story:'ss',duel:'sd',escape:'se',decor:'sdec',ach:'sach'};
function sw(m){
  if(cur===m)return;
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  $(SM[m]).classList.add('on');cur=m;
  sfxClick();
  if(m==='duel'&&!duelInited)initDuel();
  if(m==='escape'&&!escInited)initEsc();
  if(m==='decor'&&!decInited)initDec();
  if(m==='ach')renderAch();
  if(m==='hub')renderHub();
}

// ══════════════════════════════════════
// TOAST & MODAL
// ══════════════════════════════════════
let ttm;
function toast(m,dur=2600){const t=$('tst');t.textContent=m;t.classList.add('on');clearTimeout(ttm);ttm=setTimeout(()=>t.classList.remove('on'),dur);}
function showM({emoji='🌸',title='',sub='',score=0,stars='',rewards=[],btn1='OK',btn2='',cb1,cb2}){
  $('me').textContent=emoji;$('mt').textContent=title;$('ms').textContent=sub;
  $('msc').textContent=score?score.toLocaleString()+' pts':'';$('mst').textContent=stars||'';
  $('mrw').innerHTML=rewards.map(r=>`<span class="rc r${r.c}">+${r.v} ${r.l}</span>`).join('');
  $('mb1').textContent=btn1;$('mb1').onclick=cb1||(()=>hideM());
  $('mb2').textContent=btn2;$('mb2').style.display=btn2?'':'none';
  if(btn2)$('mb2').onclick=cb2||(()=>hideM());
  $('modal').classList.remove('h');burst(innerWidth/2,innerHeight/2);
}
function hideM(){$('modal').classList.add('h');}

// ══════════════════════════════════════
// ACHIEVEMENTS
// ══════════════════════════════════════
const ACHIEVEMENTS=[
  {id:'first_match',cat:'story',icon:'🌱',name:'Prima Recoltă',desc:'Câștigă primul nivel',xp:50,gold:100},
  {id:'combo3',cat:'story',icon:'🔥',name:'Trio în Flăcări',desc:'Fă un combo x3',xp:30,gold:50},
  {id:'combo5',cat:'story',icon:'💫',name:'Cascadă Magică',desc:'Fă un combo x5',xp:80,gold:150},
  {id:'score5k',cat:'story',icon:'🌟',name:'5000 de Petale',desc:'Acumulează 5000 de puncte',xp:100,gold:200},
  {id:'stars9',cat:'story',icon:'⭐',name:'Colecționar de Stele',desc:'Obține 9 stele totale',xp:120,gold:250},
  {id:'boss1',cat:'boss',icon:'👑',name:'Regele Căzut',desc:'Înfrânge Regele Buruienilor',xp:200,gold:500},
  {id:'boss2',cat:'boss',icon:'🐌',name:'Melcul de Ciocolată',desc:'Înfrânge Melcul de Ciocolată',xp:250,gold:600},
  {id:'duel1',cat:'duel',icon:'⚔️',name:'Primul Duel',desc:'Câștigă un duel',xp:80,gold:150},
  {id:'duel5',cat:'duel',icon:'🏆',name:'Campion de Duel',desc:'Câștigă 5 dueluri',xp:200,gold:400},
  {id:'escape1',cat:'escape',icon:'🗝️',name:'Detectiv în Herbe',desc:'Rezolvă prima cameră',xp:100,gold:200},
  {id:'escape4',cat:'escape',icon:'🔐',name:'Master of Escape',desc:'Rezolvă toate 4 camere',xp:300,gold:700},
  {id:'decor1',cat:'decor',icon:'🌺',name:'Grădinarul Începător',desc:'Plasează 3 decoruri',xp:50,gold:100},
  {id:'decor10',cat:'decor',icon:'🎀',name:'Grădina Perfectă',desc:'Plasează 10 decoruri',xp:150,gold:300},
  {id:'daily1',cat:'daily',icon:'📅',name:'Devotat',desc:'Completează prima provocare zilnică',xp:100,gold:200},
  {id:'daily7',cat:'daily',icon:'🗓️',name:'Săptămâna Florală',desc:'7 zile consecutive',xp:400,gold:800},
  {id:'level5',cat:'profile',icon:'🌸',name:'Grădinarul Priceput',desc:'Ajunge la nivelul 5',xp:200,gold:400},
  {id:'powerup',cat:'story',icon:'⚡',name:'Uneltele Maestrului',desc:'Folosește toate 4 power-up-uri',xp:60,gold:120},
  {id:'jelly100',cat:'story',icon:'🔵',name:'Fără Jeleu',desc:'Elimină 100 de dale cu jeleu',xp:150,gold:300},
  {id:'rainbow',cat:'story',icon:'🌈',name:'Curcubeu Complet',desc:'Activează un special curcubeu',xp:70,gold:140},
  {id:'zone3',cat:'profile',icon:'🗺️',name:'Explorator',desc:'Deblochează 3 zone',xp:200,gold:400},
  {id:'zone4',cat:'profile',icon:'🌍',name:'Cuceritor',desc:'Deblochează toate zonele',xp:500,gold:1000},
  {id:'sounds',cat:'profile',icon:'🎵',name:'Meloman de Grădină',desc:'Joacă cu sunetele pornite',xp:20,gold:40},
  {id:'nightmode',cat:'profile',icon:'🌙',name:'Grădinarul Nocturn',desc:'Activează dark mode',xp:20,gold:40},
  {id:'score_total',cat:'story',icon:'💎',name:'Legenda Grădinii',desc:'Acumulează 50000 puncte total',xp:500,gold:1000},
];
const ACH_CATS=[
  {id:'all',label:'🌟 Toate',icon:'🌟'},
  {id:'story',label:'🌿 Story',icon:'🌿'},
  {id:'boss',label:'👑 Boss',icon:'👑'},
  {id:'duel',label:'⚔️ Duel',icon:'⚔️'},
  {id:'escape',label:'🗝️ Escape',icon:'🗝️'},
  {id:'decor',label:'🎀 Decor',icon:'🎀'},
  {id:'daily',label:'📅 Daily',icon:'📅'},
  {id:'profile',label:'👤 Profil',icon:'👤'},
];
let achCat='all';
function renderAch(){
  // categories
  const catsEl=$('ach-cats');catsEl.innerHTML='';
  ACH_CATS.forEach(c=>{
    const b=document.createElement('button');b.className='ach-cat-btn'+(c.id===achCat?' on':'');
    b.innerHTML=`<span class="ach-cat-icon">${c.icon}</span>${c.label}`;
    b.onclick=()=>{achCat=c.id;renderAch();};catsEl.appendChild(b);
  });
  // grid
  const grid=$('ach-grid');grid.innerHTML='';
  const list=achCat==='all'?ACHIEVEMENTS:ACHIEVEMENTS.filter(a=>a.cat===achCat);
  list.forEach(a=>{
    const unlocked=PLAYER.achievementsUnlocked.has(a.id);
    const d=document.createElement('div');d.className='ach-card '+(unlocked?'unlocked':'locked');
    d.innerHTML=`<span class="ach-icon">${unlocked?a.icon:'🔒'}</span>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      <span class="ach-badge ${unlocked?'done':'lock'}">${unlocked?'+'+a.gold+'🪙 +'+a.xp+' XP':'Blocat'}</span>`;
    grid.appendChild(d);
  });
  const cnt=PLAYER.achievementsUnlocked.size;
  $('ach-count').textContent=`${cnt}/${ACHIEVEMENTS.length} deblocate`;
  $('ach-prog-fill').style.width=(cnt/ACHIEVEMENTS.length*100)+'%';
}
function unlockAch(id){
  if(PLAYER.achievementsUnlocked.has(id))return;
  PLAYER.achievementsUnlocked.add(id);
  const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return;
  PLAYER.coins+=a.gold;PLAYER.xp+=a.xp;
  const b=$('ach-banner');b.textContent=`${a.icon} Achievement: ${a.name} +${a.gold}🪙`;
  b.classList.add('show');setTimeout(()=>b.classList.remove('show'),3200);
  sfxUnlock();
}
function renderAchMini(){
  const el=$('ach-mini-list');if(!el)return;el.innerHTML='';
  const recent=[...PLAYER.achievementsUnlocked].slice(-3);
  recent.forEach(id=>{
    const a=ACHIEVEMENTS.find(x=>x.id===id);if(!a)return;
    const d=document.createElement('div');d.className='ach-chip unlocked';
    d.innerHTML=`<span class="ae">${a.icon}</span><span class="an">${a.name}</span><span class="abadge">+${a.gold}🪙</span>`;
    el.appendChild(d);
  });
}

// ══════════════════════════════════════
// HUB — MAP & LEADERBOARD & DAILY
// ══════════════════════════════════════
const MAP_ZONES=[
  {id:'gh',e:'🏡',tag:'Zona 1',name:'Candy Greenhouse',levels:'1–15',stars:'⭐⭐⭐·12/15',
    style:'top:8%;left:5%',bg:'rgba(255,133,194,.22)',border:'rgba(255,133,194,.4)',shadow:'rgba(255,133,194,.2)',locked:false},
  {id:'lm',e:'⛲',tag:'Zona 2',name:'Lemon Fountain',levels:'16–30',stars:'⭐⭐·4/15',
    style:'top:10%;right:6%',bg:'rgba(255,224,102,.22)',border:'rgba(255,224,102,.4)',shadow:'rgba(255,224,102,.2)',locked:false},
  {id:'ch',e:'🌑',tag:'Zona 3',name:'Chocolate Maze',levels:'31–50',stars:'☆ Blocat',
    style:'bottom:20%;left:8%',bg:'rgba(139,69,19,.3)',border:'rgba(180,120,60,.4)',shadow:'rgba(139,69,19,.2)',locked:true},
  {id:'mn',e:'🌙',tag:'Zona 4',name:'Moon Garden',levels:'51–80',stars:'☆ Blocat',
    style:'bottom:8%;right:5%',bg:'rgba(124,111,255,.25)',border:'rgba(124,111,255,.4)',shadow:'rgba(124,111,255,.2)',locked:true},
  {id:'boss',e:'👑',tag:'BOSS',name:'Regele Buruienilor',levels:'Nivel 20+',stars:'🔥 Boss Fight',
    style:'top:42%;left:42%',bg:'rgba(255,60,60,.22)',border:'rgba(255,80,80,.4)',shadow:'rgba(255,60,60,.2)',locked:false},
];
const LEADERBOARD=[
  {rank:1,av:'🦊',name:'CandyFox99',sc:48200},
  {rank:2,av:'👑',name:'BeeQueen',sc:42100},
  {rank:3,av:'🐱',name:'MoonCat',sc:38500},
  {rank:4,av:'🧑‍🌾',name:'Tu',sc:PLAYER.totalScore||12400,me:true},
  {rank:5,av:'🌶️',name:'PepperKing',sc:11000},
];
const DAILY_CHALLENGES=[
  {desc:'Fă 5 combo-uri în Candy Greenhouse',zone:'gh'},
  {desc:'Obține 3 stele în Lemon Fountain',zone:'lm'},
  {desc:'Completează un nivel fără power-up-uri',zone:'gh'},
  {desc:'Câștigă un duel cu 2000+ puncte avans',zone:'duel'},
  {desc:'Rezolvă o cameră Escape în sub 2 minute',zone:'escape'},
];

let dailyChallenge=DAILY_CHALLENGES[new Date().getDay()%DAILY_CHALLENGES.length];
let dailyTimerInterval=null;

function renderHub(){
  // map zones
  const map=$('gmap');
  map.querySelectorAll('.map-zone-btn').forEach(e=>e.remove());
  MAP_ZONES.forEach(z=>{
    const d=document.createElement('div');
    d.className='map-zone-btn'+(z.locked?' locked':'');
    d.style.cssText=z.style+';--zb-bg:'+z.bg+';--zb-border:'+z.border+';--zb-shadow:'+z.shadow;
    d.innerHTML=`<span class="mze">${z.e}</span><p class="mztag">${z.tag}</p>
      <p class="mzn">${z.name}</p><p class="mzl">${z.levels}</p><p class="mzs">${z.stars}</p>
      ${z.locked?'<span style="font-size:1.2rem;margin-top:4px;display:block">🔒</span>':''}`;
    d.onclick=()=>{
      if(z.locked){toast('🔒 Deblochează zona anterioară mai întâi!');return;}
      sfxClick();
      if(z.id==='boss'){startBoss();return;}
      setZone(z.id);
      const zk={gh:'gh',lm:'lm',ch:'ch',mn:'mn'}[z.id]||'gh';
      initGame(zk);sw('story');
    };
    map.appendChild(d);
  });
  // leaderboard
  const lb=$('lb-list');lb.innerHTML='';
  LEADERBOARD.forEach(p=>{
    const d=document.createElement('div');d.className='lb-row'+(p.me?' me':'');
    const rankCls=p.rank===1?'gold':p.rank===2?'silver':p.rank===3?'bronze':'';
    d.innerHTML=`<span class="lb-rank ${rankCls}">${p.rank===1?'🥇':p.rank===2?'🥈':p.rank===3?'🥉':p.rank}</span>
      <span class="lb-av">${p.av}</span><span class="lb-name">${p.name}</span>
      <span class="lb-sc">${p.sc.toLocaleString()}</span>`;
    lb.appendChild(d);
  });
  // daily
  $('daily-desc').textContent=dailyChallenge.desc;
  if(PLAYER.dailyDone){$('daily-btn').textContent='✅ Completat!';$('daily-btn').classList.add('done');}
  startDailyTimer();
  renderAchMini();
  unlockAch('nightmode'); // unlock for using the app
}
function startDailyTimer(){
  clearInterval(dailyTimerInterval);
  function tick(){
    const now=new Date();const midnight=new Date(now);midnight.setHours(24,0,0,0);
    const diff=Math.floor((midnight-now)/1000);
    const h=Math.floor(diff/3600),m=Math.floor((diff%3600)/60),s=diff%60;
    $('daily-timer').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  tick();dailyTimerInterval=setInterval(tick,1000);
}
function startDaily(){
  if(PLAYER.dailyDone){toast('✅ Ai completat deja provocarea de azi!');return;}
  sfxClick();setZone(dailyChallenge.zone==='duel'?'gh':dailyChallenge.zone);
  if(dailyChallenge.zone==='duel'){sw('duel');return;}
  if(dailyChallenge.zone==='escape'){sw('escape');return;}
  initGame(dailyChallenge.zone);sw('story');
  toast('📅 Daily Challenge activ! '+dailyChallenge.desc);
}

// ══════════════════════════════════════
// MATCH-3 ENGINE
// ══════════════════════════════════════
const TL=[
  {e:'🌸',n:'trandafir',c:'#ff85c2'},{e:'🍬',n:'bomboană',c:'#ffe066'},
  {e:'🍋',n:'lămâie',c:'#c8ff00'},{e:'🌿',n:'frunzuță',c:'#5effa0'},
  {e:'🫐',n:'afine',c:'#7c6fff'},{e:'🌻',n:'floare',c:'#ffab40'},
];
const ZN={
  gh:{tag:'🌸 Candy Greenhouse',mv:30,t:1200,s2:1800,s3:2600,
    goals:[{t:0,n:15,l:'trandafiri'},{t:1,n:12,l:'bomboane'}],jelly:true,weeds:false,boss:false},
  lm:{tag:'🍋 Lemon Fountain',mv:25,t:1500,s2:2200,s3:3000,
    goals:[{t:2,n:18,l:'lămâi'},{t:3,n:10,l:'frunzuțe'}],jelly:false,weeds:true,boss:false},
  ch:{tag:'🍫 Chocolate Maze',mv:20,t:2000,s2:2800,s3:3800,
    goals:[{t:4,n:20,l:'afine'},{t:5,n:15,l:'flori-soare'}],jelly:true,weeds:true,boss:false},
  boss_weed:{tag:'👑 Regele Buruienilor',mv:35,t:2500,s2:3500,s3:5000,
    goals:[{t:0,n:20,l:'trandafiri'},{t:3,n:15,l:'frunzuțe'}],jelly:true,weeds:true,boss:true,
    bossName:'👑 Regele Buruienilor',bossHP:100,bossAttack:'Noroi pe 4 dale',bossPhase2:'Caramel viu se extinde!'},
  boss_choco:{tag:'🐌 Melcul de Ciocolată',mv:30,t:3000,s2:4000,s3:6000,
    goals:[{t:4,n:25,l:'afine'},{t:5,n:20,l:'flori-soare'}],jelly:true,weeds:true,boss:true,
    bossName:'🐌 Melcul de Ciocolată',bossHP:120,bossAttack:'Liane pe 6 dale',bossPhase2:'Ciocolata se topește rapid!'},
};
const RC=8,CC=8;
let B=[],sel=null,sc=0,mv=0,combo=0,busy=false;
let jelly=new Set(),weed=new Set(),pu={},zc=null,hT=null,aPU=null,gp={};
let bossHP=0,bossMaxHP=0,bossPhase=1,isBoss=false;
let jellyBroken=0,rainbowUsed=false,puUsed=new Set();
const PU=[{id:'s',e:'🪣',n:'Scoatere',a:'rm'},{id:'b',e:'💥',n:'Bombă 3×3',a:'b3'},
  {id:'r',e:'🌈',n:'Curcubeu',a:'rb'},{id:'m',e:'⚡',n:'+5 Mutări',a:'mv'}];

function initGame(zk='gh'){
  const z=ZN[zk];zc=z;mv=z.mv;sc=0;combo=0;sel=null;busy=false;aPU=null;
  jelly=new Set();weed=new Set();gp={};z.goals.forEach(g=>gp[g.t]=0);
  pu={s:3,b:2,r:1,m:1};jellyBroken=0;rainbowUsed=false;puUsed=new Set();
  isBoss=z.boss||false;
  if(isBoss){
    bossHP=z.bossHP;bossMaxHP=z.bossHP;bossPhase=1;
    $('boss-bar-wrap').classList.add('on');
    $('boss-name').textContent=z.bossName;
    $('boss-hp').style.width='100%';
    $('boss-phase').textContent='Faza 1 · Atac: '+z.bossAttack;
    $('boss-hint').style.display='flex';
    sfxBoss();
  }else{
    $('boss-bar-wrap').classList.remove('on');
    $('boss-hint').style.display='none';
  }
  $('ztag').textContent=z.tag;
  $('hmv').textContent=mv;$('hsc').textContent=0;$('hst2').textContent='☆☆☆';
  $('mvn').textContent=mv;$('scn').textContent='0';
  $('tlbl').textContent='Țintă: '+z.t.toLocaleString();
  $('pf').style.width='0%';$('srw').textContent='☆☆☆';$('cbar').innerHTML='';
  renderGoals();renderPU();
  do{B=[];for(let r=0;r<RC;r++){B[r]=[];for(let c=0;c<CC;c++)B[r][c]={t:rnd(TL.length),sp:null};}qRes();}while(!hasMv());
  if(z.jelly)for(let i=0;i<12;i++)jelly.add(`${rnd(RC)},${rnd(CC)}`);
  if(z.weeds)for(let i=0;i<6;i++)weed.add(`${rnd(RC)},${rnd(CC)}`);
  renderB();startHint();
  unlockAch('sounds');
}
function qRes(){let f=true;while(f){f=false;const m=fndM();if(m.length){m.forEach(({r,c})=>B[r][c]=null);colB();filB();f=true;}}}
function renderB(){
  const el=$('mb');el.innerHTML='';
  for(let r=0;r<RC;r++)for(let c=0;c<CC;c++){
    const d=document.createElement('div');d.className='tile';d.dataset.r=r;d.dataset.c=c;
    const ti=B[r][c];
    if(ti){d.textContent=TL[ti.t].e;if(ti.sp==='r')d.classList.add('spr');else if(ti.sp==='b')d.classList.add('spb');else if(ti.sp==='w')d.classList.add('spw');}
    const k=`${r},${c}`;
    if(jelly.has(k))d.classList.add('jel');
    if(weed.has(k))d.classList.add('lck');
    d.addEventListener('click',()=>onT(r,c));
    el.appendChild(d);
  }
  if(sel)gT(sel.r,sel.c)?.classList.add('sel');
}
function gT(r,c){return document.querySelector(`#mb [data-r="${r}"][data-c="${c}"]`);}
function onT(r,c){
  if(busy)return;clrHint();
  if(aPU){apPU(r,c);return;}
  if(!sel){sel={r,c};renderB();startHint();return;}
  if(sel.r===r&&sel.c===c){sel=null;renderB();startHint();return;}
  if(Math.abs(sel.r-r)+Math.abs(sel.c-c)===1){doSwap(sel.r,sel.c,r,c);}
  else{sel={r,c};renderB();}
  startHint();
}
async function doSwap(r1,c1,r2,c2){
  busy=true;sel=null;sw2(r1,c1,r2,c2);
  if(!fndM().length){sw2(r1,c1,r2,c2);renderB();shk(r1,c1);shk(r2,c2);busy=false;startHint();return;}
  mv--;combo=0;$('hmv').textContent=mv;$('mvn').textContent=mv;
  renderB();await cascade();
  if(isBoss)bossAttack();
  busy=false;
  if(chkW()){setTimeout(showWin,500);return;}
  if(mv<=0){setTimeout(showLose,500);return;}
  if(!hasMv())reshuf();
  startHint();
}
function sw2(r1,c1,r2,c2){[B[r1][c1],B[r2][c2]]=[B[r2][c2],B[r1][c1]];}
async function cascade(){
  let m=fndM();
  while(m.length){
    combo++;const pts=m.length*15*Math.max(1,combo);sc+=pts;
    PLAYER.totalScore+=pts;PLAYER.combos++;
    m.forEach(({r,c})=>{
      if(!B[r][c])return;const t=B[r][c].t;
      zc.goals.forEach(g=>{if(g.t===t)gp[t]=(gp[t]||0)+1;});
      if(jelly.has(`${r},${c}`)){jelly.delete(`${r},${c}`);jellyBroken++;}
    });
    // boss damage
    if(isBoss&&combo>=2){
      const dmg=combo*8;bossHP=Math.max(0,bossHP-dmg);
      $('boss-hp').style.width=(bossHP/bossMaxHP*100)+'%';
      if(bossHP<=bossMaxHP/2&&bossPhase===1){bossPhase=2;$('boss-phase').textContent='Faza 2 · '+zc.bossPhase2;sfxBoss();toast('💀 Boss: Faza 2! '+zc.bossPhase2);}
    }
    sfxMatch();if(combo>=2)sfxCombo(combo);
    showCombo(combo,pts);await animM(m);spawnSp(m);colB();filB();renderB();updG();updSc();await wait(190);
    m=fndM();
  }
  // achievement checks
  if(combo>=3)unlockAch('combo3');
  if(combo>=5)unlockAch('combo5');
  if(sc>=5000)unlockAch('score5k');
  if(PLAYER.totalScore>=50000)unlockAch('score_total');
  if(jellyBroken>=100)unlockAch('jelly100');
}
function bossAttack(){
  if(!isBoss)return;
  // add weeds/jellies randomly
  for(let i=0;i<(bossPhase===2?4:2);i++){
    const k=`${rnd(RC)},${rnd(CC)}`;
    if(bossPhase===1)jelly.add(k);else weed.add(k);
  }
  renderB();
  // animate boss damage on a random tile
  const tiles=document.querySelectorAll('.tile');
  if(tiles.length){const t=tiles[rnd(tiles.length)];t.classList.add('boss-dmg');setTimeout(()=>t.classList.remove('boss-dmg'),300);}
}
function fndM(){
  const s=new Set();
  for(let r=0;r<RC;r++)for(let c=0;c<CC-2;c++){
    if(!B[r][c]||!B[r][c+1]||!B[r][c+2])continue;
    if(B[r][c].t===B[r][c+1].t&&B[r][c].t===B[r][c+2].t){let l=3;while(c+l<CC&&B[r][c+l]?.t===B[r][c].t)l++;for(let i=0;i<l;i++)s.add(`${r},${c+i}`);}
  }
  for(let c=0;c<CC;c++)for(let r=0;r<RC-2;r++){
    if(!B[r][c]||!B[r+1][c]||!B[r+2][c])continue;
    if(B[r][c].t===B[r+1][c].t&&B[r][c].t===B[r+2][c].t){let l=3;while(r+l<RC&&B[r+l][c]?.t===B[r][c].t)l++;for(let i=0;i<l;i++)s.add(`${r+i},${c}`);}
  }
  return[...s].map(k=>{const[r,c]=k.split(',').map(Number);return{r,c};});
}
async function animM(m){
  m.forEach(({r,c})=>{
    const el=gT(r,c);if(el)el.classList.add('mat');
    const ti=B[r][c];if(ti){const rect=el?.getBoundingClientRect();if(rect)addEmP(rect.left+rect.width/2,rect.top+rect.height/2,[TL[ti.t].e,'✨'],3);}
  });
  await wait(320);m.forEach(({r,c})=>B[r][c]=null);
}
function spawnSp(m){
  const rows={};m.forEach(({r,c})=>(rows[r]=rows[r]||[]).push(c));
  Object.entries(rows).forEach(([r,cols])=>{
    if(cols.length>=5){const c=cols[Math.floor(cols.length/2)];if(!B[r][c])B[r][c]={t:rnd(TL.length),sp:'w'};}
    else if(cols.length===4){const c=cols[1];if(!B[r][c])B[r][c]={t:rnd(TL.length),sp:'r'};}
  });
}
function colB(){for(let c=0;c<CC;c++){let e=RC-1;for(let r=RC-1;r>=0;r--){if(B[r][c]){B[e][c]=B[r][c];if(e!==r)B[r][c]=null;e--;}}for(let r=e;r>=0;r--)B[r][c]=null;}}
function filB(){for(let r=0;r<RC;r++)for(let c=0;c<CC;c++)if(!B[r][c])B[r][c]={t:rnd(TL.length),sp:null};}
function hasMv(){for(let r=0;r<RC;r++)for(let c=0;c<CC;c++){const p=[[0,1],[1,0]];for(const[dr,dc]of p){const r2=r+dr,c2=c+dc;if(r2>=RC||c2>=CC)continue;sw2(r,c,r2,c2);const h=fndM().length>0;sw2(r,c,r2,c2);if(h)return true;}}return false;}
function reshuf(){toast('🔀 Tabla amestecată!');const fl=B.flat().filter(Boolean);for(let i=fl.length-1;i>0;i--){const j=rnd(i+1);[fl[i],fl[j]]=[fl[j],fl[i]];}let k=0;for(let r=0;r<RC;r++)for(let c=0;c<CC;c++)B[r][c]=fl[k++]||{t:rnd(TL.length),sp:null};qRes();renderB();}
function shk(r,c){const el=gT(r,c);if(!el)return;el.style.animation='none';el.offsetHeight;el.style.animation='tH .3s ease 2';setTimeout(()=>el.style.animation='',600);}
function startHint(){clrHint();hT=setTimeout(()=>{const h=fndHint();if(h){h.forEach(({r,c})=>gT(r,c)?.classList.add('hin'));setTimeout(()=>document.querySelectorAll('.tile.hin').forEach(e=>e.classList.remove('hin')),1500);}},5500);}
function clrHint(){if(hT){clearTimeout(hT);hT=null;}document.querySelectorAll('.tile.hin').forEach(e=>e.classList.remove('hin'));}
function fndHint(){for(let r=0;r<RC;r++)for(let c=0;c<CC;c++){const p=[[0,1],[1,0]];for(const[dr,dc]of p){const r2=r+dr,c2=c+dc;if(r2>=RC||c2>=CC)continue;sw2(r,c,r2,c2);const h=fndM().length>0;sw2(r,c,r2,c2);if(h)return[{r,c},{r:r2,c:c2}];}}return null;}
function showCombo(c,pts){const bar=$('cbar');const el=document.createElement('div');el.className='ct';el.textContent=c>=2?`COMBO ×${c}! +${pts}`:`+${pts}`;bar.innerHTML='';bar.appendChild(el);setTimeout(()=>{if(bar.contains(el))bar.innerHTML='';},1100);}
function updSc(){$('scn').textContent=sc.toLocaleString();$('hsc').textContent=sc;$('slbl').textContent=sc.toLocaleString()+' pts';const z=zc;const pct=Math.min(100,(sc/z.s3)*100);$('pf').style.width=pct+'%';const st=sc>=z.s3?'⭐⭐⭐':sc>=z.s2?'⭐⭐':sc>=z.t?'⭐':'☆☆☆';$('srw').textContent=st;$('hst2').textContent=st;}
function renderGoals(){const el=$('glist');el.innerHTML='';zc.goals.forEach(g=>{const d=document.createElement('div');d.className='gr';d.id=`gl${g.t}`;d.innerHTML=`<span>${TL[g.t].e}</span><span style="flex:1;color:var(--muted);font-size:.7rem">${g.l}</span><span class="gc" id="gc${g.t}">0/${g.n}</span>`;el.appendChild(d);});}
function updG(){zc.goals.forEach(g=>{const el=$(`gc${g.t}`);if(!el)return;const cur=Math.min(gp[g.t]||0,g.n);el.textContent=`${cur}/${g.n}`;el.closest('.gr').classList.toggle('done',cur>=g.n);});}
function renderPU(){const el=$('pugrid');el.innerHTML='';PU.forEach(p=>{const b=document.createElement('button');b.className='pb';b.disabled=!pu[p.id];b.innerHTML=`<span class="pc">${pu[p.id]||0}</span><span class="pe">${p.e}</span><span class="pn">${p.n}</span>`;b.onclick=()=>actPU(p.id,p.a);el.appendChild(b);});}
function actPU(id,a){
  if(a==='mv'){mv+=5;$('hmv').textContent=mv;$('mvn').textContent=mv;pu[id]=0;renderPU();toast('⚡ +5 mutări!');puUsed.add(id);if(puUsed.size>=4)unlockAch('powerup');return;}
  aPU={id,a};toast('Selectează o celulă pe tablă');puUsed.add(id);if(puUsed.size>=4)unlockAch('powerup');
}
async function apPU(r,c){
  const{id,a}=aPU;aPU=null;pu[id]=0;renderPU();busy=true;
  if(a==='rm'){B[r][c]=null;colB();filB();renderB();await cascade();}
  else if(a==='b3'){const rm=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<RC&&nc>=0&&nc<CC)rm.push({r:nr,c:nc});}await animM(rm);colB();filB();renderB();await cascade();}
  else if(a==='rb'){const t=B[r][c]?.t;rainbowUsed=true;unlockAch('rainbow');if(t!=null){const rm=[];for(let rr=0;rr<RC;rr++)for(let cc2=0;cc2<CC;cc2++)if(B[rr][cc2]?.t===t)rm.push({r:rr,c:cc2});await animM(rm);colB();filB();renderB();await cascade();}}
  busy=false;if(chkW())setTimeout(showWin,500);else if(mv<=0)setTimeout(showLose,500);
}
function chkW(){
  if(isBoss)return bossHP<=0&&zc.goals.every(g=>(gp[g.t]||0)>=g.n);
  return zc.goals.every(g=>(gp[g.t]||0)>=g.n)&&sc>=zc.t;
}
function showWin(){
  PLAYER.wins++;sfxWin();
  const z=zc;const st=sc>=z.s3?'⭐⭐⭐':sc>=z.s2?'⭐⭐':'⭐';
  const starsN=st==='⭐⭐⭐'?3:st==='⭐⭐'?2:1;
  PLAYER.starsTotal+=starsN;
  PLAYER.coins+=120;PLAYER.seeds+=2;PLAYER.xp+=80;
  if(PLAYER.wins>=1)unlockAch('first_match');
  if(isBoss){zc===ZN.boss_weed?unlockAch('boss1'):unlockAch('boss2');sfxBoss();}
  if(PLAYER.starsTotal>=9)unlockAch('stars9');
  // garden builder: add flower
  const zid=curZone;
  const items=PLAYER.gardenItems.filter(x=>x.z===zid);
  if(items.length<20){
    const newItem={e:TL[rnd(TL.length)].e,n:'Câștig',x:50+rnd(250),y:50+rnd(150),z:zid};
    PLAYER.gardenItems.push(newItem);
    toast('🌱 Grădina a crescut! Un nou element a apărut.');
  }
  showM({emoji:isBoss?'👑':'🌸',title:isBoss?'Boss Înfrânt!':'Nivel Complet!',
    sub:`${z.tag} — bine jucat!`,score:sc,stars:st,
    rewards:[{c:'g',v:120,l:'🪙 Monede'},{c:'k',v:starsN,l:'⭐ Stele'},{c:'d',v:2,l:'🌱 Semințe'},{c:'m',v:1,l:'💎 Gemă'}],
    btn1:'Hartă →',btn2:'Replai',
    cb1:()=>{hideM();sw('hub');renderHub();},
    cb2:()=>{hideM();initGame(Object.keys(ZN).find(k=>ZN[k]===zc)||'gh');}});
}
function showLose(){sfxLose();showM({emoji:'🥀',title:'Mutări epuizate!',sub:'Nu ai atins obiectivele. Încearcă din nou!',score:sc,stars:'☆',rewards:[],btn1:'Încearcă din nou',btn2:'Hartă',cb1:()=>{hideM();initGame(Object.keys(ZN).find(k=>ZN[k]===zc)||'gh');},cb2:()=>{hideM();sw('hub');}});}

// BOSS entry
function startBoss(){
  const b=rnd(2)===0?'boss_weed':'boss_choco';
  setZone('ch');initGame(b);sw('story');
  toast('💀 Boss Battle! '+ZN[b].bossName);
}
initGame('gh');

// ══════════════════════════════════════
// DUEL
// ══════════════════════════════════════
const CHARS=[
  {av:'👩‍🌾',n:'Mia Gardener',b:[{e:'🌸',l:'Flori-bombă',col:'var(--candy)',sp:'flower'},{e:'🐝',l:'Albinuță',col:'var(--gold)',sp:'bee'}]},
  {av:'🦊',n:'Candy Fox',b:[{e:'🎭',l:'Furtișag',col:'var(--lemon)',sp:'steal'},{e:'💨',l:'Sprint',col:'var(--mint)',sp:'sprint'}]},
  {av:'👑',n:'Bee Queen',b:[{e:'🐝',l:'Roi',col:'var(--gold)',sp:'swarm'},{e:'⚡',l:'Curent',col:'var(--lemon)',sp:'shock'}]},
  {av:'🐱',n:'Moon Cat',b:[{e:'🌙',l:'Dublu ×2',col:'var(--moon)',sp:'double'},{e:'✨',l:'Magie',col:'var(--candy)',sp:'magic'}]},
  {av:'🌶️',n:'Pepper King',b:[{e:'🔥',l:'Explozie',col:'var(--coral)',sp:'blast'},{e:'💣',l:'Bombă',col:'var(--choco)',sp:'bomb'}]},
];
const BONUS={flower:180,bee:150,steal:200,sprint:130,swarm:220,shock:160,double:250,magic:190,blast:230,bomb:210};
let dRun=false,dSec=120,dp1=0,dp2=0,dInt=null,selCh=0,duelInited=false,duelWins=0;
function initDuel(){
  duelInited=true;
  const cg=$('cgrid');cg.innerHTML='';
  CHARS.forEach((ch,i)=>{
    const d=document.createElement('div');d.className='cc'+(i===0?' on':'');
    d.innerHTML=`<span class="ce">${ch.av}</span>${ch.n}`;
    d.onclick=()=>{selCh=i;document.querySelectorAll('.cc').forEach((x,j)=>x.classList.toggle('on',j===i));applyChar();sfxClick();};
    cg.appendChild(d);
  });
  applyChar();buildMinis();
  unlockAch('sounds');
}
function applyChar(){
  const ch=CHARS[selCh];$('dav1').textContent=ch.av;$('dpc1').textContent=ch.n;
  const br=$('dbst1');br.innerHTML='';
  ch.b.forEach(b=>{const s=document.createElement('span');s.className='bc';s.style.color=b.col;
    s.textContent=`${b.e} ${b.l}`;s.onclick=()=>useBoost(b.sp);br.appendChild(s);});
  const aiCh=CHARS[(selCh+1+rnd(CHARS.length-1))%CHARS.length];$('dpcai').textContent=aiCh.n;
}
function buildMinis(){
  ['dbp1','dbp2'].forEach((id,pi)=>{
    const el=$(id);el.innerHTML='';const mud=pi?[5,12,20,27]:[];
    for(let i=0;i<36;i++){const d=document.createElement('div');d.className='dt'+(mud.includes(i)?' mud':'');if(!mud.includes(i))d.textContent=TL[rnd(TL.length)].e;el.appendChild(d);}
  });
}
function startDuel(){
  if(dRun)return;dRun=true;dp1=0;dp2=0;dSec=120;
  buildMinis();updDS();$('dlog').innerHTML='🎮 Duelul a început!<br>';
  $('dsbtn').textContent='⏹ Stop';$('dsbtn').onclick=endDuel;sfxClick();
  dInt=setInterval(()=>{
    dSec--;const m=Math.floor(dSec/60),s=dSec%60;$('dtmr').textContent=`${m}:${String(s).padStart(2,'0')}`;
    if(dSec%3===0){const p=rnd(90)+20;dp2+=p;dlog(`🤖 AI: +${p} pts`);rebM('dbp2',[rnd(36)]);}
    if(dSec%5===0){const p=rnd(130)+40;dp1+=p;dlog(`${CHARS[selCh].av} Tu: +${p} pts (combo!)`);rebM('dbp1');}
    updDS();if(dSec<=0)endDuel();
  },1000);
}
function endDuel(){
  clearInterval(dInt);dRun=false;$('dsbtn').textContent='▶ Start';$('dsbtn').onclick=startDuel;
  const won=dp1>dp2;dlog(won?'🏆 Tu ai câștigat!':'💀 AI a câștigat!');
  if(won){duelWins++;PLAYER.wins++;PLAYER.coins+=200;sfxWin();unlockAch('duel1');if(duelWins>=5)unlockAch('duel5');}
  else sfxLose();
  showM({emoji:won?'🏆':'🥀',title:won?'Victorie!':'Înfrângere',
    sub:won?`+${(dp1-dp2).toLocaleString()} pts față de AI`:`AI te-a depășit cu ${(dp2-dp1).toLocaleString()} pts`,
    score:dp1,stars:won?'⭐⭐⭐':'☆',
    rewards:won?[{c:'g',v:200,l:'🪙 Monede'},{c:'m',v:1,l:'💎 Gemă duel'}]:[],
    btn1:'Revanșă',btn2:'Hartă',
    cb1:()=>{hideM();startDuel();},cb2:()=>{hideM();sw('hub');}});
}
function rebM(id,mud=[]){$(id).querySelectorAll('.dt').forEach((t,i)=>{if(!mud.includes(i)){t.classList.remove('mud');t.textContent=TL[rnd(TL.length)].e;}else{t.classList.add('mud');t.textContent='';}});}
function updDS(){$('dps1').textContent=dp1.toLocaleString();$('dps2').textContent=dp2.toLocaleString();$('vsl').innerHTML=dp1>dp2?`Tu conduci<br><strong>+${dp1-dp2}</strong> pts`:dp1===dp2?'Egalitate!':`AI conduce<br><strong>+${dp2-dp1}</strong> pts`;}
function dlog(m){const el=$('dlog');el.innerHTML+=m+'<br>';el.scrollTop=el.scrollHeight;}
function useBoost(sp){if(!dRun){toast('⚔️ Apasă Start mai întâi!');return;}const b=BONUS[sp]||100;dp1+=b;updDS();dlog(`✨ Booster ${sp} activat! +${b} pts`);rebM('dbp1');burst(innerWidth*.28,innerHeight*.5);toast(`✨ +${b} pts din booster!`);sfxCombo(3);}

// ══════════════════════════════════════
// ESCAPE
// ══════════════════════════════════════
const ROOMS=[
  {title:'🌸 Camera din Seră',name:'Camera din Seră',desc:'Grădinarul a lăsat ceva în urmă.',code:'G437',
    objects:[{id:'key',e:'🗝️',s:'top:22%;left:15%',cl:'Cheia gravată: litera G',ci:'c1'},
      {id:'flower',e:'🌺',s:'top:55%;left:52%',cl:'Floarea are 4 petale — cifra: 4',ci:'c2'},
      {id:'book',e:'📖',s:'top:15%;right:18%',cl:'Jurnalul: "Luna a 3-a" — cifra: 3',ci:'c3'},
      {id:'lantern',e:'🏮',s:'bottom:22%;left:28%',cl:'Felinarul luminează cifra: 7',ci:'c4'},
      {id:'chest',e:'🪣',s:'bottom:15%;right:22%',chest:true}],
    clues:[{id:'c1',t:'O cheie veche ascunsă...'},{id:'c2',t:'O floare ciudată cu petale...'},{id:'c3',t:'Jurnalul grădinarului...'},{id:'c4',t:'Felinarul magic...'}]},
  {title:'🍋 Fântâna Lemon',name:'Fântâna Blocată',desc:'Caramelul a blocat fântâna!',code:'L582',
    objects:[{id:'lemon',e:'🍋',s:'top:20%;left:20%',cl:'Extract de lemon — litera L',ci:'c1'},
      {id:'honey',e:'🍯',s:'top:60%;left:48%',cl:'5 linguri de miere — cifra: 5',ci:'c2'},
      {id:'flask',e:'⚗️',s:'top:18%;right:20%',cl:'Flasca nr. 8 — cifra: 8',ci:'c3'},
      {id:'scroll',e:'📜',s:'bottom:25%;left:35%',cl:'Rețeta: pasul 2 — cifra: 2',ci:'c4'},
      {id:'pump',e:'🚿',s:'bottom:20%;right:28%',chest:true}],
    clues:[{id:'c1',t:'Un extract misterios...'},{id:'c2',t:'Un borcan cu ceva dulce...'},{id:'c3',t:'O flască numerotată...'},{id:'c4',t:'O rețetă veche...'}]},
  {title:'🍫 Labirintul de Ciocolată',name:'Căsuța Grădinarului',desc:'Repară obiectele și deschide labirintul.',code:'C916',
    objects:[{id:'map',e:'🗺️',s:'top:18%;left:18%',cl:'Harta zonei C — litera C',ci:'c1'},
      {id:'clock',e:'⏰',s:'top:55%;left:55%',cl:'Ceasul arată ora 9 — cifra: 9',ci:'c2'},
      {id:'seed',e:'🌱',s:'top:22%;right:22%',cl:'1 sămânță specială — cifra: 1',ci:'c3'},
      {id:'letter',e:'✉️',s:'bottom:25%;left:30%',cl:'Scrisoarea secretă — cifra: 6',ci:'c4'},
      {id:'door',e:'🚪',s:'bottom:18%;right:20%',chest:true}],
    clues:[{id:'c1',t:'O hartă veche...'},{id:'c2',t:'Un ceas oprit...'},{id:'c3',t:'O pungă de semințe...'},{id:'c4',t:'O scrisoare sigilată...'}]},
  {title:'🌙 Moon Garden Secret',name:'Grădina de Noapte',desc:'Cristalele lunii ascund indicii.',code:'M734',
    objects:[{id:'crystal',e:'💎',s:'top:20%;left:20%',cl:'Cristalul lunii — litera M',ci:'c1'},
      {id:'star',e:'⭐',s:'top:55%;left:50%',cl:'7 stele alăturate — cifra: 7',ci:'c2'},
      {id:'potion',e:'🧪',s:'top:18%;right:20%',cl:'Poțiunea nr. 3 — cifra: 3',ci:'c3'},
      {id:'orb',e:'🔮',s:'bottom:25%;left:30%',cl:'Orbul de cristal: 4 — cifra: 4',ci:'c4'},
      {id:'portal',e:'🌀',s:'bottom:18%;right:22%',chest:true}],
    clues:[{id:'c1',t:'Un cristal lunar...'},{id:'c2',t:'Stele în cerc...'},{id:'c3',t:'O poțiune misterioasă...'},{id:'c4',t:'Un orb de cristal...'}]},
];
let curR=0,escFound=new Set(),escInv=[],escInited=false,escSolved=new Set();
function initEsc(){escInited=true;loadRoom(0);}
function loadRoom(i){
  curR=i;escFound=new Set();escInv=[];
  const room=ROOMS[i];
  $('etitle').textContent=room.title;$('ern').textContent=room.name;$('erd').textContent=room.desc;
  $('eprog').textContent='Indicii: 0/4';$('einp').value='';$('ehint').textContent='Găsește toate indiciile mai întâi!';
  const re=$('eroom');re.querySelectorAll('.robj').forEach(e=>e.remove());
  room.objects.forEach(o=>{
    const d=document.createElement('div');d.className='robj';d.id=`ro${o.id}`;d.textContent=o.e;d.style.cssText=o.s;
    d.onclick=e=>{e.stopPropagation();o.chest?tryChest():collectObj(o);};
    re.appendChild(d);
  });
  const cl=$('clist');cl.innerHTML='';
  room.clues.forEach((c,i2)=>{const d=document.createElement('div');d.className='ci';d.id=`ci${c.id}`;
    d.innerHTML=`<div class="cn">${i2+1}</div><div class="ctx" id="ctx${c.id}">${c.t}</div>`;cl.appendChild(d);});
  const inv=$('invbar');inv.innerHTML='';
  for(let k=0;k<4;k++){const s=document.createElement('div');s.className='islot';s.id=`is${k}`;inv.appendChild(s);}
}
function collectObj(o){
  if(escFound.has(o.id))return;escFound.add(o.id);
  const ro=$(`ro${o.id}`);if(ro)ro.classList.add('fd');
  const ci=$(`ci${o.ci}`);if(ci){ci.classList.add('fd');$(`ctx${o.ci}`).textContent=o.cl||'Indiciu găsit!';}
  const slot=$(`is${escInv.length}`);if(slot){slot.textContent=o.e;slot.classList.add('has');}
  escInv.push(o.e);$('eprog').textContent=`Indicii: ${escFound.size}/4`;
  const rect=ro?.getBoundingClientRect();if(rect)burst(rect.left+rect.width/2,rect.top+rect.height/2);
  sfxMatch();toast(`${o.e} ${o.cl||'Colectat!'}`);
  if(escFound.size>=4)$('ehint').textContent='Cod: 4 caractere — combină inițialele și cifrele!';
}
function tryChest(){if(escFound.size<4)toast('🔒 Găsește toate indiciile mai întâi!');else{$('einp').focus();toast('🗝️ Introdu codul!');}}
function submitCode(){
  const v=$('einp').value.toUpperCase().replace(/\s/g,''),room=ROOMS[curR];
  if(v===room.code){
    burst(innerWidth/2,innerHeight/2);sfxWin();
    escSolved.add(curR);PLAYER.escapesSolved++;PLAYER.coins+=300;
    unlockAch('escape1');if(escSolved.size>=4)unlockAch('escape4');
    if(PLAYER.dailyDone===false&&dailyChallenge.zone==='escape'){PLAYER.dailyDone=true;unlockAch('daily1');}
    showM({emoji:'🗝️',title:'Poarta deschisă!',sub:`Ai rezolvat ${room.name}!`,stars:'⭐⭐⭐',
      rewards:[{c:'d',v:5,l:'🌱 Semințe'},{c:'g',v:300,l:'🪙 Comori'},{c:'m',v:2,l:'💎 Geme'}],
      btn1:'Cameră nouă →',btn2:'Hartă',
      cb1:()=>{hideM();nextRoom();},cb2:()=>{hideM();sw('hub');}});
  }else{toast('❌ Cod greșit!');const i=$('einp');i.style.borderColor='var(--coral)';setTimeout(()=>i.style.borderColor='',900);}
}
function nextRoom(){loadRoom((curR+1)%ROOMS.length);}

// ══════════════════════════════════════
// DECOR + GARDEN BUILDER (Canvas)
// ══════════════════════════════════════
const DZONES=[
  {id:'gh',l:'🌸 Seră',bg:'#0a0d0a'},
  {id:'lm',l:'🍋 Fântână',bg:'#0d0d0a'},
  {id:'ch',l:'🍫 Labirint',bg:'#0d0a07'},
  {id:'mn',l:'🌙 Lună',bg:'#07070d'},
];
const SCATS=[{id:'fl',l:'🌸 Flori'},{id:'fu',l:'🪑 Mobilier'},{id:'wa',l:'⛲ Apă'},{id:'st',l:'🏡 Structuri'}];
const SITEMS_DATA={
  fl:[{id:'rp',e:'🌹',n:'Trandafir Roz',cost:'50🪙',own:false},{id:'tu',e:'🌷',n:'Lalele',cost:'30🪙',own:true},
    {id:'su',e:'🌻',n:'Floarea-Soarelui',cost:'40🪙',own:false},{id:'or',e:'🪷',n:'Orhidee',cost:'4💎',own:false},
    {id:'da',e:'🌼',n:'Margarete',cost:'20🪙',own:true},{id:'ch2',e:'🌸',n:'Cireș',cost:'60🪙',own:false}],
  fu:[{id:'bv',e:'🪑',n:'Bancă Veche',cost:'80🪙',own:false},{id:'la',e:'🏮',n:'Felinar',cost:'2💎',own:true},
    {id:'st2',e:'🗿',n:'Statuie Rară',cost:'5💎',own:false},{id:'sw',e:'🎠',n:'Leagăn',cost:'90🪙',own:false}],
  wa:[{id:'f1',e:'⛲',n:'Fântâna Clasică',cost:'100🪙',own:false},{id:'po',e:'🪷',n:'Iaz cu Nuferi',cost:'150🪙',own:false}],
  st:[{id:'gh3',e:'🏡',n:'Seră Mică',cost:'200🪙',own:true},{id:'ar',e:'🚪',n:'Arc Floral',cost:'120🪙',own:false},
    {id:'gt',e:'🗼',n:'Poarta Secretă',cost:'6💎',own:false}],
};
let sCat='fl',plItem=null,aZone='gh',decInited=false;
let gardenAnim=null;

function initDec(){
  decInited=true;
  renderZSel();renderSTabs();renderSItems();
  startGardenCanvas();
  unlockAch('decor1');
}
function renderZSel(){
  const el=$('zsel');el.innerHTML='';
  DZONES.forEach(z=>{const b=document.createElement('button');b.className='zsb'+(z.id===aZone?' on':'');
    b.textContent=z.l;b.onclick=()=>{aZone=z.id;document.querySelectorAll('.zsb').forEach((x,i)=>x.classList.toggle('on',DZONES[i].id===z.id));startGardenCanvas();sfxClick();};
    el.appendChild(b);});
}
function renderSTabs(){
  const el=$('stabs');el.innerHTML='';
  SCATS.forEach(c=>{const t=document.createElement('div');t.className='stab'+(c.id===sCat?' on':'');
    t.textContent=c.l;t.onclick=()=>{sCat=c.id;document.querySelectorAll('.stab').forEach((x,i)=>x.classList.toggle('on',SCATS[i].id===c.id));renderSItems();sfxClick();};el.appendChild(t);});
}
function renderSItems(){
  const el=$('sitems');el.innerHTML='';
  (SITEMS_DATA[sCat]||[]).forEach(item=>{
    const isPla=plItem?.id===item.id;
    const d=document.createElement('div');d.className='sitem'+(item.own?' own':'')+(isPla?' pla':'');
    const badge=isPla?'<span class="sibg pl">📍</span>':item.own?'<span class="sibg own">✓ Ai</span>':'<span class="sibg nw">NOU</span>';
    d.innerHTML=`<div class="siic">${item.e}</div><div class="siin"><div class="sinm">${item.n}</div><div class="sico">${item.cost}</div></div>${badge}`;
    d.onclick=()=>{if(!item.own){toast('💰 Cumpără '+item.n+': '+item.cost);return;}plItem=plItem?.id===item.id?null:item;renderSItems();if(plItem)toast('📍 Click pe grădină pentru a plasa '+item.n);sfxClick();};
    el.appendChild(d);
  });
}

// Garden canvas with animated items
function startGardenCanvas(){
  const canvas=$('garden-canvas');if(!canvas)return;
  const parent=canvas.parentElement;
  canvas.width=parent.offsetWidth||400;
  canvas.height=parent.offsetHeight||300;
  const ctx=canvas.getContext('2d');
  if(gardenAnim)cancelAnimationFrame(gardenAnim);
  const zconf=DZONES.find(d=>d.id===aZone);
  const bgColors={gh:'#0a140a',lm:'#14140a',ch:'#140a05',mn:'#07070f'};
  const groundColors={gh:'#1a3a1a',lm:'#3a3a10',ch:'#3a1a08',mn:'#1a1a3f'};
  let t=0;
  const items=PLAYER.gardenItems.filter(g=>g.z===aZone);

  canvas.onclick=e=>{
    if(!plItem)return;
    const rect=canvas.getBoundingClientRect();
    const x=e.clientX-rect.left,y=e.clientY-rect.top;
    PLAYER.gardenItems.push({e:plItem.e,n:plItem.n,x,y,z:aZone,birth:t});
    burst(e.clientX,e.clientY);sfxPlace();
    const cnt=PLAYER.gardenItems.filter(g=>g.z===aZone).length;
    if(cnt>=3)unlockAch('decor1');if(cnt>=10)unlockAch('decor10');
    plItem=null;renderSItems();toast('🌸 '+PLAYER.gardenItems[PLAYER.gardenItems.length-1].n+' plasat!');
  };

  function draw(){
    const W=canvas.width,H=canvas.height;
    ctx.clearRect(0,0,W,H);
    // sky
    const sky=ctx.createLinearGradient(0,0,0,H*.6);
    sky.addColorStop(0,bgColors[aZone]||'#0a0a14');sky.addColorStop(1,'transparent');
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // ground
    const gr=ctx.createLinearGradient(0,H*.55,0,H);
    gr.addColorStop(0,groundColors[aZone]||'#1a3a1a');gr.addColorStop(1,'#050d05');
    ctx.fillStyle=gr;ctx.fillRect(0,H*.55,W,H*.45);
    // stars (moon zone)
    if(aZone==='mn'){for(let i=0;i<30;i++){const sx=(i*137)%W,sy=(i*73)%H*.5,a=.2+Math.sin(t*.02+i)*.15;ctx.globalAlpha=Math.max(0,a);ctx.fillStyle='#fff9c4';ctx.beginPath();ctx.arc(sx,sy,.8,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    // fireflies (greenhouse)
    if(aZone==='gh'){for(let i=0;i<8;i++){const fx=W*.1+(i*W*.11),fy=H*.3+Math.sin(t*.03+i*1.2)*30,fa=.3+Math.sin(t*.05+i)*.2;ctx.globalAlpha=Math.max(0,fa);ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(fx,fy,1.5,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    // items
    const allItems=PLAYER.gardenItems.filter(g=>g.z===aZone);
    allItems.forEach((item,i)=>{
      const bob=Math.sin(t*.04+i*.8)*3;
      const scale=item.birth!=null?Math.min(1,(t-item.birth)/40):1;
      ctx.save();ctx.translate(item.x,item.y+bob);ctx.scale(scale,scale);
      ctx.font=`${28*scale}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.globalAlpha=scale;ctx.fillText(item.e,0,0);ctx.globalAlpha=1;ctx.restore();
    });
    // placing indicator
    if(plItem){
      ctx.globalAlpha=.5+Math.sin(t*.1)*.3;
      ctx.font='28px serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(plItem.e,W/2,H/2);
      ctx.globalAlpha=.4;ctx.strokeStyle='#ffe066';ctx.lineWidth=2;ctx.setLineDash([6,4]);
      ctx.strokeRect(W/2-25,H/2-25,50,50);ctx.setLineDash([]);ctx.globalAlpha=1;
    }
    t++;gardenAnim=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
renderHub();
unlockAch('nightmode');

// ══════════════════════════════════════
// I18N
// ══════════════════════════════════════
const LANG={
  ro:{
    'nav.map':'Hartă','nav.story':'Story','nav.duel':'Duel','nav.escape':'Escape',
    'nav.decor':'Decor','nav.ach':'Trofee','nav.pets':'Animăluțe','nav.shop':'Shop','nav.stats':'Statistici',
    'daily.play':'🎯 Joacă acum','daily.done':'✅ Completat!',
    'shop.buy':'Cumpără','shop.owned':'Deja ai',
    'pets.saved':'salvate','pets.found':'Ai găsit',
    'stats.wins':'Victorii','stats.combos':'Best Combo','stats.score':'Scor Max',
    'stats.levels':'Niveluri','stats.duels':'Dueluri','stats.escapes':'Escape','stats.pets':'Animăluțe',
  },
  en:{
    'nav.map':'Map','nav.story':'Story','nav.duel':'Duel','nav.escape':'Escape',
    'nav.decor':'Decor','nav.ach':'Trophies','nav.pets':'Pets','nav.shop':'Shop','nav.stats':'Stats',
    'daily.play':'🎯 Play now','daily.done':'✅ Done!',
    'shop.buy':'Buy','shop.owned':'Owned',
    'pets.saved':'saved','pets.found':'Found',
    'stats.wins':'Wins','stats.combos':'Best Combo','stats.score':'High Score',
    'stats.levels':'Levels','stats.duels':'Duels','stats.escapes':'Escape','stats.pets':'Pets',
  }
};
let curLang='ro';
function t(k){return(LANG[curLang]||LANG.ro)[k]||k;}
function toggleLang(){
  curLang=curLang==='ro'?'en':'ro';
  document.documentElement.dataset.lang=curLang;
  $('lang-btn').textContent='🌐 '+(curLang==='ro'?'RO':'EN');
  sfxClick();
  // refresh current screen
  if(cur==='stats')renderStats();
  if(cur==='pets')renderPets();
  if(cur==='shop')renderShop();
}

// ══════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════
const notifStack=$('notif-stack');
let notifQueue=[];
function pushNotif({icon='🌸',text='',type='info',dur=3500}){
  notifQueue.push({icon,text,type,dur});
  if(notifQueue.length===1)processNotifQueue();
}
function processNotifQueue(){
  if(!notifQueue.length)return;
  const n=notifQueue[0];
  const el=document.createElement('div');
  el.className=`notif type-${n.type}`;
  el.innerHTML=`<span class="notif-icon">${n.icon}</span><span class="notif-text">${n.text}</span><span class="notif-close" onclick="dismissNotif(this)">✕</span>`;
  notifStack.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  const removeEl=()=>{el.classList.remove('show');setTimeout(()=>{el.remove();notifQueue.shift();processNotifQueue();},400);};
  el._timer=setTimeout(removeEl,n.dur);
}
function dismissNotif(closeBtn){
  const el=closeBtn.closest('.notif');clearTimeout(el._timer);
  el.classList.remove('show');setTimeout(()=>{el.remove();notifQueue.shift();processNotifQueue();},400);
}

// Override unlockAch to use notif
const _origUnlock=unlockAch;
unlockAch=function(id){
  const wasUnlocked=PLAYER.achievementsUnlocked.has(id);
  _origUnlock(id);
  if(!wasUnlocked&&PLAYER.achievementsUnlocked.has(id)){
    const a=ACHIEVEMENTS.find(x=>x.id===id);
    if(a)pushNotif({icon:a.icon,text:`Achievement: <strong>${a.name}</strong> +${a.gold}🪙`,type:'ach',dur:4000});
  }
};

// Daily reminder notif on hub open
let dailyNotifShown=false;
const _origRenderHub=renderHub;
renderHub=function(){
  _origRenderHub();
  if(!dailyNotifShown){
    dailyNotifShown=true;
    setTimeout(()=>pushNotif({icon:'📅',text:curLang==='ro'?'Provocarea zilnică te așteaptă! 🌸':'Daily challenge is waiting! 🌸',type:'daily',dur:4000}),1200);
  }
};

// ══════════════════════════════════════
// PETS SYSTEM
// ══════════════════════════════════════
const ALL_PETS=[
  {id:'p1',e:'🐱',name:'Luna',nameEn:'Luna',zone:'🌙 Moon Garden',zoneId:'mn',hearts:5,rare:false,unlock:'Câștigă un nivel în Moon Garden'},
  {id:'p2',e:'🐶',name:'Candy',nameEn:'Candy',zone:'🌸 Candy Greenhouse',zoneId:'gh',hearts:4,rare:false,unlock:'Câștigă 3 stele în Candy Greenhouse'},
  {id:'p3',e:'🐇',name:'Mochi',nameEn:'Mochi',zone:'🍋 Lemon Fountain',zoneId:'lm',hearts:5,rare:false,unlock:'Completează 5 niveluri în Lemon Fountain'},
  {id:'p4',e:'🦊',name:'Rusty',nameEn:'Rusty',zone:'🍫 Chocolate Maze',zoneId:'ch',hearts:3,rare:true,unlock:'Înfrânge Boss-ul pentru prima dată'},
  {id:'p5',e:'🐝',name:'Buzz',nameEn:'Buzz',zone:'🌸 Candy Greenhouse',zoneId:'gh',hearts:4,rare:false,unlock:'Fă 10 combo-uri în orice zonă'},
  {id:'p6',e:'🦋',name:'Flutter',nameEn:'Flutter',zone:'🌙 Moon Garden',zoneId:'mn',hearts:5,rare:true,unlock:'Deblocați Moon Garden'},
  {id:'p7',e:'🐸',name:'Lime',nameEn:'Lime',zone:'🍋 Lemon Fountain',zoneId:'lm',hearts:3,rare:false,unlock:'Rezolvă Fântâna Lemon'},
  {id:'p8',e:'🐻',name:'Coco',nameEn:'Coco',zone:'🍫 Chocolate Maze',zoneId:'ch',hearts:4,rare:true,unlock:'Câștigă 3 dueluri la rând'},
  {id:'p9',e:'🐦',name:'Petal',nameEn:'Petal',zone:'🌸 Candy Greenhouse',zoneId:'gh',hearts:5,rare:false,unlock:'Plasează 5 decoruri'},
  {id:'p10',e:'🐾',name:'Shadow',nameEn:'Shadow',zone:'🌙 Moon Garden',zoneId:'mn',hearts:5,rare:true,unlock:'Completează toate camerele Escape'},
  {id:'p11',e:'🐠',name:'Sirop',nameEn:'Sirop',zone:'🍋 Lemon Fountain',zoneId:'lm',hearts:3,rare:false,unlock:'Câștigă 5 niveluri'},
  {id:'p12',e:'🦔',name:'Choco',nameEn:'Choco',zone:'🍫 Chocolate Maze',zoneId:'ch',hearts:4,rare:true,unlock:'Înfrânge Melcul de Ciocolată'},
];

// Unlock some pets based on progress
function syncPets(){
  if(PLAYER.wins>=1&&!PLAYER.pets.has('p11'))unlockPet('p11');
  if(PLAYER.wins>=5&&!PLAYER.pets.has('p2'))unlockPet('p2');
  if(PLAYER.combos>=10&&!PLAYER.pets.has('p5'))unlockPet('p5');
  if(PLAYER.gardenItems.length>=5&&!PLAYER.pets.has('p9'))unlockPet('p9');
}
function unlockPet(id){
  if(PLAYER.pets.has(id))return;
  PLAYER.pets.add(id);
  const pet=ALL_PETS.find(p=>p.id===id);if(!pet)return;
  pushNotif({icon:pet.e,text:`Animăluț salvat: <strong>${curLang==='en'?pet.nameEn:pet.name}</strong>! ${pet.e}`,type:'pet',dur:4000});
}
function renderPets(){
  syncPets();
  const owned=[...PLAYER.pets];
  $('pets-count').textContent=`${owned.length} ${t('pets.saved')}`;
  const body=$('pets-body');body.innerHTML='';
  // owned first
  const sorted=[...ALL_PETS].sort((a,b)=>(PLAYER.pets.has(b.id)?1:0)-(PLAYER.pets.has(a.id)?1:0));
  sorted.forEach(pet=>{
    const isOwned=PLAYER.pets.has(pet.id);
    const d=document.createElement('div');d.className='pet-card '+(isOwned?'owned':'locked');
    const hearts='❤️'.repeat(pet.hearts);
    const isNew=PLAYER.newPets&&PLAYER.newPets.has(pet.id);
    d.innerHTML=`${isNew?'<div class="pet-new-banner">NEW</div>':''}
      <span class="pet-av">${isOwned?pet.e:'🔒'}</span>
      <div class="pet-name">${curLang==='en'?pet.nameEn:pet.name}${pet.rare?' ✨':''}</div>
      <div class="pet-zone">${pet.zone}</div>
      <div class="pet-hearts">${isOwned?hearts:''}</div>
      <span class="pet-badge ${isOwned?'owned':'locked'}">${isOwned?(curLang==='ro'?'Salvat':'Saved'):(curLang==='ro'?'Blocat':'Locked')}</span>
      ${!isOwned?`<div style="font-size:.58rem;color:var(--muted);margin-top:5px;line-height:1.3">${pet.unlock}</div>`:''}`;
    body.appendChild(d);
  });
}

// ══════════════════════════════════════
// SHOP
// ══════════════════════════════════════
const SHOP_CATS_DATA=[
  {id:'featured',label:'⭐ '+(curLang==='ro'?'Featured':'Featured'),icon:'⭐'},
  {id:'flowers',label:'🌸 '+(curLang==='ro'?'Flori':'Flowers'),icon:'🌸'},
  {id:'furniture',label:'🪑 '+(curLang==='ro'?'Mobilier':'Furniture'),icon:'🪑'},
  {id:'boosters',label:'⚡ Boostere',icon:'⚡'},
  {id:'pets_shop',label:'🐾 '+(curLang==='ro'?'Animăluțe':'Pets'),icon:'🐾'},
  {id:'themes',label:'🎨 Teme',icon:'🎨'},
];
const SHOP_ITEMS_DATA={
  featured:[
    {id:'s_rose_gold',e:'✨',name:'Trandafir Auriu',nameEn:'Golden Rose',desc:'Floarea rară a grădinii lunare',descEn:'The rare flower of the moon garden',price:5,cur:'gems',cat:'flowers',featured:true},
    {id:'s_moon_pet',e:'🦋',name:'Flutter Pack',nameEn:'Flutter Pack',desc:'Deblochează animăluțul Flutter',descEn:'Unlock Flutter the butterfly',price:3,cur:'gems',cat:'pets_shop',featured:true},
    {id:'s_boost_x2',e:'⚡',name:'Dublu XP (1h)',nameEn:'Double XP (1h)',desc:'Dublează XP-ul pentru o oră',descEn:'Double your XP for one hour',price:200,cur:'coins',cat:'boosters',featured:false},
  ],
  flowers:[
    {id:'s_tulip',e:'🌷',name:'Lalele',nameEn:'Tulips',desc:'Clasice și colorate',descEn:'Classic and colorful',price:30,cur:'coins',cat:'flowers'},
    {id:'s_orchid',e:'🪷',name:'Orhidee',nameEn:'Orchid',desc:'Eleganță regală',descEn:'Royal elegance',price:4,cur:'gems',cat:'flowers'},
    {id:'s_sunflower',e:'🌻',name:'Floarea-Soarelui',nameEn:'Sunflower',desc:'Luminoasă și veselă',descEn:'Bright and cheerful',price:40,cur:'coins',cat:'flowers'},
    {id:'s_daisy',e:'🌼',name:'Margarete',nameEn:'Daisies',desc:'Simple și drăguțe',descEn:'Simple and sweet',price:20,cur:'coins',cat:'flowers'},
    {id:'s_rose_pink',e:'🌹',name:'Trandafir Roz',nameEn:'Pink Rose',desc:'Clasicul grădinii',descEn:'The garden classic',price:50,cur:'coins',cat:'flowers'},
    {id:'s_cherry',e:'🌸',name:'Flori de Cireș',nameEn:'Cherry Blossoms',desc:'Roz delicat japonez',descEn:'Delicate Japanese pink',price:60,cur:'coins',cat:'flowers'},
  ],
  furniture:[
    {id:'s_bench',e:'🪑',name:'Bancă Veche',nameEn:'Old Bench',desc:'Rustică și confortabilă',descEn:'Rustic and comfortable',price:80,cur:'coins',cat:'furniture'},
    {id:'s_lantern',e:'🏮',name:'Felinar Magic',nameEn:'Magic Lantern',desc:'Luminează noaptea',descEn:'Lights up the night',price:2,cur:'gems',cat:'furniture'},
    {id:'s_statue',e:'🗿',name:'Statuie Rară',nameEn:'Rare Statue',desc:'Un simbol al victoriei',descEn:'A symbol of victory',price:5,cur:'gems',cat:'furniture'},
    {id:'s_swing',e:'🎠',name:'Leagăn',nameEn:'Swing',desc:'Pentru momente relaxante',descEn:'For relaxing moments',price:90,cur:'coins',cat:'furniture'},
    {id:'s_fountain',e:'⛲',name:'Fântâna Clasică',nameEn:'Classic Fountain',desc:'Liniștitoare și elegantă',descEn:'Soothing and elegant',price:100,cur:'coins',cat:'furniture'},
  ],
  boosters:[
    {id:'s_moves5',e:'⚡',name:'+5 Mutări',nameEn:'+5 Moves',desc:'Extra mutări pentru orice nivel',descEn:'Extra moves for any level',price:50,cur:'coins',cat:'boosters'},
    {id:'s_bomb3',e:'💣',name:'Bombă 3×3',nameEn:'3×3 Bomb',desc:'Explodează o zonă',descEn:'Blast a zone',price:3,cur:'seeds',cat:'boosters'},
    {id:'s_rainbow',e:'🌈',name:'Curcubeu',nameEn:'Rainbow',desc:'Elimină un tip întreg',descEn:'Remove all of one type',price:4,cur:'seeds',cat:'boosters'},
    {id:'s_duel_shield',e:'🛡️',name:'Scut Duel',nameEn:'Duel Shield',desc:'Blochează un atac AI',descEn:'Block one AI attack',price:80,cur:'coins',cat:'boosters'},
  ],
  pets_shop:[
    {id:'s_pet_luna',e:'🐱',name:'Luna Pack',nameEn:'Luna Pack',desc:'Deblochează pisicuța Luna',descEn:'Unlock Luna the cat',price:150,cur:'coins',cat:'pets_shop'},
    {id:'s_pet_candy',e:'🐶',name:'Candy Pack',nameEn:'Candy Pack',desc:'Deblochează cățelușul Candy',descEn:'Unlock Candy the puppy',price:150,cur:'coins',cat:'pets_shop'},
    {id:'s_pet_buzz',e:'🐝',name:'Buzz Pack',nameEn:'Buzz Pack',desc:'Deblochează albinuța Buzz',descEn:'Unlock Buzz the bee',price:2,cur:'gems',cat:'pets_shop'},
    {id:'s_pet_mochi',e:'🐇',name:'Mochi Pack',nameEn:'Mochi Pack',desc:'Deblochează iepurașul Mochi',descEn:'Unlock Mochi the bunny',price:2,cur:'gems',cat:'pets_shop'},
  ],
  themes:[
    {id:'s_theme_rose',e:'🌹',name:'Tema Trandafir',nameEn:'Rose Theme',desc:'Tot roșu-roz în grădină',descEn:'All rose-pink in the garden',price:3,cur:'gems',cat:'themes'},
    {id:'s_theme_night',e:'🌙',name:'Tema Nocturnă',nameEn:'Night Theme',desc:'Grădina de noapte permanent',descEn:'Permanent night garden',price:4,cur:'gems',cat:'themes'},
    {id:'s_theme_candy',e:'🍬',name:'Tema Candy',nameEn:'Candy Theme',desc:'Bomboane și culori saturate',descEn:'Candy and saturated colors',price:3,cur:'gems',cat:'themes'},
  ],
};

let shopCat='featured',shopInited=false;
function initShop(){shopInited=true;renderShop();}
function renderShop(){
  updShopBalance();
  const catsEl=$('shop-cats');catsEl.innerHTML='';
  SHOP_CATS_DATA.forEach(c=>{
    const b=document.createElement('button');b.className='shop-cat-btn'+(c.id===shopCat?' on':'');
    b.innerHTML=`<span>${c.icon}</span>${curLang==='en'?c.label.replace(/^.+?\s/,''):c.label}`;
    b.onclick=()=>{shopCat=c.id;renderShop();sfxClick();};
    catsEl.appendChild(b);
  });
  const grid=$('shop-grid');grid.innerHTML='';
  const items=shopCat==='featured'?SHOP_ITEMS_DATA.featured:[...SHOP_ITEMS_DATA[shopCat]||[]];
  items.forEach(item=>{
    const owned=PLAYER.shopOwned.has(item.id);
    const d=document.createElement('div');d.className='shop-item'+(owned?' owned-item':'')+(item.featured?' featured':'');
    const priceColor=item.cur==='gems'?'gems':item.cur==='seeds'?'seeds':'coins';
    const currIcon={'coins':'🪙','gems':'💎','seeds':'🌱'}[item.cur];
    const canAfford=item.cur==='coins'?PLAYER.coins>=item.price:item.cur==='gems'?PLAYER.gems>=item.price:PLAYER.seeds>=item.price;
    d.innerHTML=`${item.featured?'<div class="si-featured-badge">⭐ FEATURED</div>':''}
      ${owned?'<div class="si-owned-badge">✓</div>':''}
      <span class="si-emoji">${item.e}</span>
      <div class="si-name">${curLang==='en'&&item.nameEn?item.nameEn:item.name}</div>
      <div class="si-desc">${curLang==='en'&&item.descEn?item.descEn:item.desc}</div>
      <div class="si-price ${priceColor}">${currIcon} ${item.price}</div>
      <button class="btn-buy ${priceColor}" ${owned?'disabled':''} onclick="buyItem('${item.id}')">
        ${owned?(t('shop.owned')):(t('shop.buy'))}
      </button>`;
    grid.appendChild(d);
  });
}
function updShopBalance(){
  $('shop-coins').textContent=PLAYER.coins;
  $('shop-gems').textContent=PLAYER.gems;
  $('shop-seeds').textContent=PLAYER.seeds;
}
function buyItem(id){
  const allItems=[...Object.values(SHOP_ITEMS_DATA)].flat();
  const item=allItems.find(x=>x.id===id);if(!item)return;
  if(PLAYER.shopOwned.has(id)){toast(curLang==='ro'?'Ai deja acest item!':'You already own this!');return;}
  const bal=item.cur==='coins'?PLAYER.coins:item.cur==='gems'?PLAYER.gems:PLAYER.seeds;
  if(bal<item.price){
    toast(`❌ ${curLang==='ro'?'Nu ai suficient':'Not enough'} ${{'coins':'🪙','gems':'💎','seeds':'🌱'}[item.cur]}`);
    return;
  }
  if(item.cur==='coins')PLAYER.coins-=item.price;
  else if(item.cur==='gems')PLAYER.gems-=item.price;
  else PLAYER.seeds-=item.price;
  PLAYER.shopOwned.add(id);
  // unlock associated pet
  if(id==='s_pet_luna')unlockPet('p1');
  if(id==='s_pet_candy')unlockPet('p2');
  if(id==='s_pet_buzz')unlockPet('p5');
  if(id==='s_pet_mochi')unlockPet('p3');
  if(id==='s_moon_pet')unlockPet('p6');
  sfxWin();burst(innerWidth/2,innerHeight/2);
  pushNotif({icon:item.e,text:`${curLang==='ro'?'Cumpărat':'Purchased'}: <strong>${curLang==='en'&&item.nameEn?item.nameEn:item.name}</strong>`,type:'shop',dur:3000});
  renderShop();updShopBalance();
}

// ══════════════════════════════════════
// STATS
// ══════════════════════════════════════
let sessionStart=Date.now(),totalTimeSec=0,statsInterval=null;
function startSessionTimer(){
  if(statsInterval)return;
  statsInterval=setInterval(()=>{
    const elapsed=Math.floor((Date.now()-sessionStart)/1000);
    const m=Math.floor(elapsed/60),s=elapsed%60;
    const el=$('session-time');if(el)el.textContent=(curLang==='ro'?'Sesiune: ':'Session: ')+m+'m '+s+'s';
  },5000);
}
function renderStats(){
  const elapsed=Math.floor((Date.now()-sessionStart)/60000);
  const totalM=Math.floor(totalTimeSec/60)+elapsed;
  const h=Math.floor(totalM/60),m=totalM%60;
  const tpEl=$('time-played');if(tpEl)tpEl.innerHTML=`⏱ ${h}h ${m}m<div class="time-sub">${curLang==='ro'?'timp total jucat':'total time played'}</div>`;
  // profile
  const av=$('stats-av');if(av)av.textContent=PLAYER.avatar||'🌸';
  const sn=$('stats-name');if(sn)sn.textContent=PLAYER.name||'Grădinarul';
  const sg=$('stats-gender');if(sg){const gl={f:curLang==='ro'?'Grădinăriță':'Gardener (F)',m:curLang==='ro'?'Grădinar':'Gardener (M)',n:curLang==='ro'?'Jucător':'Player'};sg.textContent=gl[PLAYER.gender||'n']||'Jucător';}
  // XP bar
  const xpForNext=2000;const xpPct=Math.min(100,(PLAYER.xp/xpForNext)*100);
  const xf=$('xp-fill');if(xf)xf.style.width=xpPct+'%';
  const xl=$('xp-label');if(xl)xl.textContent=PLAYER.xp+' / '+xpForNext+' XP';
  const ll=$('lvl-label');if(ll)ll.textContent=(curLang==='ro'?'Nivel ':'Level ')+PLAYER.level+' → '+(PLAYER.level+1);
  // stats grid
  const wr=PLAYER.wins>0?Math.round((PLAYER.wins/(PLAYER.wins+(PLAYER.totalScore>0?1:0)))*100):0;
  const stats=[
    {val:PLAYER.wins,lbl:t('stats.wins'),icon:'🏆'},
    {val:PLAYER.bestCombo||0,lbl:t('stats.combos'),icon:'🔥'},
    {val:PLAYER.totalScore.toLocaleString(),lbl:t('stats.score'),icon:'⭐'},
    {val:PLAYER.levelsCompleted||0,lbl:t('stats.levels'),icon:'🌿'},
    {val:PLAYER.duelWins||0,lbl:t('stats.duels'),icon:'⚔️'},
    {val:PLAYER.escapesSolved||0,lbl:t('stats.escapes'),icon:'🗝️'},
    {val:[...PLAYER.pets].length,lbl:t('stats.pets'),icon:'🐾'},
    {val:PLAYER.achievementsUnlocked.size,lbl:'Achievements',icon:'🏅'},
  ];
  const sg2=$('stats-grid');if(sg2){sg2.innerHTML='';stats.forEach(s=>{const d=document.createElement('div');d.className='stat-card';d.innerHTML=`<div class="stat-val">${s.icon} ${s.val}</div><div class="stat-lbl">${s.lbl}</div>`;sg2.appendChild(d);});}
  // perf bars
  const perfs=[
    {lbl:'Story',val:Math.min(100,PLAYER.wins*10),color:'var(--candy)'},
    {lbl:'Duel',val:Math.min(100,(PLAYER.duelWins||0)*20),color:'var(--coral)'},
    {lbl:'Escape',val:Math.min(100,(PLAYER.escapesSolved||0)*25),color:'var(--lemon)'},
    {lbl:'Decor',val:Math.min(100,PLAYER.gardenItems.length*10),color:'var(--mint)'},
  ];
  const pb=$('perf-bars');if(pb){pb.innerHTML='';perfs.forEach(p=>{const d=document.createElement('div');d.className='stat-bar-row';d.innerHTML=`<span class="stat-bar-label">${p.lbl}</span><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${p.val}%;background:${p.color}"></div></div><span class="stat-bar-val">${p.val}%</span>`;pb.appendChild(d);});}
}

// ══════════════════════════════════════
// DUEL REACTIONS
// ══════════════════════════════════════
const REACTIONS=['👍','🌸','🔥','😂','😤','🫡'];
function initReactionBar(){
  const bar=$('reaction-bar');if(!bar)return;bar.innerHTML='';
  REACTIONS.forEach(r=>{
    const b=document.createElement('button');b.className='react-btn';b.textContent=r;
    b.onclick=()=>sendReaction(r);bar.appendChild(b);
  });
}
function sendReaction(emoji){
  sfxClick();
  const popup=document.createElement('div');popup.className='react-popup';popup.textContent=emoji;
  popup.style.left=(innerWidth*.3+rnd(innerWidth*.4))+'px';
  popup.style.top=(innerHeight*.4+rnd(100))+'px';
  document.body.appendChild(popup);setTimeout(()=>popup.remove(),1500);
  if(typeof dlog==='function')dlog(`Tu: ${emoji}`);
  // AI reacts back sometimes
  if(rnd(3)===0){
    const aiR=REACTIONS[rnd(REACTIONS.length)];
    setTimeout(()=>{
      const p2=document.createElement('div');p2.className='react-popup';p2.textContent=aiR;
      p2.style.left=(innerWidth*.5+rnd(100))+'px';p2.style.top=(innerHeight*.35+rnd(80))+'px';
      document.body.appendChild(p2);setTimeout(()=>p2.remove(),1500);
      if(typeof dlog==='function')dlog(`🤖 AI: ${aiR}`);
    },800);
  }
}
initReactionBar();

// ══════════════════════════════════════
// MAP PROGRESS (zone build progress)
// ══════════════════════════════════════
const ZONE_PROGRESS={gh:80,lm:30,ch:0,mn:0};
function renderMapProgress(){
  document.querySelectorAll('.map-zone-btn').forEach(btn=>{
    const zid=btn.dataset.zid;if(!zid)return;
    const pct=ZONE_PROGRESS[zid]||0;
    if(!btn.querySelector('.mz-progress')){
      const bar=document.createElement('div');bar.className='mz-progress';
      bar.innerHTML=`<div class="mz-progress-fill" style="width:${pct}%"></div>`;
      const buildLabel=document.createElement('div');buildLabel.className='mz-build';
      buildLabel.textContent=pct>0?`Construcție ${pct}%`:(zid==='ch'||zid==='mn'?'🔒 Blocat':'Complet');
      btn.appendChild(bar);btn.appendChild(buildLabel);
    }
  });
}
// patch renderHub to add zid data attrs & progress bars
const __origRH2=renderHub;
renderHub=function(){
  __origRH2();
  document.querySelectorAll('.map-zone-btn').forEach((btn,i)=>{
    const zones=['gh','lm','ch','mn','boss'];
    if(zones[i])btn.dataset.zid=zones[i];
  });
  setTimeout(renderMapProgress,100);
};

// ══════════════════════════════════════
// SW EXTENSION for new screens
// ══════════════════════════════════════
const _origSw=sw;
sw=function(m){
  // map new screens
  if(!SM.pets)Object.assign(SM,{pets:'spets',shop:'sshop',stats:'sstats'});
  _origSw(m);
  if(m==='pets'){if(!document.getElementById('spets').dataset.inited){document.getElementById('spets').dataset.inited='1';}renderPets();}
  if(m==='shop'){if(!shopInited)initShop();else renderShop();}
  if(m==='stats'){renderStats();startSessionTimer();}
};

// Extend PLAYER with new fields
Object.assign(PLAYER,{pets:new Set(['p11']),shopOwned:new Set(),duelWins:0,
  levelsCompleted:0,bestCombo:0,newPets:new Set(['p11'])});

// Track best combo
const _origCascade=cascade;
// patch showWin to update stats
const __origShowWin=showWin;
showWin=function(){
  PLAYER.levelsCompleted++;
  PLAYER.bestCombo=Math.max(PLAYER.bestCombo||0,combo);
  ZONE_PROGRESS[curZone]=Math.min(100,(ZONE_PROGRESS[curZone]||0)+10);
  syncPets();
  __origShowWin();
};
// patch duel wins
const __origEndDuel=endDuel;
endDuel=function(){
  __origEndDuel();
  if(dp1>dp2){PLAYER.duelWins=(PLAYER.duelWins||0)+1;}
};
// update header resources when coins change
const __origBuy=buyItem;
// Patch hub resources display
function refreshHubResources(){
  const hc=$('hcoin');if(hc)hc.textContent=PLAYER.coins;
  const hs=$('hseed');if(hs)hs.textContent=PLAYER.seeds;
  const hg=$('hgem');if(hg)hg.textContent=PLAYER.gems;
}
// refresh resources on any screen show
const ___origSw=sw;
sw=function(m){___origSw(m);setTimeout(refreshHubResources,100);};

// ══════════════════════════════════════
// TOUCH SWIPE on board
// ══════════════════════════════════════
(function initTouchSwipe(){
  let tx0=0,ty0=0,touchSel=null;
  const board=$('mb');if(!board)return;
  board.addEventListener('touchstart',e=>{
    const t=e.touches[0];tx0=t.clientX;ty0=t.clientY;
    const el=document.elementFromPoint(tx0,ty0)?.closest('.tile');
    if(el){touchSel={r:+el.dataset.r,c:+el.dataset.c};e.preventDefault();}
  },{passive:false});
  board.addEventListener('touchend',e=>{
    if(!touchSel)return;
    const t=e.changedTouches[0];
    const dx=t.clientX-tx0,dy=t.clientY-ty0;
    if(Math.abs(dx)<8&&Math.abs(dy)<8){onT(touchSel.r,touchSel.c);touchSel=null;return;}
    let dr=0,dc=0;
    if(Math.abs(dx)>Math.abs(dy)){dc=dx>0?1:-1;}else{dr=dy>0?1:-1;}
    const nr=touchSel.r+dr,nc=touchSel.c+dc;
    if(nr>=0&&nr<8&&nc>=0&&nc<8){
      if(!sel){sel=touchSel;}
      doSwap(touchSel.r,touchSel.c,nr,nc);
    }
    touchSel=null;
  },{passive:false});
})();

startSessionTimer();

// ══ Extend SM map ══
Object.assign(SM,{
  'story-mode':'sstory-mode',mini:'smini',events:'sevents',
  'pet-detail':'spet-detail',editor:'seditor',tourn:'stourn',roadmap:'sroadmap'
});
const ___swBase=sw;
sw=function(m){
  ___swBase(m);
  if(m==='story-mode')initStoryMode();
  if(m==='mini')initMiniGames();
  if(m==='events')renderEvents();
  if(m==='editor')initEditor();
  if(m==='tourn')renderTournament();
  if(m==='roadmap')renderRoadmap();
};

// ══════════════════════════════════════
// STORY MODE
// ══════════════════════════════════════
const STORY_CHAPTERS=[
  {
    title:'Capitolul 1 · Trezirea Grădinii',
    bg:'radial-gradient(ellipse at 50% 80%,#1a2f1a,#0a0d0a)',
    chars:[{n:'Mia Gardener',e:'👩‍🌾',active:true},{n:'???',e:'🌿',active:false}],
    lines:[
      {speaker:'Mia Gardener',text:'Oh... ce s-a întâmplat cu grădina mea? Totul e acoperit de buruieni!',char:0},
      {speaker:'Mia Gardener',text:'A trecut mult timp de când nu am mai îngrijit-o. Trebuie să o repar!',char:0},
      {speaker:'Vocea Grădinii',text:'*foșnet misterios* Cineva a venit... în sfârșit...',char:1},
      {speaker:'Mia Gardener',text:'Cine ești?! De unde vii?',char:0},
      {speaker:'Vocea Grădinii',text:'Sunt spiritul acestei grădini. Am așteptat pe cineva care să mă trezească.',char:1},
      {speaker:'Vocea Grădinii',text:'Dacă vrei să restabilești grădina, trebuie să treci prin patru zone magice.',char:1},
    ]
  },
  {
    title:'Capitolul 2 · Sera de Bomboane',
    bg:'radial-gradient(ellipse at 50% 80%,rgba(255,133,194,.2),#0d0d1a)',
    chars:[{n:'Mia Gardener',e:'👩‍🌾',active:true},{n:'Candy Fox',e:'🦊',active:false}],
    lines:[
      {speaker:'Candy Fox',text:'*apare de nicăieri* Hei! Ce cauți în grădina mea de bomboane?',char:1},
      {speaker:'Mia Gardener',text:'Grădina TA?! Aceasta este grădina pe care trebuie să o salvez!',char:0},
      {speaker:'Candy Fox',text:'Salvat? *râde* Cred că va trebui să o câștigați mai întâi!',char:1},
      {speaker:'Mia Gardener',text:'Atunci să jucăm! Cel mai bun match-3 câștigă zona.',char:0},
      {speaker:'Candy Fox',text:'*înclinație* Fie. Dar nu vei câștiga atât de ușor, grădinărița mică!',char:1},
    ]
  },
  {
    title:'Capitolul 3 · Fântâna Lemon',
    bg:'radial-gradient(ellipse at 50% 80%,rgba(255,224,102,.15),#0d0d0a)',
    chars:[{n:'Mia Gardener',e:'👩‍🌾',active:true},{n:'Bee Queen',e:'👑',active:false}],
    lines:[
      {speaker:'Bee Queen',text:'Impresionant... ai ajuns atât de departe. Nu mulți reușesc.',char:1},
      {speaker:'Mia Gardener',text:'Am nevoie de apă din fântână pentru a debloca zona următoare.',char:0},
      {speaker:'Bee Queen',text:'Fântâna e blocată de caramel. Vei avea nevoie de aliatul meu... albinuța Buzz.',char:1},
      {speaker:'Mia Gardener',text:'Buzz? Unde pot să o găsesc?',char:0},
      {speaker:'Bee Queen',text:'O vei câștiga prin joc. Dar mai întâi... demonstrează-ți valoarea!',char:1},
    ]
  },
  {
    title:'Capitolul 4 · Grădina Lunii',
    bg:'radial-gradient(ellipse at 50% 80%,rgba(124,111,255,.2),#07070d)',
    chars:[{n:'Mia Gardener',e:'👩‍🌾',active:true},{n:'Moon Cat',e:'🐱',active:false},{n:'Spirit',e:'🌙',active:false}],
    lines:[
      {speaker:'Moon Cat',text:'*miorlăie* Ai ajuns până aici... grădinărița curajoasă.',char:1},
      {speaker:'Mia Gardener',text:'Aceasta este ultima zonă. Simt că grădina este aproape de a fi salvată!',char:0},
      {speaker:'Spirit',text:'Da... și eu o simt. Îți mulțumesc, Mia. Ai făcut imposibilul.',char:2},
      {speaker:'Moon Cat',text:'Dar există o ultimă provocare. Regele Buruienilor nu se va preda ușor.',char:1},
      {speaker:'Mia Gardener',text:'Mă înfrunt cu orice! Această grădină este casa mea!',char:0},
      {speaker:'Spirit',text:'Atunci să mergem împreună. Puterea grădinii este cu tine.',char:2},
    ]
  },
];
let storyChapter=0,storyLine=0,dialTyping=null,storyInited=false;
function initStoryMode(){
  if(!storyInited){storyInited=true;}
  renderStoryScene();
}
function renderStoryScene(){
  const ch=STORY_CHAPTERS[storyChapter];
  if(!ch)return;
  $('scene-chapter').textContent=ch.title;
  $('sn-chapter-label').textContent=`Cap. ${storyChapter+1}/4`;
  $('sn-body').style.background=ch.bg;
  const chars=$('scene-chars');chars.innerHTML='';
  ch.chars.forEach((c,i)=>{
    const d=document.createElement('div');d.className='scene-char';d.id=`sc-${i}`;
    d.innerHTML=`<span class="char-sprite">${c.e}</span><div style="font-size:.65rem;color:var(--muted);margin-top:4px">${c.n}</div>`;
    chars.appendChild(d);
  });
  typeDialogue(storyLine);
}
function typeDialogue(lineIdx){
  const ch=STORY_CHAPTERS[storyChapter];
  if(!ch||lineIdx>=ch.lines.length){
    if(storyChapter<STORY_CHAPTERS.length-1){
      $('dial-next').textContent='Capitolul următor →';
    }else{
      $('dial-next').textContent='🎉 Sfârșit!';
    }
    return;
  }
  const line=ch.lines[lineIdx];
  $('dial-speaker').textContent=line.speaker;
  // highlight active char
  ch.chars.forEach((_,i)=>{
    const el=$(`sc-${i}`);if(el)el.className='scene-char '+(i===line.char?'active':'inactive');
  });
  // typewriter
  if(dialTyping)clearInterval(dialTyping);
  const target=$('dial-text');target.innerHTML='';
  let i=0;
  dialTyping=setInterval(()=>{
    if(i<line.text.length){target.innerHTML=line.text.slice(0,++i)+'<span class="cursor"></span>';}
    else{clearInterval(dialTyping);dialTyping=null;target.innerHTML=line.text;}
  },28);
  // progress bar
  const pct=((lineIdx+1)/ch.lines.length)*100;
  $('dial-prog').style.width=pct+'%';
  $('dial-next').textContent='Continuă →';
}
function nextDialogue(){
  sfxClick();
  if(dialTyping){clearInterval(dialTyping);dialTyping=null;const ch=STORY_CHAPTERS[storyChapter];const line=ch.lines[storyLine];$('dial-text').innerHTML=line.text;return;}
  storyLine++;
  const ch=STORY_CHAPTERS[storyChapter];
  if(storyLine>=ch.lines.length){
    if(storyChapter<STORY_CHAPTERS.length-1){
      storyChapter++;storyLine=0;renderStoryScene();
      pushNotif({icon:'✍️',text:`Capitol nou deblocat: <strong>${STORY_CHAPTERS[storyChapter].title}</strong>`,type:'ach',dur:3500});
    }else{
      showM({emoji:'🌸',title:'Povestea Completă!',sub:'Ai terminat toate cele 4 capitole ale poveștii.',stars:'⭐⭐⭐',rewards:[{c:'g',v:500,l:'🪙 Monede'},{c:'m',v:3,l:'💎 Geme'}],btn1:'Minunat!',cb1:hideM});
      sfxWin();burst(innerWidth/2,innerHeight/2);
    }
  }else{typeDialogue(storyLine);}
}
function restartStory(){storyChapter=0;storyLine=0;renderStoryScene();}
function skipStory(){storyChapter=STORY_CHAPTERS.length-1;storyLine=STORY_CHAPTERS[storyChapter].lines.length-1;renderStoryScene();typeDialogue(storyLine);}

// ══════════════════════════════════════
// MINI GAMES
// ══════════════════════════════════════
let miniGame='memory',miniTimer=null,miniSec=0,miniMovesCount=0,miniRecords={memory:null,slide:null,diff:null};
function initMiniGames(){renderMiniGame('memory');}
function switchMini(type,btn){
  document.querySelectorAll('.mini-tab').forEach(t=>t.classList.remove('on'));
  btn.classList.add('on');
  miniGame=type;
  clearInterval(miniTimer);miniSec=0;miniMovesCount=0;
  $('mini-time').textContent='0s';$('mini-moves').textContent='0';
  $('mini-record').textContent=miniRecords[type]?miniRecords[type]+'s':'-';
  renderMiniGame(type);
}
function startMiniTimer(){
  clearInterval(miniTimer);miniSec=0;
  miniTimer=setInterval(()=>{miniSec++;$('mini-time').textContent=miniSec+'s';},1000);
}
function stopMiniTimer(type){
  clearInterval(miniTimer);
  if(!miniRecords[type]||miniSec<miniRecords[type])miniRecords[type]=miniSec;
  $('mini-record').textContent=miniRecords[type]+'s';
}

// — Memory Cards —
const MEM_EMOJIS=['🌸','🍬','🌿','🫐','🌻','🏮','🦋','🌙'];
let memFlipped=[],memMatched=new Set(),memLocked=false;
function renderMiniGame(type){
  const area=$('mini-area');area.innerHTML='';
  if(type==='memory')renderMemory(area);
  else if(type==='slide')renderSlide(area);
  else if(type==='diff')renderDiff(area);
}
function renderMemory(area){
  const pairs=[...MEM_EMOJIS,...MEM_EMOJIS].sort(()=>Math.random()-.5);
  memFlipped=[];memMatched=new Set();memLocked=false;
  const grid=document.createElement('div');grid.className='memory-grid';
  grid.style.gridTemplateColumns='repeat(4,1fr)';grid.style.width='320px';
  pairs.forEach((e,i)=>{
    const card=document.createElement('div');card.className='mem-card';card.dataset.i=i;card.dataset.e=e;card.style.width='70px';
    card.innerHTML=`<div class="mem-front"></div><div class="mem-back">${e}</div>`;
    card.onclick=()=>flipCard(card,pairs);
    grid.appendChild(card);
  });
  area.appendChild(grid);
  startMiniTimer();
}
function flipCard(card){
  if(memLocked||card.classList.contains('flipped')||card.classList.contains('matched'))return;
  card.classList.add('flipped');sfxClick();
  memFlipped.push(card);
  if(memFlipped.length===2){
    memLocked=true;miniMovesCount++;$('mini-moves').textContent=miniMovesCount;
    const[a,b]=memFlipped;
    if(a.dataset.e===b.dataset.e){
      setTimeout(()=>{a.classList.add('matched');b.classList.add('matched');memFlipped=[];memLocked=false;memMatched.add(a.dataset.e);sfxMatch();
        if(memMatched.size===MEM_EMOJIS.length){stopMiniTimer('memory');PLAYER.coins+=50;showM({emoji:'🎉',title:'Memory completat!',sub:`Ai terminat în ${miniSec}s cu ${miniMovesCount} mutări!`,rewards:[{c:'g',v:50,l:'🪙 Monede'}],btn1:'Joacă din nou',cb1:()=>{hideM();renderMemory($('mini-area'));}});}
      },400);
    }else{
      setTimeout(()=>{a.classList.remove('flipped');b.classList.remove('flipped');memFlipped=[];memLocked=false;},900);
    }
  }
}

// — Slide Puzzle —
let slideBoard=[],slideEmpty=8;
const SLIDE_EMOJIS=['🌸','🍬','🌿','🫐','🌻','🏮','🦋','🌙',''];
function renderSlide(area){
  slideBoard=[0,1,2,3,4,5,6,7,8];slideEmpty=8;
  // shuffle
  for(let i=0;i<200;i++){const n=getSlideNeighbors(slideEmpty);const pick=n[rnd(n.length)];[slideBoard[slideEmpty],slideBoard[pick]]=[slideBoard[pick],slideBoard[slideEmpty]];slideEmpty=pick;}
  drawSlide(area);startMiniTimer();
}
function getSlideNeighbors(pos){const n=[];if(pos%3!==0)n.push(pos-1);if(pos%3!==2)n.push(pos+1);if(pos>=3)n.push(pos-3);if(pos<=5)n.push(pos+3);return n;}
function drawSlide(area){
  area.innerHTML='';const grid=document.createElement('div');grid.className='slide-grid';
  slideBoard.forEach((val,i)=>{
    const t=document.createElement('div');t.className='slide-tile'+(val===8?' empty':'');
    t.textContent=val===8?'':SLIDE_EMOJIS[val];
    t.onclick=()=>{if(getSlideNeighbors(slideEmpty).includes(i)){[slideBoard[slideEmpty],slideBoard[i]]=[slideBoard[i],slideBoard[slideEmpty]];slideEmpty=i;miniMovesCount++;$('mini-moves').textContent=miniMovesCount;sfxClick();drawSlide($('mini-area'));if(slideBoard.every((v,i)=>v===i)){stopMiniTimer('slide');PLAYER.coins+=80;showM({emoji:'🧩',title:'Puzzle rezolvat!',sub:`${miniSec}s · ${miniMovesCount} mutări`,rewards:[{c:'g',v:80,l:'🪙 Monede'}],btn1:'Din nou',cb1:()=>{hideM();renderSlide($('mini-area'));}});}}};
    grid.appendChild(t);
  });
  area.appendChild(grid);
}

// — Find the Difference —
const DIFF_DIFFS=[{x:60,y:40,r:18},{x:140,y:90,r:15},{x:230,y:60,r:20},{x:90,y:140,r:12},{x:195,y:130,r:16}];
let diffFound=new Set();
function renderDiff(area){
  diffFound=new Set();
  const wrap=document.createElement('div');wrap.className='find-diff-wrap';wrap.style.position='relative';
  const W=300,H=200;
  function makeCanvas(isDiff){
    const c=document.createElement('canvas');c.width=W;c.height=H;c.className='find-diff-canvas';
    const ctx=c.getContext('2d');
    // background
    const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a1f0a');bg.addColorStop(1,'#1a3a1a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // flowers
    const items=[{e:'🌸',x:50,y:60},{e:'🌻',x:130,y:80},{e:'🌷',x:220,y:50},{e:'🌿',x:80,y:140},{e:'🌺',x:200,y:130},{e:'🏮',x:260,y:100}];
    items.forEach(it=>{ctx.font='28px serif';ctx.textAlign='center';ctx.fillText(it.e,it.x,it.y);});
    if(isDiff){
      DIFF_DIFFS.forEach((d,i)=>{
        if(!diffFound.has(i)){ctx.fillStyle=`hsl(${i*60},60%,40%)`;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();}
      });
    }
    return c;
  }
  const c1=makeCanvas(false),c2=makeCanvas(true);
  const label1=document.createElement('div');label1.style.cssText='font-size:.65rem;color:var(--muted);text-align:center;margin-bottom:4px';label1.textContent='Original';
  const label2=document.createElement('div');label2.style.cssText='font-size:.65rem;color:var(--muted);text-align:center;margin-bottom:4px';label2.textContent='Modificat — click pe diferențe!';
  const b1=document.createElement('div');b1.style.cssText='text-align:center';b1.appendChild(label1);b1.appendChild(c1);
  const b2=document.createElement('div');b2.style.cssText='text-align:center;position:relative';b2.appendChild(label2);b2.appendChild(c2);
  c2.onclick=(e)=>{
    const rect=c2.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const sx=mx*(W/rect.width),sy=my*(H/rect.height);
    let found=false;
    DIFF_DIFFS.forEach((d,i)=>{if(!diffFound.has(i)&&Math.hypot(sx-d.x,sy-d.y)<d.r+8){diffFound.add(i);found=true;sfxMatch();miniMovesCount++;$('mini-moves').textContent=miniMovesCount;
      const marker=document.createElement('div');marker.style.cssText=`position:absolute;left:${d.x/W*100}%;top:${d.y/H*100}%;width:${d.r*2}px;height:${d.r*2}px;margin-left:-${d.r}px;margin-top:-${d.r}px;border-radius:50%;border:3px solid var(--mint);pointer-events:none;animation:diffPop .3s ease;`;
      b2.appendChild(marker);
      if(diffFound.size===DIFF_DIFFS.length){stopMiniTimer('diff');PLAYER.coins+=100;showM({emoji:'🔍',title:'Toate diferențele găsite!',sub:`${miniSec}s · ${miniMovesCount} click-uri`,rewards:[{c:'g',v:100,l:'🪙 Monede'}],btn1:'Din nou',cb1:()=>{hideM();renderDiff($('mini-area'));}});}
    }});
    if(!found)toast('❌ Nu e o diferență acolo!');
  };
  wrap.appendChild(b1);wrap.appendChild(b2);area.appendChild(wrap);
  startMiniTimer();
}

// ══════════════════════════════════════
// SEASONAL EVENTS
// ══════════════════════════════════════
function detectSeason(){
  const m=new Date().getMonth()+1,d=new Date().getDate();
  if(m===10||m===11&&d<5)return'halloween';
  if(m===12||m===1&&d<10)return'winter';
  if(m===3||m===4||m===5&&d<15)return'spring';
  return'summer';
}
const EVENTS={
  halloween:{name:'🎃 Halloween Garden',color:'#ff6b00',pattern:'repeating-linear-gradient(45deg,rgba(255,107,0,.1) 0,rgba(255,107,0,.1) 1px,transparent 1px,transparent 8px)',
    desc:'Grădina s-a transformat! Dovleci, liliac și magie neagră au invadat florile.',
    timer:'31 Oct',rewards:[{e:'🎃',n:'Dovleac Magic'},{e:'🦇',n:'Liliac Rar'},{e:'🕷️',n:'Păianjen de Aur'},{e:'🧙',n:'Vrăjitoare Pet'}],
    challenges:[{n:'Match 50 piese portocalii',prog:23,max:50,r:'100🪙',done:false},{n:'Câștigă 3 niveluri cu tema Halloween',prog:1,max:3,r:'1💎',done:false},{n:'Rezolvă escape camera fantomelor',prog:0,max:1,r:'Pălărie exclusivă',done:false}]},
  winter:{name:'❄️ Winter Frost Garden',color:'#87e8ff',pattern:'repeating-linear-gradient(45deg,rgba(135,232,255,.08) 0,rgba(135,232,255,.08) 1px,transparent 1px,transparent 8px)',
    desc:'Zăpada a acoperit grădina! Cristale de gheață și lumânări magice decorează fiecare colț.',
    timer:'31 Dec',rewards:[{e:'❄️',n:'Cristal de Gheață'},{e:'⛄',n:'Om de Zăpadă'},{e:'🌨️',n:'Fulgule Rar'},{e:'🦌',n:'Ren Magic'}],
    challenges:[{n:'Colectează 100 fulgi de zăpadă',prog:67,max:100,r:'200🪙',done:false},{n:'Câștigă turnamentul de iarnă',prog:0,max:1,r:'3💎',done:false},{n:'Completează toate escape rooms de iarnă',prog:2,max:3,r:'Costum exclusiv',done:false}]},
  spring:{name:'🌸 Spring Festival',color:'#ff85c2',pattern:'repeating-linear-gradient(45deg,rgba(255,133,194,.08) 0,rgba(255,133,194,.08) 1px,transparent 1px,transparent 8px)',
    desc:'Primăvara a sosit! Flori noi înfloresc în fiecare zonă și animăluțe noi apar în grădină.',
    timer:'15 Mai',rewards:[{e:'🌸',n:'Floare de Cireș'},{e:'🦋',n:'Fluture Primăvăratec'},{e:'🐣',n:'Pui de Pasăre'},{e:'🌈',n:'Curcubeu Dublu'}],
    challenges:[{n:'Plantează 20 de flori în grădină',prog:8,max:20,r:'150🪙',done:false},{n:'Salvează 5 animăluțe noi',prog:2,max:5,r:'2💎',done:false},{n:'Câștigă 10 niveluri în Spring Garden',prog:4,max:10,r:'Outfit exclusiv',done:false}]},
  summer:{name:'🌞 Summer Garden Party',color:'#ffe066',pattern:'repeating-linear-gradient(45deg,rgba(255,224,102,.08) 0,rgba(255,224,102,.08) 1px,transparent 1px,transparent 8px)',
    desc:'Vara bate la ușă! Limonade, flori de vară și petreceri în grădina însorită.',
    timer:'30 Aug',rewards:[{e:'🌻',n:'Floarea-Soarelui XXL'},{e:'🍋',n:'Lămâie Magică'},{e:'🌊',n:'Unda de Vară'},{e:'🦀',n:'Rac de Coral'}],
    challenges:[{n:'Fă 30 de combo-uri vara',prog:18,max:30,r:'100🪙',done:false},{n:'Câștigă 5 dueluri de vară',prog:2,max:5,r:'1💎',done:false},{n:'Decoreaza grădina cu 8 iteme de vară',prog:3,max:8,r:'Umbreluță de soare',done:false}]},
};
const PAST_EVENTS=[{e:'🎃',n:'Halloween Garden 2024',color:'#ff6b00'},{e:'❄️',n:'Winter Frost 2024',color:'#87e8ff'}];
function renderEvents(){
  const season=detectSeason();const ev=EVENTS[season];
  const body=$('event-body');body.innerHTML='';
  $('ev-hdr-title').textContent='🌦️ Eveniment Activ';
  $('ev-season-label').textContent={halloween:'🎃 Toamnă',winter:'❄️ Iarnă',spring:'🌸 Primăvară',summer:'🌞 Vară'}[season];
  const card=document.createElement('div');card.className='active-event-card';
  card.style.cssText=`background:linear-gradient(135deg,color-mix(in srgb,${ev.color} 15%,var(--card)),var(--card));border:1px solid color-mix(in srgb,${ev.color} 40%,transparent);--event-pattern:${ev.pattern}`;
  card.innerHTML=`<span class="event-emoji">${ev.rewards[0].e}</span>
    <div class="event-name">${ev.name}</div>
    <div class="event-desc">${ev.desc}</div>
    <div class="event-timer" style="color:${ev.color}">⏳ Până la ${ev.timer}</div>
    <div style="font-size:.7rem;color:var(--muted);margin-bottom:8px">Recompense exclusive:</div>
    <div class="event-rewards-grid">${ev.rewards.map(r=>`<div class="event-reward"><span class="er-e">${r.e}</span><div class="er-n">${r.n}</div></div>`).join('')}</div>
    <button class="ba" style="font-size:.82rem;padding:8px 18px" onclick="startEventPlay('${season}')">🎯 Joacă evenimentul</button>`;
  body.appendChild(card);
  const chWrap=document.createElement('div');chWrap.className='event-challenges';
  chWrap.innerHTML=`<div class="event-ch-title">Provocările evenimentului</div>`+
    ev.challenges.map(c=>`<div class="event-ch-item ${c.done?'done':''}">
      <span class="ech-icon">${c.done?'✅':'🎯'}</span>
      <div class="ech-info"><div class="ech-name">${c.n}</div><div class="ech-prog">${c.prog}/${c.max}</div></div>
      <span class="ech-reward">${c.r}</span>
    </div>`).join('');
  body.appendChild(chWrap);
  const pastWrap=document.createElement('div');pastWrap.className='past-events';
  pastWrap.innerHTML=`<div style="font-family:'Fredoka One',cursive;font-size:.85rem;color:var(--text);margin-bottom:8px">Evenimente Trecute</div>`+
    PAST_EVENTS.map(p=>`<div class="past-ev-card"><span style="font-size:1.5rem">${p.e}</span><span style="font-size:.75rem;color:var(--muted)">${p.n}</span><span style="margin-left:auto;font-size:.65rem;background:rgba(255,255,255,.07);padding:2px 8px;border-radius:50px;color:var(--muted)">Terminat</span></div>`).join('');
  body.appendChild(pastWrap);
}
function startEventPlay(season){sfxClick();initGame('gh');sw('story');toast('🎃 Nivel special de eveniment activ!');}

// ══════════════════════════════════════
// PET EVOLUTION
// ══════════════════════════════════════
const PET_EVOL={
  p1:{stages:[{e:'🐱',l:'Pui'},{e:'🐈',l:'Adult'},{e:'🦁',l:'Legendar'}],xp:0,maxXp:100,stage:0,lastFeed:0},
  p2:{stages:[{e:'🐶',l:'Pui'},{e:'🐕',l:'Adult'},{e:'🦮',l:'Legendar'}],xp:0,maxXp:100,stage:0,lastFeed:0},
  p5:{stages:[{e:'🐝',l:'Larvă'},{e:'🐝',l:'Albinuță'},{e:'✨',l:'Regină'}],xp:0,maxXp:80,stage:0,lastFeed:0},
  p11:{stages:[{e:'🐠',l:'Pui'},{e:'🐟',l:'Adult'},{e:'🐡',l:'Legendar'}],xp:0,maxXp:90,stage:0,lastFeed:0},
};
let viewingPet=null;
function openPetDetail(petId){
  viewingPet=petId;
  const pet=ALL_PETS.find(p=>p.id===petId);if(!pet)return;
  $('petd-title').textContent=pet.name;
  const evol=PET_EVOL[petId]||{stages:[{e:pet.e,l:'Base'}],xp:0,maxXp:100,stage:0,lastFeed:0};
  const body=$('petd-body');body.innerHTML='';
  const stage=evol.stages[evol.stage];
  const canFeed=Date.now()-evol.lastFeed>60000;
  const cooldownSec=canFeed?0:Math.ceil((60000-(Date.now()-evol.lastFeed))/1000);
  body.innerHTML=`<div class="petd-card">
    <span class="petd-sprite">${stage.e}</span>
    <div class="petd-name">${pet.name}</div>
    <div class="petd-stage">${stage.l} · Stadiu ${evol.stage+1}/${evol.stages.length}</div>
    <div class="petd-hearts">${'❤️'.repeat(pet.hearts)}</div>
    <div style="font-size:.68rem;color:var(--muted);margin-bottom:6px">XP: ${evol.xp}/${evol.maxXp}</div>
    <div class="pet-xp-bar"><div class="pet-xp-fill" style="width:${(evol.xp/evol.maxXp)*100}%"></div></div>
    <div class="pet-xp-labels"><span>Stadiu curent</span><span>${evol.stage<evol.stages.length-1?'→ '+evol.stages[evol.stage+1].l:'⭐ MAX'}</span></div>
    <button class="petd-feed-btn" ${canFeed?'':'disabled'} onclick="feedPet('${petId}')">
      ${canFeed?'🍖 Hrănește (+20 XP)':'⏳ Se odihnește...'}
    </button>
    <div class="pet-feed-cooldown">${canFeed?'Gata să mănânce!':'Disponibil în '+cooldownSec+'s'}</div>
  </div>
  <div class="petd-evol-preview">
    ${evol.stages.map((s,i)=>`<span class="evol-stage ${i<=evol.stage?'reached':''}"><span class="es-e">${s.e}</span><span class="es-l">${s.l}</span></span>${i<evol.stages.length-1?'<span class="evol-arrow">→</span>':''}`).join('')}
  </div>`;
  sw('pet-detail');
}
function feedPet(petId){
  const evol=PET_EVOL[petId];if(!evol)return;
  if(Date.now()-evol.lastFeed<60000){toast('⏳ Animăluțul se odihnește!');return;}
  evol.xp+=20;evol.lastFeed=Date.now();sfxPlace();
  if(evol.xp>=evol.maxXp&&evol.stage<evol.stages.length-1){
    evol.stage++;evol.xp=0;
    burst(innerWidth/2,innerHeight/3);sfxWin();
    pushNotif({icon:evol.stages[evol.stage].e,text:`✨ ${ALL_PETS.find(p=>p.id===petId)?.name} a evoluat la <strong>${evol.stages[evol.stage].l}</strong>!`,type:'pet',dur:5000});
  }
  openPetDetail(petId);
}
// Patch renderPets to make cards clickable
const __origRenderPets=renderPets;
renderPets=function(){
  __origRenderPets();
  document.querySelectorAll('.pet-card.owned').forEach(card=>{
    const petIdx=[...document.querySelectorAll('.pet-card')].indexOf(card);
    const sorted=[...ALL_PETS].sort((a,b)=>(PLAYER.pets.has(b.id)?1:0)-(PLAYER.pets.has(a.id)?1:0));
    const pet=sorted[petIdx];if(pet&&PLAYER.pets.has(pet.id)){
      card.style.cursor='pointer';card.onclick=()=>openPetDetail(pet.id);
      const evol=PET_EVOL[pet.id];
      if(evol&&evol.stage>0){const badge=document.createElement('div');badge.style.cssText='position:absolute;bottom:6px;right:6px;font-size:.5rem;background:var(--gold);color:#111;border-radius:4px;padding:1px 4px;font-weight:900';badge.textContent='Lv'+evol.stage;card.style.position='relative';card.appendChild(badge);}
    }
  });
};

// ══════════════════════════════════════
// LEVEL EDITOR
// ══════════════════════════════════════
const ED_TL=[{e:'🌸',n:'Trandafir'},{e:'🍬',n:'Bomboană'},{e:'🍋',n:'Lămâie'},{e:'🌿',n:'Frunzuță'},{e:'🫐',n:'Afine'},{e:'🌻',n:'Floare'}];
let edBoard=Array(64).fill(null).map(()=>({type:rnd(6),obs:null}));
let edTool={kind:'tile',val:0};
let edInited=false;
function initEditor(){
  if(!edInited){edInited=true;buildEdOpts();}
  drawEdBoard();updEdInfo();
}
function buildEdOpts(){
  const el=$('ed-tile-opts');el.innerHTML='';
  ED_TL.forEach((t,i)=>{
    const d=document.createElement('div');d.className='ed-tile-opt'+(i===0?' on':'');
    d.id='ed-t-'+i;d.innerHTML=`<span class="ed-tile-emoji">${t.e}</span>${t.n}`;
    d.onclick=()=>{edTool={kind:'tile',val:i};document.querySelectorAll('.ed-tile-opt').forEach(x=>x.classList.remove('on'));d.classList.add('on');$('ed-obs-none').classList.remove('on');};
    el.appendChild(d);
  });
  // Goals
  const ge=$('ed-goals');ge.innerHTML='';
  ED_TL.slice(0,4).forEach((t,i)=>{
    const row=document.createElement('div');row.className='ed-goal-row';
    row.innerHTML=`${t.e} <input type="number" min="0" max="30" value="${rnd(10)+5}" id="edg${i}"> pcs`;
    ge.appendChild(row);
  });
}
function selEdTool(obs,btn){
  edTool={kind:'obs',val:obs};
  document.querySelectorAll('.ed-tile-opt,.ed-tile-opt[id^="ed-obs"]').forEach(x=>x.classList.remove('on'));
  document.querySelectorAll('#ed-obs-none,#ed-obs-jelly,#ed-obs-weed,#ed-obs-empty').forEach(x=>x.classList.remove('on'));
  btn.classList.add('on');
}
function drawEdBoard(){
  const board=$('ed-board');board.innerHTML='';
  edBoard.forEach((cell,i)=>{
    const d=document.createElement('div');d.className='ed-cell';
    if(cell.obs==='empty'){d.style.background='rgba(255,0,0,.1)';d.style.borderColor='rgba(255,0,0,.3)';d.textContent='🚫';}
    else if(cell.obs==='jelly'){d.style.background='rgba(255,133,194,.1)';d.style.borderColor='rgba(255,133,194,.3)';d.innerHTML=ED_TL[cell.type].e+'<span style="font-size:.5rem;position:absolute;top:1px;right:2px">🔵</span>';}
    else if(cell.obs==='weed'){d.style.background='rgba(100,160,30,.1)';d.style.borderColor='rgba(100,160,30,.3)';d.innerHTML=ED_TL[cell.type].e+'<span style="font-size:.5rem;position:absolute;top:1px;right:2px">🌿</span>';}
    else d.textContent=ED_TL[cell.type].e;
    d.onclick=()=>{
      if(edTool.kind==='tile'){edBoard[i].type=edTool.val;edBoard[i].obs=null;}
      else{edBoard[i].obs=edTool.val==='none'?null:edTool.val;}
      drawEdBoard();updEdInfo();sfxClick();
    };
    board.appendChild(d);
  });
}
function clearEditorBoard(){edBoard=Array(64).fill(null).map(()=>({type:0,obs:null}));drawEdBoard();updEdInfo();}
function randomEditorBoard(){edBoard=Array(64).fill(null).map(()=>({type:rnd(6),obs:rnd(5)===0?['jelly','weed'][rnd(2)]:null}));drawEdBoard();updEdInfo();}
function updEdInfo(){
  const jellies=edBoard.filter(c=>c.obs==='jelly').length;
  const weeds=edBoard.filter(c=>c.obs==='weed').length;
  const blocked=edBoard.filter(c=>c.obs==='empty').length;
  $('ed-info').innerHTML=`Celule: 64<br>Jeleu: ${jellies}<br>Liane: ${weeds}<br>Blocate: ${blocked}<br>Mutări: ${$('ed-moves-inp')?.value||25}`;
}
function testEditorLevel(){
  // Build zone config from editor
  const customGoals=[];
  for(let i=0;i<4;i++){const v=parseInt($(`edg${i}`)?.value||0);if(v>0)customGoals.push({t:i,n:v,l:ED_TL[i].n});}
  const mv=parseInt($('ed-moves-inp')?.value||25);
  if(customGoals.length===0){toast('⚠️ Adaugă cel puțin un obiectiv!');return;}
  ZN['custom']={tag:'🔧 Nivel Custom',mv,t:800,s2:1200,s3:1800,goals:customGoals,jelly:edBoard.some(c=>c.obs==='jelly'),weeds:edBoard.some(c=>c.obs==='weed'),boss:false};
  setZone('gh');initGame('custom');sw('story');
  toast('🔧 Testezi nivelul tău custom!');
}
function exportLevel(){
  const goals=[];for(let i=0;i<4;i++){const v=parseInt($(`edg${i}`)?.value||0);if(v>0)goals.push({t:i,n:v});}
  const code=JSON.stringify({board:edBoard.map(c=>c.type),obstacles:edBoard.map(c=>c.obs),goals,moves:parseInt($('ed-moves-inp')?.value||25)});
  navigator.clipboard?.writeText(code).then(()=>toast('📤 Nivelul a fost copiat în clipboard!')).catch(()=>toast('📤 Codul: '+code.slice(0,50)+'...'));
}

// ══════════════════════════════════════
// TOURNAMENT
// ══════════════════════════════════════
const TOURN_PLAYERS=[
  {av:'🧑‍🌾',name:'Tu',score:0,isPlayer:true},
  {av:'🦊',name:'Candy Fox',score:0},{av:'👑',name:'Bee Queen',score:0},
  {av:'🐱',name:'Moon Cat',score:0},{av:'🌶️',name:'Pepper King',score:0},
  {av:'🦔',name:'Choco Mole',score:0},{av:'🐝',name:'Buzz',score:0},
  {av:'🌸',name:'Petal',score:0},
];
let tournBracket=null,tournRound=0,tournStatus='idle';
function startTournament(){
  sfxClick();
  // Shuffle and create bracket
  const shuffled=[...TOURN_PLAYERS].sort(()=>Math.random()-.5);
  tournBracket={
    rounds:[
      // QF - 4 matches
      [{p1:shuffled[0],p2:shuffled[1],winner:null},{p1:shuffled[2],p2:shuffled[3],winner:null},{p1:shuffled[4],p2:shuffled[5],winner:null},{p1:shuffled[6],p2:shuffled[7],winner:null}],
      // SF - 2 matches
      [{p1:null,p2:null,winner:null},{p1:null,p2:null,winner:null}],
      // Final - 1 match
      [{p1:null,p2:null,winner:null}],
    ],
    roundNames:['Sfert de Finală','Semifinală','Finală'],
  };
  tournRound=0;tournStatus='playing';
  simulateTournRound();
}
function simulateTournRound(){
  if(!tournBracket)return;
  const round=tournBracket.rounds[tournRound];
  round.forEach(match=>{
    if(!match.p1||!match.p2)return;
    if(match.p1.isPlayer){match.p1.score=rnd(800)+600;match.p2.score=rnd(700)+400;}
    else if(match.p2.isPlayer){match.p2.score=rnd(800)+600;match.p1.score=rnd(700)+400;}
    else{match.p1.score=rnd(900)+400;match.p2.score=rnd(900)+400;}
    match.winner=match.p1.score>match.p2.score?match.p1:match.p2;
  });
  // Advance winners to next round
  if(tournRound<tournBracket.rounds.length-1){
    const next=tournBracket.rounds[tournRound+1];
    const winners=round.map(m=>m.winner);
    for(let i=0;i<next.length;i++){next[i].p1=winners[i*2];next[i].p2=winners[i*2+1];}
  }
  renderTournament();
  if(tournRound<tournBracket.rounds.length-1){setTimeout(()=>{tournRound++;simulateTournRound();},1500);}
  else{
    const finalist=tournBracket.rounds[tournBracket.rounds.length-1][0].winner;
    const won=finalist?.isPlayer;
    setTimeout(()=>{
      showM({emoji:won?'🏆':'🥈',title:won?'Campion!':'Loc 2!',sub:won?'Ai câștigat turnamentul!':'Ai ajuns în finală!',stars:won?'🥇🥇🥇':'🥈🥈',rewards:won?[{c:'g',v:1000,l:'🪙 Monede'},{c:'m',v:5,l:'💎 Geme'}]:[{c:'g',v:500,l:'🪙 Monede'},{c:'m',v:2,l:'💎 Geme'}],btn1:'Turnament nou',cb1:()=>{hideM();startTournament();}});
      won?sfxWin():sfxMatch();if(won)burst(innerWidth/2,innerHeight/2);
    },500);
    tournStatus='done';
  }
}
function renderTournament(){
  const statusEl=$('tourn-status');
  if(tournStatus==='idle'){
    statusEl.innerHTML=`<div class="tourn-status-title">🏆 Garden Cup</div><div class="tourn-status-sub">8 jucători · 3 runde · Premii mari</div>`;
  }else if(tournBracket){
    const rn=tournBracket.roundNames[Math.min(tournRound,2)];
    statusEl.innerHTML=`<div class="tourn-status-title">${rn}</div><div class="tourn-status-sub">${tournStatus==='done'?'Turnament finalizat!':'Runda în desfășurare...'}</div>`;
  }
  if(!tournBracket){$('bracket').innerHTML='';return;}
  const br=$('bracket');br.innerHTML='';
  tournBracket.rounds.forEach((round,ri)=>{
    const col=document.createElement('div');col.className='bracket-round';
    col.innerHTML=`<div class="bracket-round-title">${tournBracket.roundNames[ri]}</div>`;
    round.forEach(match=>{
      const m=document.createElement('div');m.className='bracket-match'+(ri===tournRound?' active':ri<tournRound?' done':'');
      const p1w=match.winner===match.p1,p2w=match.winner===match.p2;
      m.innerHTML=`<div class="bracket-player ${p1w?'winner':p2w?'loser':''}">${match.p1?`<span class="bpav">${match.p1.av}</span>${match.p1.name}<span class="bracket-score">${match.p1.score||''}</span>`:'-'}</div>
        <div class="bracket-vs">vs</div>
        <div class="bracket-player ${p2w?'winner':p1w?'loser':''}">${match.p2?`<span class="bpav">${match.p2.av}</span>${match.p2.name}<span class="bracket-score">${match.p2.score||''}</span>`:'-'}</div>`;
      col.appendChild(m);
    });
    br.appendChild(col);
    if(ri<tournBracket.rounds.length-1){const conn=document.createElement('div');conn.className='bracket-connector';br.appendChild(conn);}
  });
}

// ══════════════════════════════════════
// ROADMAP
// ══════════════════════════════════════
const ROADMAP_ITEMS=[
  {icon:'🌸',name:'Match-3 Core',desc:'Tabla 8×8 cu cascade, combo-uri și piese speciale.',tag:'shipped',color:'#5effa0',votes:0,voted:false},
  {icon:'⚔️',name:'Duel Mode',desc:'1v1 contra AI cu boosters și personaje unice.',tag:'shipped',color:'#5effa0',votes:0,voted:false},
  {icon:'🗝️',name:'Escape Rooms',desc:'4 camere secrete cu indicii și coduri de rezolvat.',tag:'shipped',color:'#5effa0',votes:0,voted:false},
  {icon:'🎀',name:'Garden Decor',desc:'Canvas animat cu plantare și animații fluente.',tag:'shipped',color:'#5effa0',votes:0,voted:false},
  {icon:'🏆',name:'Achievements',desc:'24 trofee deblocabile cu notificări pop-up.',tag:'shipped',color:'#5effa0',votes:0,voted:false},
  {icon:'🐾',name:'Animăluțe + Evoluție',desc:'12 pets colectabile cu sistem de hrănire și 3 stadii.',tag:'shipped',color:'#5effa0',votes:0,voted:false},
  {icon:'🎪',name:'Tournament Mode',desc:'Bracket vizual 8 jucători cu 3 runde și premii.',tag:'in-progress',color:'#ffe066',votes:342,voted:false},
  {icon:'🔧',name:'Level Editor',desc:'Creează și testează propriul nivel match-3.',tag:'in-progress',color:'#ffe066',votes:287,voted:false},
  {icon:'✍️',name:'Story Mode narativ',desc:'Dialoguri animate între personaje cu 4 capitole.',tag:'in-progress',color:'#ffe066',votes:256,voted:false},
  {icon:'🎲',name:'Mini-Jocuri Bonus',desc:'Memory Cards, Slide Puzzle, Find the Difference.',tag:'in-progress',color:'#ffe066',votes:198,voted:false},
  {icon:'🌍',name:'Multiplayer Real',desc:'Dueluri online cu jucători reali în timp real.',tag:'planned',color:'#8888bb',votes:892,voted:false},
  {icon:'🏅',name:'Clan System',desc:'Formează un clan cu prietenii și cuceriți grădini.',tag:'planned',color:'#8888bb',votes:654,voted:false},
  {icon:'📱',name:'App Mobile Nativă',desc:'Versiunea iOS și Android cu notificări push reale.',tag:'planned',color:'#8888bb',votes:743,voted:false},
  {icon:'🗺️',name:'World Map Extins',desc:'Zonele 5-8: Ocean Garden, Sky Garden, Volcano, Arctic.',tag:'planned',color:'#8888bb',votes:521,voted:false},
  {icon:'🎵',name:'Soundtrack Complet',desc:'OST original cu teme per zonă și event.',tag:'planned',color:'#8888bb',votes:312,voted:false},
  {icon:'🤝',name:'Co-op Mode',desc:'Joacă niveluri dificile împreună cu un prieten.',tag:'vote',color:'#ff85c2',votes:445,voted:false},
  {icon:'🐉',name:'Dragon Pet',desc:'Animăluț legendar obținut din 100 victorii consecutive.',tag:'vote',color:'#ff85c2',votes:389,voted:false},
  {icon:'🏰',name:'Castle Builder',desc:'Construiește un castel în grădină cu resursele câștigate.',tag:'vote',color:'#ff85c2',votes:267,voted:false},
];
const RM_SECTIONS=[
  {key:'shipped',label:'✅ Livrat',items:ROADMAP_ITEMS.filter(x=>x.tag==='shipped')},
  {key:'in-progress',label:'🔄 În Lucru',items:ROADMAP_ITEMS.filter(x=>x.tag==='in-progress')},
  {key:'planned',label:'📋 Planificat',items:ROADMAP_ITEMS.filter(x=>x.tag==='planned')},
  {key:'vote',label:'🗳️ Votează Acum',items:ROADMAP_ITEMS.filter(x=>x.tag==='vote')},
];
const maxVotes=Math.max(...ROADMAP_ITEMS.map(x=>x.votes),1);
function renderRoadmap(){
  const body=$('rm-body');body.innerHTML='';
  RM_SECTIONS.forEach(sec=>{
    const title=document.createElement('div');title.className='rm-section-title';title.textContent=sec.label;body.appendChild(title);
    sec.items.forEach(item=>{
      const d=document.createElement('div');d.className=`rm-item ${item.tag}`;d.style.setProperty('--rm-color',item.color);
      const isVotable=item.tag==='planned'||item.tag==='vote';
      d.innerHTML=`<div class="rm-item-header">
        <span class="rm-icon">${item.icon}</span>
        <span class="rm-name">${item.name}</span>
        <span class="rm-tag ${item.tag}">${{shipped:'✅ Livrat','in-progress':'🔄 În Lucru',planned:'📋 Planificat',vote:'🗳️ Votează'}[item.tag]}</span>
      </div>
      <div class="rm-desc">${item.desc}</div>
      ${isVotable?`<div class="rm-vote-row">
        <button class="rm-vote-btn ${item.voted?'voted':''}" onclick="voteRM(${ROADMAP_ITEMS.indexOf(item)},this)">
          ${item.voted?'✅ Votat':'👍 Votează'}
        </button>
        <div class="rm-vote-bar"><div class="rm-vote-fill" style="width:${(item.votes/maxVotes*100).toFixed(1)}%"></div></div>
        <span class="rm-vote-count">${item.votes} voturi</span>
      </div>`:item.tag==='shipped'?`<div style="font-size:.62rem;color:var(--mint)">✓ Disponibil în versiunea curentă</div>`:''}`;
      body.appendChild(d);
    });
  });
}
function voteRM(idx,btn){
  const item=ROADMAP_ITEMS[idx];if(item.voted){toast('Ai votat deja pentru acest feature!');return;}
  item.voted=true;item.votes++;sfxClick();
  pushNotif({icon:item.icon,text:`Ai votat pentru <strong>${item.name}</strong>! Mulțumim!`,type:'shop',dur:2500});
  renderRoadmap();
}

// ══════════════════════════════════════
// AMBIENT SOUND ENGINE
// ══════════════════════════════════════
let ambientNodes={};let ambientCtx=null;let ambiPlaying=false;
function getAmbCtx(){if(!ambientCtx)ambientCtx=new(window.AudioContext||window.webkitAudioContext)();return ambientCtx;}
function stopAmbient(){Object.values(ambientNodes).forEach(n=>{try{n.stop();}catch(e){}});ambientNodes={};ambiPlaying=false;}
function playAmbient(zone){
  if(ambiPlaying)stopAmbient();
  try{
    const ac=getAmbCtx();ambiPlaying=true;
    const masterGain=ac.createGain();masterGain.gain.value=0.12;masterGain.connect(ac.destination);
    // Wind layer (all zones)
    const buf=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*0.3;
    const wind=ac.createBufferSource();wind.buffer=buf;wind.loop=true;
    const wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=zone==='mn'?300:zone==='ch'?150:500;wf.Q.value=0.5;
    wind.connect(wf);wf.connect(masterGain);wind.start();ambientNodes.wind=wind;
    // Zone-specific tones
    if(zone==='gh'){
      // Birds: random chirps
      let birdInt=setInterval(()=>{
        if(!ambiPlaying){clearInterval(birdInt);return;}
        try{const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(masterGain);
          o.type='sine';o.frequency.setValueAtTime(1200+Math.random()*400,ac.currentTime);
          o.frequency.exponentialRampToValueAtTime(1800+Math.random()*300,ac.currentTime+0.1);
          g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(0.08,ac.currentTime+0.02);
          g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.15);
          o.start();o.stop(ac.currentTime+0.2);}catch(e){}
      },800+Math.random()*1200);ambientNodes.birdInt=birdInt;
    }else if(zone==='lm'){
      // Water drops
      let dropInt=setInterval(()=>{
        if(!ambiPlaying){clearInterval(dropInt);return;}
        try{const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(masterGain);
          o.type='sine';o.frequency.setValueAtTime(800,ac.currentTime);
          o.frequency.exponentialRampToValueAtTime(200,ac.currentTime+0.3);
          g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(0.1,ac.currentTime+0.01);
          g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.3);
          o.start();o.stop(ac.currentTime+0.35);}catch(e){}
      },600+Math.random()*800);ambientNodes.dropInt=dropInt;
    }else if(zone==='ch'){
      // Deep hum + rumble
      const hum=ac.createOscillator();const hg=ac.createGain();hum.connect(hg);hg.connect(masterGain);
      hum.type='sawtooth';hum.frequency.value=60;hg.gain.value=0.04;hum.start();ambientNodes.hum=hum;
    }else if(zone==='mn'){
      // Crystal resonance - ethereal pads
      [220,330,440,550].forEach((freq,i)=>{
        const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(masterGain);
        o.type='sine';o.frequency.value=freq;g.gain.value=0.02;
        o.start();ambientNodes['moon'+i]=o;
      });
    }
  }catch(e){}
}
// Patch setZone to start ambient
const ___origSetZone=setZone;
setZone=function(z){___origSetZone(z);try{playAmbient(z);}catch(e){}};

// ══════════════════════════════════════
// ENERGY SYSTEM
// ══════════════════════════════════════
const ENERGY_MAX=5;
let energyVal=5,energyLastRegen=Date.now();
function updateEnergy(){
  // regen 1 per 5 min
  const elapsed=Math.floor((Date.now()-energyLastRegen)/300000);
  if(elapsed>0){energyVal=Math.min(ENERGY_MAX,energyVal+elapsed);energyLastRegen=Date.now();}
  const pct=(energyVal/ENERGY_MAX)*100;
  const ef=$('energy-fill');if(ef)ef.style.width=pct+'%';
  const el=$('energy-label');if(el)el.textContent=`${energyVal}/${ENERGY_MAX} Energie`;
}
function spendEnergy(){
  if(energyVal<=0){toast('❌ Fără energie! Revino în 5 minute.');return false;}
  energyVal--;updateEnergy();return true;
}
// Patch doSwap to cost energy on first move of level
let levelStarted=false;
const ____doSwapOrig=doSwap;
doSwap=async function(r1,c1,r2,c2){
  if(!levelStarted){if(!spendEnergy())return;levelStarted=true;}
  await ____doSwapOrig(r1,c1,r2,c2);
};
const ____initGameOrig=initGame;
initGame=function(zk){____initGameOrig(zk);levelStarted=false;updateEnergy();};
setInterval(updateEnergy,60000);

// ══════════════════════════════════════
// STREAK SYSTEM
// ══════════════════════════════════════
let streakData={count:3,lastDate:new Date().toDateString(),days:['Mon','Tue','Wed']};
function renderStreak(){
  const today=new Date();const days=[];
  for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);days.push({label:d.toLocaleDateString('ro',{weekday:'short'}),done:i<streakData.count,today:i===0});}
  return `<div class="streak-banner">
    <span class="streak-fire">🔥</span>
    <div class="streak-info">
      <div><span class="streak-num">${streakData.count}</span> <span class="streak-lbl">zile consecutive</span></div>
      <div class="streak-calendar">${days.map(d=>`<div class="streak-day ${d.done?'done':''} ${d.today?'today':''}" title="${d.label}">${d.done?'✓':d.today?'·':''}</div>`).join('')}</div>
    </div>
  </div>`;
}

// Inject streak into hub-right daily card
const ___origRenderHub3=renderHub;
renderHub=function(){
  ___origRenderHub3();
  const dc=document.querySelector('.daily-card');
  if(dc&&!dc.querySelector('.streak-banner')){dc.insertAdjacentHTML('afterbegin',renderStreak());}
};

// ══════════════════════════════════════
// GARDEN WALL
// ══════════════════════════════════════
Object.assign(SM,{wall:'swall'});
const COMMUNITY_GARDENS=[
  {name:'Grădina Rozelor',av:'👩‍🌾',items:['🌹','🌸','🌷','🏮','⛲','🌼'],level:8,wins:42,likes:127,liked:false},
  {name:'Moon Paradise',av:'🐱',items:['🌙','💎','🌻','🔮','🌿','⭐'],level:12,wins:89,likes:234,liked:false},
  {name:'Candy Dream',av:'🦊',items:['🍬','🌸','🎀','🏡','🌺','🎠'],level:6,wins:31,likes:89,liked:false},
  {name:'Chocolate Forest',av:'🦔',items:['🌿','🍄','🌲','🌑','🪑','🗿'],level:15,wins:112,likes:356,liked:false},
  {name:'Spring Valley',av:'🐝',items:['🌸','🌼','🌷','🦋','🐝','⛲'],level:9,wins:55,likes:143,liked:false},
  {name:'Crystal Garden',av:'👑',items:['💎','🌙','✨','🔮','🌟','🗼'],level:18,wins:178,likes:512,liked:false},
  {name:'Grădina Mea',av:PLAYER.avatar||'🌸',items:PLAYER.gardenItems.slice(0,6).map(x=>x.e),level:PLAYER.level,wins:PLAYER.wins,likes:0,liked:false,isMe:true},
];
function renderWall(){
  const grid=$('wall-grid');if(!grid)return;grid.innerHTML='';
  // My card first
  const sorted=[COMMUNITY_GARDENS.find(g=>g.isMe)||COMMUNITY_GARDENS[0],...COMMUNITY_GARDENS.filter(g=>!g.isMe)];
  sorted.forEach((g,idx)=>{
    const d=document.createElement('div');d.className='wall-card';
    d.innerHTML=`<div class="wall-garden-preview">${(g.items.length?g.items:['🌸','🌿','⭐']).map(e=>`<span style="font-size:1.6rem">${e}</span>`).join('')}</div>
      <div class="wall-card-info">
        <div class="wall-card-name">${g.isMe?'✨ '+g.name:g.name} ${g.av}</div>
        <div class="wall-card-stats">Nivel ${g.level} · ${g.wins} victorii</div>
        <div class="wall-card-likes">
          <button class="like-btn ${g.liked?'liked':''}" onclick="likeGarden(${idx},this)">❤️ ${g.likes}</button>
          ${g.isMe?'<span style="font-size:.62rem;color:var(--accent);margin-left:auto">Tu</span>':''}
        </div>
      </div>`;
    grid.appendChild(d);
  });
}
function likeGarden(idx,btn){
  const g=COMMUNITY_GARDENS[idx];if(g.liked){return;}
  g.liked=true;g.likes++;btn.classList.add('liked');btn.textContent='❤️ '+g.likes;sfxClick();
}
const ___swWall=sw;
sw=function(m){___swWall(m);if(m==='wall')renderWall();};

// ══════════════════════════════════════
// GARDEN SCREENSHOT / SHARE
// ══════════════════════════════════════
function downloadGardenScreenshot(){
  const canvas=$('garden-canvas');if(!canvas){toast('❌ Canvas indisponibil');return;}
  // Draw player info overlay
  const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;
  const ctx=c.getContext('2d');ctx.drawImage(canvas,0,0);
  // Watermark
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,c.height-28,c.width,28);
  ctx.fillStyle='#fff';ctx.font='bold 11px sans-serif';ctx.textAlign='center';
  ctx.fillText('🌸 Garden Match Masters · '+(PLAYER.name||'Grădinarul'),c.width/2,c.height-10);
  const link=document.createElement('a');link.download='gradina-mea.png';link.href=c.toDataURL('image/png');link.click();
  toast('📸 Grădina salvată ca imagine!');sfxWin();
}
function generateProfileCard(){
  const el=document.createElement('div');el.className='profile-share-card';
  el.innerHTML=`<div class="psc-bg">${PLAYER.avatar||'🌸'}</div>
    <span class="psc-av">${PLAYER.avatar||'🌸'}</span>
    <div class="psc-name">${PLAYER.name||'Grădinarul'}</div>
    <div class="psc-level">Nivel ${PLAYER.level} · ${PLAYER.xp} XP</div>
    <div class="psc-stats">
      <div class="psc-stat"><div class="psc-stat-val">🏆 ${PLAYER.wins}</div><div class="psc-stat-lbl">Victorii</div></div>
      <div class="psc-stat"><div class="psc-stat-val">🔥 ${PLAYER.bestCombo||0}</div><div class="psc-stat-lbl">Best Combo</div></div>
      <div class="psc-stat"><div class="psc-stat-val">🐾 ${[...PLAYER.pets].length}</div><div class="psc-stat-lbl">Pets</div></div>
    </div>
    <div class="psc-pets">${[...PLAYER.pets].slice(0,5).map(id=>ALL_PETS.find(p=>p.id===id)?.e||'').join(' ')}</div>
    <div class="psc-footer">🌸 Garden Match Masters</div>`;
  return el;
}

// ══════════════════════════════════════
// TILE CASCADE WAVE
// ══════════════════════════════════════
// Patch animM to add wave effect
const ____animMOrig=animM;
animM=async function(m){
  // add cascade class with stagger
  m.forEach(({r,c},i)=>{setTimeout(()=>{const el=gT(r,c);if(el){el.classList.add('cascade');setTimeout(()=>el.classList.remove('cascade'),300);}},i*20);});
  return ____animMOrig(m);
};

// ══════════════════════════════════════
// TUTORIAL SYSTEM
// ══════════════════════════════════════
const TUT_STEPS=[
  {title:'Bun venit în Garden Match Masters! 🌸',desc:'Vei reconstrui o grădină magică rezolvând puzzle-uri match-3, duelând alți jucători și explorând camere secrete.',target:null,pos:'center'},
  {title:'Harta Grădinii 🗺️',desc:'Aceasta este harta ta. Click pe o zonă pentru a juca niveluri și a debloca zone noi. Începe cu Candy Greenhouse!',target:'#gmap',pos:'right'},
  {title:'Resurse 💰',desc:'Monedele, semințele și gemele sunt resursele tale. Le câștigi jucând și le cheltuiești în Shop pentru decoruri și animăluțe.',target:'.hub-resources',pos:'bottom'},
  {title:'Tablă Match-3 🎮',desc:'Dă click pe două piese adiacente pentru a le schimba. Fă 3+ de același tip pe rând sau coloană pentru un match!',target:'#mb',pos:'right'},
  {title:'Obiective 🎯',desc:'Fiecare nivel are obiective specifice. Colectează piese de anumite tipuri sau elimină toate dalele cu jeleu!',target:'#glist',pos:'right'},
  {title:'Unelte ⚡',desc:'Power-up-urile te ajută în momente dificile. Bomba elimină 3×3 tile-uri, curcubeul șterge tot un tip!',target:'#pugrid',pos:'right'},
  {title:'Animăluțe 🐾',desc:'Salvează animăluțe din niveluri și hrănește-le pentru a evolua! Fiecare are 3 stadii de evoluție.',target:'[data-m="pets"]',pos:'top'},
  {title:'Gata de joc! 🌸',desc:'Acum știi tot ce ai nevoie. Mult succes în reconstruirea grădinii tale magice! Joacă primul nivel pentru a câștiga animăluțul Sirop! 🐠',target:null,pos:'center'},
];
let tutStep=0,tutDone=false;
function startTutorial(){
  tutDone=false;tutStep=0;showTutStep(0);
}
function showTutStep(idx){
  if(idx>=TUT_STEPS.length){endTutorial();return;}
  const step=TUT_STEPS[idx];
  $('tut-step').textContent=`Pas ${idx+1}/${TUT_STEPS.length}`;
  $('tut-title').textContent=step.title;
  $('tut-desc').textContent=step.desc;
  $('tut-next-btn').textContent=idx===TUT_STEPS.length-1?'Să jucăm! 🌸':'Înainte →';
  // dots
  const dots=$('tut-dots');dots.innerHTML='';
  TUT_STEPS.forEach((_,i)=>{const d=document.createElement('div');d.className='tut-dot'+(i===idx?' on':'');dots.appendChild(d);});
  // highlight target
  const hl=$('tut-highlight'),tt=$('tut-tooltip');
  $('tut-overlay').classList.remove('hidden');hl.classList.remove('hidden');tt.classList.remove('hidden');
  if(step.target&&step.pos!=='center'){
    const el=document.querySelector(step.target);
    if(el){
      const rect=el.getBoundingClientRect();
      hl.style.top=(rect.top-6)+'px';hl.style.left=(rect.left-6)+'px';hl.style.width=(rect.width+12)+'px';hl.style.height=(rect.height+12)+'px';
      // position tooltip
      if(step.pos==='right'){tt.style.left=(rect.right+16)+'px';tt.style.top=rect.top+'px';}
      else if(step.pos==='bottom'){tt.style.top=(rect.bottom+16)+'px';tt.style.left=rect.left+'px';}
      else if(step.pos==='top'){tt.style.bottom=(window.innerHeight-rect.top+16)+'px';tt.style.left=rect.left+'px';tt.style.top='auto';}
    }else{centerTooltip(tt);}
  }else{
    hl.style.width='0';hl.style.height='0';hl.style.opacity='0';centerTooltip(tt);
  }
}
function centerTooltip(tt){tt.style.top='50%';tt.style.left='50%';tt.style.transform='translate(-50%,-50%)';}
function nextTutStep(){sfxClick();tutStep++;if(tutStep>=TUT_STEPS.length){endTutorial();}else{showTutStep(tutStep);}}
function skipTutorial(){endTutorial();}
function endTutorial(){
  tutDone=true;
  $('tut-overlay').classList.add('hidden');$('tut-highlight').classList.add('hidden');$('tut-tooltip').classList.add('hidden');
  $('tut-tooltip').style.transform='';$('tut-tooltip').style.top='';$('tut-tooltip').style.left='';
  toast('✅ Tutorial finalizat! Mult succes!');
  unlockAch('sounds');
}

// ══════════════════════════════════════
// KONAMI CODE + EASTER EGGS
// ══════════════════════════════════════
const KONAMI=[38,38,40,40,37,39,37,39,66,65];let konamiIdx=0;
document.addEventListener('keydown',e=>{
  if(e.keyCode===KONAMI[konamiIdx])konamiIdx++;else konamiIdx=0;
  if(konamiIdx===KONAMI.length){
    konamiIdx=0;activateKonami();
  }
});
function activateKonami(){
  const flash=document.createElement('div');flash.className='konami-flash';document.body.appendChild(flash);
  setTimeout(()=>flash.remove(),700);
  PLAYER.coins+=1000;PLAYER.gems+=10;
  burst(innerWidth/2,innerHeight/2);burst(innerWidth*.25,innerHeight*.5);burst(innerWidth*.75,innerHeight*.5);
  sfxWin();
  showM({emoji:'🎮',title:'KONAMI CODE! 🎮',sub:'↑↑↓↓←→←→BA — Cheat activat! +1000🪙 +10💎',rewards:[{c:'g',v:1000,l:'🪙 Monede'},{c:'m',v:10,l:'💎 Geme'}],btn1:'EPIC!',cb1:hideM});
  pushNotif({icon:'🎮',text:'Konami Code activat! Bonus secret deblocat!',type:'ach',dur:5000});
}
// Click logo 5x = surprise
let logoClicks=0;
document.querySelector('.hub-logo')?.addEventListener('click',()=>{
  logoClicks++;if(logoClicks>=5){logoClicks=0;activateKonami();}
});
// Shake device easter egg (mobile)
let shakeThreshold=15,lastShake=0;
if(window.DeviceMotionEvent){window.addEventListener('devicemotion',e=>{
  const acc=e.accelerationIncludingGravity;if(!acc)return;
  const total=Math.abs(acc.x||0)+Math.abs(acc.y||0)+Math.abs(acc.z||0);
  const now=Date.now();
  if(total>shakeThreshold&&now-lastShake>3000){lastShake=now;toast('📱 Shake detectat! +50🪙 bonus!');PLAYER.coins+=50;sfxCombo(3);}
});}

// ══════════════════════════════════════
// SMART TIPS (contextual)
// ══════════════════════════════════════
const TIPS=[
  '💡 Tip: Fă combouri verticale pentru a elimina mai rapid dalele cu jeleu!',
  '💡 Tip: Power-up-ul Curcubeu e cel mai puternic — salvează-l pentru situații dificile!',
  '💡 Tip: Animăluțele evoluează mai rapid dacă le hrănești zilnic!',
  '💡 Tip: În duel, boosterele se încarcă mai repede la combo-uri mari!',
  '💡 Tip: Escape rooms au coduri de 4 caractere — găsește toate indiciile!',
  '💡 Tip: Votează în Roadmap pentru a influența viitorul jocului!',
  '💡 Tip: Streak-ul zilnic îți aduce bonusuri speciale după 7 zile!',
  '💡 Tip: Grădina ta crește după fiecare victorie — verifică în Decor!',
];
let lastTipIdx=-1;
function showRandomTip(){
  let idx;do{idx=rnd(TIPS.length);}while(idx===lastTipIdx);
  lastTipIdx=idx;pushNotif({icon:'💡',text:TIPS[idx],type:'info',dur:4000});
}
setInterval(showRandomTip,90000); // every 90s

// ══════════════════════════════════════
// PROFILE CARD IN STATS
// ══════════════════════════════════════
const ____renderStatsOrig=renderStats;
renderStats=function(){
  ____renderStatsOrig();
  // Add share card + download button after stats
  const body=$('stats-body');if(!body)return;
  let shareSection=body.querySelector('.share-section');
  if(!shareSection){
    shareSection=document.createElement('div');shareSection.className='share-section';shareSection.style.marginTop='14px';
    body.appendChild(shareSection);
  }
  shareSection.innerHTML='';
  const card=generateProfileCard();shareSection.appendChild(card);
  const btn=document.createElement('button');btn.className='btn-daily';btn.style.marginTop='10px';btn.textContent='📸 Descarcă Card de Profil';
  btn.onclick=()=>{
    // Canvas render of profile card
    const c=document.createElement('canvas');c.width=400;c.height=280;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#1e1e38';ctx.fillRect(0,0,400,280);
    ctx.font='80px serif';ctx.textAlign='center';ctx.fillText(PLAYER.avatar||'🌸',200,100);
    ctx.fillStyle='#f0eeff';ctx.font='bold 28px Fredoka One, sans-serif';ctx.fillText(PLAYER.name||'Grădinarul',200,145);
    ctx.fillStyle='#8888bb';ctx.font='14px Nunito, sans-serif';ctx.fillText('Nivel '+PLAYER.level+' · '+PLAYER.xp+' XP',200,168);
    ctx.fillStyle='#ffd700';ctx.font='16px serif';ctx.fillText('🏆 '+PLAYER.wins+' Victorii  🔥 '+PLAYER.bestCombo+' Combo  🐾 '+[...PLAYER.pets].length+' Pets',200,200);
    ctx.fillStyle='rgba(255,133,194,.3)';ctx.font='48px serif';
    [...PLAYER.pets].slice(0,4).forEach((id,i)=>{const e=ALL_PETS.find(p=>p.id===id)?.e||'🐾';ctx.fillText(e,80+i*80,245);});
    ctx.fillStyle='rgba(255,255,255,.2)';ctx.font='11px sans-serif';ctx.fillText('🌸 Garden Match Masters',200,270);
    const link=document.createElement('a');link.download='profil-gradina.png';link.href=c.toDataURL();link.click();
    toast('📸 Card de profil salvat!');sfxWin();
  };
  shareSection.appendChild(btn);
};

// ══════════════════════════════════════
// AUTO-SHOW TUTORIAL on first profile save
// ══════════════════════════════════════
const ____origSaveProfile=saveProfile;
saveProfile=function(){
  ____origSaveProfile();
  if(!tutDone){setTimeout(startTutorial,800);}
};

// ══════════════════════════════════════
// AMBIENT on zone change + hub init
// ══════════════════════════════════════
setTimeout(()=>{
  try{playAmbient('gh');}catch(e){}
  updateEnergy();
},1000);

// ══════════════════════════════════════
// SW FINAL PATCH for wall
// ══════════════════════════════════════
const _____swFinal=sw;
sw=function(m){_____swFinal(m);if(m==='wall'){setTimeout(renderWall,50);}};
