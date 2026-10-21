import {readFileSync} from "node:fs";
import {strict as assert} from "node:assert";
import vm from "node:vm";

const html=readFileSync(new URL("../public/index.html",import.meta.url),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,"An inline application script must exist");
new vm.Script(script);
assert.ok(!/<script[^>]+src=|<link[^>]+stylesheet/i.test(html),"Essential rendering must not depend on third-party assets");
const handlers={},listeners={},nodes=new Map(),storage=new Map();
const node=id=>{
  if(!nodes.has(id))nodes.set(id,{innerHTML:"",textContent:"",value:"",focus(){},setAttribute(){}});
  return nodes.get(id);
};
const location={hash:"#/en/home",search:"",replace(value){this.hash=value;}};
const document={
 documentElement:{dataset:{},lang:""},
 getElementById:node,
 addEventListener:(name,fn)=>handlers[name]=fn,
 querySelectorAll:()=>[],
 body:{appendChild(){}},
 createElement:()=>({click(){},remove(){}})
};
const context={
 document,location,
 window:{addEventListener:(name,fn)=>listeners[name]=fn,scrollTo(){},print(){}},
 localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
 URLSearchParams,Blob,URL,setTimeout,clearTimeout,AbortController,TextEncoder,
 fetch:(...args)=>mockFetch(...args)
};
const api=vm.runInNewContext(script,context);
function route(hash){location.hash=hash;listeners.hashchange();}
function click(action,value="",extra={}){handlers.click({target:{closest:()=>({dataset:{action,value,...extra}})}});}
assert.equal(api.visibleLessons().length,18);
assert.equal(api.allQuestions().length,36);
assert.equal(api.calculate("9","18").value,.5);
assert.equal(api.calculate("0.2","0.5").value,.4);
assert.equal(api.calculate("0","18").value,0);
for(const [a,b] of [["","18"],["-1","18"],["1","0"],["Infinity","2"],["1","NaN"],["2","-1"]])assert.ok(api.calculate(a,b).error);
assert.equal(api.calculate("1e308","1e-308").error,"range");
route("#/en/lesson/moles");click("complete","moles");
assert.ok(api.getState().record.read.includes("moles"));
route("#/en/practice/moles");click("answer","0",{question:"moles-0"});
assert.equal(api.getState().record.answers["moles-0"].correct,false);
route("#/en/notes");
assert.ok(node("app").innerHTML.includes("How many moles are in 5.85 g"));
handlers.input({target:{id:"notes-input",value:"Notes <b>not markup</b>"}});
route("#/zh/home");
assert.equal(document.documentElement.lang,"zh-CN");
assert.equal(api.visibleLessons().length,15);
assert.equal(api.allQuestions().length,30);
assert.equal(api.getState().record.notes,"");
assert.equal(Object.keys(api.getState().record.answers).length,0);
route("#/zh/notes");handlers.input({target:{id:"notes-input",value:"化学笔记"}});
route("#/en/notes");
assert.equal(api.getState().record.notes,"Notes <b>not markup</b>");
assert.ok(node("app").innerHTML.includes("&lt;b&gt;not markup&lt;/b&gt;"));
click("review","moles",{question:"moles-0"});listeners.hashchange();
click("answer","1",{question:"moles-0"});
assert.equal(api.getState().record.answers["moles-0"].correct,true);
route("#/en/notes");
assert.ok(!node("app").innerHTML.includes("How many moles are in 5.85 g"));
route("#/zh/lesson/grammar");
assert.equal(api.getState().view,"learn");
for(const edition of ["en","zh"])for(const view of ["home","learn","practice","tools","notes","about","ai"]){
 route("#/"+edition+"/"+view);
 assert.ok(node("app").innerHTML.length>2000);
 assert.ok(!node("app").innerHTML.includes("undefined"));
}
route("#/en/tools");
node("mass").value="9";node("molar").value="18";
handlers.submit({target:{id:"mole-form"},preventDefault(){}});
assert.ok(node("mole-result").innerHTML.includes("0.5 mol"));
const safe=api.sanitiseRecord({read:["x","moles","moles"],notes:4,answers:{"moles-0":{choice:0,correct:true},x:{choice:1}}});
assert.equal(safe.read.length,1);
assert.equal(safe.notes,"");
assert.equal(Object.keys(safe.answers).length,1);
assert.equal(safe.answers["moles-0"].correct,false);
let sent, mockFetch=async (url,options)=>{sent={url,body:JSON.parse(options.body)};return {ok:true,json:async()=>({answer:'Use <script>alert(1)</script> & units.'})};};
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const ask=text=>{handlers.input({target:{id:'ai-input',value:text}});handlers.submit({target:{id:'ai-form'},preventDefault(){}});};
route('#/en/lesson/moles');click('ask-lesson','moles');listeners.hashchange();
assert.equal(api.getState().view,'ai');
assert.ok(node('app').innerHTML.includes('selected>The mole'));
ask('Explain moles');await settle();
assert.equal(sent.url,'/api/chat');assert.equal(sent.body.curriculum,'hkdse');
assert.ok(sent.body.context.includes('The mole'));
assert.ok(node('app').innerHTML.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp; units.'));
assert.ok(!node('app').innerHTML.includes('<script>alert'));
ask('An example?');await settle();
assert.equal(sent.body.messages.length,3);
route('#/zh/ai');assert.ok(!node('app').innerHTML.includes('Explain moles'));
mockFetch=async()=>({ok:false,json:async()=>({error:'not_configured'})});
ask('什么是摩尔？');await settle();
assert.ok(node('app').innerHTML.includes('尚未启用'));
assert.ok(node('app').innerHTML.includes('什么是摩尔？</textarea>'));
click('ai-clear');
let finish;mockFetch=()=>new Promise(resolve=>{finish=resolve;});
ask('Old request');click('ai-clear');
finish({ok:true,json:async()=>({answer:'Stale reply'})});await settle();
assert.ok(!node('app').innerHTML.includes('Stale reply'));
assert.ok(!node('app').innerHTML.includes('Old request'));
console.log("ChemHouse checks passed: existing study features, AI routes, context, follow-ups, escaped replies, language isolation, errors and reset races.");
console.log("These are JavaScript and rendered-markup checks with DOM stubs, not browser layout or deployment verification.");

