import { bytesToFormatted } from "./utils";

let loadAccountStuff = async () => {
  console.log('loading account');
  let req = await fetch('http://127.0.0.1:53413/api/v1/user?refresh=1', { headers: { key: localStorage.getItem('token')! } });
  let res = await req.json();
  let user = res.user;

  console.log(res);

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

  document.querySelector<HTMLElement>('.account-name')!.innerHTML = user.username;
  document.querySelector<HTMLElement>('.storage-label')!.innerHTML = bytesToFormatted(user.used, 0) + ' / ' + bytesToFormatted(user.storage, 0);

  if(user.used === user.storage)
    document.querySelector<HTMLElement>('.storage-bar')!.style.setProperty('--bar-size', '100%');
  else
    document.querySelector<HTMLElement>('.storage-bar')!.style.setProperty('--bar-size', ( user.used / user.storage ) * 100 + '%');
}

export { loadAccountStuff };