import fs from "node:fs";

const path = "src/i18n/bg.ts";
const content = fs.readFileSync(path, "utf8");
const start = content.indexOf("  roomTemplates:");
const end = content.indexOf("} as const;", start);
const replacement = `  roomTemplates: {
    residential: {
      name: "Жилищен проект",
      description: "Пълен набор помещения за жилищен интериорен дизайн.",
      defaultRoomSummary: "Планиране и дизайн на помещението",
    },
    commercial: {
      name: "Търговски проект",
      description: "Пълен набор помещения за търговски и hospitality пространства.",
      defaultRoomSummary: "Планиране и дизайн на зоната",
    },
  },
`;

if (start === -1 || end === -1) {
  throw new Error("Could not find roomTemplates block");
}

fs.writeFileSync(path, content.slice(0, start) + replacement + content.slice(end));
console.log("patched");
