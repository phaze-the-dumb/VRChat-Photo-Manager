import { bytesToFormatted } from "./utils";

let loggedInCb = () => {};
let loadAccountStuff = async () => {
  console.log('loading account');

  try{
    let req = await fetch('http://127.0.0.1:53413/api/v1/user?refresh=1', { headers: { key: localStorage.getItem('token')! } });
    let res = await req.json();
    if(!res.ok || !res.user)return console.log('Not logged in');

    let user = res.user;
    loggedInCb();
    
    if(user.settings.enableSync)
      document.querySelector<HTMLElement>('#image-share-button')!.style.display = 'flex';

    document.querySelector<HTMLElement>('.user-pfp')!.style.background = 'url(\'https://cdn.phazed.xyz/ID/Avatars/'+user._id+'/'+user.avatar+'.png\')';
    document.querySelector<HTMLElement>('.user-pfp')!.style.backgroundSize = 'cover';
    document.querySelector<HTMLElement>('.user-pfp')!.style.backgroundPosition = 'center';
    document.querySelector<HTMLElement>('.user-pfp')!.style.display = 'block';

    document.querySelector<HTMLElement>('.account-pfp')!.style.background = 'url(\'https://cdn.phazed.xyz/ID/Avatars/'+user._id+'/'+user.avatar+'.png\')';
    document.querySelector<HTMLElement>('.account-pfp')!.style.backgroundSize = 'cover';
    document.querySelector<HTMLElement>('.account-pfp')!.style.backgroundPosition = 'center';
    document.querySelector<HTMLElement>('.account-pfp')!.style.display = 'block';

    document.querySelector<HTMLElement>('#account-loggedout')!.style.display = 'none';
    document.querySelector<HTMLElement>('#account-loggedout-splash')!.style.display = 'none';
    document.querySelector<HTMLElement>('#account-loggedin-splash')!.style.display = 'block';
    document.querySelector<HTMLElement>('#account-loggedin')!.style.display = 'flex';
    document.querySelector<HTMLElement>('.share-menu')!.style.display = 'block';

    document.querySelector<HTMLElement>('.account-name')!.innerHTML = user.username;
    document.querySelector<HTMLElement>('.storage-label')!.innerHTML = bytesToFormatted(user.used, 0) + ' / ' + bytesToFormatted(user.storage, 0);

    if(user.used === user.storage)
      document.querySelector<HTMLElement>('.storage-bar')!.style.setProperty('--bar-size', '100%');
    else
      document.querySelector<HTMLElement>('.storage-bar')!.style.setProperty('--bar-size', ( user.used / user.storage ) * 100 + '%');

    document.querySelector<HTMLInputElement>('#class-share-code')!.value = user.shareCode;
    document.querySelector<HTMLInputElement>('#class-share-code')!.onclick = () => { document.querySelector<HTMLInputElement>('#class-share-code')!.select() };
  } catch(e){
    console.log(e);
    console.log('Not logged in');
  }
}

let isLoggedIn = ( cb: () => void ) => {
  loggedInCb = cb;
};

export { loadAccountStuff, isLoggedIn };