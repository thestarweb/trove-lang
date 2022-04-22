"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTxtFile = exports.binfabs2TxtsWithLog = exports.binfabs2Txts = exports.mapBinfabDir = exports.mapDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const trove_lang_tool_1 = require("@thestarweb/trove-lang-tool");
function mapDir(dir, callback) {
    if (!fs_1.default.existsSync(dir))
        return [];
    const dirData = fs_1.default.readdirSync(dir);
    return dirData.map((filename, index) => {
        return callback(filename, index, dirData.length);
    });
}
exports.mapDir = mapDir;
const filterSymbol = Symbol();
function mapBinfabDir(dir, callback, option = {}) {
    return mapDir(dir, (filename, index, length) => {
        if (filename.endsWith(".binfab")) {
            const filePath = path_1.default.join(dir, filename);
            option.befroeRead && option.befroeRead(filename, index, length);
            const data = callback(filename, (0, trove_lang_tool_1.read)(fs_1.default.readFileSync(filePath)), index, length);
            option.afterRead && option.afterRead(filename, index, length);
            return data;
        }
        return filterSymbol;
    }).filter(item => item !== filterSymbol);
}
exports.mapBinfabDir = mapBinfabDir;
function binfabs2Txts(srcdir, outDir, option = {}) {
    mapBinfabDir(srcdir, (filename, data) => {
        const outName = filename.substr(0, filename.lastIndexOf(".")) + ".txt";
        fs_1.default.writeFileSync(path_1.default.join(outDir, outName), data.map((item) => `${item.key}=${item.value.replace("\r", "").replace("\n", "\\n")}`).join("\n"));
    }, option);
}
exports.binfabs2Txts = binfabs2Txts;
function binfabs2TxtsWithLog(srcdir, outDir = './') {
    mapBinfabDir(srcdir, (filename, data) => {
        const outName = filename.substr(0, filename.lastIndexOf(".")) + ".txt";
        fs_1.default.writeFileSync(path_1.default.join(outDir, outName), data.map((item) => `${item.key}=${item.value.replace(/\r/g, "").replace(/\n/g, "\\n")}`).join("\n"));
    }, {
        befroeRead: (filename) => console.log(`转换${filename}`),
        afterRead: (filename, index, length) => console.log(`转换${filename}完成 （${index + 1}/${length}）`),
    });
}
exports.binfabs2TxtsWithLog = binfabs2TxtsWithLog;
function readTxtFile(path) {
    if (!fs_1.default.existsSync(path))
        return [];
    return fs_1.default.readFileSync(path, { encoding: 'utf8' }).split("\n").map(item => {
        const [key, ...value] = item.split("=");
        return { key, value: value.join('=') };
    });
}
exports.readTxtFile = readTxtFile;
