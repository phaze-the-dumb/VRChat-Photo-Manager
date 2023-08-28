import anime from 'animejs';
import { bytesToFormatted } from './utils';
import { loadAccountStuff } from './account';

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
    duration: 300,
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

document.querySelector<HTMLElement>('.login-button')!.onclick = () => {
  window.location.href = 'https://photos.phazed.xyz/api/v1/auth';
}

let finalStorageLocation = setupStorageSetting('final-storage-location', async ( value ) => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/settings/finalPhotoPath', { method: 'PUT', headers: { 'Content-Type': 'application/json', key: localStorage.getItem('token')! }, body: JSON.stringify({ value }) });
  let res = await req.json();

  if(!res.ok)
    console.error(res);
});

let showStorageWarning = false;
let showUpdaterWarning = false;

let loadSettings = async () => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/settings', { headers: { key: localStorage.getItem('token')! } });
  let res = await req.json();

  finalStorageLocation.text(res.finalPhotoPath);
  document.querySelector('#origin-storage-location')!.children[0].innerHTML = res.originPhotoPath;
  document.querySelector('#software-version')!.innerHTML = 'Software Version: ' + res.version;

  console.log('Loaded settings, now loading account stuff');
  loadAccountStuff();

  let sres = res;

  let i = setInterval(async () => {
    let req = await fetch('http://127.0.0.1:53413/api/v1/status', { headers: { key: localStorage.getItem('token')! } });
    let res = await req.json();

    if(res.restoring)window.clearInterval(i);

    if(res.update && !showUpdaterWarning){
      showUpdaterWarning = true;
      document.querySelector<HTMLElement>('.updater')!.style.display = 'flex';

      document.querySelector<HTMLElement>('#current-version')!.innerHTML = sres.version;
      document.querySelector<HTMLElement>('#update-version')!.innerHTML = res.update.tag_name;

      anime({
        targets: '.updater',
        opacity: 1,
        easing: 'linear',
        duration: 300
      })
    }

    if(res.lowStorage && !showStorageWarning){
      showStorageWarning = true;
      document.querySelector<HTMLElement>('.low-storage-warning')!.style.display = 'block';

      anime({
        targets: '.low-storage-warning',
        opacity: 1,
        easing: 'linear',
        duration: 300
      })
    } else if(!res.lowStorage && showStorageWarning){
      showStorageWarning = false;

      anime({
        targets: '.low-storage-warning',
        opacity: 1,
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector<HTMLElement>('.low-storage-warning')!.style.display = 'none';
        }
      })
    }

    if(res.uploading)
      document.querySelector<HTMLElement>('#sync-status')!.innerHTML = 'Uploading...';
    else
      document.querySelector<HTMLElement>('#sync-status')!.innerHTML = '';
  }, 1000);
}

document.querySelector<HTMLElement>('.update-button')!.onclick = () => {
  anime({
    targets: '.updater',
    opacity: 0,
    easing: 'linear',
    duration: 300
  })

  document.querySelector<HTMLElement>('.loading')!.style.display = 'block';
  document.querySelector<HTMLElement>('.loading')!.innerHTML = 'Updating...';

  anime({
    targets: '.loading',
    opacity: 1,
    easing: 'linear',
    duration: 300
  })

  fetch('http://127.0.0.1:53413/api/v1/confirm-update', { headers: { key: localStorage.getItem('token')! } })
    .then(data => data.json())
    .then(data => {
      document.querySelector<HTMLElement>('.loading')!.innerHTML = 'Installer opened. The app will close in a few seconds.';
    })
}

export { loadSettings };