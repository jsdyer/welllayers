import assert from "node:assert/strict";
import test from "node:test";
import {depth,extent,tableRows,alignedLayers} from "../web/model.mjs";
test("shared scale, raw overlaps and unlogged depths are preserved",()=>{
 const layers=[[2,6,"sand"],[5,8,"gravel"],[10,20,"slate"]];
 assert.equal(extent([{layers}]),20);
 assert.equal(depth(100,"m"),30.48);
 assert.deepEqual(tableRows(layers),[[0,2,"Unlogged interval"],...layers.slice(0,2),[8,10,"Unlogged interval"],layers[2]]);
});

test("aligns observations without inventing a material below the shorter log",()=>{
 const result=alignedLayers([[0,50,"Material unrecorded"],[50,73,"coarse sand"]],[[0,56,"boulders / sand"],[56,120,"shale"]]);
 assert.deepEqual(result.map(row=>row.slice(0,2)),[[0,50],[50,56],[56,73],[73,120]]);
 assert.equal(result[3][2],"Beyond the last logged interval");
});

import {readFileSync} from 'node:fs';
import {probeFeet, sampleAtDepth} from '../web/model.mjs';
const logs = JSON.parse(readFileSync(new URL('../web/data/logs.json', import.meta.url)));
test('The linked BC/NS comparison preserves differing source descriptions and separate observation fields', () => {
  const bc = logs.find(log => log.id === '30145'), ns = logs.find(log => log.id === '000119');
  assert.equal(sampleAtDepth(bc, probeFeet('20', 'm')).matches[0][2], 'coarse sand');
  assert.equal(sampleAtDepth(ns, probeFeet('20', 'm')).matches[0][2], 'shale / unknown');
  assert.equal(sampleAtDepth(ns, probeFeet('20', 'm')).status, 'partial');
  assert.equal(sampleAtDepth(bc, probeFeet('10', 'm')).status, 'empty');
  assert.match(sampleAtDepth(bc, 0).matches[0][3], /dug well/);
  for (const [ft, m, status, label] of [[50,15.24,'described','coarse sand'], [73,22.2504,'bottom'], [74,22.5552,'beyond']]) {
    for (const feet of [probeFeet(String(ft), 'ft'), probeFeet(String(m), 'm')]) {
      const result = sampleAtDepth(bc, feet);
      assert.equal(result.status, status); assert.equal(result.matches[0]?.[2], label);
    }
  }
});
test('A point lookup keeps overlaps, first/interior gaps, empty fields and explicit unknown terms distinct', () => {
  const log = {layers: [[2,5,'unknown / unknown'], [4,7,'clay / unknown'], [9,12,'Material unrecorded']]};
  assert.equal(sampleAtDepth(log, 0).status, 'gap');
  assert.equal(sampleAtDepth(log, 2).status, 'unknown');
  assert.equal(sampleAtDepth(log, 4).matches.length, 2);
  assert.equal(sampleAtDepth(log, 4).status, 'overlap');
  assert.equal(sampleAtDepth(log, 5).status, 'partial');
  assert.equal(sampleAtDepth(log, 7).status, 'gap');
  assert.equal(sampleAtDepth(log, 9).status, 'empty');
  assert.equal(sampleAtDepth({layers: []}, 0).status, 'absent');
  for (const value of ['', '-2', '1x', 'Infinity']) assert.equal(probeFeet(value,'m'), null);
});
