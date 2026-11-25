const pptxgen=require('pptxgenjs');const React=require('react');const S=require('react-dom/server');const sharp=require('sharp');
const gi=require('react-icons/gi');const fa6=require('react-icons/fa6');
const FONT='Meiryo';
const COL={blue:{c:'1E6BB8',t:'E6F0FA'},orange:{c:'D9730D',t:'FDF0E1'},red:{c:'C8352E',t:'FBE7E5'}};
const DARK='1F2937';
async function png(svg){return 'image/png;base64,'+(await sharp(Buffer.from(svg)).resize(300,300,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer()).toString('base64');}
const icon=(I,c)=>png(S.renderToStaticMarkup(React.createElement(I,{size:256,color:'#'+c})));
// custom illustrations
const vessel=c=>png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect x="10" y="55" width="180" height="90" rx="20" fill="#${c}"/><rect x="10" y="72" width="180" height="56" fill="#ffffff"/><rect x="10" y="78" width="180" height="44" fill="#${c}" opacity="0.35"/><path d="M60 72 Q85 108 110 72 Z" fill="#F2B632"/><path d="M95 128 Q125 96 150 128 Z" fill="#F2B632"/><circle cx="35" cy="100" r="6" fill="#${c}"/><circle cx="170" cy="100" r="6" fill="#${c}"/></svg>`);
const colon=c=>png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M55 175 L45 60 Q42 30 75 30 L130 30 Q160 30 158 60 L152 150 Q150 172 120 172 L105 172 L100 190" fill="none" stroke="#${c}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><g stroke="#ffffff" stroke-width="4" stroke-linecap="round"><line x1="33" y1="80" x2="58" y2="78"/><line x1="35" y1="115" x2="60" y2="112"/><line x1="37" y1="150" x2="62" y2="146"/><line x1="85" y1="17" x2="85" y2="43"/><line x1="120" y1="17" x2="120" y2="43"/><line x1="143" y1="80" x2="170" y2="82"/><line x1="141" y1="120" x2="167" y2="122"/></g></svg>`);
const cell=c=>png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path d="M100 18 C135 15 150 45 172 60 C195 80 180 115 182 135 C184 165 150 182 120 178 C95 186 60 190 40 165 C18 145 30 115 20 92 C12 60 45 25 100 18 Z" fill="#${c}"/><path d="M98 70 C125 62 138 85 132 105 C128 130 100 138 82 126 C62 112 70 76 98 70 Z" fill="#ffffff"/><circle cx="104" cy="100" r="13" fill="#${c}"/><circle cx="55" cy="70" r="7" fill="#ffffff"/><circle cx="150" cy="140" r="8" fill="#ffffff"/><circle cx="60" cy="150" r="6" fill="#ffffff"/></svg>`);

(async()=>{
const pres=new pptxgen();pres.layout='LAYOUT_WIDE';pres.title='肥満が健康に与える3つの影響';
pres.theme={headFontFace:FONT,bodyFontFace:FONT};
const s=pres.addSlide();s.background={color:'FFFFFF'};
const T=(text,o)=>s.addText(text,Object.assign({fontFace:FONT,color:DARK,margin:0,isTextBox:true,align:'center',valign:'middle'},o));
T('肥満が健康に与える3つの影響',{x:0.5,y:0.35,w:12.33,h:0.75,fontSize:36,bold:true});
const CW=4.1,xs=[0.5,0.5+CW+0.015,0.5+2*(CW+0.015)];
// thin dividers
[xs[1],xs[2]].forEach(x=>s.addShape(pres.shapes.LINE,{x:x-0.01,y:1.45,w:0,h:4.65,line:{color:'D9D9D9',width:1}}));
const arrow=(x,y,w,h,color,o={})=>s.addShape(pres.shapes.LINE,{x,y,w,h,flipH:!!o.flipH,flipV:!!o.flipV,line:{color,width:2,endArrowType:'triangle'}});
const cols=[
 {k:'blue',title:'① 生活習慣病',icons:[await icon(gi.GiFat,COL.blue.c),await icon(gi.GiHeartOrgan,COL.blue.c),await vessel(COL.blue.c)],alt:['内臓脂肪','心臓','血管'],
  flow:['内臓脂肪の増加','糖尿病・高血圧・脂質異常症','心筋梗塞・脳梗塞']},
 {k:'orange',title:'② 身体への負担',icons:[await icon(gi.GiKneeCap,COL.orange.c),await icon(gi.GiPersonInBed,COL.orange.c)],alt:['膝関節','睡眠中の人']},
 {k:'red',title:'③ がんのリスク',icons:[await cell(COL.red.c),await colon(COL.red.c),await icon(gi.GiLiver,COL.red.c)],alt:['細胞','大腸','肝臓'],
  flow:['慢性的な炎症','ホルモンバランスの変化','大腸がん・肝臓がんなど'],plus:true},
];
cols.forEach((col,i)=>{
 const x=xs[i],{c}=COL[col.k];const cx=x+CW/2;
 T(col.title,{x,y:1.4,w:CW,h:0.55,fontSize:26,bold:true,color:c});
 const D=0.85,n=col.icons.length,gap=0.35,tot=n*D+(n-1)*gap;
 col.icons.forEach((d,j)=>s.addImage({data:d,x:cx-tot/2+j*(D+gap),y:2.15,w:D,h:D,altText:col.alt[j]}));
 if(col.flow){
  const ys=[3.35,4.35,5.35],h=0.5;
  col.flow.forEach((f,j)=>T(f,{x:x+0.1,y:ys[j],w:CW-0.2,h,fontSize:j===2?22:19,bold:j===2,color:j===2?c:DARK}));
  if(col.plus)T('＋',{x:cx-0.25,y:ys[0]+h,w:0.5,h:0.5,fontSize:20,bold:true,color:c});
  else arrow(cx,ys[0]+h+0.08,0,0.34,c);
  arrow(cx,ys[1]+h+0.08,0,0.34,c);
 } else {
  T(['膝や腰への負担','睡眠時無呼吸症候群','運動能力の低下'].map((k,j)=>({text:k,options:{breakLine:j<2,paraSpaceAfter:4}})),{x:x+0.1,y:3.2,w:CW-0.2,h:1.15,fontSize:19});
  const pw=1.5,ph=0.6,lx=cx-1.85,rx=cx+0.35,ty=4.6,by=5.5;
  const node=(t,px,py,b)=>T(t,{x:px,y:py,w:pw,h:ph,fontSize:15,bold:b,color:b?c:DARK});
  node('体重増加',lx,ty,true);node('関節への負担',rx,ty);node('運動不足',rx,by);node('さらなる\n体重増加',lx,by,true);
  arrow(lx+pw+0.05,ty+ph/2,rx-lx-pw-0.1,0,c);
  arrow(rx+pw/2,ty+ph-0.05,0,by-ty-ph+0.1,c);
  arrow(lx+pw+0.05,by+ph/2,rx-lx-pw-0.1,0,c,{flipH:true});
  arrow(lx+pw/2,ty+ph-0.05,0,by-ty-ph+0.1,c,{flipV:true});
 }
});
T('肥満は体重だけの問題ではなく、全身の健康に影響を与える',{x:0.5,y:6.55,w:12.33,h:0.6,fontSize:24,bold:true});
s.addNotes('肥満は①生活習慣病、②身体への負担、③がんのリスクという3つの面から全身の健康に影響します。');
await pres.writeFile({fileName:'obesity_health_effects.pptx'});
})();
