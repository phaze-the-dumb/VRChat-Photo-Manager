let days = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ];
let months = ["January", "February", "March", "April", "May", "June", "July","August", "September", "October", "November", "December"];

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

export { place, months, days };