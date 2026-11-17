/* Build a GitHub Pages release that cannot mix files from different versions. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
require('./map-previews.cjs');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const data=file=>'data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,file)).toString('base64');
const assets={},covers={};
for(const file of fs.readdirSync(path.join(root,'assets')))if(file.endsWith('.svg'))assets[file.slice(0,-4)]=data('assets/'+file);
for(const file of fs.readdirSync(path.join(root,'assets/previews')))if(file.endsWith('.svg'))covers[file.slice(0,-4)]=data('assets/previews/'+file);
let html=read('tools/index.template.html');
function embedStaticImages(text){return text.replace(/assets\/[a-z0-9-]+\.svg/g,file=>data(file))}
html=html.replace(/<link rel="stylesheet" href="([^"?]+)(?:\?[^" ]*)?">/g,(_,file)=>'<style data-source="'+file+'">\n'+embedStaticImages(read(file))+'\n</style>');
let first=true;
html=html.replace(/<script src="([^"?]+)(?:\?[^" ]*)?"><\/script>/g,(_,file)=>{
 let js=read(file);
 js=js.replace("src=n=>'assets/'+n+'.svg'","src=n=>globalThis.PixelAssets[n]");
 js=js.replace('assets/${name}.svg','${globalThis.PixelAssets[name]}');
 js=js.replace('assets/previews/${g.id}.svg','${globalThis.PixelCovers[g.id]}');
 js=embedStaticImages(js);
 const prelude=first?'globalThis.PixelAssets='+JSON.stringify(assets)+';globalThis.PixelCovers='+JSON.stringify(covers)+';\n':'';first=false;
 return '<script data-source="'+file+'">\n'+prelude+js.replace(/<\/script/gi,'<\\/script')+'\n</script>';
});
const version=JSON.parse(read('version.json')).version;
const hash=crypto.createHash('sha256').update(html).digest('hex').slice(0,12);
html=html.replace('</head>','<meta name="pixel-build" content="'+version+'-'+hash+'"></head>');
fs.writeFileSync(path.join(root,'index.html'),html);
console.log('Built Пиксель '+version+' ('+hash+'): '+Buffer.byteLength(html)+' bytes, '+Object.keys(covers).length+' covers, no external app files.');
