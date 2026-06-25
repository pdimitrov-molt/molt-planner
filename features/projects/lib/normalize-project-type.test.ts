import assert from "node:assert/strict";

import {
  assertProjectType,
  normalizeProjectType,
} from "@/features/projects/lib/normalize-project-type";

assert.equal(normalizeProjectType("residential"), "residential");
assert.equal(normalizeProjectType("commercial"), "commercial");
assert.equal(normalizeProjectType("hospitality"), "hospitality");
assert.equal(normalizeProjectType("renovation"), "renovation");
assert.equal(normalizeProjectType("staging"), "staging");

assert.equal(normalizeProjectType("Жилищен"), "residential");
assert.equal(normalizeProjectType("Жилище"), "residential");
assert.equal(normalizeProjectType("Търговски"), "commercial");
assert.equal(normalizeProjectType("Хотелиерски"), "hospitality");
assert.equal(normalizeProjectType("Хотел"), "hospitality");
assert.equal(normalizeProjectType("Ремонт"), "renovation");
assert.equal(normalizeProjectType("Реновация"), "renovation");
assert.equal(normalizeProjectType("Сценичен"), "staging");
assert.equal(normalizeProjectType("Хоум стейджинг"), "staging");

assert.equal(normalizeProjectType("office"), null);
assert.equal(normalizeProjectType(""), null);

assert.throws(
  () => assertProjectType("invalid"),
  /Invalid project type/
);

console.log("normalize-project-type.test.ts passed");
