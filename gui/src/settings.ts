import anime from 'animejs';

let sidebarHighlight = document.querySelector<HTMLElement>(".sidebar-highlight")!;
let inAnim = false;
let settingsTab = 'account';

document.querySelector<HTMLElement>("#settings-account-tab")!.onclick = () => {
  if(inAnim)return;
  inAnim = true;

  if(settingsTab == 'program'){
    anime({
      targets: '.settings-program',
      top: '0px',
      opacity: 0,
      duration: 300,
      easing: 'linear',
      complete: () => {
        document.querySelector<HTMLElement>(".settings-program")!.style.display = 'none';
      }
    });
  }

  if(settingsTab !== 'account'){
    document.querySelector<HTMLElement>(".settings-account")!.style.display = 'block';
    anime({
      targets: '.settings-account',
      top: '0px',
      opacity: 1,
      duration: 300,
      easing: 'linear'
    });

    settingsTab = 'account';
  }

  anime({
    targets: sidebarHighlight,
    top: '0px',
    complete: () => inAnim = false
  });
}

document.querySelector<HTMLElement>("#settings-program-tab")!.onclick = () => {
  if(inAnim)return;
  inAnim = true;

  if(settingsTab == 'account'){
    anime({
      targets: '.settings-account',
      top: '50px',
      opacity: 0,
      duration: 300,
      easing: 'linear',
      complete: () => {
        document.querySelector<HTMLElement>(".settings-account")!.style.display = 'none';
      }
    });
  }

  if(settingsTab !== 'program'){
    document.querySelector<HTMLElement>(".settings-program")!.style.display = 'block';
    anime({
      targets: '.settings-program',
      top: '-50px',
      opacity: 1,
      duration: 300,
      easing: 'linear'
    });

    settingsTab = 'program';
  }

  anime({
    targets: sidebarHighlight,
    top: '50px',
    duration: 300,
    complete: () => inAnim = false
  });
}