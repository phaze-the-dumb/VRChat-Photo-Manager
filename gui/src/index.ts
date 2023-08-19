import './index.css';
import anime from 'animejs';

import { isCtxMenuOpen, showContextMenuImage, closeCtxMenu } from './contextMenu';
import { place, months, days } from './utils';
import { showPhotoUI, currentPhoto, enlargedImage, trayOpen, setTray, getPhotoIndex, closeImageUI } from './photoUI';

import copyButton from './photoUI/copy';
import shareButton from './photoUI/share';
import warningsButton from './photoUI/warnings';
import infoButton from './photoUI/info';
import prevButton from './photoUI/prev';
import nextButton from './photoUI/next';
import statsButton from './photoUI/stats';

let loadingText = document.querySelector<HTMLElement>('.loading')!;
let photos: any = [];
let imageContainer = document.querySelector<HTMLElement>('.image-container')!;
let lastPhotoIndex = -1;
let currentGroupDate = "";
let images: Array<HTMLImageElement> = [];

setTimeout(() => {
    authThread();
}, 100);

let loadAnotherImage = () => {
  let div = document.createElement('div');
  div.className = 'image-wrapper';

  lastPhotoIndex++;
  let photo = photos[lastPhotoIndex];
  let index = lastPhotoIndex;

  if(!photo)return;
  let date = new Date(photo.timestamp);

  if(currentGroupDate != date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()) {
    let title = document.createElement('div');
    title.className = 'group-title';
    title.innerHTML = days[date.getDay()] + ' ' + date.getDate() + '<sup class="smol-date">'+place(date.getDate().toString())+'</sup> ' + months[date.getMonth()] + ' <span class="smol-date">' + date.getFullYear() + "</span>";

    anime({
      targets: title,
      opacity: 1,
      duration: 500,
      easing: 'linear',
      translateY: '0px'
    })

    imageContainer.appendChild(title);
    currentGroupDate = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
  }

  let img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/scaled?key=' + localStorage.getItem('token')!;
  img.draggable = false;

  imageContainer.appendChild(div);
  div.appendChild(img);
  imageContainer.appendChild(div);
  images.push(img);

  div.style.height = '200px';
  div.style.width = Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px';

  div.onclick = () => {
    if(isCtxMenuOpen)return closeCtxMenu();

    showPhotoUI( photo, img, index );
  }

  div.oncontextmenu = ( e ) => {
    e.preventDefault();

    if(isCtxMenuOpen)return closeCtxMenu(() => showContextMenuImage( photo, img, e ));
    showContextMenuImage( photo, img, e );
  }

  img.onload = () => {
    anime.set(div, { translateY: '10px' });
    anime({
      targets: div,
      opacity: 1,
      duration: 500,
      easing: 'linear',
      translateY: '0px'
    })
  }
}

let loadImages = async () => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/photos', { headers: { 'key': localStorage.getItem('token')! } });
  let res = await req.json();

  photos = res.pictures;

  setInterval(() => {
    if(imageContainer.offsetHeight + imageContainer.scrollTop >= imageContainer.scrollHeight - 400)
      loadAnotherImage();
  }, 50);
}

let authThread = async () => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/requestKey');
  let res = await req.json();

  if(res.ok && !res.waiting){
    localStorage.setItem('token', res.key);
    loadingText.innerHTML = 'Connecting Socket...';

    let ws = new WebSocket('ws://127.0.0.1:53413/api/v1/socket?key='+res.key);

    ws.onopen = () => {
      loadingText.innerHTML = 'Connected to Backend';

      anime({
        targets: '.loading',
        opacity: 0,
        duration: 1000,
        easing: 'linear',
        complete: () => {
          document.querySelector<HTMLElement>('.loading')!.style.display = 'none';

          anime({
            targets: '.nav-bar',
            background: '#444',
            easing: 'linear',
            duration: 500
          })

          loadImages();
        }
      })
    }

    ws.onmessage = (e) => {
      console.log(e.data);
    }
  } else{
    loadingText.innerHTML = 'Failed to connect to Backend, Please restart the app.';
  }
}

copyButton.regButton(() => enlargedImage!);
shareButton.regButton(setTray, () => trayOpen);
warningsButton.regButton(setTray, () => trayOpen, () => currentPhoto);
infoButton.regButton(setTray, () => trayOpen, () => currentPhoto);
statsButton.regButton(setTray, () => trayOpen, () => currentPhoto);
prevButton.regButton(getPhotoIndex, () => images, () => photos, closeImageUI, showPhotoUI);
nextButton.regButton(getPhotoIndex, () => images, () => photos, closeImageUI, showPhotoUI, loadAnotherImage);