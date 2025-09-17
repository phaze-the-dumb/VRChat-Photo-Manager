use std::str;

use serde::Serialize;

#[derive(Clone, Debug, Serialize)]
pub struct PNGImage {
  pub width: u32,
  pub height: u32,
  pub bit_depth: u8,
  pub colour_type: u8,
  pub compression_method: u8,
  pub filter_method: u8,
  pub interlace_method: u8,
  pub metadata: String,
  pub path: String,
  pub error: bool
}

impl PNGImage {
  pub fn new(buff: Vec<u8>, path: String) -> Result<PNGImage, &'static str> {
    if buff[0] != 0x89
      || buff[1] != 0x50
      || buff[2] != 0x4E
      || buff[3] != 0x47
      || buff[4] != 0x0D
      || buff[5] != 0x0A
      || buff[6] != 0x1A
      || buff[7] != 0x0A
    {
      dbg!(path);
      return Err("Image is not a PNG file");
    }

    let mut img = PNGImage {
      width: 0,
      height: 0,
      bit_depth: 0,
      colour_type: 0,
      compression_method: 0,
      filter_method: 0,
      interlace_method: 0,
      metadata: "".to_string(),
      path: path,
      error: false
    };

    img.read_png_chunk(8, buff);
    Ok(img)
  }

  fn read_png_chunk(&mut self, start_byte: usize, buff: Vec<u8>) {
    let data_buff = buff[start_byte..].to_vec();

    let length = u32::from_le_bytes([data_buff[3], data_buff[2], data_buff[1], data_buff[0]]);
    let chunk_type = str::from_utf8(&data_buff[4..8]).unwrap();

    match chunk_type {
      "IHDR" => {
        self.width = u32::from_le_bytes([data_buff[11], data_buff[10], data_buff[9], data_buff[8]]);

        self.height =
          u32::from_le_bytes([data_buff[15], data_buff[14], data_buff[13], data_buff[12]]);

        self.bit_depth = data_buff[16];
        self.colour_type = data_buff[17];
        self.compression_method = data_buff[18];
        self.filter_method = data_buff[19];
        self.interlace_method = data_buff[20];

        self.read_png_chunk((length + 12) as usize, data_buff);
      }
      "iTXt" => {
        let end_byte = (8 + length) as usize;
        let d = str::from_utf8(&data_buff[8..end_byte]).unwrap();

        self.metadata = d.to_string();

        self.read_png_chunk((length + 12) as usize, data_buff);
      }
      "IEND" => {}
      "IDAT" => {}
      _ => {
        self.read_png_chunk((length + 12) as usize, data_buff);
      }
    }
  }
}
