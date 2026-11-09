/* SWAFL setup wizard with the End User Licence Agreement: shown before first use (and again whenever the agreement version changes). */
(function(){
'use strict';
var VER="1.0", KEY='swafl.eula.accepted', DATE="9 November 2026";
var SECTIONS=[["1. Acceptance of this agreement", ["This End User Licence Agreement (the \"Agreement\") is a legal agreement between you (an individual or a single organisation, \"you\") and Naziru Halilu (the \"Author\") for the SWAFL soil-water and irrigation decision-support software, version 1.1.0 and later, including its desktop application, web application, simulation engines, data files, documentation and any updates (together, the \"Software\").", "By installing the Software, by starting it for the first time, or by clicking \"I Accept\", you confirm that you have read this Agreement, that you understand it and that you agree to be bound by it. If you do not agree, click \"I Decline\", do not install the Software, and do not use it."]], ["2. Licence and relationship to the open-source licence", ["The source code of the Software is published under the MIT Licence (see the file LICENSE). Nothing in this Agreement removes or reduces any right the MIT Licence gives you over that source code.", "For the compiled application, installers, hosted web application and bundled data, the Author grants you a free, non-exclusive, non-transferable, worldwide licence to install and use the Software for research, teaching, learning, professional and personal purposes, including commercial advisory work, on any number of your own devices, subject to this Agreement.", "Third-party components bundled with or used by the Software (for example the Daisy agro-ecosystem model, Leaflet, GeoTIFF and charting libraries) remain under their own licences, which apply to those components."]], ["3. What you may and may not do", ["You may: run the Software; create, save and share your own projects, results, figures and reports; and cite or discuss results produced with the Software.", "You may not: remove or alter copyright, author or licence notices; present the Software or its models as your own work; use the Software for any unlawful purpose; attempt to disrupt the third-party services that the Software contacts; or use the name or logos of the Author, SUSTAGRI, the universities or any funder to suggest endorsement of your work or products without written permission."]], ["4. Decision-support only: no professional advice", ["SWAFL is a simulation and decision-support tool. Its results are model estimates that depend on the inputs, soil and crop parameters, weather data and assumptions you provide, and on the limits of the underlying models.", "The Software does not give agronomic, engineering, hydrological, environmental, legal or financial advice. Irrigation, drainage, mulching, design and management decisions, and any decision on safety, regulation or investment, remain your own responsibility. You must check results against field measurements, local conditions, applicable standards and the judgement of a qualified professional before you act on them."]], ["5. Data, privacy and internet features", ["The Software runs on your device. It has no user accounts and does not send usage statistics or telemetry. Your projects, inputs and results are stored on your device (or in your browser) and are not uploaded by the Software.", "Some features contact third-party services only when you use them: weather and geocoding (Open-Meteo), place search (OpenStreetMap Nominatim), map imagery (for example Esri) and satellite data (Microsoft Planetary Computer), and downloads of components from GitHub. These requests can include coordinates, place names or dates that you enter and your IP address, and are governed by those providers' own terms and privacy policies. If you do not want these requests, do not use those features."]], ["6. Intellectual property and citation", ["The Author keeps all rights in the Software that this Agreement does not expressly give you. Your own data, projects and results belong to you.", "If you publish work that uses the Software, please cite it as: Halilu, N. (2026). SWAFL: soil-water and irrigation decision-support suite, version 1.1.0, and the associated publications and Zenodo records listed at https://halilunaziru73-creator.github.io/."]], ["7. Updates and support", ["The Software may be updated, changed or discontinued at any time. The Author has no obligation to provide updates, maintenance or support. Questions and bug reports are welcome but are answered on a best-effort basis."]], ["8. Disclaimer of warranty", ["TO THE FULLEST EXTENT PERMITTED BY LAW, THE SOFTWARE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, NON-INFRINGEMENT, OR THAT THE SOFTWARE WILL BE ERROR-FREE, UNINTERRUPTED OR SUITABLE FOR YOUR FIELD, CROP OR DESIGN."]], ["9. Limitation of liability", ["TO THE FULLEST EXTENT PERMITTED BY LAW, THE AUTHOR AND CONTRIBUTORS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR FOR LOSS OF CROP, YIELD, WATER, PROFIT, DATA OR BUSINESS, ARISING FROM THE USE OF, OR INABILITY TO USE, THE SOFTWARE OR ITS RESULTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. WHERE LIABILITY CANNOT BE EXCLUDED, IT IS LIMITED TO THE AMOUNT YOU PAID FOR THE SOFTWARE, WHICH IS ZERO IF YOU OBTAINED IT FREE OF CHARGE.", "Nothing in this Agreement limits liability that cannot be limited by law, or any rights you have as a consumer under mandatory law."]], ["10. Termination", ["This Agreement applies until it is terminated. It ends automatically if you breach it. You can end it at any time by uninstalling and deleting all copies of the Software. Sections 4, 6, 8, 9 and 11 continue after termination."]], ["11. General terms", ["This Agreement is governed by the laws of Greece, where the Author is based, without regard to conflict-of-law rules, and subject to any mandatory consumer-protection law of your country of residence. If any part of this Agreement is found unenforceable, the rest stays in force. This Agreement, together with the MIT Licence for the source code, is the entire agreement about the Software. The Author may publish a new version of this Agreement with a new release; you will be asked to accept it before you continue using that release."]], ["12. Contact", ["Naziru Halilu · halilunaziru73@gmail.com · https://halilunaziru73-creator.github.io/ · https://github.com/halilunaziru73-creator"]]];
function get(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){return window.__eulaMem||null}}
function set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){window.__eulaMem=v}}
function ok(){var a=get();return a&&a.v===VER}
var STEPS=['Welcome','Licence agreement','Privacy and online features','Ready'];
var css='#eula{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(14,28,20,.82);font:14px/1.55 "Segoe UI",Arial,sans-serif;color:#1A2318;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}'+
'#eula .ep{background:#fff;width:min(840px,94vw);height:min(86vh,680px);border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);display:flex;flex-direction:column;overflow:hidden}'+
'#eula .eh{flex:none;padding:16px 24px 14px;background:#14532D;color:#fff;border-bottom:4px solid #D4A94A}'+
'#eula .eh b{font-size:19px;letter-spacing:.2px}#eula .eh span{display:block;font-size:12px;opacity:.85;margin-top:2px}'+
'#eula .est{flex:none;display:flex;gap:6px;padding:12px 24px;background:#F4F8F5;border-bottom:1px solid #E3E3E3;font-size:12px;color:#6B6B6B;flex-wrap:wrap}'+
'#eula .est i{font-style:normal;padding:3px 10px;border-radius:12px;background:#E3EBE5}#eula .est i.on{background:#14532D;color:#fff;font-weight:600}#eula .est i.dn{background:#D4A94A;color:#2A1B05}'+
'#eula .eb{flex:1;overflow:auto;padding:18px 26px;background:#FCFCFA}'+
'#eula h3{margin:0 0 8px;font-size:18px;color:#14532D}#eula h4{margin:16px 0 4px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;color:#14532D}'+
'#eula h4:first-child{margin-top:0}#eula p{margin:0 0 8px;text-align:left}#eula ul{margin:0 0 8px;padding-left:20px}#eula li{margin:3px 0}'+
'#eula .ef{flex:none;padding:12px 24px 16px;border-top:1px solid #E3E3E3;background:#fff}'+
'#eula label{display:flex;gap:9px;align-items:flex-start;font-size:13px;cursor:pointer;margin-bottom:5px}'+
'#eula .er{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap}'+
'#eula .eh2{font-size:11.5px;color:#6B6B6B;flex:1}'+
'#eula button{font:inherit;font-weight:600;border-radius:8px;padding:9px 22px;cursor:pointer;border:1px solid #14532D;background:#fff;color:#14532D;margin-left:8px}'+
'#eula button.ea{background:#14532D;color:#fff}#eula button:disabled{opacity:.4;cursor:not-allowed}#eula button.ec{border-color:#C9C9C9;color:#6B6B6B}';
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
var P={
0:'<h3>Welcome to SWAFL setup</h3><p>SWAFL (Soil Water, Atmosphere, Feedback and Layout workbench) is a soil-water and irrigation decision-support suite: coupled water fluxes, precision irrigation, mulching, drainage and drip, surface and sprinkler design, with a Daisy agro-ecosystem workbench.</p><p>This short setup takes four steps:</p><ul><li><b>Welcome</b> (this page)</li><li><b>Licence agreement</b>: you read and accept the End User Licence Agreement</li><li><b>Privacy and online features</b>: what stays on your device and what is sent to online services</li><li><b>Ready</b>: you start SWAFL</li></ul><p>Click <b>Next</b> to continue, or <b>Cancel</b> to leave.</p>',
2:'<h3>Privacy and online features</h3><p>SWAFL runs on your own device.</p><ul><li>There are <b>no user accounts</b> and <b>no usage statistics</b> (no telemetry).</li><li>Your projects, inputs and results stay on your device or in your browser. The Software does not upload them.</li></ul><p>Some features contact other services <b>only when you use them</b>:</p><ul><li><b>Weather and place names</b>: Open-Meteo and OpenStreetMap Nominatim</li><li><b>Map imagery</b>: for example Esri</li><li><b>Satellite data</b>: Microsoft Planetary Computer</li><li><b>Downloads of components</b>: GitHub</li></ul><p>These requests can include coordinates, place names or dates you enter, and your IP address, and are governed by those providers\u2019 terms. If you do not want them, do not use those features. You can read the full text again in Help, About SWAFL.</p>'
};
function show(force){
 if(!force&&ok())return;
 if(document.getElementById('eula'))return;
 var st=document.createElement('style');st.id='eula-css';st.textContent=css;document.head.appendChild(st);
 var d=document.createElement('div');d.id='eula';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','SWAFL setup');
 document.body.appendChild(d);document.documentElement.style.overflow='hidden';
 var step=0,read=false,agree=false;
 function close(){d.remove();st.remove();document.documentElement.style.overflow=''}
 function decline(){
  if(window.swafl&&window.swafl.quit){window.swafl.quit();return}
  d.innerHTML='<div class="ep" style="height:auto;max-width:520px"><div class="eh"><b>Setup cancelled</b></div><div class="eb"><p>You need to accept the End User Licence Agreement to use SWAFL. You can close this tab, or start the setup again.</p></div><div class="ef"><div class="er"><span></span><button class="ea" id="eula-back">Start setup again</button></div></div></div>';
  d.querySelector('#eula-back').addEventListener('click',function(){close();show(true)});
 }
 function render(){
  var h='<div class="ep"><div class="eh"><b>SWAFL Setup</b><span>Version 1.1.0 \u00b7 Agreement version '+VER+' \u00b7 '+DATE+'</span></div><div class="est">';
  STEPS.forEach(function(n,i){h+='<i class="'+(i===step?'on':(i<step?'dn':''))+'">'+(i<step?'\u2713 ':(i+1)+'. ')+n+'</i>'});
  h+='</div><div class="eb" tabindex="0">';
  if(step===1){h+='<h3>Licence agreement</h3><p>Please read the agreement to the end. You can then accept it to continue.</p>';SECTIONS.forEach(function(s){h+='<h4>'+esc(s[0])+'</h4>';s[1].forEach(function(p){h+='<p>'+esc(p)+'</p>'})})}
  else if(step===3){h+='<h3>Ready to start</h3><p>You accepted the End User Licence Agreement (version '+VER+').</p><ul><li>SWAFL will open now with the Welcome screen.</li><li>The agreement is not shown again, until a new version of it comes with a release.</li><li>You can read it again at any time in <b>Help \u2192 About SWAFL \u2192 End User Licence Agreement</b>.</li></ul><p>Click <b>Start SWAFL</b> to finish.</p>'}
  else h+=P[step];
  h+='</div><div class="ef">';
  if(step===1)h+='<label><input type="radio" name="eula-r" id="eula-acc" disabled> <span>I accept the terms of the agreement</span></label><label><input type="radio" name="eula-r" id="eula-rej"> <span>I do not accept the terms of the agreement</span></label>';
  h+='<div class="er"><span class="eh2" id="eula-hint">'+(step===1&&!read?'Scroll to the end of the agreement to enable \u201cI accept\u201d.':'')+'</span><span><button class="ec" id="eula-cancel">Cancel</button>'+(step>0&&step<3?'<button id="eula-prev">\u2039 Back</button>':'')+(step<3?'<button class="ea" id="eula-next">Next \u203a</button>':'<button class="ea" id="eula-go">Start SWAFL</button>')+'</span></div></div></div>';
  d.innerHTML=h;
  var body=d.querySelector('.eb'),nx=d.querySelector('#eula-next'),hint=d.querySelector('#eula-hint');
  d.querySelector('#eula-cancel').addEventListener('click',decline);
  var pv=d.querySelector('#eula-prev');if(pv)pv.addEventListener('click',function(){step--;render()});
  if(nx)nx.addEventListener('click',function(){step++;render()});
  var go=d.querySelector('#eula-go');if(go)go.addEventListener('click',function(){set({v:VER,t:new Date().toISOString()});close();try{window.dispatchEvent(new Event('swafl-eula-accepted'))}catch(e){}});
  if(step===1){
   var acc=d.querySelector('#eula-acc'),rej=d.querySelector('#eula-rej');
   function sync(){acc.disabled=!read;if(read&&hint.textContent)hint.textContent='';nx.disabled=!(read&&agree)}
   function atEnd(){if(body.scrollTop+body.clientHeight>=body.scrollHeight-8){read=true;sync()}}
   body.addEventListener('scroll',atEnd);setTimeout(atEnd,50);
   acc.checked=agree&&read;rej.checked=!agree&&rej.dataset.x==='1';
   acc.addEventListener('change',function(){agree=acc.checked;sync()});
   rej.addEventListener('change',function(){agree=false;sync()});
   sync();
  }
  setTimeout(function(){body.focus()},60);
 }
 render();
}
window.swaflEula={show:function(){show(true)},accepted:ok};
function boot(){if(document.body)show(false);else document.addEventListener('DOMContentLoaded',function(){show(false)})}
boot();
})();
