import anime from 'animejs';

let regButton = ( setTray: Function, trayOpen: () => string ) => {
  document.querySelector<HTMLElement>('#image-share-button')!.onclick = () => {
    console.log('Share button Clicked');

    if(trayOpen() === 'share'){
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector<HTMLElement>('.image-tray')!.style.display = 'none';
          document.querySelector('.image-tray')!.innerHTML = '';
          setTray('none');
        }
      });

      return;
    }

    let text = '';

    text += '<div class="share-code-input">User Share Code: <input id="share-input" placeholder="12345678"></div>';
    text += `<div class="share-user">
      <div class="user-avatar"></div>
      <div class="user-username">Loading...</div>
    </div>`;
    text += `<div class="share-confirm">Share</div>`;
    text += `<div class="user-not-found">Cannot find user.</div>`;

    if(trayOpen() !== 'none') {
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector('.image-tray')!.innerHTML = text;
          document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';

          anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0,
          })

          setTray('share');
          setupShare();
        }
      })
    } else{
      document.querySelector('.image-tray')!.innerHTML = text;
      document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';

      anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
      anime({
        targets: '.image-tray',
        opacity: 1,
        translateY: 0,
      })

      setTray('share');
      setupShare();
    }
  };
}

let setupShare = async () => {
  let el = document.querySelector<HTMLInputElement>('#share-input')!;
  let confirm = document.querySelector<HTMLInputElement>('.share-confirm')!;

  el.onchange = async () => {
    let req = await fetch('http://127.0.0.1:53413/api/v1/user/byCode?code='+el.value, { headers: { key: localStorage.getItem('token')! } });
    let res = await req.json();

    if(!res.ok){
      document.querySelector<HTMLElement>('.user-not-found')!.innerHTML = res.error;
      document.querySelector<HTMLElement>('.user-not-found')!.style.display = 'block';
      return;
    }

    document.querySelector<HTMLElement>('.user-not-found')!.style.display = 'none';
    document.querySelector<HTMLElement>('.share-code-input')!.style.display = 'none';
    document.querySelector<HTMLElement>('.share-confirm')!.style.display = 'inline-block';
    document.querySelector<HTMLElement>('.share-user')!.style.display = 'flex';

    document.querySelector<HTMLElement>('.share-user .user-avatar')!.style.background = 'url(\'https://cdn.phazed.xyz/ID/Avatars/'+res.user._id+'/'+res.user.avatar+'.png\') no-repeat';
    document.querySelector<HTMLElement>('.share-user .user-avatar')!.style.backgroundSize = 'cover';
    document.querySelector<HTMLElement>('.share-user .user-avatar')!.style.backgroundPosition = 'center';
    document.querySelector<HTMLElement>('.share-user .user-username')!.innerHTML = res.user.username;
  }

  confirm.onclick = () => {
    document.querySelector<HTMLElement>('.share-user')!.style.display = 'none';
    document.querySelector<HTMLElement>('.share-confirm')!.style.display = 'none';
    document.querySelector<HTMLElement>('.user-not-found')!.style.display = 'none';
    document.querySelector<HTMLElement>('.share-code-input')!.style.display = 'block';

    el.value = "";

    // Do share stuff
  }
}

export default { regButton };