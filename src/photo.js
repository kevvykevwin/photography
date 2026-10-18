import {lenses,films,scenarios,settingsResult,circleOfConfusion} from './optics.js';
const images=new Map();
export async function loadPhotos(){await Promise.all(scenarios.map(s=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images.set(s.id,img);resolve();};img.onerror=()=>reject(new Error(`Could not load the ${s.name.toLowerCase()} photograph.`));img.src=s.image;})));}
export function drawPhoto(canvas,state,{clean=false,viewfinder=false,preview=false}={}){
 const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,scene=scenarios.find(s=>s.id===state.scenario),img=images.get(scene.id);if(!img)return;
 const lens=lenses.find(l=>l.id===state.lens),result=settingsResult(state);let effectiveCoc=viewfinder?circleOfConfusion(lens.f,preview?state.aperture:lens.max,state.focus,scene.distance):result.coc;
 // A virtual 28mm plate; crops preserve 28/f ratios around one fixed optical axis.
 const ratio=W/H,ax=scene.anchor[0]*img.width,ay=scene.anchor[1]*img.height;
 const baseW=Math.min(2*Math.min(ax,img.width-ax),2*Math.min(ay,img.height-ay)*ratio);const sw=baseW*28/lens.f,sh=sw/ratio;
 let brightness=clean||viewfinder?1:Math.pow(2,Math.max(-4,Math.min(3,result.stops))*.45);
 if(viewfinder&&preview)brightness*=Math.pow(lens.max/state.aperture,1.1);
 const blur=clean?0:Math.min(16,effectiveCoc/36*W+(!viewfinder?result.shake*1.5:0));
 ctx.save();ctx.fillStyle='#18231d';ctx.fillRect(0,0,W,H);ctx.filter=`brightness(${brightness}) blur(${blur}px)`;
 ctx.drawImage(img,ax-sw/2,ay-sh/2,sw,sh,0,0,W,H);ctx.filter='none';
 if(!clean&&!viewfinder&&scene.speed&&result.movement>0.0001){const smear=Math.min(W*.12,result.movement*W);ctx.globalAlpha=.12;for(let i=1;i<=5;i++)ctx.drawImage(img,ax-sw/2,ay-sh/2,sw,sh,smear*i/5,0,W,H);ctx.globalAlpha=1;}
 if(!clean&&!viewfinder){ctx.globalCompositeOperation='soft-light';const tungsten=state.light==='tungsten',stock=films[state.film];ctx.fillStyle=stock.balance===3200&&!tungsten?'rgba(82,138,204,.32)':stock.balance===5500&&tungsten?'rgba(233,151,64,.37)':'rgba(188,166,120,.08)';ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';}
 if(viewfinder){const r=W*.065,cx=W/2,cy=H/2,shift=Math.min(22,effectiveCoc/36*W*2);if(shift>0.3){ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,0);ctx.closePath();ctx.clip();ctx.drawImage(canvas,shift,0);ctx.restore();}ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.moveTo(cx-r,cy);ctx.lineTo(cx+r,cy);ctx.stroke();}
 ctx.restore();
}
