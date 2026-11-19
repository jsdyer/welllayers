import {el,node,read,option,format} from "./shared.mjs";
import {depth,depthLabel,extent,tableRows,alignedLayers,observations,probeFeet} from "./model.mjs";
import {sourceLink, renderProbe} from './probe.mjs';
let records=[];
let feet = 20 / 0.3048;
const key=log=>log.province+"-"+log.id;

function panel(log,max,unit){
 const box=node("article");box.append(node("h2",log.place),node("p",log.province+" · Well "+log.id),node("p","0 "+unit+" · ground surface","extent"));
 const strip=node("div",undefined,"strip");strip.setAttribute("aria-hidden","true");
 log.layers.forEach(([a,b,text],i)=>{const band=node("div",undefined,"slice");band.style.top=100*a/max+"%";band.style.height=100*(b-a)/max+"%";band.dataset.unknown=String(text==="Material unrecorded");band.textContent=(b-a)/max>=0.1?String(i+1):"";band.title=depthLabel(a,unit)+"–"+depthLabel(b,unit)+" "+unit+" · "+text;strip.append(band);});
 if (feet != null && feet <= max) {
   const marker = node('div', undefined, 'probe-marker');
   marker.style.top = 100 * feet / max + '%';
   strip.append(marker);
 }
 box.append(strip,node("p",depthLabel(max,unit)+" "+unit+" · shared scale","extent"));
 const table=node("table"),head=node("thead"),headers=node("tr");headers.append(node("th","Depth ("+unit+")"),node("th","Driller’s description"));head.append(headers);table.append(head);
 const body=node("tbody");for(const [a,b,text,note] of tableRows(log.layers)){const row=node("tr");row.append(node("td",depthLabel(a,unit)+"–"+depthLabel(b,unit)),node("td",text));if(note)row.lastChild.append(node("small",note,"source-note"));body.append(row);}table.append(body);box.append(table);
 box.append(sourceLink(log));return box;
}
function render(){
 const logs=["left","right"].map(id=>records.find(r=>key(r)===el(id).value));const max=extent(logs);
 el("result").replaceChildren(...logs.map(r=>panel(r,max,el("units").value)));
 const unit=el("units").value;
 el("aligned-head").replaceChildren(...["Depth ("+unit+")",...logs.map(log=>log.place+" · "+log.id)].map(label=>node("th",label)));
 renderProbe(records,logs,feet,unit);
 const rows=alignedLayers(logs[0].layers,logs[1].layers);
 el("aligned").replaceChildren(...rows.map(([a,b,left,right])=>{
   const tr=node("tr");
   tr.append(node("td",depthLabel(a,unit)+"–"+depthLabel(b,unit)),node("td",left),node("td",right));
   return tr;
 }));
 el("notice").textContent="A band marks an interval in drilling order. Its fill only shows whether the material field was filled in. Wells with the same shading may describe entirely different material. Hatching marks an interval with no record, and the dashed line marks your selected depth.";
}
try{
 const [status,logs]=await Promise.all([read("status"),read("logs")]);records=logs;
 el("count").textContent=format.format(status.count);el("stamp").textContent=status.intervals+" intervals · Retrieved "+status.retrieved;
 for(const id of ["left","right"]){for(const log of records)option(id,log.province+" · "+log.place+" · "+log.id,key(log));}
 el("left").value="BC-48";el("right").value=key(records.find(r=>r.province==="NS"&&r.place==="Fall River"));
 const controlIds = ["left", "right", "units"];
 const url = new URL(window.location.href);
 for (const id of controlIds) {
   const value = url.searchParams.get(id);
   const select = el(id);
   if (Array.from(select.options).some(option => option.value === value)) select.value = value;
 }
 option('sample-area', 'All communities', '');
 for (const place of [...new Set(records.map(log => log.place))].sort()) option('sample-area', place, place);
 option('sample-status', 'All evidence', '');
 for (const [status, label] of Object.entries(observations)) option('sample-status', label, status);
 const start = url.searchParams.get('depth');
 if (start !== null && probeFeet(start, el('units').value) !== null) el('probe-depth').value = start;
 else el('probe-depth').value = el('units').value === 'ft' ? '65.616797900262' : '20';
 feet = probeFeet(el('probe-depth').value, el('units').value);
 function update() {
   const selection = new URL(window.location.href);
   for (const id of controlIds) selection.searchParams.set(id, el(id).value);
   if (feet == null) selection.searchParams.delete('depth');
   else selection.searchParams.set('depth', el('probe-depth').value);
   window.history.replaceState(window.history.state, '', selection);
   render();
 }
 document.querySelector("form").addEventListener("change", event => {
   if (event.target.id === 'units' && feet != null) {
     el('probe-depth').value = String(Number(depth(feet, el('units').value).toPrecision(14)));
   }
   update();
 });
 el('probe-depth').addEventListener('input', () => {
   feet = probeFeet(el('probe-depth').value, el('units').value);
   update();
 });
 el('example').onclick = () => {
   el('left').value = 'BC-30145'; el('right').value = 'NS-000119';
   el('units').value = 'm'; el('probe-depth').value = '20';
   feet = probeFeet('20', 'm');
   update();
 };
 for (const id of ['sample-area', 'sample-status']) el(id).onchange = render;
 render();
}catch{el("notice").textContent="The well logs could not be loaded. See Sources & method for the original records.";}
