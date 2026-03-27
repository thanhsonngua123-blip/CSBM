var modern = require('./crypto/modern');

function encryptAES(text, key) {
  if (!text) {
    return '';
  }

  return modern.encryptModern(text, key);
}

function decryptAES(ciphertext, key) {
  if (!ciphertext) {
    return '';
  }

  if (modern.isModernCiphertext(ciphertext)) {
    return modern.decryptModern(ciphertext, key);
  }

  throw new Error('Ciphertext khong hop le');
}

module.exports = {
  encryptAES,
  decryptAES,
  isModernCiphertext: modern.isModernCiphertext
};
