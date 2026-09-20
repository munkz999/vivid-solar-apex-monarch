import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatBreakdown,
  LIE_FACTORS,
  pickClub,
  playsLike,
} from "./caddy.ts";

describe("caddy lie factors", () => {
  it("uses Favorable/Buried hero multipliers", () => {
    assert.equal(LIE_FACTORS.fairway.favorable, 1.0);
    assert.equal(LIE_FACTORS.fairway.buried, 1.1);
    assert.equal(LIE_FACTORS.rough.favorable, 1.12);
    assert.equal(LIE_FACTORS.rough.buried, 1.35);
    assert.equal(LIE_FACTORS.bunker.favorable, 1.25);
    assert.equal(LIE_FACTORS.bunker.buried, 1.45);
  });
});

describe("playsLike", () => {
  it("applies lie then elevation in yards", () => {
    // 162 pin, rough buried 1.35 → 218.7 after lie; −10 yd downhill → 208.7
    const r = playsLike({
      pinYards: 162,
      lieType: "rough",
      lieQuality: "buried",
      elevationYards: -10,
    });
    assert.equal(r.lieFactor, 1.35);
    assert.ok(Math.abs(r.afterLieYards - 162 * 1.35) < 1e-9);
    assert.ok(Math.abs(r.playsLikeYards - (162 * 1.35 - 10)) < 1e-9);
  });

  it("fairway favorable is identity before elev", () => {
    const r = playsLike({
      pinYards: 148,
      lieType: "fairway",
      lieQuality: "favorable",
      elevationYards: 0,
    });
    assert.equal(r.playsLikeYards, 148);
  });
});

describe("pickClub", () => {
  const chart = [
    { clubId: "8i", label: "8i", carry: 140 },
    { clubId: "7i", label: "7i", carry: 150 },
    { clubId: "6i", label: "6i", carry: 160 },
  ];

  it("picks closest carry", () => {
    const pick = pickClub(148, chart);
    assert.equal(pick?.clubId, "7i");
  });

  it("returns null for empty chart", () => {
    assert.equal(pickClub(150, []), null);
  });

  it("formats breakdown line", () => {
    assert.equal(formatBreakdown(162, 148, "7i"), "162 pin → 148 plays-like → 7i");
  });
});
