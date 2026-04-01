var BLOCK_SIZE = require('./aes-core').BLOCK_SIZE;
var copyBytes = require('./bytes').copyBytes;
var sliceBytes = require('./bytes').sliceBytes;

function addPkcs7Padding(bytes) {
  var result = copyBytes(bytes);
  var paddingLength = BLOCK_SIZE - (result.length % BLOCK_SIZE);

  for (var i = 0; i < paddingLength; i++) {
    result[result.length] = paddingLength;
  }

  return result;
}

function removePkcs7Padding(bytes) {
  if (bytes.length === 0 || bytes.length % BLOCK_SIZE !== 0) {
    throw new Error('Padding không hợp lệ');
  }

  var paddingLength = bytes[bytes.length - 1];

  if (paddingLength < 1 || paddingLength > BLOCK_SIZE || paddingLength > bytes.length) {
    throw new Error('Padding không hợp lệ');
  }

  for (var i = bytes.length - paddingLength; i < bytes.length; i++) {
    if (bytes[i] !== paddingLength) {
      throw new Error('Padding không hợp lệ');
    }
  }

  return sliceBytes(bytes, 0, bytes.length - paddingLength);
}

module.exports = {
  addPkcs7Padding,
  removePkcs7Padding
};
