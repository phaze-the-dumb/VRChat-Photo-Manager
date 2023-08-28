import anime from 'animejs';

let regButton = ( setTray: Function, trayOpen: () => string, currentPhoto: () => any ) => {
  document.querySelector<HTMLElement>('#image-people-button')!.onclick = async () => {
    console.log('People button Clicked');

    if(trayOpen() === 'people'){
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

    let text = `
      <span class="tray-header">People</span><br />`

    for(let user of currentPhoto().VRCXData.players){
      if(user.id && user.id !== '')
        text += `<div class="people-user">${user.displayName} <i id="open-user-${user.id}" class="open-user fa-solid fa-arrow-up-right-from-square"></i></div>`
      else
        text += `<div class="people-user">${user.displayName}</div>`
    }

    if(trayOpen() !== 'none') {
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';
          document.querySelector('.image-tray')!.innerHTML = text;

          for(let user of currentPhoto().VRCXData.players){
            if(user.id && user.id !== '')
              document.querySelector<HTMLElement>('#open-user-'+user.id)!.onclick = () =>
                fetch('http://127.0.0.1:53413/api/v1/openurl?url=https://vrchat.com/home/user/'+user.id, { headers: { key: localStorage.getItem('token')! } });
          }

          anime.set('.image-tray', { translateX: '-50%', translateY: '-20px' });
          anime.set('.people-user', { opacity: 0, translateY: '20px' });

          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0
          })

          anime({
            targets: '.people-user',
            opacity: 1,
            translateY: 0,
            delay: anime.stagger(100)
          })

          setTray('people');
        }
      })
    } else{
      document.querySelector('.image-tray')!.innerHTML = text;
      document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';

      for(let user of currentPhoto().VRCXData.players){
        if(user.id && user.id !== '')
          document.querySelector<HTMLElement>('#open-user-'+user.id)!.onclick = () =>
            fetch('http://127.0.0.1:53413/api/v1/openurl?url=https://vrchat.com/home/user/'+user.id, { headers: { key: localStorage.getItem('token')! } });
      }

      anime.set('.image-tray', { translateX: '-50%', translateY: '-20px' });
      anime.set('.people-user', { opacity: 0, translateY: '20px' });

      anime({
        targets: '.image-tray',
        opacity: 1,
        translateY: 0,
      })

      anime({
        targets: '.people-user',
        opacity: 1,
        translateY: 0,
        delay: anime.stagger(100)
      })

      setTray('people');
    }
  };
}

export default { regButton };