const { recognize } = require('node-tesseract-ocr');
const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}

async function processImage(img) {
  let imgText = await recognize(img, config);
  return imgText.replace(',,', '').replace(/\s+/g, ' ');
}

module.exports = processImage;