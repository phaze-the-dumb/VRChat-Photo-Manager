use std::fs;

use tauri::{Emitter, State, Window};

use crate::util::cache::Cache;

#[tauri::command]
pub fn change_final_path(new_path: &str, window: Window, cache: State<Cache>) -> bool {
  match fs::metadata(&new_path) {
    Ok(_) => {
      let config_path = dirs::config_dir()
        .unwrap()
        .join("PhazeDev/VRChatPhotoManager/.photos_path");

      fs::write(&config_path, new_path.as_bytes()).unwrap();
      cache.insert("photo-path".into(), new_path.to_owned());

      true
    }
    Err(_) => {
      window.emit("vrcpm-error", "Error Changing Path: Path does not exist.").unwrap();
      false
    }
  }
}
