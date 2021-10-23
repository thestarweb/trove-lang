import path from 'path';
import fs from 'fs';
import { read } from "@thestarweb/trove-lang-tool";
import type { LangInfoItem } from "@thestarweb/trove-lang-tool";

type fileCallBack<T> = (filename:string, index:number, length:number) => T;

export function mapDir<T=unknown>(dir:string, callback:fileCallBack<T>):T[]{
    if(!fs.existsSync(dir)) return [];
    const dirData = fs.readdirSync(dir);
    return dirData.map((filename, index) => {
        return callback(filename, index, dirData.length);
    });
}

type readOption = {
    befroeRead?: fileCallBack<unknown>;
    afterRead?: fileCallBack<unknown>;
}

const filterSymbol = Symbol();
export function mapBinfabDir<T=unknown>(
    dir:string,
    callback:(filename:string, data:LangInfoItem[], index:number, length:number) => T,
    option:readOption={},
):T[]{
    return mapDir(dir, (filename:string, index:number, length:number):T|Symbol => {
        if(filename.endsWith(".binfab")){
            const filePath = path.join(dir, filename);
            option.befroeRead && option.befroeRead(filename, index, length);
            const data = callback(filename, read(fs.readFileSync(filePath)), index, length);
            option.afterRead && option.afterRead(filename, index, length);
            return data;
        }
        return filterSymbol;
    }).filter(item => item !== filterSymbol) as T[];
}
export function binfabs2Txts(srcdir: string, outDir: string, option:readOption = {}):void{
    mapBinfabDir(srcdir, (filename:string, data:LangInfoItem[]) => {
        const outName = filename.substr(0, filename.lastIndexOf(".")) + ".txt";
        fs.writeFileSync(path.join(outDir, outName), data.map((item) => `${item.key}=${item.value.replace("\r","").replace("\n","\\n")}`).join("\n"));
    }, option);
}
export function binfabs2TxtsWithLog(srcdir: string, outDir: string = './'):void{
    mapBinfabDir(srcdir, (filename:string, data:LangInfoItem[]) => {
        const outName = filename.substr(0, filename.lastIndexOf(".")) + ".txt";
        fs.writeFileSync(path.join(outDir, outName), data.map((item) => `${item.key}=${item.value.replace(/\r/g,"").replace(/\n/g,"\\n")}`).join("\n"));
    }, {
        befroeRead: (filename) => console.log(`转换${filename}`),
        afterRead: (filename, index, length) => console.log(`转换${filename}完成 （${index+1}/${length}）`),
    });
}

export function readTxtFile(path:string):LangInfoItem[]{
    if(!fs.existsSync(path)) return [];
    return fs.readFileSync(path, {encoding: 'utf8'}).split("\n").map(item => {
        const [key, value] = item.split("=", 2);
        return {key, value};
    });
}