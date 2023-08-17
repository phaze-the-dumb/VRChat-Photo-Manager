import './index.css';
import anime from 'animejs';

let loadingText = document.querySelector<HTMLElement>('.loading')!;
let photos: any = [];
let imageContainer = document.querySelector<HTMLElement>('.image-container')!;
let lastPhotoIndex = 0;
let currentGroupDate = "";

let days = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ];
let months = ["January", "February", "March", "April", "May", "June", "July","August", "September", "October", "November", "December"];

setTimeout(() => {
    authThread();
}, 100);

let loadImages = async () => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/photos', { headers: { 'key': localStorage.getItem('token')! } });
  let res = await req.json();

  photos = res.pictures;

  setInterval(() => {
    if (imageContainer.offsetHeight + imageContainer.scrollTop >= imageContainer.scrollHeight - 400) {
      let div = document.createElement('div');
      div.className = 'image-wrapper';

      lastPhotoIndex++;
      let photo = photos[lastPhotoIndex];
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
      img.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/scaled?key=' + localStorage.getItem('token')!;
  
      imageContainer.appendChild(div);
      div.appendChild(img);
      imageContainer.appendChild(div);

      div.style.height = '200px';
      div.style.width = Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px';

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

let place = ( num: string ): string => {
  if(num.toString().endsWith('1') && !num.toString().endsWith('11')){
      return 'st'
  } else if(num.toString().endsWith('2') && !num.toString().endsWith('12')){
      return 'nd'
  } else if(num.toString().endsWith('3') && !num.toString().endsWith('13')){
      return 'rd'
  } else{
      return 'th'
  }
}