import assert from "node:assert/strict";
import test from "node:test";
import { GameBounds3, GameZoneSystem } from "../src/runtime/game-zones.mjs";
import { Vector3 } from "../src/runtime/vector3.mjs";

test("implements recovered dynamic zone enter leave and removal", () => {
  const system=new GameZoneSystem();const events=[];const zone=system.add({bounds:new GameBounds3(new Vector3(0,0,0),new Vector3(2,2,2)),selector:"player"});zone.onEnter(e=>events.push(`enter:${e.entity.id}`));zone.onLeave(e=>events.push(`leave:${e.entity.id}`));const player={id:"p",position:new Vector3(1,1,1)};system.poll(1,[player]);assert.deepEqual(zone.entities(),[player]);player.position=new Vector3(3,3,3);system.poll(2,[player]);assert.deepEqual(events,["enter:p","leave:p"]);zone.remove();assert.deepEqual(system.list(),[]);
});