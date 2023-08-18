import anime from 'animejs';

let regButton = ( getEnlargedImage: () => HTMLImageElement ) => {
  document.querySelector<HTMLElement>('#image-copy-button')!.onclick = () => {
    console.log('Copy Button Clicked');

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');

    canvas.width = getEnlargedImage().width;
    canvas.height = getEnlargedImage().height;

    ctx?.drawImage(getEnlargedImage(), 0, 0, canvas.width, canvas.height);

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
}

export default { regButton };