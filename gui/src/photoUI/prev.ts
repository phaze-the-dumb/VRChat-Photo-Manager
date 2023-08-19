let regButton = ( currentPhotoIndex: () => number, images: () => HTMLImageElement[], photos: () => any[], closeImageUI: () => void, showImageUI: ( photo: any, img: HTMLImageElement, index: number ) => void ) => {
  document.querySelector<HTMLElement>('.prev-image-button')!.onclick = () => {
    if(currentPhotoIndex() == 0)return;

    closeImageUI();
    let newIndex = currentPhotoIndex() - 1;

    setTimeout(() => {
      showImageUI(photos()[newIndex], images()[newIndex], newIndex);
    }, 500);
  }
}

export default { regButton };