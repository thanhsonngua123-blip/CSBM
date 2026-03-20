var aesCore = require('./aes-core');
var bytes = require('./bytes');

function normalizeLegacyKey(key) {
  var keyBytes = bytes.stringToBytes(key);
  var result = [];

  for (var i = 0; i < aesCore.BLOCK_SIZE; i = i + 1) {
    result[i] = i < keyBytes.length ? keyBytes[i] : 0;
  }

  return result;
}

function splitLegacyBlocks(dataBytes) {
  var blocks = [];
  var index = 0;

  for (var i = 0; i < dataBytes.length; i = i + aesCore.BLOCK_SIZE) {
    var block = [];

    for (var j = 0; j < aesCore.BLOCK_SIZE; j = j + 1) {
      block[j] = i + j < dataBytes.length ? dataBytes[i + j] : 0;
    }

    blocks[index] = block;
    index = index + 1;
  }

  if (blocks.length === 0) {
    blocks[0] = [];
    for (var k = 0; k < aesCore.BLOCK_SIZE; k = k + 1) {
      blocks[0][k] = 0;
    }
  }

  return blocks;
}

function isLegacyCiphertext(value) {
  return (
    typeof value === 'string' &&
    value.length >= 32 &&
    value.length % 32 === 0 &&
    bytes.isHexString(value)
  );
}

function decryptLegacy(ciphertext, key) {
  var cipherBytes = bytes.hexToBytes(ciphertext);
  var expandedKey = aesCore.expandKey(normalizeLegacyKey(key));
  var blocks = splitLegacyBlocks(cipherBytes);
  var plainBytes = [];
  var index = 0;

  for (var i = 0; i < blocks.length; i = i + 1) {
    var block = aesCore.decryptBlock(blocks[i], expandedKey);

    for (var j = 0; j < block.length; j = j + 1) {
      plainBytes[index] = block[j];
      index = index + 1;
    }
  }

  return bytes.bytesToLegacyString(plainBytes);
}

module.exports = {
  isLegacyCiphertext,
  decryptLegacy
};
