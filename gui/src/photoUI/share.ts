import anime from 'animejs';

let regButton = ( setTray: Function, trayOpen: string ) => {
  document.querySelector<HTMLElement>('#image-share-button')!.onclick = () => {
    console.log('Share button Clicked');

    if(trayOpen === 'share'){
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

    if(trayOpen !== 'none') {
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector('.image-tray')!.innerHTML = 'share';

          anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0,
          })

          setTray('share');
        }
      })
    } else{
      document.querySelector('.image-tray')!.innerHTML = 'share';
      document.querySelector<HTMLElement>('.image-tray')!.style.display = 'flex';

      anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
      anime({
        targets: '.image-tray',
        opacity: 1,
        translateY: 0,
      })

      setTray('share');
    }
  };
}

export default { regButton };