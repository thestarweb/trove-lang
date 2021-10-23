import Stream from '@thestarweb/buff-stream';

/**
 * by star_ss
 * package: @thestarweb//trove-lang-tool
 */

export interface LangInfoItem{
    key:string;
    value:string;
}
const STRT_ARR=[0x3E,0xAE];
const END_ARR=[0xBE,0x03,0x08,0x00,0x08,0x1E];
const INTER_START=0x08;
const LOCA_START=0x18;

export function read(data:Uint8Array){
    const fd = new Stream(data);
    if(fd.readChar()!=STRT_ARR[0]||fd.readChar()!=STRT_ARR[1]){
		throw new Error("无效文件头");
	}
	const len=fd.readVarUInt();//词条数量
	fd.readChar();//一般是00，暂时不懂啥意思
	const list:LangInfoItem[]=[];
	let read_count=0;
	while(read_count<len){
		fd.readVarUInt();

		//读取国际化部分
		if(fd.readChar()!=INTER_START){
			throw new Error("无效国际化");
		}
		const str_int=fd.readStr();

		//读取本地化部分
		if(fd.readChar()!=LOCA_START){
			throw new Error("无效本地化");
		}
		const str_loca=fd.readStr();
		if(fd.check(END_ARR)!=END_ARR.length){
			throw new Error("无效词条结尾");
		}
		const item:LangInfoItem={key:str_int,value:str_loca};
		list.push(item);
		read_count++;
	}
    return list;
}

export function write(data:LangInfoItem[]){
    const fd = new Stream();
    fd.writeArr(STRT_ARR);
	fd.writeVarUInt(data.length);
	fd.writeUInt8(0);
    data.forEach((d, i)=>{
        fd.writeVarUInt((i<<4)|4);
        fd.writeUInt8(INTER_START);
        fd.writeStr(d.key);
        fd.writeUInt8(LOCA_START);
        fd.writeStr(d.value);
        fd.writeArr(END_ARR);
    })
	fd.writeArr([0x08,0x1E]);
	return fd.getData();
}

export default { read, write };