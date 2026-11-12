const A='../assets/';
const VIDEO_BASE_URL=(window.INNER_CITY_MEDIA_CONFIG?.r2PublicBaseUrl||'').trim().replace(/\/+$/,'');
const works={mountains:{n:'01',place:'MOUNTAINS',title:'STONE IS THE ROOT OF CLOUD',video:'stone-is-the-root-of-cloud.mp4',cover:'covers/Stone is the Root of Cloud-cover.png',ratio:'16/9'},bus:{n:'02',place:'BUS STOP',title:'XIAO NAN',video:'xiao-nan.mp4',cover:'covers/Xiao Nan-cover.jpg',ratio:'16/9'},banquet:{n:'03',place:'BANQUET HALL',title:'THE FLOCK',video:'the-flock.mp4',cover:'covers/The Flock-cover.png',ratio:'9/16'},apartment:{n:'04',place:'APARTMENT 03',title:'ME',video:'me.mp4',cover:'covers/Me-cover.png',ratio:'16/9'},archive:{n:'05',place:'ARCHIVE',title:'IMAGE ARCHIVE'}};
const css=document.createElement('style');css.textContent=`.entry{position:fixed;z-index:4;left:7vw;top:25vh;width:310px;display:none}.entry.show{display:block}body.place-selected .copy{opacity:0;pointer-events:none}.legend{left:auto;right:4vw}.entry button{pointer-events:auto}.actions button{color:#e6e4db!important}.workroom{position:fixed;z-index:20;inset:0;background:#111a1cF2;color:#e8e5dc;display:none;overflow:auto;padding:8vh 7vw;font:12px 'DM Mono',monospace}.workroom.open{display:block}.workroom .close{position:fixed;right:4vw;top:3vh}.workroom h2{font:300 30px 'DM Sans',sans-serif;letter-spacing:.04em}.workroom video{display:block;width:min(82vw,1440px);height:auto;max-height:72vh;margin:4vh auto 2vh;object-fit:contain;background:#000}.workroom video[poster]{cursor:pointer}.media-error{color:#e6b776;text-align:center;max-width:60ch;margin:12px auto}.workroom .controls{display:flex;gap:12px;align-items:center;justify-content:center}.workroom input[type=range]{accent-color:#dfb776}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:18px;margin-top:28px}.gallery img{width:100%;height:260px;object-fit:contain;background:#202d30;cursor:zoom-in}.filters{display:flex;gap:8px;flex-wrap:wrap}.lightbox3{position:fixed;z-index:30;inset:0;background:#101719f5;display:none;align-items:center;justify-content:center;padding:5vh}.lightbox3.open{display:flex}.lightbox3 img{max-width:90vw;max-height:88vh;object-fit:contain}.lightbox3 button{position:fixed;right:4vw;top:3vh}@media(max-width:700px){.copy{top:13vh!important;left:5vw!important;width:min(88vw,340px)!important}.copy h1{font-size:clamp(34px,10vw,52px)!important}.actions{max-height:29vh!important;display:grid!important;grid-template-columns:1fr 1fr}.world-label{display:none!important}.entry{left:5vw;top:auto;bottom:5vh;width:90vw}.workroom{padding:12vh 5vw 5vh}.workroom video{max-width:90vw;max-height:64vh}.workroom .controls{flex-wrap:wrap}}`;
css.textContent+=`.entry .work-description{max-height:min(25vh,220px);overflow:auto;margin:10px 0 12px;padding-right:5px;color:#c5ceca;font:10px/1.65 'DM Sans',sans-serif;letter-spacing:.01em;overscroll-behavior:contain}.entry .description-subtitle,.entry .description-paragraph{display:block}.entry .description-subtitle{margin-bottom:5px;color:#dfb776;font:10px 'DM Mono',monospace;letter-spacing:.08em}.entry .description-paragraph+.description-paragraph{margin-top:8px}.entry .work-description[hidden]{display:none}.entry.entry--bus{left:auto;right:7vw;top:14vh;width:min(320px,30vw)}.entry.entry--banquet{left:calc(7vw + 80px)}@media(max-width:700px){.entry .work-description{max-height:22vh;font-size:10px;line-height:1.55}.entry.entry--bus{left:auto;right:5vw;top:13vh;width:min(90vw,360px)}.entry.entry--banquet{left:5vw;top:auto;bottom:5vh;width:min(90vw,310px)}}`;
document.head.append(css);
const entry=document.createElement('aside');entry.className='entry';entry.innerHTML='<p class="eyebrow">SELECTED WORK</p><strong></strong><p class="work-description" hidden></p><br><button class="enter">ENTER THE WORK ↗</button>';document.body.append(entry);
const room=document.createElement('section');room.className='workroom';room.innerHTML='<button class="close">CLOSE ×</button><p class="eyebrow"></p><h2></h2><video playsinline preload="metadata"></video><div class="controls"><button class="play">PLAY / PAUSE</button><span class="now">0:00</span><input class="seek" type="range" min="0" max="100" value="0"><span class="end">0:00</span><label>VOL <input class="vol" type="range" min="0" max="100" value="0"></label><button class="fs">FULLSCREEN</button></div><div class="filters"></div><div class="gallery"></div></section>';document.body.append(room);
const light=document.createElement('div');light.className='lightbox3';light.innerHTML='<button>CLOSE ×</button><img>';document.body.append(light);light.querySelector('button').onclick=()=>light.classList.remove('open');light.onclick=e=>{if(e.target===light)light.classList.remove('open')};
let selected=null,mediaGeneration=0,dragging=false,metadataReady=false,activeMediaUrl='';
const descriptions={mountains:{subtitle:'Poem Notes',paragraphs:['“Clouds are born from stone; hence the name Yungen.” Poets of the Tang and Song dynasties referred to rocks as “cloud roots.”','In the story, stones and clouds symbolize a son and mother who are not related by blood. While searching for the secret behind his mother\'s blessing, the son accidentally kills another mother who is praying for her own child. The obsessions we pursue are ultimately destined to become illusions.']},bus:{paragraphs:['A late-night phone call on the last bus exposes the double suffocation experienced by a young woman living far from her hometown, trapped between workplace conditioning and the emotional constraints of her family.']},banquet:{paragraphs:['People imitate, follow, and move forward, only to find themselves returning to where they began. Unknowingly swept along by the crowd, we repeat the same decisions over and over again.']}};
const descriptionEl=entry.querySelector('.work-description');let arrivedKey=null;
function setDescription(key,visible){const item=descriptions[key];descriptionEl.replaceChildren();if(!item||!visible){descriptionEl.hidden=true;return}if(item.subtitle){const subtitle=document.createElement('strong');subtitle.className='description-subtitle';subtitle.textContent=item.subtitle;descriptionEl.append(subtitle)}for(const paragraph of item.paragraphs){const p=document.createElement('span');p.className='description-paragraph';p.textContent=paragraph;descriptionEl.append(p)}descriptionEl.hidden=false}
document.addEventListener('innercity:scene-arrived',event=>{arrivedKey=event.detail?.key;if(arrivedKey===selected&&!room.classList.contains('open'))setDescription(selected,true)});
const video=room.querySelector('video'),seek=room.querySelector('.seek'),timeLabel=room.querySelector('.now'),durationLabel=room.querySelector('.end');
const videoFrame=document.createElement('div');videoFrame.className='video-frame';video.parentNode.insertBefore(videoFrame,video);videoFrame.append(video);
const coverLayer=document.createElement('img');coverLayer.className='work-cover';coverLayer.alt='';coverLayer.hidden=true;videoFrame.append(coverLayer);
function hideCover(){coverLayer.hidden=true}
video.addEventListener('play',hideCover);
seek.addEventListener('input',hideCover);
seek.disabled=true;
function mediaStatus(message,kind='status'){
  let el=room.querySelector('.media-status');
  if(!el){el=document.createElement('p');el.className='media-status';room.querySelector('.controls').after(el)}
  el.dataset.kind=kind;el.textContent=message;
}
function clearMediaStatus(){room.querySelector('.media-status')?.remove()}
function resetMediaUI(){
  dragging=false;metadataReady=false;seek.value='0';seek.disabled=true;
  timeLabel.textContent='0:00';durationLabel.textContent='—';
}
function unloadVideo(){
  video.pause();
  try{video.currentTime=0}catch{}
  video.removeAttribute('src');video.removeAttribute('poster');video.load();
  coverLayer.hidden=true;coverLayer.removeAttribute('src');
  activeMediaUrl='';resetMediaUI();
}
function currentGeneration(g,url){return g===mediaGeneration&&url===activeMediaUrl&&video.src===url&&(!video.currentSrc||video.currentSrc===url)}
function seekRanges(){
  const ranges=[];try{for(let i=0;i<video.seekable.length;i++)ranges.push([video.seekable.start(i),video.seekable.end(i)])}catch{}
  return ranges;
}
function updateSeekAvailability(g,url){
  if(!currentGeneration(g,url)||!metadataReady)return;
  const ranges=seekRanges(),available=Number.isFinite(video.duration)&&video.duration>0&&ranges.length>0;
  seek.disabled=!available;
  if(!available)mediaStatus('Seeking unavailable: media has no seekable ranges yet.');
  else if(room.querySelector('.media-status')?.dataset.kind==='status')clearMediaStatus();
}
function timeFromSlider(){
  if(!metadataReady||!Number.isFinite(video.duration)||video.duration<=0)return null;
  const requested=video.duration*Math.max(0,Math.min(100,Number(seek.value)||0))/100;
  const ranges=seekRanges();if(!ranges.length)return null;
  for(const [start,end] of ranges)if(requested>=start&&requested<=end)return requested;
  let nearest=null,distance=Infinity;
  for(const [start,end] of ranges)for(const edge of [start,end])if(Math.abs(requested-edge)<distance){nearest=edge;distance=Math.abs(requested-edge)}
  return nearest;
}
function commitSeek(){
  const target=timeFromSlider();
  if(target===null){mediaStatus('Cannot seek: video metadata or seekable range is unavailable.');return false}
  try{
    video.currentTime=target;
    timeLabel.textContent=fmt(target);
    return true;
  }catch(error){mediaStatus(`Seek failed: ${error.message||error}`,'error');return false}
}
const openWork=()=>{
  if(!selected)return;
  setDescription(selected,false);
  const w=works[selected],g=++mediaGeneration;
  room.querySelector('.eyebrow').textContent=`${w.n} / ${w.place}`;
  room.querySelector('h2').textContent=w.title;
  room.querySelector('.filters').innerHTML='';room.querySelector('.gallery').innerHTML='';
  clearMediaStatus();unloadVideo();
  const archiveView=selected==='archive',videoControls=room.querySelector('.controls');
  videoFrame.style.display=archiveView?'none':'block';
  videoControls.hidden=archiveView;videoControls.style.display=archiveView?'none':'';
  if(selected==='archive'){
    const data={PHOTO:['Photo1.jpg','Photo2.jpg','Photo3.jpg','Photo4.jpg','Photo5.jpg'],ANIMATION:['Animation1.jpg','Animation2.jpg','Animation3.jpg','Animation4.jpg','Animation5.jpg'],'INSTALLATION ART':['installation art1.JPG','installation art2.JPG']};
    room.querySelector('.filters').innerHTML=['PHOTO','ANIMATION','INSTALLATION ART'].map(x=>`<button data-cat="${x}">${x}</button>`).join('');
    const draw=cat=>{
      room.querySelectorAll('[data-cat]').forEach(b=>b.classList.toggle('active',b.dataset.cat===cat));
      room.querySelector('.gallery').innerHTML=data[cat].map((f,i)=>`<figure><img src="${A}images/${encodeURIComponent(f).replaceAll('%20',' ')}" alt="${cat} ${i+1}" loading="lazy"><figcaption>${cat} ${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('');
      room.querySelectorAll('.gallery img').forEach(img=>img.onclick=()=>{light.querySelector('img').src=img.src;light.classList.add('open')});
    };
    room.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>draw(b.dataset.cat));draw('PHOTO');
  }else{
    video.poster=new URL(`${A}${w.cover}`,document.baseURI).href;coverLayer.src=video.poster;coverLayer.hidden=false;video.style.aspectRatio=w.ratio;
    if(!VIDEO_BASE_URL){activeMediaUrl='';mediaStatus('Video delivery is awaiting the R2 public URL.')}else{
      const url=new URL(`${VIDEO_BASE_URL}/${w.video}`).href;activeMediaUrl=url;
    mediaStatus('Loading media…');video.src=url;video.load();
    const isCurrent=()=>currentGeneration(g,url);
    video.onloadedmetadata=()=>{
      if(!isCurrent())return;
      metadataReady=Number.isFinite(video.duration)&&video.duration>0;
      durationLabel.textContent=metadataReady?fmt(video.duration):'—';
      timeLabel.textContent='0:00';seek.value='0';
      // A freshly loaded source starts at its beginning. Only assign time zero
      // when the browser confirms that zero is inside a seekable range.
      if(metadataReady&&seekRanges().some(([start,end])=>start<=0&&end>=0)){try{video.currentTime=0}catch(error){mediaStatus(`Unable to start at beginning: ${error.message||error}`,'error')}}
      updateSeekAvailability(g,url);
    };
    video.onloadeddata=()=>{if(isCurrent())clearMediaStatus()};
    video.onprogress=()=>updateSeekAvailability(g,url);
    video.oncanplay=()=>updateSeekAvailability(g,url);
    video.ontimeupdate=()=>{
      if(!isCurrent()||dragging)return;
      timeLabel.textContent=fmt(video.currentTime);
      if(metadataReady&&video.duration>0)seek.value=String(video.currentTime/video.duration*100);
    };
    video.onseeking=()=>{if(isCurrent())timeLabel.textContent=fmt(video.currentTime)};
    video.onseeked=()=>{
      if(!isCurrent())return;
      if(!dragging){timeLabel.textContent=fmt(video.currentTime);if(video.duration>0)seek.value=String(video.currentTime/video.duration*100)}
    };
    video.onerror=()=>{
      if(!isCurrent())return;
      const code=video.error?.code??'unknown',message=video.error?.message||'No browser detail';
      mediaStatus(`Media load failed (${code}): ${message} — ${video.currentSrc||url}`,'error');
    };
    }
  }
  room.classList.add('open');
};
function fmt(t){return Number.isFinite(t)?`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`:'0:00'}
entry.querySelector('.enter').onclick=openWork;
room.querySelector('.close').onclick=()=>{mediaGeneration++;unloadVideo();clearMediaStatus();room.classList.remove('open');if(arrivedKey===selected)setDescription(selected,true)};
room.querySelector('.play').onclick=()=>{if(video.paused)video.play().catch(error=>mediaStatus(`Playback failed: ${error.message||error}`,'error'));else video.pause()};
seek.addEventListener('pointerdown',()=>{if(!seek.disabled)dragging=true});
seek.addEventListener('input',commitSeek);
seek.addEventListener('change',()=>{commitSeek();dragging=false});
seek.addEventListener('pointerup',()=>{commitSeek();dragging=false});
seek.addEventListener('pointercancel',()=>{dragging=false});
room.querySelector('.vol').oninput=e=>room.querySelector('video').volume=e.target.value/100;room.querySelector('.fs').onclick=()=>room.querySelector('video').requestFullscreen?.();document.addEventListener('keydown',e=>{if(e.key==='Escape'){room.classList.remove('open');light.classList.remove('open')}});
document.querySelectorAll('[data-location],.world-label').forEach(el=>el.addEventListener('click',()=>{const key=el.dataset.location||el.id.replace('label-','');selected=key;arrivedKey=null;entry.classList.remove('entry--bus','entry--banquet');if(key==='bus')entry.classList.add('entry--bus');if(key==='banquet')entry.classList.add('entry--banquet');setDescription(key,false);const w=works[key];if(w){entry.querySelector('strong').textContent=`${w.n} — ${w.place} / ${w.title}`;entry.classList.add('show');document.body.classList.add('place-selected')}}));document.querySelector('#overview').addEventListener('click',()=>{arrivedKey=null;setDescription(selected,false);entry.classList.remove('entry--bus','entry--banquet','show');document.body.classList.remove('place-selected')});

const workIndex=document.querySelector('#workIndex'),indexTrigger=document.querySelector('#viewAllWorks'),indexClose=document.querySelector('#closeWorkIndex');
function closeWorkIndex(){workIndex.classList.remove('open');workIndex.setAttribute('aria-hidden','true');workIndex.inert=true;indexTrigger.focus()}
indexTrigger.addEventListener('click',()=>{workIndex.inert=false;workIndex.setAttribute('aria-hidden','false');workIndex.classList.add('open');indexClose.focus()});
indexClose.addEventListener('click',closeWorkIndex);
workIndex.addEventListener('click',e=>{if(e.target===workIndex)closeWorkIndex()});
workIndex.querySelectorAll('[data-work-index]').forEach(item=>item.addEventListener('click',()=>{const key=item.dataset.workIndex;closeWorkIndex();const destination=Array.from(document.querySelectorAll('[data-location]')).find(button=>button.dataset.location===key);if(destination){destination.click();entry.querySelector('.enter').click()}}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&workIndex.classList.contains('open'))closeWorkIndex()});
