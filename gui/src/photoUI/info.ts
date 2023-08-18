import anime from 'animejs';

let regButton = ( setTray: Function, trayOpen: () => string, currentPhoto: () => any ) => {
  document.querySelector<HTMLElement>('#image-info-button')!.onclick = async () => {
    console.log('Info button Clicked');

    if(trayOpen() === 'info'){
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

    let worldInfoReq = await fetch('http://127.0.0.1:53413/api/v1/worlds/'+currentPhoto().VRCXData.world.id, { headers: { key: localStorage.getItem('token')! } });
    let worldInfo = await worldInfoReq.json();
    console.log(worldInfo);

    let formattedName = currentPhoto().VRCXData.world.name.split('');

    for(let char in formattedName)
      formattedName[char] = '<div class="world-title-char">'+formattedName[char]+'</div>';

    let text = `
      <div class="world-info">${formattedName.join('')} <i id="open-world-page" class="fa-solid fa-arrow-up-right-from-square"></i></div>`

    if(worldInfo.ok){
      text += `<div class="world-description">${worldInfo.data.desc}</div>`;

      text += `<br /><div style="text-align: center;">World Tags:</div>`;
      text += `<div class="world-tags">`;
      for(let tag of worldInfo.data.tags){
        if(tag === "system_approved")continue;

        tag = tag.replace('author_tag_', '');
        tag = tag.replace('system_', '');

        text += `<div class="world-tag">${tag}</div>`;
      }

      text += `</div><br />`;
      text += `<div class="scraper-watermark">${worldInfo.data.fromSite}</div>`;
    }

    if(trayOpen() !== 'none') {
      anime({
        targets: '.image-tray',
        opacity: 0,
        translateY: '-50px',
        easing: 'linear',
        duration: 300,
        complete: () => {
          document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';
          document.querySelector('.image-tray')!.innerHTML = text;

          document.querySelector<HTMLElement>('#open-world-page')!.onclick = () =>
            fetch('http://127.0.0.1:53413/api/v1/openurl?url=https://vrchat.com/home/world/'+currentPhoto().VRCXData.world, { headers: { key: localStorage.getItem('token')! } });

          anime.set('.image-tray', { translateX: '-50%', translateY: '-20px' });
          anime.set('.world-tag', { translateY: '-50px', opacity: 0 });
          anime.set('.world-title-char', { opacity: 0, translateY: '-5px'  });
          anime.set('.world-description', { opacity: 0 });

          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0
          })

          anime({
            targets: '.world-tag',
            delay: anime.stagger(100, { start: 200 }),
            opacity: 1,
            translateY: 0,
          })

          anime({
            targets: '.world-title-char',
            delay: anime.stagger(50),
            opacity: 1,
            translateY: 0
          })

          anime({
            targets: '.world-description',
            opacity: 1,
            delay: 100,
            easing: 'linear'
          })

          setTray('info');
        }
      })
    } else{
      document.querySelector('.image-tray')!.innerHTML = text;
      document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';

      document.querySelector<HTMLElement>('#open-world-page')!.onclick = () =>
        fetch('http://127.0.0.1:53413/api/v1/openurl?url=https://vrchat.com/home/world/'+currentPhoto().VRCXData.world.id, { headers: { key: localStorage.getItem('token')! } });

      anime.set('.image-tray', { translateX: '-50%', translateY: '-20px' });
      anime.set('.world-tag', { translateY: '-50px', opacity: 0 });
      anime.set('.world-title-char', { opacity: 0, translateY: '-5px' });
      anime.set('.world-description', { opacity: 0 });

      anime({
        targets: '.image-tray',
        opacity: 1,
        translateY: 0,
      })

      anime({
        targets: '.world-tag',
        delay: anime.stagger(100, { start: 200 }),
        opacity: 1,
        translateY: 0,
      })

      anime({
        targets: '.world-title-char',
        delay: anime.stagger(50),
        opacity: 1,
        translateY: 0
      })

      anime({
        targets: '.world-description',
        opacity: 1,
        delay: 100,
        easing: 'linear'
      })

      setTray('info');
    }
  };
}

export default { regButton };