import { createGameKeyBoardEvent } from "../../demo-map/src/runtime/script-runtime.mjs";

export function createKeyBoardEventFixture(overrides = {}) {
  return createGameKeyBoardEvent(overrides.tick ?? 43, overrides.keyCode ?? 65);
}
