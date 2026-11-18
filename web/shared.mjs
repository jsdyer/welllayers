export const el=id=>document.getElementById(id);
export function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
export async function read(path){const r=await fetch("./data/"+path+".json");if(!r.ok)throw Error("Data unavailable");return r.json();}
export function option(id,label,value){el(id).add(new Option(label,value));}
export const format=new Intl.NumberFormat("en-CA");
document.querySelector('a[href="#sources"]').addEventListener("click",()=>{el("sources").open=true});
