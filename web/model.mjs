export function depth(feet,unit){return unit==="m"?feet*0.3048:feet;}
export function depthLabel(feet,unit){return Number(depth(feet,unit).toFixed(unit==="m"?2:1)).toLocaleString("en-CA",{maximumFractionDigits:2});}
export function extent(logs){return Math.max(...logs.flatMap(log=>log.layers.map(layer=>layer[1])));}
export function tableRows(layers){
  let bottom=0;
  const rows=[];
  for(const [top,end,text] of layers){
    if(top>bottom)rows.push([bottom,top,"Unlogged interval"]);
    rows.push([top,end,text]);
    bottom=Math.max(bottom,end);
  }
  return rows;
}
