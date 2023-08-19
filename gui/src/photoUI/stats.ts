import anime from 'animejs';
import { bytesToFormatted } from '../utils';

let regButton = ( setTray: Function, trayOpen: () => string, currentPhoto: () => any ) => {
  document.querySelector<HTMLElement>('#image-stats-button')!.onclick = () => {
    console.log('Share button Clicked');

    if(trayOpen() === 'stats'){
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

    let photo = currentPhoto();

    let text = `
    File Name: ${photo.name}<br />
    Image Resolution: ${photo.res[0]} x ${photo.res[1]}px<br />
    File Size: ${bytesToFormatted(photo.stat.size, 0)}`;

    console.log(photo.stat);

    if(trayOpen() !== 'none') {
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector('.image-tray')!.innerHTML = text;

          anime.set('.image-tray', { translateX: '-50%', translateY: '-50px' });
          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0,
          })

          setTray('stats');
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

      setTray('stats');
    }
  };
}

export default { regButton };