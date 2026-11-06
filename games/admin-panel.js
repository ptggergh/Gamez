/* GAMEZ universal admin tools — local single-player controls only. */
(()=>{'use strict';if(window.__gamezAdminInstalled)return;window.__gamezAdminInstalled=true;
const css=document.createElement('style');css.textContent=`
#gzAdminOpen{position:fixed!important;right:12px!important;bottom:12px!important;z-index:2147483000!important;padding:10px 15px!important;border-radius:12px!important;border:1px solid #67f3e7!important;background:#10273bf0!important;color:#dffffb!important;font:800 12px system-ui!important;cursor:pointer!important;box-shadow:0 6px 25px #0008!important;pointer-events:auto!important}
#gzAdminOverlay{position:fixed!important;inset:0!important;z-index:2147483001!important;display:none;place-items:center;background:#040d19dc;backdrop-filter:blur(7px);font:600 14px system-ui;color:#eaffff;pointer-events:auto!important}
#gzAdminOverlay.gzVisible{display:grid!important}
#gzAdminBox{background:linear-gradient(145deg,#132f47,#0a192c);border:1px solid #5de7e3;border-radius:20px;padding:23px;width:min(94vw,540px);max-height:85vh;overflow:auto;box-shadow:0 20px 90px #000b}
#gzAdminBox h2{margin:0 0 7px;font-size:24px;color:#70f6ed}#gzAdminBox p{color:#b3cbd7;font-size:12px;line-height:1.5}
#gzAdminBox button,#gzAdminBox input{background:#20445b;color:white;border:1px solid #598a9b;border-radius:10px;padding:12px;font:700 13px system-ui;cursor:pointer}
#gzAdminBox input{width:100%;cursor:text}#gzAdminBox button:hover{background:#2d6a80}#gzAdminActions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:14px 0}#gzAdminActions button{min-height:54px}
#gzAdminBox .gzDanger{border-color:#ff8d86}#gzAdminStatus{min-height:20px;color:#a2f8cf;font-size:12px}#gzAdminClose{float:right}
`;document.head.appendChild(css);

const overlay=document.createElement('div');overlay.id='gzAdminOverlay';overlay.innerHTML=`<div id="gzAdminBox" role="dialog" aria-modal="true" aria-label="GAMEZ admin panel"><button id="gzAdminClose">✕ Close</button><h2>⚙ GAMEZ ADMIN</h2><p>Local game tools · Enter the access code to unlock</p><div id="gzAdminLock"><input id="gzAdminCode" type="password" autocomplete="off" placeholder="Enter admin code"><button id="gzAdminUnlock" style="margin-top:9px">🔓 Unlock tools</button></div><div id="gzAdminTools" hidden><div id="gzAdminActions"><button data-gz="fullscreen">⛶ Fullscreen</button><button data-gz="screenshot">📸 Screenshot</button><button data-gz="backup">💾 Backup saves</button><button data-gz="restore">📂 Restore saves</button><button data-gz="hide">👁 Hide game UI</button><button data-gz="reload">🔄 Restart game</button><button class="gzDanger" data-gz="clear">🗑 Reset saved progress</button><button data-gz="lock">🔒 Lock admin</button></div><p>Backup/restore works with localStorage saves on this game's origin. Restart reloads the game. Reset permanently clears this game's saved data after confirmation.</p><input type="file" id="gzAdminFile" accept="application/json,.json" hidden></div><div id="gzAdminStatus" role="status"></div></div>`;
document.body.append(overlay);
let unlocked=false,uiHidden=false;
const $=s=>overlay.querySelector(s),status=t=>{$('#gzAdminStatus').textContent=t};
function show(){overlay.classList.add('gzVisible');$('#gzAdminLock').hidden=unlocked;$('#gzAdminTools').hidden=!unlocked;status('');}
function close(){overlay.classList.remove('gzVisible')}
$('#gzAdminClose').onclick=close;
$('#gzAdminUnlock').onclick=()=>{if($('#gzAdminCode').value==='99901'){unlocked=true;$('#gzAdminLock').hidden=true;$('#gzAdminTools').hidden=false;$('#gzAdminCode').value='';status('Admin tools unlocked.')}else status('Incorrect code.')};
$('#gzAdminCode').onkeydown=e=>{if(e.key==='Enter')$('#gzAdminUnlock').click()};
document.addEventListener('keydown',e=>{if(e.code==='Backquote'){e.preventDefault();e.stopImmediatePropagation();overlay.classList.contains('gzVisible')?close():show()}else if(e.code==='Escape'&&overlay.classList.contains('gzVisible')){e.stopImmediatePropagation();close()}},true);
function saves(){const result={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);result[k]=localStorage.getItem(k)}}catch{}return result}
function download(name,blob){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('#gzAdminActions').onclick=async e=>{const b=e.target.closest('button[data-gz]');if(!b||!unlocked)return;const a=b.dataset.gz;
try{
if(a==='fullscreen'){if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();status('Fullscreen updated.')}
if(a==='screenshot'){const c=[...document.querySelectorAll('canvas')].filter(x=>x.width>300&&x.height>200).sort((a,b)=>b.width*b.height-a.width*a.height)[0];if(!c){status('No game canvas available.');return}c.toBlob(blob=>blob?download('gamez-screenshot.png',blob):status('Screenshot unavailable (cross-origin content).'))}
if(a==='backup'){download('gamez-save-backup.json',new Blob([JSON.stringify({game:location.pathname,date:new Date().toISOString(),saves:saves()},null,2)],{type:'application/json'}));status('Save backup downloaded.')}
if(a==='restore')$('#gzAdminFile').click();
if(a==='hide'){uiHidden=!uiHidden;[...document.body.children].filter(el=>el!==overlay&&el.tagName!=='CANVAS'&&el.tagName!=='SCRIPT'&&el.tagName!=='STYLE').forEach(el=>{if(uiHidden){el.dataset.gzOldVisibility=el.style.visibility;el.style.visibility='hidden'}else if('gzOldVisibility'in el.dataset){el.style.visibility=el.dataset.gzOldVisibility;delete el.dataset.gzOldVisibility}});status(uiHidden?'Game interface hidden. Click again to restore.':'Game interface restored.')}
if(a==='reload')location.reload();
if(a==='clear'){if(confirm('Permanently delete all saved progress for this game origin? Make a backup first.')){localStorage.clear();status('Local saves cleared. Restart to begin again.')}}
if(a==='lock'){unlocked=false;$('#gzAdminTools').hidden=true;$('#gzAdminLock').hidden=false;status('Admin locked.')}
}catch(err){status('Action unavailable: '+err.message)}
};
$('#gzAdminFile').onchange=async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(data.game!==location.pathname||!data.saves||typeof data.saves!=='object')throw Error('Backup does not match this game.');if(!confirm('Restore this backup? Existing matching saves will be overwritten.'))return;for(const [k,v]of Object.entries(data.saves))if(typeof v==='string')localStorage.setItem(k,v);status('Saves restored. Restart the game to load them.')}catch(err){status('Restore failed: '+err.message)}e.target.value=''};
})();
