import anime from 'animejs';

let navUser = document.querySelector<HTMLElement>('.nav-user')!;
let dropdown = document.querySelector<HTMLElement>('.user-dropdown')!;
let userDropdownOpen = false;
let inAnim = false;
let currentTab = 'photos';

let dropdownButtons: any = {
  'Settings': () => {
    if(inAnim || currentTab === 'settings')return;
    inAnim = true;

    currentTab = 'settings';

    anime({
      targets: '.image-container',
      easing: 'linear',
      opacity: 0,
      translateY: '50px',
      duration: 300,
      complete: () => {
        document.querySelector<HTMLElement>('.image-container')!.style.display = 'none';
        document.querySelector<HTMLElement>('#photos-tab')!.classList.remove('nav-tab-selected');

        closeDropdownMenu();
      }
    });

    document.querySelector<HTMLElement>('.settings-container')!.style.display = 'block';
    anime({
      targets: '.settings-container',
      easing: 'linear',
      opacity: 1,
      translateY: '0px',
      duration: 300
    });
  }
}

navUser.onclick = () => {
  if(inAnim)return;

  if(userDropdownOpen){
    closeDropdownMenu();
  } else{
    openDropdownMenu();
  }
}

let closeDropdownMenu = () => {
  inAnim = true;
  userDropdownOpen = false;

  anime({
    targets: dropdown,
    right: '-300px',
    easing: 'linear',
    opacity: 0,
    duration: 300,
    rotate: '-45deg',
    complete: () => {
      anime.set(dropdown, { rotate: '45deg', top: '-300px', right: '10px', opacity: 0 });
      inAnim = false;

      dropdown.innerHTML = '';
    }
  })
}

let openDropdownMenu = () => {
  inAnim = true;
  userDropdownOpen = true;

  anime.set(dropdown, { rotate: '45deg', top: '-300px', right: '10px', opacity: 0 });
  anime({
    targets: dropdown,
    top: '60px',
    rotate: '0deg',
    opacity: 1,
    width: '180px',
    height: Object.keys(dropdownButtons).length * 30 + 10 + 'px',
    complete: () => {
      inAnim = false;
    }
  })

  Object.keys(dropdownButtons).forEach(item => {
    let div = document.createElement('div');
    div.onclick = () => {
      dropdownButtons[item]();
    };

    div.innerHTML = item;
    div.classList.add('dropdown-menu-item');

    dropdown.appendChild(div);
  })

  anime({
    targets: '.dropdown-menu-item',
    opacity: 1,
    delay: anime.stagger(100, { start: 300 }),
    duration: 500,
    easing: 'linear',
  })
}

let closeSettingsMenuAnim = () => {
  anime({
    targets: '.settings-container',
    easing: 'linear',
    opacity: 0,
    translateY: '50px',
    duration: 300,
    complete: () =>
      document.querySelector<HTMLElement>('.settings-container')!.style.display = 'none'
  });
}

document.querySelector<HTMLElement>('#photos-tab')!.onclick = () => {
  if(inAnim || currentTab === 'photos')return;
  inAnim = true;

  if(currentTab === 'settings')
    closeSettingsMenuAnim();

  if(currentTab === 'jumpdate'){
    anime({
      targets: '.jump-to-date-menu',
      easing: 'linear',
      opacity: 0,
      duration: 300,
      complete: () => {
        inAnim = false;

        document.querySelector<HTMLElement>('#jump-to-date')!.classList.remove('nav-tab-selected');
        document.querySelector<HTMLElement>('.jump-to-date-menu')!.style.display = 'none';
      }
    });
  }

  document.querySelector<HTMLElement>('.image-container')!.style.display = 'block';
  currentTab = 'photos';

  anime({
    targets: '.image-container',
    easing: 'linear',
    opacity: 1,
    translateY: '0px',
    duration: 300,
    complete: () => {
      document.querySelector<HTMLElement>('#photos-tab')!.classList.add('nav-tab-selected');
      inAnim = false;
    }
  });
}

document.querySelector<HTMLElement>('.jump-to-date-menu')!.onclick = () => {
  if(inAnim || currentTab === 'photos')return;
  inAnim = true;

  if(currentTab === 'settings')
    closeSettingsMenuAnim();

  if(currentTab === 'jumpdate'){
    anime({
      targets: '.jump-to-date-menu',
      easing: 'linear',
      opacity: 0,
      duration: 300,
      complete: () => {
        inAnim = false;

        document.querySelector<HTMLElement>('#jump-to-date')!.classList.remove('nav-tab-selected');
        document.querySelector<HTMLElement>('.jump-to-date-menu')!.style.display = 'none';
      }
    });
  }

  document.querySelector<HTMLElement>('.image-container')!.style.display = 'block';
  currentTab = 'photos';

  anime({
    targets: '.image-container',
    easing: 'linear',
    opacity: 1,
    translateY: '0px',
    duration: 300,
    complete: () => {
      document.querySelector<HTMLElement>('#photos-tab')!.classList.add('nav-tab-selected');
      inAnim = false;
    }
  });
}

document.querySelector<HTMLElement>('#jump-to-date')!.onclick = () => {
  if(inAnim || currentTab === 'jumpdate')return;
  inAnim = true;

  if(currentTab === 'settings'){
    closeSettingsMenuAnim();

    anime({
      targets: '.image-container',
      easing: 'linear',
      opacity: 1,
      translateY: '0px',
      duration: 300
    });
  }

  if(currentTab === 'photos')
    document.querySelector<HTMLElement>('#photos-tab')!.classList.remove('nav-tab-selected');

  document.querySelector<HTMLElement>('.image-container')!.style.display = 'block';
  document.querySelector<HTMLElement>('.jump-to-date-menu')!.style.display = 'block';

  currentTab = 'jumpdate';

  anime({
    targets: '.jump-to-date-menu',
    easing: 'linear',
    opacity: 1,
    duration: 300,
    complete: () => {
      inAnim = false;
      document.querySelector<HTMLElement>('#jump-to-date')!.classList.add('nav-tab-selected');
    }
  });
}

let getCurrentTab = () => currentTab;

let loggedIn = () => {
  dropdownButtons['Sign Out'] = () => {
    fetch('http://127.0.0.1:53413/api/v1/signout', { headers: { key: localStorage.getItem('token')! } })
      .then(() => window.location.reload());
  }
}

export { getCurrentTab, loggedIn };