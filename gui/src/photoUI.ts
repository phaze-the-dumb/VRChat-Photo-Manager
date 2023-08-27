import anime from 'animejs';

import { isCtxMenuOpen, closeCtxMenu, showContextMenuImageView } from './contextMenu';

let enlargedImage: null | HTMLImageElement = null;
let imgBoundingPos: null | DOMRect = null;
let currentImage: null | HTMLImageElement = null;
let currentPhoto: any = null;
let currentPhotoIndex = -1;
let trayOpen = 'none';

let setTray = ( tray: string ) =>
  trayOpen = tray;

let showPhotoUI = ( photo: any, img: HTMLImageElement, index: number ) => {
  console.log(photo, index);

  if(document.querySelector<HTMLElement>(".image-view")!.style.display === 'block')
    return;

  let c = img.parentElement!;
  imgBoundingPos = img.getBoundingClientRect();

  if(photo.warnings.length > 0)
    document.querySelector<HTMLElement>('#image-warning-button')!.style.display = 'flex';

  if(photo.VRCXData)
    document.querySelector<HTMLElement>('#image-info-button')!.style.display = 'flex';
  else
    document.querySelector<HTMLElement>('#image-info-button')!.style.display = 'none';

  c.style.position = 'fixed';
  c.style.top = imgBoundingPos.y + 'px';
  c.style.left = imgBoundingPos.x + 'px';
  c.style.zIndex = '9999';
  c.style.display = 'block';
  c.style.margin = '0px';

  img.style.height = '100%';
  img.style.width = '100%';

  currentImage = img;
  currentPhoto = photo;
  currentPhotoIndex = index;

  let width = (photo.res[0] * ( window.innerHeight / photo.res[1] ));
  let height = window.innerHeight;
  let left = window.innerWidth / 2 - width / 2;
  let top = 0;

  if(width > window.innerWidth){
    width = window.innerWidth;
    height = (photo.res[1] * ( window.innerWidth / photo.res[0] ));
    left = 0;
    top = window.innerHeight / 2 - height / 2;
  }

  window.onresize = () => {
    width = (photo.res[0] * ( window.innerHeight / photo.res[1] ));
    height = window.innerHeight;
    left = window.innerWidth / 2 - width / 2;

    if(width > window.innerWidth){
      width = window.innerWidth;
      height = (photo.res[1] * ( window.innerWidth / photo.res[0] ));
      left = 0;
      top = window.innerHeight / 2 - height / 2;
    }

    if(enlargedImage){
      enlargedImage.style.width = width + 'px';
      enlargedImage.style.height = height + 'px';
      enlargedImage.style.top = top + 'px';
      enlargedImage.style.left = left + 'px';
    }

    anime({
      targets: c,
      width: width + 'px',
      height: height + 'px',
      filter: 'blur(10px)',
      top: top,
      left: left,
      easing: 'linear',
      duration: 50
    })
  }

  let nav = document.querySelector<HTMLElement>(".nav-bar")!;
  anime({
    target: ".nav-bar",
    top: '-50px',
    duration: 200,
    update: ( anim ) => {
      nav.style.top = '-' + anim.progress * 0.5 + 'px';
    }
  })

  anime({
    targets: c,
    width: width + 'px',
    height: height + 'px',
    filter: 'blur(10px)',
    top: top,
    left: left,
    duration: 400,
    complete: () => {
      console.log('Made Image Bigger');
    }
  })

  let image = document.createElement('img');
  image.style.position = 'fixed';
  image.oncontextmenu = ( e ) => {
    e.preventDefault();

    if(isCtxMenuOpen)return closeCtxMenu(() => showContextMenuImageView( photo, image, e ));
    showContextMenuImageView( photo, image, e );
  }

  image.crossOrigin = 'anonymous';
  image.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/hd?key=' + localStorage.getItem('token');
  document.querySelector<HTMLElement>(".image-view")!.appendChild(image);

  image.onload = () => {
    console.log('Loaded Higher Res Image');

    document.querySelector<HTMLElement>(".image-view")!.style.display = 'block';
    anime({
      targets: '.image-view',
      opacity: 1,
      duration: 100,
      complete: () => {
        console.log('Shown Image View')
      }
    })

    enlargedImage = image;

    enlargedImage.style.width = width + 'px';
    enlargedImage.style.height = height + 'px';
    enlargedImage.style.top = top + 'px';
    enlargedImage.style.left = left + 'px';
  }
}

let closeImageUI = () => {
  window.onresize = () => {};

  if(trayOpen !== 'none') {
    anime({
      targets: '.image-tray',
      opacity: 0,
      translateY: '-50px',
      easing: 'linear',
      duration: 300,
    })
  }

  anime({
    targets: '.image-view',
    opacity: 0,
    duration: 100,
    easing: 'linear',
    complete: () => {
      console.log('Hidden Image View');
      document.querySelector<HTMLElement>('.image-view')!.style.display = 'none';

      let c = currentImage!.parentElement!;
      let photo = currentPhoto!;

      document.querySelector<HTMLElement>('.image-view')!.querySelectorAll('img').forEach( ( img: HTMLImageElement ) => { img.remove(); } );
      enlargedImage = null;

      anime({
        targets: c,
        width: Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px',
        height: '200px',
        filter: 'blur(0px)',
        easing: 'easeInOutQuad',
        duration: 100,
        top: imgBoundingPos!.y - 10,
        left: imgBoundingPos!.x - 10,
        margin: '10px',
        complete: () => {
          console.log('Made image smaller');

          c.style.display = 'inline-block';
          c.style.position = 'static';

          currentImage = null;
          currentPhoto = null;
          currentPhotoIndex = -1;

          trayOpen = 'none';
          document.querySelector<HTMLElement>('.image-tray')!.style.display = 'none';

          let nav = document.querySelector<HTMLElement>(".nav-bar")!;
          anime({
            target: '.nav-bar',
            top: '0px',
            duration: 200,
            update: ( anim ) => {
              nav.style.top = (anim.progress * 0.5) - 50 + 'px';
            }
          })

          anime.set(c, {
            width: Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px',
            height: '200px',
            filter: 'blur(0px)',
            margin: '10px'
          })
        }
      })
    }
  })
};

let getPhotoIndex = () => currentPhotoIndex;

document.querySelector<HTMLElement>('.image-close')!.onclick = () => closeImageUI();

export { showPhotoUI, currentImage, currentPhoto, enlargedImage, imgBoundingPos, trayOpen, setTray, getPhotoIndex, closeImageUI };