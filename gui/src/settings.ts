import anime from 'animejs';
import { bytesToFormatted } from './utils';

let sidebarHighlight = document.querySelector<HTMLElement>(".sidebar-highlight")!;
let inAnim = false;
let settingsTab = 'account';

document.querySelector<HTMLElement>("#settings-account-tab")!.onclick = () => {
  if(inAnim)return;
  inAnim = true;

  if(settingsTab == 'program'){
    anime({
      targets: '.settings-program',
      top: '0px',
      opacity: 0,
      duration: 300,
      easing: 'linear',
      complete: () => {
        document.querySelector<HTMLElement>(".settings-program")!.style.display = 'none';
      }
    });
  }

  if(settingsTab !== 'account'){
    document.querySelector<HTMLElement>(".settings-account")!.style.display = 'block';
    anime({
      targets: '.settings-account',
      top: '0px',
      opacity: 1,
      duration: 300,
      easing: 'linear'
    });

    settingsTab = 'account';
  }

  anime({
    targets: sidebarHighlight,
    top: '0px',
    complete: () => inAnim = false
  });
}

document.querySelector<HTMLElement>("#settings-program-tab")!.onclick = async () => {
  if(inAnim)return;
  inAnim = true;

  if(settingsTab == 'account'){
    anime({
      targets: '.settings-account',
      top: '50px',
      opacity: 0,
      duration: 300,
      easing: 'linear',
      complete: () => {
        document.querySelector<HTMLElement>(".settings-account")!.style.display = 'none';
      }
    });
  }

  if(settingsTab !== 'program'){
    let req = await fetch('http://127.0.0.1:53413/api/v1/stats', { headers: { key: localStorage.getItem('token')! } });
    let res = await req.json();

    document.querySelector<HTMLElement>("#photo-storage-size")!.innerHTML = res.photoCount + ' Photos (' + bytesToFormatted(res.totalSize, 0) + ')'
    document.querySelector<HTMLElement>(".settings-program")!.style.display = 'block';

    anime({
      targets: '.settings-program',
      top: '-50px',
      opacity: 1,
      duration: 300,
      easing: 'linear'
    });

    settingsTab = 'program';
  }

  anime({
    targets: sidebarHighlight,
    top: '50px',
    duration: 300,
    complete: () => inAnim = false
  });
}

let setupStorageSetting = ( id: string, cb: ( value: string ) => void ) => {
  let innerEl = document.querySelector<HTMLElement>(`#${id} > div`)!;
  let v = innerEl.innerText;

  let clickFunc = () => {
    let id = Math.random().toString().replace('0.', '');
    innerEl.innerHTML = `<input value="${v}" class="file-text-input" id="inpt-${id}">`;
    innerEl.onclick = () => {};

    document.querySelector<HTMLInputElement>(`#inpt-${id}`)!.onkeydown = ( e ) => {
      if(e.key == 'Enter'){
        v = document.querySelector<HTMLInputElement>(`#inpt-${id}`)!.value;
        cb(v);
  
        innerEl.innerText = v;
        innerEl.onclick = clickFunc;
      }
    }

    document.querySelector<HTMLInputElement>(`#inpt-${id}`)!.onchange = () => {
      v = document.querySelector<HTMLInputElement>(`#inpt-${id}`)!.value;
      cb(v);

      innerEl.innerText = v;
      innerEl.onclick = clickFunc;
    }
  }

  innerEl.onclick = clickFunc;

  return {
    text: ( value: string ) => {
      innerEl.textContent = value;
      v = value;
    }
  }
}

let finalStorageLocation = setupStorageSetting('final-storage-location', async ( value ) => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/settings/finalPhotoPath', { method: 'PUT', headers: { 'Content-Type': 'application/json', key: localStorage.getItem('token')! }, body: JSON.stringify({ value }) });
  let res = await req.json();

  if(!res.ok)
    console.error(res);
});

let loadSettings = async () => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/settings', { headers: { key: localStorage.getItem('token')! } });
  let res = await req.json();

  finalStorageLocation.text(res.finalPhotoPath);
  document.querySelector('#origin-storage-location')!.children[0].innerHTML = res.originPhotoPath;
}

export { loadSettings };