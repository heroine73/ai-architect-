// AI Architect — Client-Side Floor Plan Engine v4
// 프레젠테이션급: 이중선 벽체, 가구심볼, 파스텔존, 치수선, 문arc

var S=0.08,PAD=70,EW=200,IW=120,SETBK=1500;
var ZC={
  living:{bg:'#FFF8E7',b:'#E8D5A8'},bed:{bg:'#F0F4FF',b:'#B8C8E8'},
  kitchen:{bg:'#FFF3E0',b:'#E8C8A0'},bath:{bg:'#E8F5F0',b:'#A8D8C8'},
  entrance:{bg:'#F5F0EB',b:'#D8C8B0'},hall:{bg:'#F8F6F2',b:'#D8D0C4'},
  storage:{bg:'#F2F2F2',b:'#C8C8C8'},balcony:{bg:'#F0F8F0',b:'#B0D8B0'},
  study:{bg:'#F5F0FF',b:'#C8B8E8'},dress:{bg:'#FFF0F5',b:'#E8C0D0'},
  utility:{bg:'#F0F5F5',b:'#B0C8C8'}
};
function px(v){return v*S;}
function zc(t){return ZC[t]||ZC.hall;}
function inferType(n){
  n=(n||'').toLowerCase();
  if(/거실|living/.test(n))return'living';
  if(/주방|부엌|kitchen|식당/.test(n))return'kitchen';
  if(/욕실|화장실|bath|toilet/.test(n))return'bath';
  if(/현관|entrance/.test(n))return'entrance';
  if(/복도|홀|hall/.test(n))return'hall';
  if(/수납|창고|팬트리/.test(n))return'storage';
  if(/발코니|베란다/.test(n))return'balcony';
  if(/서재|공부|작업/.test(n))return'study';
  if(/드레스|옷방/.test(n))return'dress';
  if(/다용도|세탁/.test(n))return'utility';
  return'bed';
}

function furn(type,rx,ry,rw,rh){
  var o='',sc='#999',sw=0.5;
  if(type==='bath'){
    var tx=rx+rw*0.6,ty=ry+rh*0.2;
    o+='<rect x="'+tx+'" y="'+ty+'" width="7" height="9" rx="1.5" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    o+='<ellipse cx="'+(tx+3.5)+'" cy="'+(ty+3)+'" rx="2.5" ry="1.5" fill="none" stroke="'+sc+'" stroke-width="0.3"/>';
    var sx=rx+rw*0.2,sy=ry+rh*0.2;
    o+='<rect x="'+sx+'" y="'+sy+'" width="9" height="6" rx="1" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    o+='<ellipse cx="'+(sx+4.5)+'" cy="'+(sy+3)+'" rx="2.5" ry="1.5" fill="none" stroke="'+sc+'" stroke-width="0.3"/>';
  }
  if(type==='kitchen'){
    var kx=rx+rw*0.1,ky=ry+3,kw=rw*0.8;
    o+='<rect x="'+kx+'" y="'+ky+'" width="'+kw+'" height="8" rx="0.5" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    o+='<circle cx="'+(kx+kw*0.35)+'" cy="'+(ky+4)+'" r="2.5" fill="none" stroke="'+sc+'" stroke-width="0.3"/>';
    o+='<circle cx="'+(kx+kw*0.65)+'" cy="'+(ky+4)+'" r="2.5" fill="none" stroke="'+sc+'" stroke-width="0.3"/>';
  }
  if(type==='entrance'){
    var bx=rx+3,by=ry+3,bw=rw*0.25,bh=rh*0.5;
    o+='<rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="0.5" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    for(var j=1;j<4;j++){o+='<line x1="'+bx+'" y1="'+(by+bh*j/4)+'" x2="'+(bx+bw)+'" y2="'+(by+bh*j/4)+'" stroke="'+sc+'" stroke-width="0.25"/>';}
  }
  if(type==='utility'){
    var wx=rx+rw*0.3,wy=ry+rh*0.3;
    o+='<rect x="'+wx+'" y="'+wy+'" width="9" height="9" rx="1" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    o+='<circle cx="'+(wx+4.5)+'" cy="'+(wy+4.5)+'" r="3" fill="none" stroke="'+sc+'" stroke-width="0.3"/>';
  }
  if(type==='bed'){
    var bw2=Math.min(rw*0.5,25),bh2=Math.min(rh*0.4,20);
    var bx2=rx+rw/2-bw2/2,by2=ry+rh*0.55-bh2/2;
    o+='<rect x="'+bx2+'" y="'+by2+'" width="'+bw2+'" height="'+bh2+'" rx="1" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    o+='<rect x="'+(bx2+1.5)+'" y="'+(by2+1)+'" width="'+(bw2-3)+'" height="3" rx="0.5" fill="none" stroke="'+sc+'" stroke-width="0.25"/>';
  }
  if(type==='living'){
    var sw2=Math.min(rw*0.45,30),sh2=6;
    var sx2=rx+rw/2-sw2/2,sy2=ry+rh*0.65;
    o+='<rect x="'+sx2+'" y="'+sy2+'" width="'+sw2+'" height="'+sh2+'" rx="1.5" fill="none" stroke="'+sc+'" stroke-width="'+sw+'"/>';
    o+='<rect x="'+sx2+'" y="'+(sy2+sh2-1.5)+'" width="'+sw2+'" height="2.5" rx="0.5" fill="none" stroke="'+sc+'" stroke-width="0.25"/>';
    var tw2=sw2*0.35,th2=5;
    o+='<rect x="'+(sx2+sw2/2-tw2/2)+'" y="'+(sy2-th2-3)+'" width="'+tw2+'" height="'+th2+'" rx="0.5" fill="none" stroke="'+sc+'" stroke-width="0.3"/>';
  }
  return o;
}

function generateFloorPlanLocal(lWm,lHm,dir,specs){
  var lW=lWm*1000,lH=lHm*1000;
  var bW=Math.min(lW-SETBK*2,Math.floor(Math.sqrt(lW*lH*0.6*((lW-SETBK*2)/(lH-SETBK*2)))/100)*100);
  var bH=Math.min(lH-SETBK*2,Math.floor((lW*lH*0.6/bW)/100)*100);
  var bX=(lW-bW)/2,bY=(lH-bH)/2;
  var inW=bW-EW*2,inH=bH-EW*2;

  // 행 기반 배치 — 입력 치수를 그대로 유지 (비율 확대 없음)
  var rows=[],ri=0;
  while(ri<specs.length){
    var row={items:[],h:0},cx=0;
    while(ri<specs.length){
      var sw2=specs[ri].width*1000;
      if(cx>0&&cx+sw2>inW+50)break;
      row.h=Math.max(row.h,specs[ri].height*1000);
      row.items.push({spec:specs[ri],x:cx,w:sw2});
      cx+=sw2;ri++;
    }
    // 가로 중앙 정렬 (확대 없음)
    var tw=row.items.reduce(function(s,i){return s+i.w;},0);
    var hpad=Math.max((inW-tw)/2,0);
    var xx=hpad;
    row.items.forEach(function(i){i.x=xx;xx+=i.w;});
    rows.push(row);
  }
  // 세로 중앙 정렬 (확대 없음)
  var tH=rows.reduce(function(s,r){return s+r.h;},0);
  var vpad=Math.max((inH-tH)/2,0);
  var yy=vpad;
  rows.forEach(function(r){r.y=yy;yy+=r.h;});

  var laid=[];
  rows.forEach(function(row,ri2){
    row.items.forEach(function(it,ci){
      laid.push({name:it.spec.name,type:inferType(it.spec.name),
        x:EW+it.x,y:EW+row.y,w:it.w,h:row.h,
        specW:it.spec.width*1000,specH:it.spec.height*1000,
        isTop:ri2===0,isBot:ri2===rows.length-1,
        isLeft:ci===0,isRight:ci===row.items.length-1});
    });
  });

  // 실제 방 합계 면적 (입력 치수 기준)
  var roomTotalSqm=0;
  for(var i=0;i<specs.length;i++) roomTotalSqm+=specs[i].width*specs[i].height;
  var bA=roomTotalSqm,lA=lWm*lHm;
  var cov=(bA/lA*100).toFixed(1),py=(bA/3.306).toFixed(1);

  // SVG
  var svgW=px(lW)+PAD*2+90,svgH=px(lH)+PAD*2+75;
  var lx=PAD,ly=PAD+38;
  var ox=px(bX)+lx,oy=px(bY)+ly;
  var ewPx=px(EW),iwPx=px(IW);

  var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+svgW+' '+svgH+'">';
  o+='<defs><filter id="ds" x="-2%" y="-2%" width="104%" height="104%"><feDropShadow dx="0.4" dy="0.4" stdDeviation="0.6" flood-opacity="0.06"/></filter></defs>';

  // 배경
  o+='<rect width="'+svgW+'" height="'+svgH+'" fill="#FAFAF6"/>';

  // 타이틀
  o+='<rect x="'+(svgW/2-110)+'" y="3" width="220" height="28" rx="3" fill="#FFF" stroke="#E0DDD5" stroke-width="0.4" filter="url(#ds)"/>';
  o+='<text x="'+(svgW/2)+'" y="16" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#222" font-weight="700">1F 평면도 — '+dir+'</text>';
  o+='<text x="'+(svgW/2)+'" y="30" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#666">대지 '+lWm+'×'+lHm+'m ('+lA.toFixed(1)+'㎡) · 건축 '+bA.toFixed(1)+'㎡ ('+py+'평) · 건폐율 '+cov+'%</text>';

  // 대지 경계
  o+='<rect x="'+lx+'" y="'+ly+'" width="'+px(lW)+'" height="'+px(lH)+'" fill="none" stroke="#C0B8A8" stroke-width="0.5" stroke-dasharray="3,2"/>';
  o+='<text x="'+(lx+2)+'" y="'+(ly-2)+'" font-family="sans-serif" font-size="5" fill="#A09880">대지경계</text>';

  // 건물 그림자
  o+='<rect x="'+(ox+1)+'" y="'+(oy+1)+'" width="'+px(bW)+'" height="'+px(bH)+'" fill="#E0DDD5" rx="0.5" opacity="0.3"/>';

  // 방 바닥
  for(var i=0;i<laid.length;i++){
    var rm=laid[i],z=zc(rm.type);
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    o+='<rect x="'+rx+'" y="'+ry+'" width="'+rw+'" height="'+rh+'" fill="'+z.bg+'"/>';
  }

  // 내벽 (이중선)
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var g=Math.max(iwPx*0.5,1);
    o+='<line x1="'+rx+'" y1="'+ry+'" x2="'+(rx+rw)+'" y2="'+ry+'" stroke="#555" stroke-width="0.7"/>';
    o+='<line x1="'+rx+'" y1="'+(ry+g)+'" x2="'+(rx+rw)+'" y2="'+(ry+g)+'" stroke="#555" stroke-width="0.35"/>';
    o+='<line x1="'+rx+'" y1="'+(ry+rh)+'" x2="'+(rx+rw)+'" y2="'+(ry+rh)+'" stroke="#555" stroke-width="0.7"/>';
    o+='<line x1="'+rx+'" y1="'+(ry+rh-g)+'" x2="'+(rx+rw)+'" y2="'+(ry+rh-g)+'" stroke="#555" stroke-width="0.35"/>';
    o+='<line x1="'+rx+'" y1="'+ry+'" x2="'+rx+'" y2="'+(ry+rh)+'" stroke="#555" stroke-width="0.7"/>';
    o+='<line x1="'+(rx+g)+'" y1="'+ry+'" x2="'+(rx+g)+'" y2="'+(ry+rh)+'" stroke="#555" stroke-width="0.35"/>';
    o+='<line x1="'+(rx+rw)+'" y1="'+ry+'" x2="'+(rx+rw)+'" y2="'+(ry+rh)+'" stroke="#555" stroke-width="0.7"/>';
    o+='<line x1="'+(rx+rw-g)+'" y1="'+ry+'" x2="'+(rx+rw-g)+'" y2="'+(ry+rh)+'" stroke="#555" stroke-width="0.35"/>';
  }

  // 외벽
  var bxp=ox,byp=oy,bwp=px(bW),bhp=px(bH);
  var ew2=Math.max(ewPx,3);
  o+='<rect x="'+bxp+'" y="'+byp+'" width="'+bwp+'" height="'+bhp+'" fill="none" stroke="#333" stroke-width="2.2"/>';
  o+='<rect x="'+(bxp+ew2)+'" y="'+(byp+ew2)+'" width="'+(bwp-ew2*2)+'" height="'+(bhp-ew2*2)+'" fill="none" stroke="#333" stroke-width="0.8"/>';
  // 외벽 사이 채움
  o+='<rect x="'+(bxp+1)+'" y="'+(byp+1)+'" width="'+(bwp-2)+'" height="'+(ew2-1)+'" fill="#E8E5E0" opacity="0.4"/>';
  o+='<rect x="'+(bxp+1)+'" y="'+(byp+bhp-ew2)+'" width="'+(bwp-2)+'" height="'+(ew2-1)+'" fill="#E8E5E0" opacity="0.4"/>';
  o+='<rect x="'+(bxp+1)+'" y="'+(byp+ew2)+'" width="'+(ew2-1)+'" height="'+(bhp-ew2*2)+'" fill="#E8E5E0" opacity="0.4"/>';
  o+='<rect x="'+(bxp+bwp-ew2)+'" y="'+(byp+ew2)+'" width="'+(ew2-1)+'" height="'+(bhp-ew2*2)+'" fill="#E8E5E0" opacity="0.4"/>';

  // 문
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var dw=Math.min(rw*0.2,px(900));if(dw<4)dw=4;
    var g2=Math.max(iwPx*0.5,1);
    if(rm.type==='entrance'){
      var dx=rx+rw/2-dw/2;
      o+='<rect x="'+(dx-1)+'" y="'+(byp+bhp-ew2-1)+'" width="'+(dw+2)+'" height="'+(ew2+2)+'" fill="'+zc(rm.type).bg+'"/>';
      o+='<line x1="'+dx+'" y1="'+(byp+bhp)+'" x2="'+dx+'" y2="'+(byp+bhp+dw)+'" stroke="#333" stroke-width="0.8"/>';
      o+='<path d="M '+dx+' '+(byp+bhp+dw)+' A '+dw+' '+dw+' 0 0 1 '+(dx+dw)+' '+(byp+bhp)+'" fill="none" stroke="#333" stroke-width="0.5"/>';
      o+='<text x="'+(dx+dw/2)+'" y="'+(byp+bhp+dw+7)+'" text-anchor="middle" font-family="sans-serif" font-size="5" fill="#6A9F6A" font-weight="600">▲ IN</text>';
    }else{
      var dx2=rx+rw*0.12;
      o+='<rect x="'+(dx2-0.5)+'" y="'+(ry+rh-g2-0.5)+'" width="'+(dw+1)+'" height="'+(g2+1)+'" fill="'+zc(rm.type).bg+'"/>';
      o+='<line x1="'+dx2+'" y1="'+(ry+rh-g2)+'" x2="'+dx2+'" y2="'+(ry+rh-g2-dw*0.7)+'" stroke="#555" stroke-width="0.6"/>';
      o+='<path d="M '+dx2+' '+(ry+rh-g2-dw*0.7)+' A '+(dw*0.7)+' '+(dw*0.7)+' 0 0 1 '+(dx2+dw*0.7)+' '+(ry+rh-g2)+'" fill="none" stroke="#555" stroke-width="0.4"/>';
    }
  }

  // 창문 (3선)
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    if(rm.type==='bath'||rm.type==='storage'||rm.type==='entrance'||rm.type==='hall'||rm.type==='utility')continue;
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var ww=Math.min(rw*0.35,px(1500));if(ww<6)ww=6;
    if(rm.isTop){
      var wx=rx+rw*0.3;
      o+='<rect x="'+(wx-0.5)+'" y="'+(byp-0.5)+'" width="'+(ww+1)+'" height="'+(ew2+1)+'" fill="'+zc(rm.type).bg+'"/>';
      o+='<line x1="'+wx+'" y1="'+(byp+ew2*0.2)+'" x2="'+(wx+ww)+'" y2="'+(byp+ew2*0.2)+'" stroke="#666" stroke-width="1"/>';
      o+='<line x1="'+wx+'" y1="'+(byp+ew2*0.5)+'" x2="'+(wx+ww)+'" y2="'+(byp+ew2*0.5)+'" stroke="#666" stroke-width="0.5"/>';
      o+='<line x1="'+wx+'" y1="'+(byp+ew2*0.8)+'" x2="'+(wx+ww)+'" y2="'+(byp+ew2*0.8)+'" stroke="#666" stroke-width="1"/>';
    }
    if(rm.isLeft){
      var wy=ry+rh*0.25,wh=Math.min(rh*0.35,px(1500));
      o+='<rect x="'+(bxp-0.5)+'" y="'+(wy-0.5)+'" width="'+(ew2+1)+'" height="'+(wh+1)+'" fill="'+zc(rm.type).bg+'"/>';
      o+='<line x1="'+(bxp+ew2*0.2)+'" y1="'+wy+'" x2="'+(bxp+ew2*0.2)+'" y2="'+(wy+wh)+'" stroke="#666" stroke-width="1"/>';
      o+='<line x1="'+(bxp+ew2*0.5)+'" y1="'+wy+'" x2="'+(bxp+ew2*0.5)+'" y2="'+(wy+wh)+'" stroke="#666" stroke-width="0.5"/>';
      o+='<line x1="'+(bxp+ew2*0.8)+'" y1="'+wy+'" x2="'+(bxp+ew2*0.8)+'" y2="'+(wy+wh)+'" stroke="#666" stroke-width="1"/>';
    }
    if(rm.isRight){
      var wy=ry+rh*0.25,wh=Math.min(rh*0.35,px(1500));
      var wrx=bxp+bwp-ew2;
      o+='<rect x="'+(wrx-0.5)+'" y="'+(wy-0.5)+'" width="'+(ew2+1)+'" height="'+(wh+1)+'" fill="'+zc(rm.type).bg+'"/>';
      o+='<line x1="'+(wrx+ew2*0.2)+'" y1="'+wy+'" x2="'+(wrx+ew2*0.2)+'" y2="'+(wy+wh)+'" stroke="#666" stroke-width="1"/>';
      o+='<line x1="'+(wrx+ew2*0.5)+'" y1="'+wy+'" x2="'+(wrx+ew2*0.5)+'" y2="'+(wy+wh)+'" stroke="#666" stroke-width="0.5"/>';
      o+='<line x1="'+(wrx+ew2*0.8)+'" y1="'+wy+'" x2="'+(wrx+ew2*0.8)+'" y2="'+(wy+wh)+'" stroke="#666" stroke-width="1"/>';
    }
  }

  // 가구
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    o+=furn(rm.type,px(rm.x)+ox,px(rm.y)+oy,px(rm.w),px(rm.h));
  }

  // 라벨
  for(var i=0;i<laid.length;i++){
    var rm=laid[i],z=zc(rm.type);
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var sw=rm.specW||rm.w,sh=rm.specH||rm.h;
    var aSqm=(sw/1000)*(sh/1000),aPy=(aSqm/3.306).toFixed(1);
    var cx=rx+rw/2,cy=ry+rh/2;
    var fs=Math.min(9,rw/6,rh/5);if(fs<5)fs=5;
    // 라벨 배경 카드
    var lbw=fs*rm.name.length*0.7+12,lbh=fs*2.2;
    o+='<rect x="'+(cx-lbw/2)+'" y="'+(cy-lbh/2-fs*0.3)+'" width="'+lbw+'" height="'+lbh+'" rx="2" fill="#FFF" opacity="0.75"/>';
    o+='<text x="'+cx+'" y="'+(cy-fs*0.1)+'" text-anchor="middle" font-family="sans-serif" font-size="'+fs+'" fill="#333" font-weight="600">'+rm.name+'</text>';
    o+='<text x="'+cx+'" y="'+(cy+fs*0.9)+'" text-anchor="middle" font-family="sans-serif" font-size="'+(fs*0.75)+'" fill="#666" font-weight="500">'+aPy+'평</text>';
  }

  // 치수선 — 건물
  o+=dimH(bxp,byp+bhp,bxp+bwp,(bW/1000).toFixed(1)+'m',16);
  o+=dimV(bxp+bwp,byp,byp+bhp,(bH/1000).toFixed(1)+'m',16);
  // 치수선 — 대지
  o+=dimH(lx,ly+px(lH),lx+px(lW),lWm+'m',35);
  o+=dimV(lx+px(lW),ly,ly+px(lH),lHm+'m',35);

  // 우측 방별 면적 표기
  var rsx=lx+px(lW)+48;
  o+='<text x="'+rsx+'" y="'+(ly+8)+'" font-family="sans-serif" font-size="9" fill="#333" font-weight="700">면적표</text>';
  o+='<line x1="'+(rsx-3)+'" y1="'+(ly+12)+'" x2="'+(rsx+45)+'" y2="'+(ly+12)+'" stroke="#CCC" stroke-width="0.4"/>';
  for(var i=0;i<laid.length;i++){
    var rm=laid[i],z=zc(rm.type);
    var sw=rm.specW||rm.w,sh=rm.specH||rm.h;
    var aSqm=(sw/1000)*(sh/1000),aPy=(aSqm/3.306).toFixed(1);
    var ry2=ly+22+i*16;
    o+='<rect x="'+(rsx-3)+'" y="'+(ry2-5)+'" width="6" height="6" rx="1" fill="'+z.bg+'" stroke="'+z.b+'" stroke-width="0.3"/>';
    o+='<text x="'+(rsx+8)+'" y="'+ry2+'" font-family="sans-serif" font-size="8" fill="#333" font-weight="500">'+rm.name+'</text>';
    o+='<text x="'+(rsx+8)+'" y="'+(ry2+9)+'" font-family="sans-serif" font-size="7" fill="#777">'+aPy+'평</text>';
  }

  // 나침반
  var ncx=lx+px(lW)-20,ncy=ly+18;
  o+='<circle cx="'+ncx+'" cy="'+ncy+'" r="10" fill="#FFF" stroke="#CCC" stroke-width="0.3" opacity="0.8"/>';
  o+='<polygon points="'+ncx+','+(ncy-8)+' '+(ncx-2.5)+','+(ncy-2)+' '+(ncx+2.5)+','+(ncy-2)+'" fill="#D44"/>';
  o+='<polygon points="'+ncx+','+(ncy+8)+' '+(ncx-2.5)+','+(ncy+2)+' '+(ncx+2.5)+','+(ncy+2)+'" fill="#AAA"/>';
  o+='<text x="'+ncx+'" y="'+(ncy-10)+'" text-anchor="middle" font-family="sans-serif" font-size="6" fill="#D44" font-weight="700">N</text>';

  o+='</svg>';
  return o;
}

function dimH(x1,y,x2,label,off){
  var dy=y+off,s='';
  s+='<line x1="'+x1+'" y1="'+y+'" x2="'+x1+'" y2="'+(dy+3)+'" stroke="#999" stroke-width="0.3"/>';
  s+='<line x1="'+x2+'" y1="'+y+'" x2="'+x2+'" y2="'+(dy+3)+'" stroke="#999" stroke-width="0.3"/>';
  s+='<line x1="'+x1+'" y1="'+dy+'" x2="'+x2+'" y2="'+dy+'" stroke="#333" stroke-width="0.5"/>';
  s+='<line x1="'+x1+'" y1="'+(dy-3.5)+'" x2="'+x1+'" y2="'+(dy+3.5)+'" stroke="#333" stroke-width="0.8"/>';
  s+='<line x1="'+x2+'" y1="'+(dy-3.5)+'" x2="'+x2+'" y2="'+(dy+3.5)+'" stroke="#333" stroke-width="0.8"/>';
  s+='<text x="'+((x1+x2)/2)+'" y="'+(dy-4.5)+'" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#333" font-weight="600">'+label+'</text>';
  return s;
}

function dimV(x,y1,y2,label,off){
  var dx=x+off,s='',mid=(y1+y2)/2;
  s+='<line x1="'+x+'" y1="'+y1+'" x2="'+(dx+3)+'" y2="'+y1+'" stroke="#999" stroke-width="0.3"/>';
  s+='<line x1="'+x+'" y1="'+y2+'" x2="'+(dx+3)+'" y2="'+y2+'" stroke="#999" stroke-width="0.3"/>';
  s+='<line x1="'+dx+'" y1="'+y1+'" x2="'+dx+'" y2="'+y2+'" stroke="#333" stroke-width="0.5"/>';
  s+='<line x1="'+(dx-3.5)+'" y1="'+y1+'" x2="'+(dx+3.5)+'" y2="'+y1+'" stroke="#333" stroke-width="0.8"/>';
  s+='<line x1="'+(dx-3.5)+'" y1="'+y2+'" x2="'+(dx+3.5)+'" y2="'+y2+'" stroke="#333" stroke-width="0.8"/>';
  s+='<text x="'+(dx+3)+'" y="'+(mid+3)+'" text-anchor="start" font-family="sans-serif" font-size="9" fill="#333" font-weight="600" transform="rotate(-90,'+(dx+3)+','+(mid+3)+')">'+label+'</text>';
  return s;
}