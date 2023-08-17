import './index.css';
import anime from 'animejs';

let loadingText = document.querySelector<HTMLElement>('.loading')!;

setTimeout(() => {
    authThread();
}, 100);

let loadImages = async () => {
  let req = await fetch('http://127.0.0.1:53413/api/v1/photos', { headers: { 'key': localStorage.getItem('token')! } });
  let res = await req.json();

  console.log(res);
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

    setInterval(() => {
      fetch('http://127.0.0.1:53413/api/v1/heartbeat', { headers: { 'key': localStorage.getItem('token')! } });
    }, 9500);
  } else{
    loadingText.innerHTML = 'Failed to connect to Backend, Please restart the app.';
  }
}