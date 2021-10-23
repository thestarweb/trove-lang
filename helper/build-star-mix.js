"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const trove_lang_tool_1 = require("@thestarweb/trove-lang-tool");
const common_1 = require("./common");
const config_1 = __importDefault(require("./common/config"));
(async () => {
    const LANG_DIR = "lang-txt/mix-star";
    const BASE_DIR = "./lang-txt/en-base";
    (0, common_1.mapDir)(BASE_DIR, (filename) => {
        const baseEN = (0, common_1.readTxtFile)(path_1.default.join(BASE_DIR, filename));
        const mixMap = new Map();
        const cnMap = new Map();
        (0, common_1.readTxtFile)(path_1.default.join(LANG_DIR, filename)).forEach(item => mixMap.set(item.key, item.value));
        (0, common_1.readTxtFile)(path_1.default.join('./lang-txt/cn-liulianf', filename)).forEach(item => cnMap.set(item.key, item.value));
        const newData = baseEN.map((item) => {
            if (mixMap.get(item.key)) {
                return { key: item.key, value: mixMap.get(item.key) };
            }
            if (item.value === cnMap.get(item.key) || !cnMap.has(item.key))
                return item;
            const n = (cnMap.get(item.key).indexOf("\\n") != -1 || item.value.indexOf("\\n") != -1 || cnMap.get(item.key).length > 100 || item.value.length > 150) ? "\n" : "";
            return { key: item.key, value: `${cnMap.get(item.key)}${n}(${item.value})` };
        }).map(({ key, value }) => ({ key, value: value.replace(/\\n/g, "\n") }));
        if (newData.length > 0) {
            (0, fs_1.writeFileSync)(path_1.default.join(config_1.default.buildOutputDir, filename.substr(0, filename.lastIndexOf(".")) + ".binfab"), (0, trove_lang_tool_1.write)(newData));
        }
    });
})();
