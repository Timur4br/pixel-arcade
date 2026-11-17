/* Pure game rules, shared by the browser and Node tests. */
(function(root){
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b){for(const [a,c,d] of lines)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(Boolean)?'draw':null}
function bestTic(b,p){const other=p==='X'?'O':'X';let best=-Infinity,choice=-1;for(const i of [4,0,2,6,8,1,3,5,7])if(!b[i]){b[i]=p;const w=winner(b);const value=w?(w==='draw'?0:1):-solve(b,other);b[i]='';if(value>best){best=value;choice=i}}return choice}
function solve(b,p){const w=winner(b);if(w)return w==='draw'?0:w===p?1:-1;let best=-Infinity;for(let i=0;i<9;i++)if(!b[i]){b[i]=p;best=Math.max(best,-solve(b,p==='X'?'O':'X'));b[i]=''}return best}
function move2048(board,dir){const out=Array(16).fill(0);let score=0;for(let row=0;row<4;row++){const indices=Array.from({length:4},(_,col)=>dir==='left'?row*4+col:dir==='right'?row*4+3-col:dir==='up'?col*4+row:(3-col)*4+row);const vals=indices.map(i=>board[i]).filter(Boolean);const result=[];for(let j=0;j<vals.length;j++){if(vals[j]===vals[j+1]){result.push(vals[j]*2);score+=vals[j]*2;j++}else result.push(vals[j])}indices.forEach((i,k)=>out[i]=result[k]||0)}return {board:out,score,changed:out.some((v,i)=>v!==board[i])}}
const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function snakeNext(s,d,n=20){const a=dirs[d];return [(s[0][0]+a[0]+n)%n,(s[0][1]+a[1]+n)%n]}
function snakeBot(s,food,n=20){let best=-Infinity,choice='right';for(const d of Object.keys(dirs)){const p=snakeNext(s,d,n),eat=p[0]===food[0]&&p[1]===food[1];const blocked=new Set(s.slice(0,eat?s.length:-1).map(p=>p.join(',')));if(blocked.has(p.join(',')))continue;const queue=[p],seen=new Set([p.join(',')]);for(let i=0;i<queue.length;i++)for(const [dx,dy] of Object.values(dirs)){const q=[(queue[i][0]+dx+n)%n,(queue[i][1]+dy+n)%n],key=q.join(',');if(!seen.has(key)&&!blocked.has(key)){seen.add(key);queue.push(q)}}const dx=Math.abs(p[0]-food[0]),dy=Math.abs(p[1]-food[1]);const dist=Math.min(dx,n-dx)+Math.min(dy,n-dy);const value=seen.size*10-dist+(eat?15:0);if(value>best){best=value;choice=d}}return choice}
const api={winner,bestTic,move2048,dirs,snakeNext,snakeBot};if(typeof module!=='undefined')module.exports=api;else root.Rules=api;
})(globalThis);
