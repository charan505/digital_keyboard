const keyboardEl = document.getElementById('keyboard');
const output = document.getElementById('output');
const clearBtn = document.getElementById('clearBtn');
const soundToggle = document.getElementById('soundToggle');

let isShift = false;
let isCaps = false;
let soundEnabled = false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playClick(){
  if(!soundEnabled) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.value = 900;
  g.gain.value = 0.02;
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  setTimeout(()=>{ o.stop(); }, 50);
}

const layout = [  [
   {lower:'`', upper:'~', type:'char'},
    {lower:'1', upper:'!', type:'char'},
    {lower:'2', upper:'@', type:'char'},
    {lower:'3', upper:'#', type:'char'},
    {lower:'4', upper:'$', type:'char'},
    {lower:'5', upper:'%', type:'char'},
    {lower:'6', upper:'^', type:'char'},
    {lower:'7', upper:'&', type:'char'},
    {lower:'8', upper:'*', type:'char'},
    {lower:'9', upper:'(', type:'char'},
    {lower:'0', upper:')', type:'char'},
    {lower:'-', upper:'_', type:'char'},
    {lower:'=', upper:'+', type:'char'},
    {lower:'Backspace', upper:'Backspace', type:'func', className:'wider'}
  ],
 
  [
    {lower:'Tab', upper:'Tab', type:'func', className:'wide'},
    {lower:'q', upper:'Q', type:'char'},
    {lower:'w', upper:'W', type:'char'},
    {lower:'e', upper:'E', type:'char'},
    {lower:'r', upper:'R', type:'char'},
    {lower:'t', upper:'T', type:'char'},
    {lower:'y', upper:'Y', type:'char'},
    {lower:'u', upper:'U', type:'char'},
    {lower:'i', upper:'I', type:'char'},
    {lower:'o', upper:'O', type:'char'},
    {lower:'p', upper:'P', type:'char'},
    {lower:'[', upper:'{', type:'char'},
    {lower:']', upper:'}', type:'char'},
    {lower:'\\', upper:'|', type:'char'}
  ],
 
  [
    {lower:'Caps', upper:'Caps', type:'func', className:'wide'},
    {lower:'a', upper:'A', type:'char'},
    {lower:'s', upper:'S', type:'char'},
    {lower:'d', upper:'D', type:'char'},
    {lower:'f', upper:'F', type:'char'},
    {lower:'g', upper:'G', type:'char'},
    {lower:'h', upper:'H', type:'char'},
    {lower:'j', upper:'J', type:'char'},
    {lower:'k', upper:'K', type:'char'},
    {lower:'l', upper:'L', type:'char'},
    {lower:';', upper:':', type:'char'},
    {lower:"'", upper:'"', type:'char'},
    {lower:'Enter', upper:'Enter', type:'func', className:'wider'}
  ],

  [
    {lower:'Shift', upper:'Shift', type:'func', className:'wide'},
    {lower:'z', upper:'Z', type:'char'},
    {lower:'x', upper:'X', type:'char'},
    {lower:'c', upper:'C', type:'char'},
    {lower:'v', upper:'V', type:'char'},
    {lower:'b', upper:'B', type:'char'},
    {lower:'n', upper:'N', type:'char'},
    {lower:'m', upper:'M', type:'char'},
    {lower:',', upper:'<', type:'char'},
    {lower:'.', upper:'>', type:'char'},
    {lower:'/', upper:'?', type:'char'},
    {lower:'Shift', upper:'Shift', type:'func', className:'wide'}
  ],
 
  [
    {lower:'Ctrl', upper:'Ctrl', type:'func'},
    {lower:'Alt', upper:'Alt', type:'func'},
    {lower:'Space', upper:'Space', type:'func', className:'wider'},
    {lower:'Left', upper:'Left', type:'func'},
    {lower:'Right', upper:'Right', type:'func'}
  ]
];

function renderKeyboard(){
  keyboardEl.innerHTML = '';
  layout.forEach(row=>{
    const rowEl = document.createElement('div');
    rowEl.className = 'row';
    row.forEach(key=>{
      const keyEl = document.createElement('button');
      keyEl.type = 'button';
      keyEl.className = 'key';
      if(key.type === 'func') keyEl.classList.add('function');
      if(key.className) keyEl.classList.add(...key.className.split(' '));
      const label = getLabelForKey(key);
      keyEl.textContent = label;
      keyEl.dataset.lower = key.lower;
      keyEl.dataset.upper = key.upper;
      keyEl.dataset.type = key.type;
      keyEl.addEventListener('click', onVirtualKeyClick);
      rowEl.appendChild(keyEl);
    });
    keyboardEl.appendChild(rowEl);
  });
}

function getLabelForKey(key){
  if(key.type === 'char'){
    const upperState = (isShift ^ !isCaps) ? key.upper : key.lower;
    if(/[a-zA-Z]/.test(key.lower)){
      return (isShift || isCaps) ? key.upper : key.lower;
    } else {
      return isShift ? key.upper : key.lower;
    }
  } else {
    return key.lower;
  }
}

function refreshLabels(){
  document.querySelectorAll('.key').forEach(k=>{
    const type = k.dataset.type;
    if(type === 'char'){
      const lower = k.dataset.lower;
      const upper = k.dataset.upper;
      if(/[a-zA-Z]/.test(lower)){
        k.textContent = (isShift || isCaps) ? upper : lower;
      } else {
        k.textContent = isShift ? upper : lower;
      }
    }
  });
}

function onVirtualKeyClick(e){
  const key = e.currentTarget;
  const type = key.dataset.type;
  const lower = key.dataset.lower;
  const upper = key.dataset.upper;

  playClick();

  if(type === 'char'){
    const char = determineChar(lower, upper);
    insertAtCursor(char);
    if(isShift) { isShift = false; refreshLabels(); }
  } else {
    
    switch(lower){
      case 'Backspace':
        backspaceAtCursor();
        break;
      case 'Tab':
        insertAtCursor('\t');
        break;
      case 'Enter':
        insertAtCursor('\n');
        break;
      case 'Space':
        insertAtCursor(' ');
        break;
      case 'Caps':
      case 'CapsLock':
      case 'CapsLock':
      case 'Caps':
        isCaps = !isCaps;
        refreshLabels();
        break;
      case 'Shift':
        isShift = !isShift;
        refreshLabels();
        break;
      default:
        if(lower === 'Left') moveCursor(-1);
        if(lower === 'Right') moveCursor(1);
        break;
    }
  }

  output.focus();
}

function determineChar(lower, upper){
  if(/[a-zA-Z]/.test(lower)){
    if(isShift ^ isCaps) return upper;
    return lower;
  } else {
    return isShift ? upper : lower;
  }
}

function insertAtCursor(text){
  const start = output.selectionStart;
  const end = output.selectionEnd;
  const val = output.value;
  output.value = val.slice(0,start) + text + val.slice(end);
  const pos = start + text.length;
  output.selectionStart = output.selectionEnd = pos;
  output.focus();
}

function backspaceAtCursor(){
  const start = output.selectionStart;
  const end = output.selectionEnd;
  if(start === end && start > 0){
    const val = output.value;
    output.value = val.slice(0, start-1) + val.slice(end);
    output.selectionStart = output.selectionEnd = start-1;
  } else if(start !== end){
    const val = output.value;
    output.value = val.slice(0,start) + val.slice(end);
    output.selectionStart = output.selectionEnd = start;
  }
  output.focus();
}

function moveCursor(offset){
  let pos = output.selectionStart + offset;
  pos = Math.max(0, Math.min(output.value.length, pos));
  output.selectionStart = output.selectionEnd = pos;
  output.focus();
}

const keyMap = {}; 
function createKeyMap(){
  document.querySelectorAll('.key').forEach(k=>{
    const lower = k.dataset.lower;
    keyMap[lower.toLowerCase()] = k;

    keyMap[(k.dataset.upper || '').toLowerCase()] = k;
  });
}

function flashKey(keyEl){
  if(!keyEl) return;
  keyEl.classList.add('active');
  keyEl.style.transform = 'translateY(2px)';
  setTimeout(()=>{
    keyEl.classList.remove('active');
    keyEl.style.transform = '';
  }, 120);
}

function onPhysicalKeyDown(ev){

  soundEnabled = soundToggle.checked;
  const k = ev.key;

  if(k === 'Shift'){
    isShift = true; refreshLabels();
    return;
  }

  if(k === 'CapsLock'){
    isCaps = !isCaps; refreshLabels();
    return;
  }

  if(k === 'Backspace'){ ev.preventDefault(); backspaceAtCursor(); playClick(); flashKey(keyMap['backspace']); return; }
  if(k === 'Enter'){ ev.preventDefault(); insertAtCursor('\n'); playClick(); flashKey(keyMap['enter']); return; }
  if(k === 'Tab'){ ev.preventDefault(); insertAtCursor('\t'); playClick(); flashKey(keyMap['tab']); return; }
  if(k === ' '){ ev.preventDefault(); insertAtCursor(' '); playClick(); flashKey(keyMap['space']); return; }

  const lowerK = k.toLowerCase();
  const matching = keyMap[lowerK];
  if(matching){
    
    ev.preventDefault();
    const lower = matching.dataset.lower;
    const upper = matching.dataset.upper;
    const char = determineChar(lower, upper);
    insertAtCursor(char);
    playClick();
    flashKey(matching);
    if(isShift){ isShift = false; refreshLabels(); }
  }
}

function onPhysicalKeyUp(ev){
  if(ev.key === 'Shift'){
    isShift = false; refreshLabels();
  }
}

soundToggle.addEventListener('change', ()=> soundEnabled = soundToggle.checked );
clearBtn.addEventListener('click', ()=> { output.value=''; output.focus(); });

renderKeyboard();
createKeyMap();

window.addEventListener('keydown', onPhysicalKeyDown);
window.addEventListener('keyup', onPhysicalKeyUp);

output.addEventListener('focus', ()=> { /* no-op */ });

output.focus();  