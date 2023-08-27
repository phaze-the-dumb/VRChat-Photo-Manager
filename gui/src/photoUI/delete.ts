import anime from 'animejs';

let regButton = ( setTray: Function, trayOpen: () => string, currentPhoto: () => any ) => {
  document.querySelector<HTMLElement>('#image-delete-button')!.onclick = async () => {
    console.log('Delete button Clicked');

    if(trayOpen() === 'delete'){
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

    let text = `Are you sure you want to delete this image?<br /><br /><div class="delete-confirm-button">Confirm</div> <div class="delete-deny-button">No</div>`;

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

          document.querySelector<HTMLElement>('.delete-deny-button')!.onclick = () => {
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
          }

          document.querySelector<HTMLElement>('.delete-confirm-button')!.onclick = () => {
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

            fetch('http://127.0.0.1:53413/api/v1/photos/'+currentPhoto().timestamp+'/delete', { headers: { key: localStorage.getItem('token')! } });
          }

          anime.set('.image-tray', { translateX: '-50%', translateY: '-20px' });
          anime.set('.delete-deny-button', { opacity: 0, translateY: '-10px'  });
          anime.set('.delete-confirm-button', { opacity: 0, translateY: '-10px'  });

          anime({
            targets: '.image-tray',
            opacity: 1,
            translateY: 0
          })

          anime({
            targets: '.delete-deny-button',
            delay: 100,
            opacity: 1,
            translateY: 0
          })

          anime({
            targets: '.delete-confirm-button',
            delay: 200,
            opacity: 1,
            translateY: 0
          })

          setTray('delete');
        }
      })
    } else{
      document.querySelector('.image-tray')!.innerHTML = text;
      document.querySelector<HTMLElement>('.image-tray')!.style.display = 'block';

      document.querySelector<HTMLElement>('.delete-deny-button')!.onclick = () => {
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
      }

      document.querySelector<HTMLElement>('.delete-confirm-button')!.onclick = () => {
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

        document.querySelector<HTMLElement>('.loading')!.style.display = 'block';
        document.querySelector<HTMLElement>('.loading')!.innerHTML = 'Deleting Image...';

        anime({
          targets: '.loading',
          opacity: 1,
          easing: 'linear',
          duration: 300
        })

        fetch('http://127.0.0.1:53413/api/v1/photos/'+currentPhoto().timestamp+'/delete', { headers: { key: localStorage.getItem('token')! } })
          .then(data => data.json())
          .then(data => {
            if(!data.ok){
              document.querySelector<HTMLElement>('.notification-error')!.innerHTML = data.message;

              anime.set('.notification-error', { translateX: '-50%', translateY: '-50px' });
              anime({
                targets: '.notification-error',
                opacity: 1,
                translateY: 0,
              })

              setTimeout(() => {
                anime({
                  targets: '.notification-error',
                  opacity: 0,
                  translateY: '-50px',
                })
              }, 5000);
            }

            document.querySelector<HTMLElement>('.loading')!.innerHTML = 'Image Deleted.';
            anime({
              targets: '.loading',
              opacity: 0,
              duration: 300,
              easing: 'linear',
              complete: () => {
                document.querySelector<HTMLElement>('.loading')!.style.display = 'none';
              }
            })
          })
      }

      anime.set('.image-tray', { translateX: '-50%', translateY: '-20px' });
      anime.set('.delete-deny-button', { opacity: 0, translateY: '-10px'  });
      anime.set('.delete-confirm-button', { opacity: 0, translateY: '-10px'  });

      anime({
        targets: '.image-tray',
        opacity: 1,
        translateY: 0,
      })

      anime({
        targets: '.delete-deny-button',
        delay: 100,
        opacity: 1,
        translateY: 0
      })

      anime({
        targets: '.delete-confirm-button',
        delay: 200,
        opacity: 1,
        translateY: 0
      })

      setTray('delete');
    }
  };
}

export default { regButton };