import assert from "node:assert/strict";
import test from "node:test";
import {depth,extent,tableRows} from "../web/model.mjs";
test("shared scale, raw overlaps and unlogged depths are preserved",()=>{
 const layers=[[2,6,"sand"],[5,8,"gravel"],[10,20,"slate"]];
 assert.equal(extent([{layers}]),20);
 assert.equal(depth(100,"m"),30.48);
 assert.deepEqual(tableRows(layers),[[0,2,"Unlogged interval"],...layers.slice(0,2),[8,10,"Unlogged interval"],layers[2]]);
});
