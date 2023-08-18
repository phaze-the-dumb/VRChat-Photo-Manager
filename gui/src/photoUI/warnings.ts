import anime from 'animejs';

let regButton = ( setTray: Function, trayOpen: () => string, currentPhoto: () => any ) => {
  document.querySelector<HTMLElement>('#image-warning-button')!.onclick = () => {
    console.log('Share button Clicked');

    if(trayOpen() === 'warnings'){
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

    currentPhoto().warnings.forEach(( w: string ) =>
      text += `<div class="warning"><div class="icon"><i class="fa-solid fa-triangle-exclamation"></i></div><div class="body">${w}</div></div>`)

    if(trayOpen() !== 'none') {
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector<HTMLElement>('.image-tray')!.style.display = 'flex';
          document.querySelector('.image-tray')!.innerHTML = text;

          anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0,
          })

          setTray('warnings');
        }
      })
    } else{
      document.querySelector('.image-tray')!.innerHTML = text;
      document.querySelector<HTMLElement>('.image-tray')!.style.display = 'flex';

      anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
      anime({
        targets: '.image-tray',
        opacity: 1,
        translateY: 0,
      })

      setTray('warnings');
    }
  };
}

export default { regButton };