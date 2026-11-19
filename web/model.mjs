export function depth(feet,unit){return unit==="m"?feet*0.3048:feet;}
export function depthLabel(feet,unit){return Number(depth(feet,unit).toFixed(unit==="m"?2:1)).toLocaleString("en-CA",{maximumFractionDigits:2});}
export function extent(logs){return Math.max(...logs.flatMap(log=>log.layers.map(layer=>layer[1])));}
export function tableRows(layers){
  let bottom=0;
  const rows=[];
  for(const layer of layers){
    const [top,end] = layer;
    if(top>bottom)rows.push([bottom,top,"Unlogged interval"]);
    rows.push(layer);
    bottom=Math.max(bottom,end);
  }
  return rows;
}

export function alignedLayers(left, right) {
  const limits = [...new Set([0,...[...left,...right].flatMap(([top,end])=>[top,end])])].sort((a,b)=>a-b);
  function descriptions(layers, from, to) {
    const found = layers.filter(([top,end])=>top < to && end > from);
    if (found.length) return found.map(layer=>layer[2]).join(" / ");
    return layers.some(([,end])=>end > from) ? "Unlogged interval" : "Beyond the last logged interval";
  }
  return limits.slice(1).map((to,i)=>[limits[i],to,descriptions(left,limits[i],to),descriptions(right,limits[i],to)]);
}
