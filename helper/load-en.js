"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const common_1 = require("./common");
async function getGameDir() {
    return new Promise((resolve, reject) => {
        child_process_1.default.exec('REG QUERY "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 304050"', function (error, stdout, stderr) {
            if (error || stderr) {
                reject("读取数据失败");
                return;
            }
            const data = /InstallLocation(?: +)REG_SZ(?: +)((\w| |\\|\/|\:)+)/.exec(stdout);
            if (!data || !data[1]) {
                reject("未能找到游戏路径");
                return;
            }
            resolve(path_1.default.join(data[1], 'Games\\Trove\\Live\\'));
        });
    });
}
function extract(srcDir, outDir, data) {
    return new Promise((resolve, reject) => {
        const to = path_1.default.isAbsolute(outDir) ? outDir : path_1.default.resolve(outDir);
        if (fs_1.default.existsSync(to)) {
            fs_1.default.rmSync(to, { recursive: true });
        }
        child_process_1.default.exec(`"${path_1.default.join(srcDir, "trove.exe")}" -tool extractarchive ${data} "${to}"`, {
            cwd: srcDir
        }, function (error, stdout, stderr) {
            if (!fs_1.default.existsSync(to)) {
                console.error(error || stderr);
                reject(error || stderr);
                return;
            }
            resolve();
        });
    });
}
(async () => {
    const CACHE_DIR = "./cache";
    const OUT_DIR = "./base-en";
    const gameDir = await getGameDir();
    console.log(`获取到游戏路径${gameDir}`);
    console.log("开始解包");
    await extract(gameDir, CACHE_DIR, "languages/en");
    console.log("已解包");
    console.log("开始转换");
    if (fs_1.default.existsSync(OUT_DIR)) {
        fs_1.default.rmSync(OUT_DIR, { recursive: true });
    }
    fs_1.default.mkdirSync(OUT_DIR);
    (0, common_1.binfabs2TxtsWithLog)(CACHE_DIR, OUT_DIR);
    console.log("转换完成");
    console.log("清理临时文件");
    fs_1.default.rmSync(CACHE_DIR, { recursive: true });
    console.log("处理完成");
})();
