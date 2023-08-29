let regButton = ( currentPhotoIndex: () => number, images: () => HTMLImageElement[], photos: () => any[], closeImageUI: ( tray: boolean ) => void, showImageUI: ( photo: any, img: HTMLImageElement, index: number ) => void ) => {
  document.querySelector<HTMLElement>('.prev-image-button')!.onclick = () => {
    if(currentPhotoIndex() == 0)return;

    let newIndex = currentPhotoIndex() - 1;
    closeImageUI(true);

    showImageUI(photos()[newIndex], images()[newIndex], newIndex);
  }
}

export default { regButton };