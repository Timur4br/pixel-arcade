/* Make the two map covers from the exact first playable level. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),c={};vm.createContext(c);for(const file of ['algorithms.js','course-levels.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);
const sprite=(name,x,y,size)=>'<image x="'+x+'" y="'+y+'" width="'+size+'" height="'+size+'" href="data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'assets',name+'.svg')).toString('base64')+'"/>';
for(const id of ['maze','wave']){
 const l=c.CourseLevels.levels[id][0],route=c.Algorithms.bfs(l).path,size=Math.min(280/l.w,146/l.h),left=(360-l.w*size)/2,top=(200-l.h*size)/2;
 let shapes='<rect width="360" height="200" fill="#142735"/><rect x="16" y="18" width="328" height="164" fill="none" stroke="#55727b" stroke-width="2"/>';
 for(let i=0;i<l.w*l.h;i++){const x=left+i%l.w*size,y=top+(i/l.w|0)*size;shapes+='<rect x="'+x+'" y="'+y+'" width="'+(size-1)+'" height="'+(size-1)+'" fill="'+(l.walls.includes(i)?'#263c46':id==='wave'&&route.includes(i)?'#4d7a70':'#3b6753')+'"/>';if(l.walls.includes(i))shapes+=sprite('wall',x,y,size-1)}
 const points=route.map(i=>(left+(i%l.w+.5)*size)+','+(top+((i/l.w|0)+.5)*size)).join(' ');shapes+='<polyline points="'+points+'" fill="none" stroke="#7bc5db" stroke-width="4"/>';
 shapes+=sprite('person',left+l.start%l.w*size,top+(l.start/l.w|0)*size,size);
 shapes+='<rect x="'+(left+(l.goal%l.w+.2)*size)+'" y="'+(top+((l.goal/l.w|0)+.2)*size)+'" width="'+size*.6+'" height="'+size*.6+'" fill="#db8b78"/>';
 fs.writeFileSync(path.join(root,'assets/previews',id+'.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="400" viewBox="0 0 360 200" shape-rendering="crispEdges">'+shapes+'</svg>');
}
