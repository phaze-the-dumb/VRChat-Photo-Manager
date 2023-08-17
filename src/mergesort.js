let mergeSort = ( photos ) => {
  let len = photos.length;
  let halfLen = Math.floor( len / 2 );

  if(len <= 1)return photos;

  let left = photos.slice(0, halfLen);
  let right = photos.slice(halfLen, len);

  let merge = ( leftIndex, rightIndex, outIndex ) => {
    if(!left[leftIndex] || !right[rightIndex]){
      if(left[leftIndex]){
        photos[outIndex] = left[leftIndex];
        leftIndex++;
      } else if(right[rightIndex]){
        photos[outIndex] = right[rightIndex];
        rightIndex++;
      }
    } else if(left[leftIndex].timestamp > right[rightIndex].timestamp){
      photos[outIndex] = left[leftIndex];
      leftIndex++;
    } else{
      photos[outIndex] = right[rightIndex];
      rightIndex++;
    }

    if(left.length > leftIndex || right.length > rightIndex){
      merge(leftIndex, rightIndex, outIndex + 1);
    }
  }

  if(left.length > 1)left = mergeSort(left);
  if(right.length > 1)right = mergeSort(right);

  merge(0, 0, 0);
  return photos;
}

module.exports = mergeSort;