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

  throw new Error('Ciphertext không hợp lệ');
}

module.exports = {
  encryptAES,
  decryptAES,
  isModernCiphertext: modern.isModernCiphertext
};
