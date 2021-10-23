import https from "https";
import jszip from "jszip";
import fs from 'fs';
import { binfabs2TxtsWithLog } from "./common";

function getFileID(modid:number|string){
    return new Promise<string>(async (resolve, reject) => {
        https.request(`https://trovesaurus.com/mod=${modid}`, (res) => {
            res.setEncoding('utf8');
            let html = "";
            res.on('data', (d) => html += d);
            res.on('end', () => {
                try{
                    let res = /<input type="hidden" name="FileID" value="(\d+)">/g.exec(html);
                    if(res && res[1]){
                        resolve(res[1]);
                        return;
                    }
                }catch{
                    //
                }
                reject();
            });
        }).end();
    })
}

function download(modid:number|string,fileid:number|string){
    return new Promise<void>(async (resolve, reject) => {
        const req = https.request(`https://trovesaurus.com/mod=${modid}/chinese-language`, {
            method: 'POST',
            headers: {
                "referrer": `https://trovesaurus.com/mod=${modid}/chinese-language`,
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en,zh-CN;q=0.9,zh-TW;q=0.8,zh;q=0.7,en-US;q=0.6",
                "cache-control": "max-age=0",
                "content-type": "application/x-www-form-urlencoded",
                "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
            },
        }, (res) => {
            let data = new Uint8Array(0);
            res.on('data', (d) =>{
                const newData = new Uint8Array(data.length + d.length);
                newData.set(data);
                for(var i=0; i<d.length;i++){
                    newData[data.length+i] = d[i];
                }
                data=newData;
            });
            res.on('end', async() => {
                console.log("下载完成");
                const d = await jszip.loadAsync(data);
                await Promise.all(Object.keys(d.files).map((filename) => {
                    if(filename.endsWith(".binfab")){ 
                        console.log(`开始解压${filename}`);
                        const stream = d.files[filename].nodeStream();
                        return new Promise<void>(async (resilve, reject) => {
                            let data = new Uint8Array(0);
                            stream.on("data", async(d) => {
                                const newData = new Uint8Array(data.length + d.length);
                                newData.set(data);
                                for(var i=0; i<d.length;i++){
                                    newData[data.length+i] = d[i];
                                }
                                data=newData;
                            });
                            stream.on('end', async() => {
                                fs.writeFileSync("./cache/"+filename.substr(filename.lastIndexOf("/")),data);
                                resilve();
                                console.log(`${filename}解压完成`);
                            });
                        });
                    }
                    return Promise.resolve();
                }));
                resolve();
            });
        });
        req.write(`FileID=${fileid}&DownloadFile=download`);
        req.end();
    })
}


(async () => {
    const CACHE_DIR = "./cache";
    const OUT_DIR = "./liulianf-cn";
    console.log("开始获取文件id");
    if(fs.existsSync(OUT_DIR)){
        fs.rmSync(OUT_DIR, {recursive: true});
    }
    fs.mkdirSync(OUT_DIR);
    const fileId = await getFileID(9139);
    console.log(`获取文件id=${fileId}`);
    await download(9139, fileId);
    console.log("开始转换");
    if(fs.existsSync(OUT_DIR)){
        fs.rmSync(OUT_DIR, {recursive: true});
    }
    fs.mkdirSync(OUT_DIR);
    binfabs2TxtsWithLog(CACHE_DIR, OUT_DIR);
    console.log("转换完成");
})()
