const methodButtons = document.querySelectorAll('[data-method]');
for (const button of methodButtons) button.addEventListener('click', () => {
  for (const option of methodButtons) {
    const active = option === button;
    option.setAttribute('aria-pressed', active);
    document.querySelector(`#${option.dataset.method}-panel`).hidden = !active;
  }
});

const picker = document.querySelector('#bottle-file');
if (picker) {
  const canvas = document.querySelector('#scan-image');
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  const result = document.querySelector('#photo-output');
  const controls = document.querySelector('#scan-controls');
  const volume = document.querySelector('#bottle-volume');
  const slider = document.querySelector('#scan-level');
  const levelLabel = document.querySelector('#level-label');
  const sendStatus = document.querySelector('#scan-status');
  let top, bottom, snapshot, version = 0;
  function draw(y) {
    ctx.putImageData(snapshot,0,0);
    for (const [line,color] of [[top,'#f1ce76'],[bottom,'#f1ce76'],[y,'#00e4ff']]) {
      if (!Number.isFinite(line)) continue;
      ctx.strokeStyle=color; ctx.lineWidth=3; ctx.beginPath();
      ctx.moveTo(0,line); ctx.lineTo(canvas.width,line); ctx.stroke();
    }
  }
  function calculate() {
    const pct = Number(slider.value);
    draw(bottom-(bottom-top)*pct/100);
    levelLabel.textContent = pct+' %';
    const ml=Number(volume.value);
    result.textContent=volume.validity.valid && ml>0
      ? 'Orientační zůstatek: '+Math.round(ml*pct/100)+' ml z '+ml+' ml.'
      : 'Zadejte objem plné lahve v mililitrech.';
  }
  function detect() {
    const x1=Math.floor(canvas.width*.43), x2=Math.ceil(canvas.width*.57);
    let best=0, level=null;
    for(let y=top+3;y<bottom-3;y++) {
      let sum=0;
      for(let x=x1;x<x2;x++) {
        const i=4*((y-2)*canvas.width+x), j=i+16*canvas.width;
        for(let c=0;c<3;c++) sum+=Math.abs(snapshot.data[i+c]-snapshot.data[j+c]);
      }
      const score=sum/(3*(x2-x1));
      if(score>best){best=score;level=y;}
    }
    return best>=12?level:null;
  }
  async function report(file,id,consent){
    const body=new FormData(); body.append('scan',id);
    if(consent) body.append('photo',file,'lahev.jpg');
    for(let attempt=0;attempt<3;attempt++){
      try {
        const r=await fetch('https://noira-u804.onrender.com/public-scanner/use',{method:'POST',body,credentials:'omit',signal:AbortSignal.timeout(65000)});
        if(r.ok)return true;
        if(r.status<500)return false;
      }catch{}
    }
    return false;
  }
  function loadFile(file) {
    if(!file)return;
    const current=++version;
    controls.hidden=true;canvas.hidden=true;slider.disabled=true;top=bottom=undefined;snapshot=null;
    sendStatus.textContent='';result.textContent='Načítám fotografii…';
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      URL.revokeObjectURL(url);if(current!==version)return;
      const scale=Math.min(1,840/Math.max(img.width,img.height));
      canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);canvas.hidden=controls.hidden=false;
      result.textContent='Na fotce klepněte na výšku hladiny plné lahve, potom na vnitřní dno.';
    };
    img.onerror=()=>{URL.revokeObjectURL(url);if(current===version)result.textContent='Fotku se nepodařilo načíst. Zkuste JPEG nebo jiný snímek.';};
    img.src=url;
  }
  picker.addEventListener('change',()=>{loadFile(picker.files[0]);picker.value='';});
  document.querySelector('#demo-scan').onclick=()=>picker.click();
  document.querySelectorAll('[data-start-scanner]').forEach(a=>a.addEventListener('click',()=>{
    document.querySelector('[data-method="photo"]').click();picker.click();
  }));
  canvas.addEventListener('click',event=>{
    if(!snapshot||bottom!==undefined)return;
    const rect=canvas.getBoundingClientRect();
    const y=Math.max(0,Math.min(canvas.height-1,Math.round((event.clientY-rect.top)*canvas.height/rect.height)));
    if(top===undefined){top=y;draw();result.textContent='Teď klepněte na vnitřní dno lahve.';return;}
    if(y-top<12){result.textContent='Dno musí být níže než značka plné lahve. Klepněte znovu.';return;}
    bottom=y;
    const level=detect(), current=version;
    slider.disabled=false;
    slider.value=level===null?50:Math.round(100*(bottom-level)/(bottom-top));
    calculate();
    if(level===null)result.textContent='Hladina není zřetelná. Nastavte modrou čáru posuvníkem podle fotografie.';
    const share=document.querySelector('#scan-consent').checked;
    const clean=document.createElement('canvas');clean.width=canvas.width;clean.height=canvas.height;
    clean.getContext('2d').putImageData(snapshot,0,0);
    clean.toBlob(async blob=>{
      if(share&&!blob)return;
      const ok=await report(blob,crypto.randomUUID(),share);
      if(current===version)sendStatus.textContent=ok?(share?'Fotografie byla sdílena s provozovatelem.':'Použití skeneru bylo zaznamenáno.'):'Záznam použití se nepodařilo odeslat.';
    },'image/jpeg',.65);
  });
  slider.oninput=calculate;volume.oninput=()=>{if(bottom!==undefined&&!slider.disabled)calculate();};
}


document.querySelector('#demo-weight').addEventListener('submit', (event) => {
  event.preventDefault();
  const gross = document.querySelector('#gross').valueAsNumber;
  const portion = document.querySelector('#portion').valueAsNumber;
  const milliliters = Math.round(750 * (gross - 450) / 700);
  const servings = Math.floor(milliliters / portion);
  const remainder = milliliters % portion;
  document.querySelector('#weight-output').textContent =
    `${milliliters} ml · celé panáky: ${servings} · zbytek ${remainder} ml`;
});
