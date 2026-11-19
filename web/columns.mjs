import {depthLabel} from './model.mjs';
import {node} from './shared.mjs';

const palette = ['#cfac76', '#9db2a4', '#b28e85', '#92a7bb', '#c6be8e', '#a797ac'];
export function drawColumns(logs, limit, unit, probe, selectDepth) {
  const plot = node('div', undefined, 'columns');
  plot.append(node('span',unit,'axis-title'));
  for (const well of logs) {
    const heading = node('div', undefined, 'well-heading');
    heading.append(node('strong',well.place),node('small',well.province+' · '+well.id));
    plot.append(heading);
  }
  const ruler = node('div',undefined,'ruler');
  for (let i = 0; i <= 5; i++) {
    const tick = node('span',depthLabel(i*limit/5,unit));
    tick.style.top=(20*i)+'%'; ruler.append(tick);
  }
  plot.append(ruler);
  for (const [column,well] of logs.entries()) {
    const track = node('div',undefined,'well-track');
    const bottom = Math.max(...well.layers.map(row=>row[1]));
    if (bottom < limit) {
      const beyond=node('div',undefined,'beyond');
      beyond.style.top=100*bottom/limit+'%';
      if (bottom/limit<.86) beyond.append(node('small','End of log · '+depthLabel(bottom,unit)+' '+unit));
      track.append(beyond);
    }
    // Preserve overlapping source records in separate lanes inside the same track.
    const ends = [];
    const lanes = well.layers.map(([start,end])=>{
      let index=ends.findIndex(last=>last<=start);
      if(index<0) index=ends.length;
      ends[index]=end;
      return index;
    });
    well.layers.forEach(([start,end,material],i)=>{
      if (start>=limit) return;
      const band=node('button',undefined,'slice');
      const hi=Math.min(end,limit);
      const span=(hi-start)/limit;
      band.type='button';
      band.style.cssText=['top:'+100*start/limit+'%','height:'+100*span+'%',
        'left:'+100*lanes[i]/ends.length+'%','width:'+100/ends.length+'%',
        'background-color:'+(material==='Material unrecorded'?'#d3d4ce':palette[i%palette.length])].join(';');
      const label=depthLabel(start,unit)+'–'+depthLabel(end,unit)+' '+unit+' · '+material;
      band.title=label;band.setAttribute('aria-label',well.place+' · '+label);
      band.id='band-'+column+'-'+i;
      if(span>=.045) band.append(node('span',(i+1)+' · '+material));
      band.addEventListener('click',()=>{selectDepth((start+hi)/2);document.getElementById(band.id)?.focus({preventScroll:true});});
      track.append(band);
    });
    if(probe!=null && probe<=limit){
      const marker=node('div',undefined,'probe-marker');marker.style.top=100*probe/limit+'%';track.append(marker);
    }
    plot.append(track);
  }
  return plot;
}
