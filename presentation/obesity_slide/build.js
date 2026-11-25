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
s.addText('肥満が健康に与える3つの影響',{x:0.45,y:0.3,w:12.43,h:0.75,fontFace:FONT,fontSize:38,bold:true,color:DARK,align:'center',valign:'middle',margin:0,isTextBox:true});

const CW=4.0,GAP=0.2167,CY=1.2,CH=5.05;const xs=[0.45,0.45+CW+GAP,0.45+2*(CW+GAP)];
const cols=[
 {k:'blue',title:'① 生活習慣病',icons:[await icon(gi.GiFat,COL.blue.c),await icon(gi.GiHeartOrgan,COL.blue.c),await vessel(COL.blue.c)],alt:['内臓脂肪','心臓','血管'],
  flow:['内臓脂肪の増加','糖尿病・高血圧・脂質異常症','心筋梗塞・脳梗塞']},
 {k:'orange',title:'② 身体への負担',icons:[await icon(gi.GiKneeCap,COL.orange.c),await icon(gi.GiPersonInBed,COL.orange.c),await icon(fa6.FaPersonWalking,COL.orange.c)],alt:['膝関節','睡眠中の人','運動']},
 {k:'red',title:'③ がんのリスク',icons:[await cell(COL.red.c),await colon(COL.red.c),await icon(gi.GiLiver,COL.red.c)],alt:['細胞','大腸','肝臓'],
  flow:['慢性的な炎症','ホルモンバランスの変化','大腸がん・肝臓がんなど'],plus:true},
];
const arrow=(x,y,w,h,color,o={})=>s.addShape(pres.shapes.LINE,{x,y,w,h,flipH:!!o.flipH,flipV:!!o.flipV,line:{color,width:3,endArrowType:'triangle'}});
cols.forEach((col,i)=>{
 const x=xs[i],{c,t}=COL[col.k];
 s.addShape(pres.shapes.ROUNDED_RECTANGLE,{x,y:CY,w:CW,h:CH,rectRadius:0.15,fill:{color:'FFFFFF'},line:{color:t,width:2},shadow:{type:'outer',color:'000000',opacity:0.12,blur:8,offset:2,angle:90},objectName:`card${i+1}`});
 s.addText(col.title,{x:x+0.15,y:CY+0.15,w:CW-0.3,h:0.65,shape:pres.shapes.ROUNDED_RECTANGLE,rectRadius:0.12,fill:{color:c},fontFace:FONT,fontSize:24,bold:true,color:'FFFFFF',align:'center',valign:'middle',margin:0});
 // icon row
 const D=0.95,iy=CY+0.95;const step=(CW-3*D)/4;
 col.icons.forEach((d,j)=>{const ix=x+step+j*(D+step);
  s.addShape(pres.shapes.OVAL,{x:ix,y:iy,w:D,h:D,fill:{color:t},line:{color:t,width:0}});
  s.addImage({data:d,x:ix+0.14,y:iy+0.14,w:D-0.28,h:D-0.28,altText:col.alt[j]});});
 if(col.flow){
  const bx=x+0.25,bw=CW-0.5,bh=0.65;const ys=[3.3,4.35,5.4];
  col.flow.forEach((f,j)=>{const last=j===2;
   s.addText(f,{x:bx,y:ys[j],w:bw,h:bh,shape:pres.shapes.ROUNDED_RECTANGLE,rectRadius:0.1,fill:{color:last?c:t},fontFace:FONT,fontSize:last?20:18,bold:true,color:last?'FFFFFF':DARK,align:'center',valign:'middle',margin:0});});
  if(col.plus){s.addText('＋',{x:x+CW/2-0.25,y:ys[0]+bh,w:0.5,h:ys[1]-ys[0]-bh,fontFace:FONT,fontSize:22,bold:true,color:c,align:'center',valign:'middle',margin:0,isTextBox:true});}
  else arrow(x+CW/2,ys[0]+bh+0.05,0,ys[1]-ys[0]-bh-0.1,c);
  arrow(x+CW/2,ys[1]+bh+0.05,0,ys[2]-ys[1]-bh-0.1,c);
 } else {
  // keywords
  const kw=['膝や腰への負担','睡眠時無呼吸症候群','運動能力の低下'];
  s.addText(kw.map((k,j)=>({text:k,options:{bullet:{code:'25CF'},breakLine:j<2,paraSpaceAfter:7}})),{x:x+0.65,y:3.15,w:CW-0.9,h:1.15,fontFace:FONT,fontSize:17,bold:true,color:DARK,valign:'middle',margin:0,isTextBox:true});
  // vicious cycle
  const pw=1.6,ph=0.62,lx=x+0.2,rx=x+CW-0.2-pw,ty=4.45,by=5.45;
  const pill=(txt,px,py,strong)=>s.addText(txt,{x:px,y:py,w:pw,h:ph,shape:pres.shapes.ROUNDED_RECTANGLE,rectRadius:0.3,fill:{color:strong?c:t},line:{color:c,width:1.5},fontFace:FONT,fontSize:14,bold:true,color:strong?'FFFFFF':DARK,align:'center',valign:'middle',margin:0});
  pill('体重増加',lx,ty,true);pill('関節への負担',rx,ty);pill('運動不足',rx,by);pill('さらなる\n体重増加',lx,by,true);
  arrow(lx+pw+0.05,ty+ph/2,rx-lx-pw-0.1,0,c);
  arrow(rx+pw/2,ty+ph+0.04,0,by-ty-ph-0.08,c);
  arrow(lx+pw+0.05,by+ph/2,rx-lx-pw-0.1,0,c,{flipH:true});
  arrow(lx+pw/2,ty+ph+0.04,0,by-ty-ph-0.08,c,{flipV:true});
  s.addText('悪循環',{x:x+CW/2-0.6,y:ty+ph,w:1.2,h:by-ty-ph,fontFace:FONT,fontSize:16,bold:true,color:c,align:'center',valign:'middle',margin:0,isTextBox:true});
 }
});
// summary
s.addText([{text:'肥満は体重だけの問題ではなく、',options:{color:'FFFFFF'}},{text:'全身の健康',options:{color:'FFD15C'}},{text:'に影響を与える',options:{color:'FFFFFF'}}],
 {x:0.45,y:6.45,w:12.43,h:0.72,shape:pres.shapes.ROUNDED_RECTANGLE,rectRadius:0.12,fill:{color:'1F2A44'},fontFace:FONT,fontSize:24,bold:true,align:'center',valign:'middle',margin:0});
s.addNotes('肥満は①生活習慣病、②身体への負担、③がんのリスクという3つの面から全身の健康に影響します。');
await pres.writeFile({fileName:'obesity_health_effects.pptx'});
})();
