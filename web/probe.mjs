import {el, node} from './shared.mjs';
import {depth, observations, sampleAtDepth} from './model.mjs';

export function sourceLink(log) {
  const bc = log.province === 'BC';
  const link = node('a', bc ? 'GWELLS record ' + log.id + ' ↗' : 'NS database · well ' + log.id + ' ↗');
  link.href = bc ? 'https://apps.nrs.gov.bc.ca/gwells/well/' + encodeURIComponent(log.id)
    : 'https://novascotia.ca/nse/groundwater/welldatabase.asp';
  return link;
}
const precise = value => Number(value.toPrecision(12)).toLocaleString('en-CA', {maximumFractionDigits: 10});
function boundaries(start, end, unit) {
  const raw = precise(start) + '–' + precise(end) + ' ft';
  return unit === 'ft' ? raw : precise(depth(start, unit)) + '–' + precise(depth(end, unit)) + ' m (' + raw + ')';
}
function evidence(result, unit) {
  const container = node('div', undefined, 'evidence');
  container.append(node('strong', observations[result.status], 'evidence-status'));
  for (const [from, to, material, note] of result.matches) {
    const entry = node('p');
    entry.append(node('span', boundaries(from, to, unit), 'interval-bounds'), node('span', material || 'Material unrecorded'));
    if (note) entry.append(node('small', note, 'source-note'));
    container.append(entry);
  }
  if (result.status === 'bottom' || result.status === 'beyond') container.append(node('small', 'Last interval ends at ' + precise(result.bottom) + ' ft.'));
  return container;
}

export function renderProbe(records, pair, feet, unit) {
  el('probe-label').textContent = 'Depth below ground (' + unit + ')';
  el('probe-depth').setAttribute('aria-invalid', String(feet == null));
  const ok = feet != null;
  el('sample').hidden = !ok;
  if (!ok) {
    el('probe-summary').textContent = 'Enter a depth of zero or greater to read the logs.';
    el('pair-evidence').replaceChildren();
    return;
  }
  const results = records.map(log => ({log, result: sampleAtDepth(log, feet)}));
  const point = precise(depth(feet, unit)) + ' ' + unit;
  el('probe-summary').textContent = 'Selected wells at ' + point + ' below their respective ground surfaces.';
  el('pair-evidence').replaceChildren(...pair.map(log => {
    const card = node('div', undefined, 'probe-card');
    card.append(node('h3', log.place + ' · ' + log.province + ' ' + log.id), evidence(sampleAtDepth(log, feet), unit), sourceLink(log));
    return card;
  }));
  const counts = new Map();
  for (const {result} of results) counts.set(result.status, (counts.get(result.status) || 0) + 1);
  el('sample-title').textContent = 'Compare all ' + records.length + ' sampled logs at ' + point;
  el('sample-counts').textContent = Object.entries(observations).filter(([status]) => counts.has(status))
    .map(([status, label]) => label + ' (' + counts.get(status) + ')').join(' · ');
  const location = el('sample-area').value;
  const status = el('sample-status').value;
  const shown = results.filter(row => (!location || row.log.place === location) && (!status || row.result.status === status));
  el('filtered-count').textContent = shown.length + ' of ' + records.length + ' logs match these filters.';
  if (!shown.length) {
    el('sample-table').replaceChildren(node('p', 'No sample log matches this combination.'));
    return;
  }
  const table = node('table');
  const header = table.createTHead().insertRow();
  for (const name of ['Community and well', 'Recorded interval at ' + point, 'Provincial source']) {
    const cell = node('th', name); cell.scope = 'col'; header.append(cell);
  }
  const body = table.createTBody();
  for (const {log, result} of shown) {
    const row = body.insertRow();
    row.insertCell().textContent = log.place + ' · ' + log.province + ' ' + log.id;
    row.insertCell().append(evidence(result, unit));
    row.insertCell().append(sourceLink(log));
  }
  el('sample-table').replaceChildren(table);
}
