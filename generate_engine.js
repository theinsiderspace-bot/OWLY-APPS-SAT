// generate_engine.js - Assembles src/data/questionGeneratorEngine.ts
const fs = require("fs");
const path = require("path");

const targetPath = path.join(__dirname, "src/data/questionGeneratorEngine.ts");

console.log("Building complete questionGeneratorEngine.ts file...");
