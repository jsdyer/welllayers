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

export const observations = {
  described: 'Reported material',
  partial: 'Includes an unknown term',
  unknown: 'Only unknown terms',
  empty: 'Material field empty',
  overlap: 'Overlapping intervals',
  gap: 'No interval logged here',
  bottom: 'At the final logged boundary',
  beyond: 'Below the last logged interval',
  absent: 'No valid intervals'
};

export function probeFeet(value, unit) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const input = Number(value);
  if (!Number.isFinite(input) || input < 0) return null;
  const feet = unit === 'm' ? input / 0.3048 : input;
  // Provincial depths are stored in feet. Remove conversion noise at a shared boundary.
  return Number.isFinite(feet) ? Number(feet.toPrecision(14)) : null;
}

export function sampleAtDepth(log, feet) {
  const matches = log.layers.filter(([top, end]) => top <= feet && feet < end);
  if (matches.length > 1) return {status: 'overlap', matches};
  if (matches.length) {
    const material = matches[0][2];
    if (!material || material === 'Material unrecorded') return {status: 'empty', matches};
    const terms = material.toLowerCase().split('/').map(term => term.trim()).filter(Boolean);
    if (terms.includes('unknown')) {
      return {status: terms.every(term => term === 'unknown') ? 'unknown' : 'partial', matches};
    }
    return {status: 'described', matches};
  }
  if (!log.layers.length) return {status: 'absent', matches};
  const bottom = Math.max(...log.layers.map(layer => layer[1]));
  if (feet === bottom) return {status: 'bottom', matches, bottom};
  return {status: feet > bottom ? 'beyond' : 'gap', matches, bottom};
}
