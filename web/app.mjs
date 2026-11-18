import {el,node,read,option,format} from "./shared.mjs";
import {depthLabel,extent,tableRows} from "./model.mjs";
let records=[];
const key=log=>log.province+"-"+log.id;
const colors=["#bd9862","#79523a","#a68670","#736e56"];
function panel(log,max,unit){
 const box=node("article");box.append(node("h2",log.place),node("p",log.province+" · Well "+log.id),node("p","0 "+unit+" · ground surface","extent"));
 const strip=node("div",undefined,"strip");strip.setAttribute("aria-hidden","true");
 log.layers.forEach(([a,b,text],i)=>{const band=node("div",undefined,"slice");band.style.top=100*a/max+"%";band.style.height=100*(b-a)/max+"%";band.style.backgroundColor=colors[i%colors.length];band.title=depthLabel(a,unit)+"–"+depthLabel(b,unit)+" "+unit+" · "+text;strip.append(band);});
 box.append(strip,node("p",depthLabel(max,unit)+" "+unit+" · shared scale","extent"));
 const table=node("table"),head=node("thead"),headers=node("tr");headers.append(node("th","Depth ("+unit+")"),node("th","Driller’s description"));head.append(headers);table.append(head);
 const body=node("tbody");for(const [a,b,text] of tableRows(log.layers)){const row=node("tr");row.append(node("td",depthLabel(a,unit)+"–"+depthLabel(b,unit)),node("td",text));body.append(row);}table.append(body);box.append(table);
 const link=node("a",log.province==="BC"?"Open provincial well record ↗":"Open provincial well database ↗");
 link.href=log.province==="BC"?"https://apps.nrs.gov.bc.ca/gwells/well/"+log.id:"https://novascotia.ca/nse/groundwater/welldatabase.asp";
 box.append(link);return box;
}
function render(){
 const logs=["left","right"].map(id=>records.find(r=>key(r)===el(id).value));const max=extent(logs);
 el("result").replaceChildren(...logs.map(r=>panel(r,max,el("units").value)));
 el("notice").textContent="Depth below local ground surface · Bands follow recorded intervals. Hatching marks gaps or the end of a log.";
}
try{
 const [status,logs]=await Promise.all([read("status"),read("logs")]);records=logs;
 el("count").textContent=format.format(status.count);el("stamp").textContent=status.intervals+" intervals · Retrieved "+status.retrieved;
 for(const id of ["left","right"]){for(const log of records)option(id,log.province+" · "+log.place+" · "+log.id,key(log));}
 el("left").value="BC-48";el("right").value=key(records.find(r=>r.province==="NS"&&r.place==="Fall River"));
 document.querySelector("form").addEventListener("change",render);render();
}catch{el("notice").textContent="The well logs could not be loaded. See Sources & method for the original records.";}
