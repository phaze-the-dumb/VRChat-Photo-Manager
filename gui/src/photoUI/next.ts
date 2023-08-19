let regButton = ( currentPhotoIndex: () => number, images: () => HTMLImageElement[], photos: () => any[], closeImageUI: () => void, showImageUI: ( photo: any, img: HTMLImageElement, index: number ) => void, loadAnotherImage: () => void ) => {
  document.querySelector<HTMLElement>('.next-image-button')!.onclick = () => {
    if(currentPhotoIndex() == photos().length - 1)return;

    closeImageUI();
    let newIndex = currentPhotoIndex() + 1;

    if(!images()[newIndex])
      loadAnotherImage();

    setTimeout(() => {
      showImageUI(photos()[newIndex], images()[newIndex], newIndex);
    }, 500);
  }
}

export default { regButton };