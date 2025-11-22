import { createSignal, onMount } from "solid-js";

import PhotoList from "./PhotoList";
import PhotoViewer from "./PhotoViewer";
import SettingsMenu from "./SettingsMenu";
import { animate, utils } from "animejs";
import { listen } from "@tauri-apps/api/event";

let App = () => {
  let [ errorText, setErrorText ] = createSignal('');

  onMount(() => {
    utils.set('.settings',
    {
      display: 'none',
      opacity: 0,
      translateX: '500px'
    })

    listen<string>('vrcpm-error', ( ev ) => {
      setErrorText(ev.payload);

      utils.set('.error-notif', { translateX: '-50%', translateY: '-100px' });
      animate('.error-notif', {
        ease: 'outElastic',
        opacity: 1,
        translateY: '0px'
      });

      setTimeout(() => {
        animate('.error-notif', {
          ease: 'outElastic',
          opacity: 0,
          translateY: '-100px'
        });
      }, 2000);
    });
  })

  return (
    <div class="container">
      <PhotoList />
      <PhotoViewer />

      <SettingsMenu />

      <div class="copy-notif">Image Copied!</div>
      <div class="error-notif">{ errorText() }</div>
    </div>
  );
}

export default App;
