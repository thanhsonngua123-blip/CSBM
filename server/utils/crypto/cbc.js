var aesCore = require('./aes-core');
var splitBlocks = require('./bytes').splitBlocks;

function xorBlock(left, right) {
  var result = [];

  for (var i = 0; i < aesCore.BLOCK_SIZE; i = i + 1) {
    result[i] = left[i] ^ right[i];
  }

  return result;
}

function joinBlocks(blocks) {
  var result = [];
  var index = 0;

  for (var i = 0; i < blocks.length; i = i + 1) {
    for (var j = 0; j < blocks[i].length; j = j + 1) {
      result[index] = blocks[i][j];
      index = index + 1;
    }
  }

  return result;
}

function encryptCbc(plainBytes, expandedKey, ivBytes) {
  var blocks = splitBlocks(plainBytes, aesCore.BLOCK_SIZE);
  var encryptedBlocks = [];
  var previousBlock = ivBytes;

  for (var i = 0; i < blocks.length; i = i + 1) {
    var xored = xorBlock(blocks[i], previousBlock);
    var encrypted = aesCore.encryptBlock(xored, expandedKey);
    encryptedBlocks[i] = encrypted;
    previousBlock = encrypted;
  }

  return joinBlocks(encryptedBlocks);
}

function decryptCbc(cipherBytes, expandedKey, ivBytes) {
  var blocks = splitBlocks(cipherBytes, aesCore.BLOCK_SIZE);
  var plainBlocks = [];
  var previousBlock = ivBytes;

  for (var i = 0; i < blocks.length; i = i + 1) {
    var decrypted = aesCore.decryptBlock(blocks[i], expandedKey);
    plainBlocks[i] = xorBlock(decrypted, previousBlock);
    previousBlock = blocks[i];
  }

  return joinBlocks(plainBlocks);
}

module.exports = {
  xorBlock,
  encryptCbc,
  decryptCbc
};
