import anime from 'animejs';

let isCtxMenuOpen = false;
let mouseOverCtxMenu = false;

let ctxmenu = document.querySelector<HTMLElement>('.context-menu')!;

ctxmenu.onmouseover = () => mouseOverCtxMenu = true;
ctxmenu.onmouseleave = () => mouseOverCtxMenu = false;

document.body.onclick = () => { if(isCtxMenuOpen && !mouseOverCtxMenu) closeCtxMenu(); };

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
        height: '0px',
        complete: cb
      })
    },
  })
}

export { isCtxMenuOpen, closeCtxMenu, showContextMenuImage, showContextMenuImageView };