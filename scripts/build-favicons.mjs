import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

// Export the approved, transparent vector. No redesign or background is added.
// Run with Sharp installed, or set OSTENVIA_SHARP_MODULE to its installed path.
const require=createRequire(import.meta.url);
const sharp=require(process.env.OSTENVIA_SHARP_MODULE||'sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=await fs.readFile(path.join(root,'public/assets/logos/favicon-transparent.svg'));
const png=size=>sharp(source,{density:384}).resize(size,size).png().toBuffer();

await fs.writeFile(path.join(root,'public/favicon.png'),await png(96));
await fs.writeFile(path.join(root,'public/apple-touch-icon.png'),await png(180));

// ICO supports PNG payloads; each entry retains the original alpha channel.
const sizes=[16,32,48,96,256];
const images=await Promise.all(sizes.map(png));
const directory=Buffer.alloc(6+16*sizes.length);
directory.writeUInt16LE(1,2);
directory.writeUInt16LE(sizes.length,4);
let offset=directory.length;
for(let i=0;i<sizes.length;i++){
 const entry=6+16*i;
 directory[entry]=sizes[i]===256?0:sizes[i];
 directory[entry+1]=directory[entry];
 directory.writeUInt16LE(1,entry+4);
 directory.writeUInt16LE(32,entry+6);
 directory.writeUInt32LE(images[i].length,entry+8);
 directory.writeUInt32LE(offset,entry+12);
 offset+=images[i].length;
}
await fs.writeFile(path.join(root,'public/favicon.ico'),Buffer.concat([directory,...images]));
console.log('Transparent favicons exported: PNG 96, Apple 180, ICO 16/32/48/96/256.');
