var BLOCK_SIZE = require('./aes-core').BLOCK_SIZE;
var copyBytes = require('./bytes').copyBytes;
var sliceBytes = require('./bytes').sliceBytes;

function addPkcs7Padding(bytes) {
  var result = copyBytes(bytes);
  var paddingLength = BLOCK_SIZE - (result.length % BLOCK_SIZE);

  if (paddingLength === 0) {
    paddingLength = BLOCK_SIZE;
  }

  for (var i = 0; i < paddingLength; i = i + 1) {
    result[result.length] = paddingLength;
  }

  return result;
}

function removePkcs7Padding(bytes) {
  if (bytes.length === 0 || bytes.length % BLOCK_SIZE !== 0) {
    throw new Error('Padding khong hop le');
  }

  var paddingLength = bytes[bytes.length - 1];

  if (paddingLength < 1 || paddingLength > BLOCK_SIZE || paddingLength > bytes.length) {
    throw new Error('Padding khong hop le');
  }

  for (var i = bytes.length - paddingLength; i < bytes.length; i = i + 1) {
    if (bytes[i] !== paddingLength) {
      throw new Error('Padding khong hop le');
    }
  }

  return sliceBytes(bytes, 0, bytes.length - paddingLength);
}

module.exports = {
  addPkcs7Padding,
  removePkcs7Padding
};
