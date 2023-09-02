import './index.css';
import anime from 'animejs';

import { isCtxMenuOpen, showContextMenuImage, closeCtxMenu } from './contextMenu';
import { place, months, days, bytesToFormatted } from './utils';
import { showPhotoUI, currentPhoto, enlargedImage, trayOpen, setTray, getPhotoIndex, closeImageUI, closeImageUINoAnim, showPhotoUINoAnim } from './photoUI';

import copyButton from './photoUI/copy';
import shareButton from './photoUI/share';
import warningsButton from './photoUI/warnings';
import infoButton from './photoUI/info';
import prevButton from './photoUI/prev';
import nextButton from './photoUI/next';
import statsButton from './photoUI/stats';
import deleteButton from './photoUI/delete';
import peopleButton from './photoUI/people';

import { loggedIn } from './tabs';
import { loadSettings, isLoggedIn } from './settings';

isLoggedIn(() => loggedIn());

let loadingText = document.querySelector<HTMLElement>('.loading')!;
let photos: any = [];
let imageContainer = document.querySelector<HTMLElement>('.image-container')!;
let lastPhotoIndex = -1;
let lastGroupDates: Array<string> = [];
let currentGroupDate = "";
let images: Array<HTMLImageElement> = [];
let imageContainers: Array<HTMLElement> = [];
let dateContainers: Array<HTMLElement> = [];
let targetScroll = 0;
let currentScroll = 0;
let lerp = ( x: number, y: number, a: number ) => x * (1 - a) + y * a;
let windowSize = { x: window.innerWidth, y: window.innerHeight };
let scrollSmoothness = 0.1;

window.addEventListener('resize', () => {
  windowSize.x = window.innerWidth;
  windowSize.y = window.innerHeight;
})

imageContainer.onwheel = ( e: WheelEvent ) => {
  e.preventDefault();
  targetScroll += e.deltaY;

  if(targetScroll < 0)
    targetScroll = 0;
}

imageContainer.onscroll = ( e: Event ) => {
  e.preventDefault();
}

let loadImagesInFrame = () => {
  imageContainers.forEach((image: HTMLElement, index: number) => {
    let rect = image.getBoundingClientRect();
    let top = rect.y;

    if(top + 200 < 0 || top > windowSize.y){
      // if(images[index])
        // images[index].style.display = 'none'; - Was causing ui flickering, need to find a fix (but shouldn't chromium do this automatically?)
    } else{
      if(!images[index])
        loadAnotherImage(index, image);

      // images[index].style.display = 'inline-block';
    }
  });
}

let loadAnotherImage = ( index: number, image?: HTMLElement ) => {
  let photo = photos[index];

  if(!image)
    image = imageContainers[index];

  let img = document.createElement('img');
  img.crossOrigin = 'anonymous';
  img.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/scaled?key=' + localStorage.getItem('token')!;
  img.draggable = false;

  image.appendChild(img);
  images[index] = img;

  image.onclick = () => {
    if(isCtxMenuOpen)return closeCtxMenu();

    showPhotoUI( photo, img, photo.getIndex() );
  }

  image.oncontextmenu = ( e ) => {
    e.preventDefault();

    if(isCtxMenuOpen)return closeCtxMenu(() => showContextMenuImage( photo, img, e ));
    showContextMenuImage( photo, img, e );
  }

  img.onload = () => {
    if(!image)return;

    anime.set(image, { translateY: '10px' });
    anime({
      targets: image,
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

  let dates = [];

  let index = 0;
  for(let photo of photos){
    let div = document.createElement('div');
    div.className = 'image-wrapper';

    photo.index = index;
    photo.getIndex = () => photo.index;

    index++;
    let date = new Date(photo.timestamp);

    if(currentGroupDate != date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()) {
      let title = document.createElement('div');
      title.className = 'group-title';
      title.innerHTML = '<span id="scroll-to-'+photo.timestamp+'"></span>' + days[date.getDay()] + ' ' + date.getDate() + '<sup class="smol-date">'+place(date.getDate().toString())+'</sup> ' + months[date.getMonth()] + ' <span class="smol-date">' + date.getFullYear() + "</span>";

      let dateStr = '<div class="date" id="photo-date-'+photo.timestamp+'">'+days[date.getDay()]+' '+date.getDate()+'<sup class="date-sub-text">'+place(date.getDate().toString())+'</sup> '+months[date.getMonth()]+' <span class="date-sub-text">'+date.getFullYear()+'</span></div>';
      dates.push(dateStr);

      anime({
        targets: title,
        opacity: 1,
        duration: 500,
        easing: 'linear',
        translateY: '0px'
      })
  
      imageContainer.appendChild(title);
  
      lastGroupDates.push(date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear());
      dateContainers.push(title);
      currentGroupDate = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
    }

    imageContainer.appendChild(div);
    imageContainers.push(div);

    div.style.height = '200px';
    div.style.width = Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px';
  }

  document.querySelector<HTMLElement>('.dates')!.innerHTML = dates.join('');

  for(let photo of photos){
    let el = document.querySelector<HTMLElement>('#photo-date-'+photo.timestamp)!;
    if(!el)continue;

    el.onclick = () => {
      console.log('scrolling to: '+photo.timestamp);
      targetScroll = currentScroll + document.querySelector('#scroll-to-'+photo.timestamp)!.getBoundingClientRect().y - 60;
    }
  }

  if(photos.length === 0){
    document.querySelector<HTMLElement>('.image-container')!.innerHTML = '<div class="no-photo-warning">You seem to have no photos.<br />Take some in vrchat!<br /><br />If you are sure that you have photos, OR you have just updated, Please restart the app (its a bug and i have no idea how to fix it)</div>'
    return;
  }

  let index2 = 0;
  while(true){
    let photo = photos[index2];
    let image = imageContainers[index2];

    if(!photo)break;

    let img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/scaled?key=' + localStorage.getItem('token')!;
    img.draggable = false;

    image.appendChild(img);
    images[index2] = img;

    image.onclick = () => {
      if(isCtxMenuOpen)return closeCtxMenu();

      showPhotoUI( photo, img, photo.getIndex() );
    }

    image.oncontextmenu = ( e ) => {
      e.preventDefault();

      if(isCtxMenuOpen)return closeCtxMenu(() => showContextMenuImage( photo, img, e ));
      showContextMenuImage( photo, img, e );
    }
  
    img.onload = () => {
      anime.set(image, { translateY: '10px' });
      anime({
        targets: image,
        opacity: 1,
        duration: 500,
        easing: 'linear',
        translateY: '0px'
      })
    }

    console.log(image.getBoundingClientRect().y > windowSize.y + 300, image.getBoundingClientRect().y + 300, windowSize.y)
    if(image.getBoundingClientRect().y > windowSize.y + 300)
      break;

    index2++;
  }
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
            opacity: 1,
            easing: 'linear',
            duration: 500
          })

          loadImages();
          loadSettings(( amount: number ) => { scrollSmoothness = amount } );
        }
      })
    }

    ws.onmessage = (e) => {
      let msg = JSON.parse(e.data);

      switch(msg.type){
        case 'new-photo':
          console.log(msg.photo);

          photos.forEach(( p: any ) => {
            if(p.index !== undefined)
              p.index++;
          })

          photos.splice(0, 0, msg.photo);

          let div = document.createElement('div');
          div.className = 'image-wrapper';

          imageContainers.splice(0, 0, div);
          lastPhotoIndex++;

          let photo = photos[0];
          if(!photo)return;

          photo.index = 0;
          photo.getIndex = () => photo.index;

          let date = new Date(photo.timestamp);

          if(lastGroupDates[0] != date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()) {
            let title = document.createElement('div');
            title.className = 'group-title';
            title.id = 'scroll-to-'+photo.timestamp;
            title.innerHTML = days[date.getDay()] + ' ' + date.getDate() + '<sup class="smol-date">'+place(date.getDate().toString())+'</sup> ' + months[date.getMonth()] + ' <span class="smol-date">' + date.getFullYear() + "</span>";

            let dateStr = days[date.getDay()]+' '+date.getDate()+'<sup class="date-sub-text">'+place(date.getDate().toString())+'</sup> '+months[date.getMonth()]+' <span class="date-sub-text">'+date.getFullYear()+'</span>';
            let dateDiv = document.createElement('div');

            dateDiv.innerHTML = dateStr;
            dateDiv.className = 'date';
            dateDiv.id = 'photo-date-'+photo.timestamp;

            document.querySelector('.dates')!.insertBefore(dateDiv, document.querySelector('.dates')!.firstChild);

            dateDiv.onclick = () => {
              console.log('scrolling to: '+photo.timestamp);
              targetScroll = currentScroll + document.querySelector('#scroll-to-'+photo.timestamp)!.getBoundingClientRect().y - 60;
            }

            anime({
              targets: title,
              opacity: 1,
              duration: 500,
              easing: 'linear',
              translateY: '0px'
            })

            imageContainer.insertBefore(title, imageContainer.childNodes[0]);

            lastGroupDates.splice(0, 0, date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear());
            dateContainers.splice(0, 0, title);

            currentGroupDate = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
          }
        
          let img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/scaled?key=' + localStorage.getItem('token')!;
          img.draggable = false;
        
          imageContainer.insertBefore(div, imageContainer.childNodes[1]);
          div.appendChild(img)
          images.splice(0, 0, img);

          div.style.height = '200px';
          div.style.width = Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px';
        
          div.onclick = () => {
            if(isCtxMenuOpen)return closeCtxMenu();
        
            showPhotoUI( photo, img, photo.getIndex() );
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

          break;
        case 'photo-removed':
          console.log('Removing photo: '+msg.id);
          let p = photos.find(( p: any ) => p.timestamp === msg.id);
          if(!p)return;

          let index = photos.indexOf(p);

          photos.forEach(( ph: any, i: number ) => {
            if(ph.index !== undefined && i > index)
              ph.index--;
          })

          if(
            images[index].parentElement!.previousElementSibling!.classList.contains('group-title') &&
            images[index].parentElement!.nextElementSibling!.classList.contains('group-title')
          ){
            console.log('Removing group title');
            images[index].parentElement!.previousSibling!.remove();

            let date = new Date(photos[index].timestamp);

            let indx = lastGroupDates.indexOf(date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear());
            dateContainers[indx].remove();

            dateContainers.splice(indx, 1);
            lastGroupDates.splice(indx, 1);

            document.querySelector('.dates')!.children[indx].remove();
          }

          console.log(imageContainers);

          images[index].parentElement!.remove();
          photos = photos.filter(( p: any ) => p.timestamp !== msg.id);
          
          images.splice(index, 1);
          imageContainers.splice(index, 1);

          if(currentPhoto && msg.id === currentPhoto.timestamp)
            closeImageUI();

          break;
        case 'update-storage':
          document.querySelector<HTMLElement>('.storage-label')!.innerHTML = bytesToFormatted(msg.used, 0) + ' / ' + bytesToFormatted(msg.storage, 0);

          if(msg.used === msg.storage)
            document.querySelector<HTMLElement>('.storage-bar')!.style.setProperty('--bar-size', '100%');
          else
            document.querySelector<HTMLElement>('.storage-bar')!.style.setProperty('--bar-size', ( msg.used / msg.storage ) * 100 + '%');

          break;
        case 'photo-synced':
          photos.find(( p: any ) => p.timestamp === msg.photo).isSynced = true;
          break;
        case 'restoring':
          loadingText.innerHTML = 'Some of your photos seem to have gone missing. We are currently restoring them from the cloud...';
          document.querySelector<HTMLElement>('.loading')!.style.display = 'block';

          anime({
            targets: '.nav-bar',
            opacity: 0,
            easing: 'linear',
            duration: 500
          })

          anime({
            targets: '.loading',
            opacity: 1,
            duration: 1000,
            easing: 'linear'
          })

          anime({
            targets: '.image-container',
            opacity: 0,
            duration: 50,
            easing: 'linear'
          })

          anime({
            targets: '.settings-container',
            opacity: 0,
            duration: 50,
            easing: 'linear'
          })

          break;
      }
    }
  } else if(res.waiting){
    loadingText.innerHTML = 'Failed to connect to Backend, Please restart the app.';
  } else{
    loadingText.innerHTML = res.error;
  }
}

let update = () => {
  requestAnimationFrame(update);

  currentScroll = lerp(currentScroll, targetScroll, scrollSmoothness);
  imageContainer.scrollTop = currentScroll;

  loadImagesInFrame();
}

copyButton.regButton(() => enlargedImage!);
shareButton.regButton(setTray, () => trayOpen);
warningsButton.regButton(setTray, () => trayOpen, () => currentPhoto);
infoButton.regButton(setTray, () => trayOpen, () => currentPhoto);
deleteButton.regButton(setTray, () => trayOpen, () => currentPhoto);
statsButton.regButton(setTray, () => trayOpen, () => currentPhoto);
peopleButton.regButton(setTray, () => trayOpen, () => currentPhoto);
prevButton.regButton(getPhotoIndex, () => images, () => photos, closeImageUINoAnim, showPhotoUINoAnim, loadAnotherImage);
nextButton.regButton(getPhotoIndex, () => images, () => photos, closeImageUINoAnim, showPhotoUINoAnim, loadAnotherImage);

authThread();
update();