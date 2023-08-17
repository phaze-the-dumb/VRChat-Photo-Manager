import './index.css';
import anime from 'animejs';

let loadingText = document.querySelector<HTMLElement>('.loading')!;
let photos: any = [];
let imageContainer = document.querySelector<HTMLElement>('.image-container')!;
let lastPhotoIndex = 0;
let currentGroupDate = "";
let enlargedImage: null | HTMLImageElement = null;
let imgBoundingPos: null | DOMRect = null;
let currentImage: null | HTMLImageElement = null;
let currentPhoto: any = null;
let isCtxMenuOpen = false;
let mouseOverCtxMenu = false;
let trayOpen = 'none';

let ctxmenu = document.querySelector<HTMLElement>('.context-menu')!;

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

ctxmenu.onmouseover = () => mouseOverCtxMenu = true;
ctxmenu.onmouseleave = () => mouseOverCtxMenu = false;

document.body.onclick = () => {
  if(isCtxMenuOpen && !mouseOverCtxMenu) closeCtxMenu();
}

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
      img.crossOrigin = 'anonymous';
      img.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/scaled?key=' + localStorage.getItem('token')!;
      img.draggable = false;
  
      imageContainer.appendChild(div);
      div.appendChild(img);
      imageContainer.appendChild(div);

      div.style.height = '200px';
      div.style.width = Math.floor(photo.res[0] * ( 200 / photo.res[1] )) + 'px';

      div.onclick = () => {
        if(isCtxMenuOpen)return closeCtxMenu();
        showPhotoUI( photo, img );
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

let closeCtxMenu = ( cb = () => {} ) => {
  if(!isCtxMenuOpen)return;
  isCtxMenuOpen = false;

  let menu = document.querySelector<HTMLElement>('.context-menu')!;

  anime({
    targets: '.context-menu-item',
    opacity: 0,
    delay: anime.stagger(10),
    duration: 100,
    easing: 'linear',
    complete: () => {
      menu.innerHTML = '';

      anime({
        targets: menu,
        opacity: 0,
        duration: 200,
        easing: 'linear',
        width: '0px',
        complete: cb
      })
    },
  })
}

let showContextMenuImage = ( photo: any, img: HTMLImageElement, e: MouseEvent ) => {
  let menu = document.querySelector<HTMLElement>('.context-menu')!;
  isCtxMenuOpen = true;

  menu.style.display = 'block';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';

  let menuItems: any = {
    'Copy Image (Smol)': () => {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(( blob ) => {
        navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob!
          })
        ]);

        canvas.remove();
        closeCtxMenu();

        anime.set('.notification-copy', { translateX: '-50%', translateY: '-50px' });
        anime({
          targets: '.notification-copy',
          opacity: 1,
          translateY: 0,
        })

        setTimeout(() => {
          anime({
            targets: '.notification-copy',
            opacity: 0,
            translateY: '-50px',
          })
        }, 2500);
      });
    },
    'Copy Image': () => {
      let fullImage = document.createElement('img');
      fullImage.crossOrigin = 'anonymous';
      fullImage.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/full?key=' + localStorage.getItem('token')!;

      fullImage.onload = () => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        canvas.width = fullImage.width;
        canvas.height = fullImage.height;

        ctx?.drawImage(fullImage, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(( blob ) => {
          navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob!
            })
          ]);

          canvas.remove();
          closeCtxMenu();

          anime.set('.notification-copy', { translateX: '-50%', translateY: '-50px' });
          anime({
            targets: '.notification-copy',
            opacity: 1,
            translateY: 0,
          })

          setTimeout(() => {
            anime({
              targets: '.notification-copy',
              opacity: 0,
              translateY: '-50px',
            })
          }, 2500);
        });
      }
    },
    'Open File Location': () => {
      fetch('http://127.0.0.1:53413/api/v1/photos/'+photo.timestamp+'/open?key='+localStorage.getItem('token')!).then(() => closeCtxMenu())
    }
  }

  anime({
    targets: menu,
    opacity: 1,
    duration: 200,
    easing: 'linear',
    width: '180px',
    height: Object.keys(menuItems).length * 30 + 10 + 'px'
  })

  Object.keys(menuItems).forEach(item => {
    let div = document.createElement('div');
    div.onclick = () => {
      menuItems[item]();
      closeCtxMenu();
    };

    div.innerHTML = item;
    div.classList.add('context-menu-item');

    menu.appendChild(div);
  })

  anime({
    targets: '.context-menu-item',
    opacity: 1,
    delay: anime.stagger(10, { start: 200 }),
    duration: 100,
    easing: 'linear',
  })
}

let showContextMenuImageView = ( photo: any, img: HTMLImageElement, e: MouseEvent ) => {
  let menu = document.querySelector<HTMLElement>('.context-menu')!;
  isCtxMenuOpen = true;

  menu.style.display = 'block';
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';

  let menuItems: any = {
    'Copy Image': () => {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(( blob ) => {
        navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob!
          })
        ]);

        canvas.remove();
        closeCtxMenu();

        anime.set('.notification-copy', { translateX: '-50%', translateY: '-50px' });
        anime({
          targets: '.notification-copy',
          opacity: 1,
          translateY: 0,
        })

        setTimeout(() => {
          anime({
            targets: '.notification-copy',
            opacity: 0,
            translateY: '-50px',
          })
        }, 2500);
      });
    },
    'Open File Location': () => {
      fetch('http://127.0.0.1:53413/api/v1/photos/'+photo.timestamp+'/open?key='+localStorage.getItem('token')!).then(() => closeCtxMenu());
    }
  }

  anime({
    targets: menu,
    opacity: 1,
    duration: 200,
    easing: 'linear',
    width: '180px',
    height: Object.keys(menuItems).length * 30 + 10 + 'px'
  })

  Object.keys(menuItems).forEach(item => {
    let div = document.createElement('div');
    div.onclick = () => {
      menuItems[item]();
    };

    div.innerHTML = item;
    div.classList.add('context-menu-item');

    menu.appendChild(div);
  })

  anime({
    targets: '.context-menu-item',
    opacity: 1,
    delay: anime.stagger(10, { start: 200 }),
    duration: 100,
    easing: 'linear',
  })
}

let showPhotoUI = ( photo: any, img: HTMLImageElement ) => {
  console.log(photo);

  let c = img.parentElement!;
  imgBoundingPos = img.getBoundingClientRect();

  if(photo.warnings.length > 0)
    document.querySelector<HTMLElement>('#image-warning-button')!.style.display = 'flex';

  if(photo.VRCXData)
    document.querySelector<HTMLElement>('#image-info-button')!.style.display = 'flex';

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

  anime({
    targets: c,
    width: width + 'px',
    height: height + 'px',
    filter: 'blur(10px)',
    top: top,
    left: left
  })

  let image = document.createElement('img');
  image.style.position = 'fixed';
  image.oncontextmenu = ( e ) => {
    e.preventDefault();

    if(isCtxMenuOpen)return closeCtxMenu(() => showContextMenuImageView( photo, image, e ));
    showContextMenuImageView( photo, image, e );
  }

  image.crossOrigin = 'anonymous';
  image.src = 'http://127.0.0.1:53413/api/v1/photos/' + photo.timestamp + '/full?key=' + localStorage.getItem('token');
  document.querySelector<HTMLElement>(".image-view")!.appendChild(image);

  image.onload = () => {
    document.querySelector<HTMLElement>(".image-view")!.style.display = 'block';
    anime({
      targets: '.image-view',
      opacity: 1
    })

    enlargedImage = image;

    enlargedImage.style.width = width + 'px';
    enlargedImage.style.height = height + 'px';
    enlargedImage.style.top = top + 'px';
    enlargedImage.style.left = left + 'px';
  }
}

document.querySelector<HTMLElement>('.image-close')!.onclick = () => {
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

  setTimeout(() => {
    anime({
      targets: '.image-view',
      opacity: 0,
      duration: 100,
      easing: 'linear',
      complete: () => {
        document.querySelector<HTMLElement>('.image-view')!.style.display = 'none';
  
        let c = currentImage!.parentElement!;
        let photo = currentPhoto!;
  
  
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
            c.style.display = 'inline-block';
            c.style.position = 'static';
  
            enlargedImage?.remove();
            enlargedImage = null;
  
            currentImage = null;
            currentPhoto = null;
          }
        })
      }
    })
  }, 100);
};

document.querySelector<HTMLElement>('#image-copy-button')!.onclick = () => {
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');

  canvas.width = enlargedImage!.width;
  canvas.height = enlargedImage!.height;

  ctx?.drawImage(enlargedImage!, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(( blob ) => {
    navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob!
      })
    ]);

    canvas.remove();

    anime.set('.notification-copy', { translateX: '-50%', translateY: '-50px' });
    anime({
      targets: '.notification-copy',
      opacity: 1,
      translateY: 0,
    })

    setTimeout(() => {
      anime({
        targets: '.notification-copy',
        opacity: 0,
        translateY: '-50px',
      })
    }, 2500);
  });
}

document.querySelector<HTMLElement>('#image-share-button')!.onclick = () => {};

document.querySelector<HTMLElement>('#image-warning-button')!.onclick = () => {
  if(trayOpen === 'warnings'){
    anime({
      targets: '.image-tray',
      opacity: 0,
      translateY: '-50px',
      easing: 'linear',
      duration: 300,
      complete: () => {
        document.querySelector<HTMLElement>('.image-tray')!.style.display = 'none';
        document.querySelector('.image-tray')!.innerHTML = '';
        trayOpen = 'none';
      }
    });

    return;
  }

  let text = '';

  currentPhoto.warnings.forEach(( w: string ) =>
    text += `<div class="warning"><div class="icon"><i class="fa-solid fa-triangle-exclamation"></i></div><div class="body">${w}</div></div>`)

  if(trayOpen !== 'none') {
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

        trayOpen = 'warnings';
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

    trayOpen = 'warnings';
  }
};

document.querySelector<HTMLElement>('#image-info-button')!.onclick = () => {};