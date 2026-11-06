'use strict';
/* SkillConnect: static front-end app. Data is kept in the browser (localStorage) so it works on GitHub Pages. */
const K='skillconnect_db_v1',U='skillconnect_uid',$=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nm=s=>String(s).trim().toLowerCase(),uid=()=>Math.random().toString(36).slice(2,9);
const hs=s=>btoa(unescape(encodeURIComponent(s)));
const GROUPS=[['web development','html','css','javascript','react','frontend'],['python','machine learning','data science'],['java','spring boot'],['graphic design','photoshop','canva','figma'],['video editing','premiere','capcut']];
const rel=(a,b)=>nm(a)===nm(b)||GROUPS.some(g=>g.includes(nm(a))&&g.includes(nm(b)));
const LV=['Beginner','Intermediate','Advanced'];
function seed(){
 const u=(name,email,dept,sem,bio,t,l)=>({id:uid(),name,email,pw:hs('demo123'),role:'student',dept,sem,bio,teach:t.map(x=>({name:x,level:'Intermediate'})),learn:l});
 return{users:[{id:'admin',name:'Admin',email:'admin@skillconnect.com',pw:hs('admin123'),role:'admin',dept:'',sem:'',bio:'',teach:[],learn:[]},
 u('Rahul Sharma','rahul@demo.com','CSE',5,'Backend and Java fan.',['Java'],['Python']),
 u('Priya Verma','priya@demo.com','CSE',5,'Data and Python.',['Python'],['Java']),
 u('Aman Singh','aman@demo.com','IT',3,'Design and video.',['Graphic Design','Video Editing'],['Web Development']),
 u('Neha Patel','neha@demo.com','CSE',4,'Frontend developer.',['React','CSS'],['Public Speaking'])],
 reqs:[],sess:[],revs:[],msgs:[]};}
let db=JSON.parse(localStorage.getItem(K)||'null')||seed();
const save=()=>localStorage.setItem(K,JSON.stringify(db));save();
const me=()=>db.users.find(u=>u.id===localStorage.getItem(U));
const user=id=>db.users.find(u=>u.id===id)||{name:'(deleted)',teach:[],learn:[]};
function toast(t){const e=$('#toast');e.textContent=t;e.className='show';setTimeout(()=>e.className='',2200)}
const chips=(a,c='')=>a.length?a.map(x=>`<span class="chip ${c}">${esc(x)}</span>`).join(''):'<span class="mut">none yet</span>';
/* Matching engine: compares teach/learn lists in both directions */
function match(a,b){
 const get=a.learn.filter(l=>b.teach.some(t=>rel(t.name,l)));
 const give=b.learn.filter(l=>a.teach.some(t=>rel(t.name,l)));
 const two=get.length&&give.length;
 const score=two?Math.min(100,70+(get.length+give.length)*5):(get.length||give.length)?Math.min(60,20+(get.length+give.length)*15):0;
 return{get,give,score,two};}
const matches=u=>db.users.filter(o=>o.id!==u.id&&o.role!=='admin').map(o=>({o,...match(u,o)})).filter(m=>m.score).sort((x,y)=>y.score-x.score);
/* Auth */
function register(e){e.preventDefault();const f=e.target,em=nm(f.email.value);
 if(db.users.some(u=>nm(u.email)===em))return toast('That email is already registered. Log in instead.');
 if(f.pw.value.length<6)return toast('Use a password with at least 6 characters.');
 const u={id:uid(),name:f.name.value.trim(),email:em,pw:hs(f.pw.value),role:'student',dept:f.dept.value,sem:f.sem.value,bio:'',teach:[],learn:[]};
 db.users.push(u);save();localStorage.setItem(U,u.id);location.hash='#/profile';toast('Account created. Add your skills.')}
function login(e){e.preventDefault();const f=e.target;
 const u=db.users.find(x=>nm(x.email)===nm(f.email.value)&&x.pw===hs(f.pw.value));
 if(!u)return toast('Email or password is incorrect.');
 localStorage.setItem(U,u.id);location.hash=u.role==='admin'?'#/admin':'#/dashboard'}
function logout(){localStorage.removeItem(U);location.hash='#/'}
/* Profile and skills */
function saveProfile(e){e.preventDefault();const u=me(),f=e.target;Object.assign(u,{name:f.name.value.trim(),dept:f.dept.value,sem:f.sem.value,bio:f.bio.value});save();toast('Profile saved')}
function addTeach(e){e.preventDefault();const f=e.target,s=f.skill.value.trim();if(!s)return;const u=me();
 if(!u.teach.some(t=>nm(t.name)===nm(s)))u.teach.push({name:s,level:f.level.value});save();render()}
function addLearn(e){e.preventDefault();const s=e.target.skill.value.trim(),u=me();if(s&&!u.learn.some(l=>nm(l)===nm(s)))u.learn.push(s);save();render()}
const delSkill=(k,i)=>{me()[k].splice(i,1);save();render()};
/* Requests */
function sendReq(to,get,give){const u=me();
 if(db.reqs.some(r=>r.from===u.id&&r.to===to&&r.status==='pending'))return toast('You already have a pending request to this student.');
 db.reqs.push({id:uid(),from:u.id,to,get,give,status:'pending',at:Date.now()});save();toast('Request sent');render()}
const setReq=(id,s)=>{db.reqs.find(r=>r.id===id).status=s;save();render()};
function schedule(rid){const d=$('#d_'+rid).value,t=$('#t_'+rid).value,l=$('#l_'+rid).value;
 if(!d||!t)return toast('Pick a date and time.');db.sess.push({id:uid(),req:rid,date:d,time:t,where:l,status:'scheduled'});save();toast('Session scheduled');render()}
const doneSess=id=>{db.sess.find(s=>s.id===id).status='done';save();render()};
function rate(sid,to){const st=+$('#st_'+sid).value,tx=$('#tx_'+sid).value;db.revs.push({id:uid(),sess:sid,from:me().id,to,stars:st,text:tx});save();toast('Thanks for your feedback');render()}
const avg=id=>{const r=db.revs.filter(x=>x.to===id);return r.length?(r.reduce((a,b)=>a+b.stars,0)/r.length).toFixed(1)+' ★ ('+r.length+')':'No ratings'};
function send(e,pid){e.preventDefault();const t=e.target.t.value.trim();if(!t)return;db.msgs.push({id:uid(),from:me().id,to:pid,t,at:Date.now()});save();render();const c=$('.chat');if(c)c.scrollTop=1e6}
function adminDel(id){if(confirm('Delete this user and their requests?')){db.users=db.users.filter(u=>u.id!==id);db.reqs=db.reqs.filter(r=>r.from!==id&&r.to!==id);save();render()}}
/* Views */
const opt=(a,v)=>a.map(x=>`<option ${x==v?'selected':''}>${x}</option>`).join('');
const DEPT=['CSE','IT','ECE','EE','ME','CE','Other'];
const authForm=reg=>`<form class="box" onsubmit="${reg?'register':'login'}(event)"><h2>${reg?'Create your account':'Log in'}</h2>
${reg?`<label>Full name</label><input name="name" required><div class="row"><div><label>Department</label><select name="dept">${opt(DEPT)}</select></div><div><label>Semester</label><select name="sem">${opt([1,2,3,4,5,6,7,8])}</select></div></div>`:''}
<label>Email</label><input name="email" type="email" required><label>Password</label><input name="pw" type="password" required>
<button>${reg?'Create account':'Log in'}</button>${reg?'':'<p class="mut">Demo: rahul@demo.com / demo123. Admin: admin@skillconnect.com / admin123</p>'}</form>`;
const V={
home:()=>`<section class="hero"><h1>I can teach you what I know. You can teach me what I want to learn.</h1>
<p>SkillConnect is a notice board for student skills that also finds your learning partner. List what you can teach, list what you want to learn, and get matched.</p>
<a class="btn" href="#/register">Create account</a> <a class="btn alt" href="#/login">Log in</a>
<div class="swap"><div class="card"><b>Rahul</b><br>Teaches Java<br>Wants Python</div><b>⇄</b><div class="card"><b>Priya</b><br>Teaches Python<br>Wants Java</div></div></section>
<h2>How it works</h2><div class="grid">${['Register|Create a student account.','Profile|Add skills you teach and skills you want.','Match|See students whose lists fit yours both ways.','Request|Send an exchange request.','Session|Schedule, chat, learn and rate.'].map((s,i)=>`<div class="card"><h3>${i+1}. ${s.split('|')[0]}</h3><p class="mut">${s.split('|')[1]}</p></div>`).join('')}</div>`,
login:()=>authForm(0),register:()=>authForm(1),
dashboard:u=>{const m=matches(u);return`<h2>Your matches</h2>${!u.teach.length||!u.learn.length?'<p class="card">Add at least one skill to teach and one to learn in <a href="#/profile">your profile</a> to get matches.</p>':''}
<div class="grid">${m.map(x=>`<div class="card"><span class="badge ${x.two?'':'one'}">${x.score}% ${x.two?'two-way':'one-way'}</span><h3>${esc(x.o.name)}</h3><p class="mut">${esc(x.o.dept)} · Sem ${esc(x.o.sem)} · ${avg(x.o.id)}</p>
<p>They can teach you:<br>${chips(x.get)}</p><p>You can teach them:<br>${chips(x.give,'w')}</p>
<button onclick="sendReq('${x.o.id}','${esc(x.get.join(', '))}','${esc(x.give.join(', '))}')">Request exchange</button></div>`).join('')||(u.teach.length&&u.learn.length?'<p class="mut">No matches yet. Try searching by skill.</p>':'')}</div>`},
profile:u=>`<h2>Your profile</h2><form class="box" onsubmit="saveProfile(event)"><label>Name</label><input name="name" value="${esc(u.name)}" required>
<div class="row"><div><label>Department</label><select name="dept">${opt(DEPT,u.dept)}</select></div><div><label>Semester</label><select name="sem">${opt([1,2,3,4,5,6,7,8],u.sem)}</select></div></div>
<label>Bio</label><textarea name="bio" rows="3">${esc(u.bio)}</textarea><button>Save profile</button></form>
<h2>Skills I can teach</h2><p>${u.teach.map((t,i)=>`<span class="chip">${esc(t.name)} (${t.level}) <button onclick="delSkill('teach',${i})" aria-label="Remove">×</button></span>`).join('')||'<span class="mut">none yet</span>'}</p>
<form class="row" onsubmit="addTeach(event)"><input name="skill" placeholder="e.g. Java" required><select name="level">${opt(LV,'Intermediate')}</select><button>Add skill</button></form>
<h2>Skills I want to learn</h2><p>${u.learn.map((t,i)=>`<span class="chip w">${esc(t)} <button onclick="delSkill('learn',${i})" aria-label="Remove">×</button></span>`).join('')||'<span class="mut">none yet</span>'}</p>
<form class="row" onsubmit="addLearn(event)"><input name="skill" placeholder="e.g. Python" required><button>Add skill</button></form>`,
search:u=>{const q=nm(window.sq||'');const r=db.users.filter(o=>o.id!==u.id&&o.role!=='admin'&&(!q||o.teach.some(t=>nm(t.name).includes(q))||o.learn.some(l=>nm(l).includes(q))));
 return`<h2>Search students by skill</h2><input id="q" placeholder="Type a skill, e.g. Python" value="${esc(window.sq||'')}" oninput="window.sq=this.value;render('q')"><div class="grid">${r.map(o=>`<div class="card"><h3>${esc(o.name)}</h3><p class="mut">${esc(o.dept)} · Sem ${esc(o.sem)} · ${avg(o.id)}</p><p>${esc(o.bio)}</p><p>Teaches: ${chips(o.teach.map(t=>t.name))}</p><p>Wants: ${chips(o.learn,'w')}</p>
 <button class="alt" onclick="sendReq('${o.id}','${esc(o.teach.map(t=>t.name).join(', '))}','${esc(u.teach.map(t=>t.name).join(', '))}')">Request exchange</button></div>`).join('')||'<p class="mut">No students found for that skill.</p>'}</div>`},
requests:u=>{const L=db.reqs.filter(r=>r.from===u.id||r.to===u.id).sort((a,b)=>b.at-a.at);
 return`<h2>Exchange requests</h2>${L.map(r=>{const inc=r.to===u.id,o=user(inc?r.from:r.to),s=db.sess.find(x=>x.req===r.id);
 return`<div class="card" style="margin-bottom:1rem"><span class="badge ${r.status==='pending'?'one':''}">${r.status}</span><h3>${inc?'From':'To'} ${esc(o.name)}</h3>
 <p class="mut">${inc?'Wants to learn: '+esc(r.give||'any of your skills'):'You offered: '+esc(r.give||'your skills')} · ${inc?'Can teach you: '+esc(r.get||'-'):'Can learn: '+esc(r.get||'-')}</p>
 ${inc&&r.status==='pending'?`<button onclick="setReq('${r.id}','accepted')">Accept</button> <button class="bad" onclick="setReq('${r.id}','rejected')">Reject</button>`:''}
 ${r.status==='accepted'?`<a class="btn alt" href="#/chat/${o.id}">Chat</a>
 ${s?`<p>Session: ${esc(s.date)} at ${esc(s.time)} ${esc(s.where)}</p>`:`<div class="row" style="margin-top:.6rem"><input type="date" id="d_${r.id}"><input type="time" id="t_${r.id}"><input id="l_${r.id}" placeholder="Where or meeting link"><button onclick="schedule('${r.id}')">Schedule</button></div>`}`:''}</div>`}).join('')||'<p class="mut">No requests yet. Find a match on your <a href="#/dashboard">dashboard</a>.</p>'}`},
sessions:u=>{const L=db.sess.filter(s=>{const r=db.reqs.find(x=>x.id===s.req);return r&&(r.from===u.id||r.to===u.id)});
 return`<h2>Learning sessions</h2>${L.map(s=>{const r=db.reqs.find(x=>x.id===s.req),o=user(r.from===u.id?r.to:r.from),rv=db.revs.find(x=>x.sess===s.id&&x.from===u.id);
 return`<div class="card" style="margin-bottom:1rem"><span class="badge ${s.status==='done'?'':'one'}">${s.status}</span><h3>With ${esc(o.name)}</h3><p>${esc(s.date)} at ${esc(s.time)} ${esc(s.where)}</p>
 ${s.status==='scheduled'?`<button onclick="doneSess('${s.id}')">Mark as completed</button>`:rv?`<p>Your rating: ${'★'.repeat(rv.stars)} ${esc(rv.text)}</p>`:`<div class="row"><select id="st_${s.id}">${[5,4,3,2,1].map(n=>`<option>${n}</option>`).join('')}</select><input id="tx_${s.id}" placeholder="Short comment"><button onclick="rate('${s.id}','${o.id}')">Submit rating</button></div>`}</div>`}).join('')||'<p class="mut">No sessions yet. Accept a request, then schedule one.</p>'}`},
chat:(u,pid)=>{const ok=db.reqs.filter(r=>r.status==='accepted'&&(r.from===u.id||r.to===u.id)).map(r=>r.from===u.id?r.to:r.from);
 if(!pid)return`<h2>Chat</h2>${ok.map(i=>`<p><a class="btn alt" href="#/chat/${i}">${esc(user(i).name)}</a></p>`).join('')||'<p class="mut">Chat opens after an exchange request is accepted.</p>'}`;
 if(!ok.includes(pid))return'<p class="card">You can chat once a request between you is accepted.</p>';
 const M=db.msgs.filter(m=>(m.from===u.id&&m.to===pid)||(m.from===pid&&m.to===u.id)).sort((a,b)=>a.at-b.at);
 return`<h2>Chat with ${esc(user(pid).name)}</h2><div class="chat">${M.map(m=>`<div class="msg ${m.from===u.id?'me':''}">${esc(m.t)}</div>`).join('')||'<span class="mut">Say hello.</span>'}</div>
 <form class="row" style="margin-top:.6rem" onsubmit="send(event,'${pid}')"><input name="t" placeholder="Type a message" autocomplete="off"><button style="flex:0 0 auto;height:2.6rem">Send</button></form><p class="mut">Messages are stored in this browser only.</p>`},
admin:u=>{if(u.role!=='admin')return'<p class="card">Admins only.</p>';const S=db.users.filter(x=>x.role!=='admin'),sk={};S.forEach(x=>x.teach.forEach(t=>sk[t.name]=(sk[t.name]||0)+1));
 return`<h2>Admin panel</h2><div class="stats"><div class="card"><b>${S.length}</b><br>Students</div><div class="card"><b>${db.reqs.length}</b><br>Requests</div><div class="card"><b>${db.sess.length}</b><br>Sessions</div><div class="card"><b>${db.revs.length}</b><br>Reviews</div></div>
 <h2>Skills offered</h2><p>${Object.entries(sk).map(([k,v])=>`<span class="chip">${esc(k)} × ${v}</span>`).join('')||'<span class="mut">none</span>'}</p>
 <h2>Users</h2><div class="wrap"><table><tr><th>Name</th><th>Email</th><th>Dept</th><th>Rating</th><th></th></tr>${S.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.email)}</td><td>${esc(x.dept)} / ${esc(x.sem)}</td><td>${avg(x.id)}</td><td><button class="bad" onclick="adminDel('${x.id}')">Delete</button></td></tr>`).join('')}</table></div>
 <p class="mut">Report: ${db.reqs.filter(r=>r.status==='accepted').length} accepted, ${db.reqs.filter(r=>r.status==='pending').length} pending, ${db.reqs.filter(r=>r.status==='rejected').length} rejected requests.</p>`}};
function render(keep){const u=me(),[r,p]=(location.hash.slice(2)||'home').split('/'),pub=['home','login','register'];
 let route=V[r]?r:'home';if(!u&&!pub.includes(route))route='login';if(u&&['login','register'].includes(route))route=u.role==='admin'?'admin':'dashboard';
 $('#nav').innerHTML=u?(u.role==='admin'?[['admin','Admin']]:[['dashboard','Matches'],['search','Search'],['requests','Requests'],['sessions','Sessions'],['chat','Chat'],['profile','Profile']]).map(([k,t])=>`<a href="#/${k}" class="${k===route?'on':''}">${t}</a>`).join('')+`<a href="#" onclick="logout();return false">Log out</a>`:'<a href="#/login">Log in</a><a href="#/register">Register</a>';
 $('#app').innerHTML=V[route](u,p);document.title='SkillConnect';
 if(keep==='q'){const q=$('#q');q.focus();q.setSelectionRange(q.value.length,q.value.length)}
 const c=$('.chat');if(c)c.scrollTop=1e6;if(keep!=='q')window.scrollTo(0,0)}
window.addEventListener('hashchange',()=>{window.sq='';render()});render();
