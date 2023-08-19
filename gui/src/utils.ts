let days = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ];
let months = ["January", "February", "March", "April", "May", "June", "July","August", "September", "October", "November", "December"];
let fileSize = [ 'B', 'KB', 'MB', 'GB' ];

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

let bytesToFormatted = ( bytes: number, stage: number ): string => {
  if(bytes > 1024){
    bytes = bytes / 1024;

    if(fileSize[stage + 1])
      return bytesToFormatted(bytes, stage + 1);
    else
      return bytes.toFixed(2) + fileSize[stage];
  } else
    return bytes.toFixed(2) + fileSize[stage];
}

export { place, months, days, bytesToFormatted };