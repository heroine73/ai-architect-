// AI Architect — Client-Side Floor Plan Engine v3
// 건축 도면 수준: 두꺼운 벽체, 문 arc, 창문 이중선, 치수선, 빈틈없는 배치

var S = 0.06;
var PAD = 60;
var EW = 200;
var IW = 120;
var SETBK = 1500;

var C = {
  extWall:'#2A2A2A', intWall:'#4A4A4A',
  wood:'#D4B896', wg1:'#C8A882', wg2:'#BEAA80',
  tile:'#D8D8D8', tg:'#C0C0C0',
  kitch:'#E0D5C0', balc:'#E8E8E8', entr:'#C8B8A0',
  dim:'#333', lbl:'#222', area:'#666', sub:'#888',
  door:'#333', win:'#555',
  bg:'#FFF', site:'#999'
};

function px(v){return v*S;}

function inferType(n){
  n=(n||'').toLowerCase();
  if(/거실|living/.test(n))return'living';
  if(/주방|부엌|kitchen|식당/.test(n))return'kitchen';
  if(/욕실|화장실|bath|toilet/.test(n))return'bath';
  if(/현관|entrance/.test(n))return'entrance';
  if(/복도|홀|hall/.test(n))return'hall';
  if(/수납|창고|팬트리|storage/.test(n))return'storage';
  if(/발코니|베란다|balcon/.test(n))return'balcony';
  if(/서재|공부|작업|study/.test(n))return'study';
  if(/드레스|옷방/.test(n))return'dress';
  if(/다용도|세탁|utility/.test(n))return'utility';
  return'bed';
}

function rf(t){
  if('living bed hall study dress'.indexOf(t)>=0)return'url(#pw)';
  if(t==='kitchen')return'url(#pk)';
  if(t==='bath'||t==='utility')return'url(#pt)';
  if(t==='entrance')return'url(#pe)';
  if(t==='balcony')return C.balc;
  return'#EDE5D8';
}

function generateFloorPlanLocal(lWm,lHm,dir,specs){
  var lW=lWm*1000,lH=lHm*1000;
  var bW=Math.min(lW-SETBK*2,Math.floor(Math.sqrt(lW*lH*0.6*((lW-SETBK*2)/(lH-SETBK*2)))/100)*100);
  var bH=Math.min(lH-SETBK*2,Math.floor((lW*lH*0.6/bW)/100)*100);
  var bX=(lW-bW)/2,bY=(lH-bH)/2;
  var inW=bW-EW*2,inH=bH-EW*2;

  // === 빈틈없는 행 기반 배치 ===
  var rows=[],ri=0;
  while(ri<specs.length){
    var row={items:[],h:0},cx=0;
    while(ri<specs.length){
      var sw=specs[ri].width*1000;
      if(cx>0&&cx+sw>inW+50)break;
      row.h=Math.max(row.h,specs[ri].height*1000);
      row.items.push({spec:specs[ri],x:cx,w:sw});
      cx+=sw; ri++;
    }
    // 가로 비율 분배
    var tw=row.items.reduce(function(s,i){return s+i.w;},0);
    if(tw<inW){
      var ex=inW-tw;
      row.items.forEach(function(i){i.w+=Math.round(ex*(i.w/tw));});
      var sm=row.items.reduce(function(s,i){return s+i.w;},0);
      row.items[row.items.length-1].w+=(inW-sm);
      var xx=0;row.items.forEach(function(i){i.x=xx;xx+=i.w;});
    }
    rows.push(row);
  }
  // 세로 비율 분배
  var tH=rows.reduce(function(s,r){return s+r.h;},0);
  if(tH<inH){
    var exH=inH-tH;
    rows.forEach(function(r){r.h+=Math.round(exH*(r.h/tH));});
    var sH=rows.reduce(function(s,r){return s+r.h;},0);
    rows[rows.length-1].h+=(inH-sH);
  }
  var yy=0;rows.forEach(function(r){r.y=yy;yy+=r.h;});

  var laid=[];
  rows.forEach(function(row){
    row.items.forEach(function(it){
      laid.push({name:it.spec.name,type:inferType(it.spec.name),
        x:EW+it.x,y:EW+row.y,w:it.w,h:row.h});
    });
  });

  var bA=(bW/1000)*(bH/1000),lA=lWm*lHm;
  var cov=(bA/lA*100).toFixed(1),py=(bA/3.306).toFixed(1);

  // === SVG ===
  var sw=px(lW)+PAD*2+80,sh=px(lH)+PAD*2+90;
  var lx=PAD+20,ly=PAD+44;
  var ox=px(bX)+lx,oy=px(bY)+ly;
  var ewPx=px(EW),iwPx=px(IW);

  var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+sw+' '+sh+'">';

  // Defs
  o+='<defs>';
  o+='<pattern id="pw" width="16" height="4" patternUnits="userSpaceOnUse">';
  o+='<rect width="16" height="4" fill="'+C.wood+'"/>';
  o+='<line x1="0" y1="1.5" x2="16" y2="1.5" stroke="'+C.wg1+'" stroke-width="0.3" opacity="0.5"/>';
  o+='<line x1="0" y1="3.2" x2="16" y2="3.2" stroke="'+C.wg2+'" stroke-width="0.2" opacity="0.3"/>';
  o+='</pattern>';
  o+='<pattern id="pt" width="6" height="6" patternUnits="userSpaceOnUse">';
  o+='<rect width="6" height="6" fill="'+C.tile+'"/>';
  o+='<line x1="0" y1="0" x2="6" y2="0" stroke="'+C.tg+'" stroke-width="0.4"/>';
  o+='<line x1="0" y1="0" x2="0" y2="6" stroke="'+C.tg+'" stroke-width="0.4"/>';
  o+='</pattern>';
  o+='<pattern id="pk" width="16" height="4" patternUnits="userSpaceOnUse">';
  o+='<rect width="16" height="4" fill="'+C.kitch+'"/>';
  o+='<line x1="0" y1="2" x2="16" y2="2" stroke="#D5C8B0" stroke-width="0.2" opacity="0.4"/>';
  o+='</pattern>';
  o+='<pattern id="pe" width="8" height="8" patternUnits="userSpaceOnUse">';
  o+='<rect width="8" height="8" fill="'+C.entr+'"/>';
  o+='<rect width="4" height="4" fill="#BFA888" opacity="0.3"/>';
  o+='<rect x="4" y="4" width="4" height="4" fill="#BFA888" opacity="0.3"/>';
  o+='</pattern>';
  o+='</defs>';

  // 배경
  o+='<rect width="'+sw+'" height="'+sh+'" fill="'+C.bg+'"/>';

  // 타이틀 블록
  o+='<text x="'+(sw/2)+'" y="18" text-anchor="middle" font-family="sans-serif" font-size="13" fill="'+C.lbl+'" font-weight="700">단독주택 평면도</text>';
  o+='<text x="'+(sw/2)+'" y="32" text-anchor="middle" font-family="sans-serif" font-size="8.5" fill="'+C.sub+'">'+
    dir+' | 대지 '+lWm+'m×'+lHm+'m ('+lA.toFixed(1)+'㎡) | '+
    '건축면적 '+bA.toFixed(1)+'㎡ ('+py+'평) | 건폐율 '+cov+'% | 1:100</text>';

  // 대지 경계
  o+='<rect x="'+lx+'" y="'+ly+'" width="'+px(lW)+'" height="'+px(lH)+'" fill="none" stroke="'+C.site+'" stroke-width="0.8" stroke-dasharray="4,2"/>';

  // 건물 바닥 (흰색)
  o+='<rect x="'+ox+'" y="'+oy+'" width="'+px(bW)+'" height="'+px(bH)+'" fill="#FAFAFA"/>';

  // 방 바닥재
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    o+='<rect x="'+rx+'" y="'+ry+'" width="'+rw+'" height="'+rh+'" fill="'+rf(rm.type)+'"/>';
  }

  // 내벽 (두께 표현)
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    // 4변 모두 내벽으로 그림 (두께 있는 사각형)
    var t=Math.max(iwPx,1.5);
    o+='<rect x="'+rx+'" y="'+ry+'" width="'+rw+'" height="'+t+'" fill="'+C.intWall+'"/>'; // top
    o+='<rect x="'+rx+'" y="'+(ry+rh-t)+'" width="'+rw+'" height="'+t+'" fill="'+C.intWall+'"/>'; // bottom
    o+='<rect x="'+rx+'" y="'+ry+'" width="'+t+'" height="'+rh+'" fill="'+C.intWall+'"/>'; // left
    o+='<rect x="'+(rx+rw-t)+'" y="'+ry+'" width="'+t+'" height="'+rh+'" fill="'+C.intWall+'"/>'; // right
  }

  // 외벽 (두께 표현 — 4면 각각)
  var bxp=ox,byp=oy,bwp=px(bW),bhp=px(bH);
  var et=Math.max(ewPx,3);
  o+='<rect x="'+bxp+'" y="'+byp+'" width="'+bwp+'" height="'+et+'" fill="'+C.extWall+'"/>'; // top
  o+='<rect x="'+bxp+'" y="'+(byp+bhp-et)+'" width="'+bwp+'" height="'+et+'" fill="'+C.extWall+'"/>'; // bottom
  o+='<rect x="'+bxp+'" y="'+byp+'" width="'+et+'" height="'+bhp+'" fill="'+C.extWall+'"/>'; // left
  o+='<rect x="'+(bxp+bwp-et)+'" y="'+byp+'" width="'+et+'" height="'+bhp+'" fill="'+C.extWall+'"/>'; // right

  // === 문 (건축 기호: 벽 끊기 + 1/4 arc) ===
  // 각 방에 문 하나씩 (내벽에)
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var dw=Math.min(rw*0.25,px(900)); // 문 너비 (최대 900mm)
    if(dw<4)dw=4;
    var t2=Math.max(iwPx,1.5);

    if(rm.type==='entrance'){
      // 현관문은 외벽 하단
      var dx=rx+rw/2-dw/2;
      o+='<rect x="'+dx+'" y="'+(byp+bhp-et-1)+'" width="'+dw+'" height="'+(et+2)+'" fill="'+C.bg+'"/>';
      o+='<line x1="'+dx+'" y1="'+(byp+bhp)+'" x2="'+dx+'" y2="'+(byp+bhp+dw*0.8)+'" stroke="'+C.door+'" stroke-width="1.2"/>';
      o+='<path d="M '+dx+' '+(byp+bhp+dw*0.8)+' A '+(dw*0.8)+' '+(dw*0.8)+' 0 0 1 '+(dx+dw*0.8)+' '+(byp+bhp)+'" fill="none" stroke="'+C.door+'" stroke-width="0.7" stroke-dasharray="2,1"/>';
    } else {
      // 일반 방: 하단 내벽에 문
      var dx=rx+rw*0.15;
      o+='<rect x="'+dx+'" y="'+(ry+rh-t2-0.5)+'" width="'+dw+'" height="'+(t2+1)+'" fill="'+rf(rm.type)+'"/>';
      // 문짝 (위쪽으로 열림)
      o+='<line x1="'+dx+'" y1="'+(ry+rh-t2)+'" x2="'+dx+'" y2="'+(ry+rh-t2-dw*0.7)+'" stroke="'+C.door+'" stroke-width="0.8"/>';
      o+='<path d="M '+dx+' '+(ry+rh-t2-dw*0.7)+' A '+(dw*0.7)+' '+(dw*0.7)+' 0 0 1 '+(dx+dw*0.7)+' '+(ry+rh-t2)+'" fill="none" stroke="'+C.door+'" stroke-width="0.5" stroke-dasharray="1.5,1"/>';
    }
  }

  // === 창문 (이중선 — 외벽에 접한 방) ===
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    if(rm.type==='bath'||rm.type==='storage'||rm.type==='entrance'||rm.type==='hall')continue;
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var ww=Math.min(rw*0.35,px(1500));
    if(ww<6)ww=6;

    // 상단 외벽에 접하면 상단 창문
    if(Math.abs(px(rm.y)+oy-byp-et)<2){
      var wx=rx+rw*0.3;
      o+='<rect x="'+wx+'" y="'+(byp-0.5)+'" width="'+ww+'" height="'+(et+1)+'" fill="'+C.bg+'"/>';
      o+='<line x1="'+wx+'" y1="'+(byp+et*0.25)+'" x2="'+(wx+ww)+'" y2="'+(byp+et*0.25)+'" stroke="'+C.win+'" stroke-width="1.5"/>';
      o+='<line x1="'+wx+'" y1="'+(byp+et*0.75)+'" x2="'+(wx+ww)+'" y2="'+(byp+et*0.75)+'" stroke="'+C.win+'" stroke-width="1.5"/>';
      o+='<line x1="'+(wx+ww/2)+'" y1="'+(byp)+'" x2="'+(wx+ww/2)+'" y2="'+(byp+et)+'" stroke="'+C.win+'" stroke-width="0.4"/>';
    }
    // 좌측 외벽에 접하면
    if(Math.abs(px(rm.x)+ox-bxp-et)<2){
      var wy=ry+rh*0.3;
      var wh=Math.min(rh*0.35,px(1500));
      o+='<rect x="'+(bxp-0.5)+'" y="'+wy+'" width="'+(et+1)+'" height="'+wh+'" fill="'+C.bg+'"/>';
      o+='<line x1="'+(bxp+et*0.25)+'" y1="'+wy+'" x2="'+(bxp+et*0.25)+'" y2="'+(wy+wh)+'" stroke="'+C.win+'" stroke-width="1.5"/>';
      o+='<line x1="'+(bxp+et*0.75)+'" y1="'+wy+'" x2="'+(bxp+et*0.75)+'" y2="'+(wy+wh)+'" stroke="'+C.win+'" stroke-width="1.5"/>';
    }
  }

  // === 방 라벨 ===
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w),rh=px(rm.h);
    var aSqm=(rm.w/1000)*(rm.h/1000);
    var aPy=(aSqm/3.306).toFixed(1);
    var cx2=rx+rw/2,cy2=ry+rh/2;
    var fs=Math.min(11,rw/5,rh/4);
    if(fs<6)fs=6;
    o+='<text x="'+cx2+'" y="'+(cy2-fs*0.4)+'" text-anchor="middle" font-family="sans-serif" font-size="'+fs+'" fill="'+C.lbl+'" font-weight="600">'+rm.name+'</text>';
    o+='<text x="'+cx2+'" y="'+(cy2+fs*0.7)+'" text-anchor="middle" font-family="sans-serif" font-size="'+(fs*0.7)+'" fill="'+C.area+'">'+aSqm.toFixed(1)+'㎡ ('+aPy+'평)</text>';
    // 치수
    o+='<text x="'+cx2+'" y="'+(cy2+fs*1.5)+'" text-anchor="middle" font-family="sans-serif" font-size="'+(fs*0.6)+'" fill="'+C.sub+'">'+(rm.w/1000).toFixed(1)+'m × '+(rm.h/1000).toFixed(1)+'m</text>';
  }

  // === 치수선 ===
  // 건물 — 하단
  o+=dimH(bxp,byp+bhp,bxp+bwp,(bW/1000).toFixed(1)+'m',18);
  // 건물 — 우측
  o+=dimV(bxp+bwp,byp,byp+bhp,(bH/1000).toFixed(1)+'m',18);
  // 대지 — 하단
  o+=dimH(lx,ly+px(lH),lx+px(lW),lWm+'m',38);
  // 대지 — 우측
  o+=dimV(lx+px(lW),ly,ly+px(lH),lHm+'m',38);

  // 방별 가로 치수 (상단에)
  for(var i=0;i<laid.length;i++){
    var rm=laid[i];
    var rx=px(rm.x)+ox,ry=px(rm.y)+oy,rw=px(rm.w);
    if(rows.length>0&&px(rows[0].y)+px(EW)+oy===ry){
      // 첫 행만 상단 치수
      o+=dimH(rx,ry,rx+rw,(rm.w/1000).toFixed(1)+'m',-10);
    }
  }

  // 나침반 방향 표시
  var cx3=lx+px(lW)-25,cy3=ly+25;
  o+='<circle cx="'+cx3+'" cy="'+cy3+'" r="12" fill="none" stroke="'+C.sub+'" stroke-width="0.5"/>';
  o+='<text x="'+cx3+'" y="'+(cy3-14)+'" text-anchor="middle" font-family="sans-serif" font-size="7" fill="'+C.lbl+'" font-weight="600">N</text>';
  o+='<line x1="'+cx3+'" y1="'+(cy3-10)+'" x2="'+cx3+'" y2="'+(cy3-4)+'" stroke="'+C.lbl+'" stroke-width="1" marker-end=""/>';
  o+='<polygon points="'+cx3+','+(cy3-12)+' '+(cx3-2.5)+','+(cy3-7)+' '+(cx3+2.5)+','+(cy3-7)+'" fill="'+C.lbl+'"/>';

  o+='</svg>';
  return o;
}

function dimH(x1,y,x2,label,off){
  var dy=y+off,s='';
  s+='<line x1="'+x1+'" y1="'+y+'" x2="'+x1+'" y2="'+(dy+3)+'" stroke="'+C.dim+'" stroke-width="0.25"/>';
  s+='<line x1="'+x2+'" y1="'+y+'" x2="'+x2+'" y2="'+(dy+3)+'" stroke="'+C.dim+'" stroke-width="0.25"/>';
  s+='<line x1="'+x1+'" y1="'+dy+'" x2="'+x2+'" y2="'+dy+'" stroke="'+C.dim+'" stroke-width="0.5"/>';
  s+='<line x1="'+x1+'" y1="'+(dy-3)+'" x2="'+x1+'" y2="'+(dy+3)+'" stroke="'+C.dim+'" stroke-width="0.7"/>';
  s+='<line x1="'+x2+'" y1="'+(dy-3)+'" x2="'+x2+'" y2="'+(dy+3)+'" stroke="'+C.dim+'" stroke-width="0.7"/>';
  s+='<text x="'+((x1+x2)/2)+'" y="'+(dy-3)+'" text-anchor="middle" font-family="sans-serif" font-size="7.5" fill="'+C.dim+'">'+label+'</text>';
  return s;
}

function dimV(x,y1,y2,label,off){
  var dx=x+off,s='',mid=(y1+y2)/2;
  s+='<line x1="'+x+'" y1="'+y1+'" x2="'+(dx+3)+'" y2="'+y1+'" stroke="'+C.dim+'" stroke-width="0.25"/>';
  s+='<line x1="'+x+'" y1="'+y2+'" x2="'+(dx+3)+'" y2="'+y2+'" stroke="'+C.dim+'" stroke-width="0.25"/>';
  s+='<line x1="'+dx+'" y1="'+y1+'" x2="'+dx+'" y2="'+y2+'" stroke="'+C.dim+'" stroke-width="0.5"/>';
  s+='<line x1="'+(dx-3)+'" y1="'+y1+'" x2="'+(dx+3)+'" y2="'+y1+'" stroke="'+C.dim+'" stroke-width="0.7"/>';
  s+='<line x1="'+(dx-3)+'" y1="'+y2+'" x2="'+(dx+3)+'" y2="'+y2+'" stroke="'+C.dim+'" stroke-width="0.7"/>';
  s+='<text x="'+(dx+2)+'" y="'+(mid+2)+'" text-anchor="start" font-family="sans-serif" font-size="7.5" fill="'+C.dim+'" transform="rotate(-90,'+(dx+2)+','+(mid+2)+')">'+label+'</text>';
  return s;
}
