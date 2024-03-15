import child_process from 'child_process';
import path from 'path';
import fs from 'fs';
import { binfabs2TxtsWithLog } from './common';


async function getGameDir(){
    return new Promise<string>((resolve, reject) => {
        child_process.exec('REG QUERY "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Steam App 304050"', function(error,stdout,stderr){
            if(error || stderr){
                reject("读取数据失败");
                return;
            }
            const data = /InstallLocation(?: +)REG_SZ(?: +)((\w| |\\|\/|\:)+)/.exec(stdout);
            if(!data || !data[1]){
                reject("未能找到游戏路径");
                return;
            }
            resolve(path.join(data[1],'Games\\Trove\\Live\\'));
        })
    });
}

function extract(srcDir:string, outDir:string, data:string){
    return new Promise<void>((resolve, reject) => {
        const to = path.isAbsolute(outDir) ? outDir : path.resolve(outDir);
        if(fs.existsSync(to)){
            fs.rmSync(to, {recursive: true});
        }
        child_process.exec(`"${path.join(srcDir,"trove.exe")}" -tool extractarchive ${data} "${to}"`, {
            cwd: srcDir
        }, function(error,stdout,stderr){
            if(!fs.existsSync(to)){
                console.error(error || stderr);
                reject(error || stderr);
                return;
            }
            resolve();
        })
    });
}

(async () => {
    const CACHE_DIR = "./cache";
    const OUT_DIR = "./lang-txt/cn-base";
    const gameDir = await getGameDir();
    console.log(`获取到游戏路径${gameDir}`);
    console.log("开始解包");
    await extract(gameDir, CACHE_DIR, "languages/zh");
    console.log("已解包");
    console.log("开始转换");
    if(fs.existsSync(OUT_DIR)){
        fs.rmSync(OUT_DIR, {recursive: true});
    }
    fs.mkdirSync(OUT_DIR);
    binfabs2TxtsWithLog(CACHE_DIR, OUT_DIR);
    console.log("转换完成");
    console.log("清理临时文件");
    fs.rmSync(CACHE_DIR, {recursive: true});
    console.log("处理完成");
})();
