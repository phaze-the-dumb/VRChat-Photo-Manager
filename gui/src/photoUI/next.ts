let regButton = ( currentPhotoIndex: () => number, images: () => HTMLImageElement[], photos: () => any[], closeImageUI: ( tray: boolean ) => void, showImageUI: ( photo: any, img: HTMLImageElement, index: number ) => void, loadAnotherImage: () => void ) => {
  document.querySelector<HTMLElement>('.next-image-button')!.onclick = () => {
    if(currentPhotoIndex() == photos().length - 1)return;

    let newIndex = currentPhotoIndex() + 1;
    closeImageUI(true);

    if(!images()[newIndex])
      loadAnotherImage();

    showImageUI(photos()[newIndex], images()[newIndex], newIndex);
  }
}

export default { regButton };