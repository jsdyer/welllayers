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
