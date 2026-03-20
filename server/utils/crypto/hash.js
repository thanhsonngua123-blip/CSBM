var createHash = require('crypto').createHash;
var concatBytes = require('./bytes').concatBytes;
var copyBytes = require('./bytes').copyBytes;

function sha256Bytes(bytes) {
  return Array.from(createHash('sha256').update(Buffer.from(bytes)).digest());
}

function hmacSha256(keyBytes, messageBytes) {
  var blockSize = 64;
  var normalizedKey = copyBytes(keyBytes);

  if (normalizedKey.length > blockSize) {
    normalizedKey = sha256Bytes(normalizedKey);
  }

  while (normalizedKey.length < blockSize) {
    normalizedKey[normalizedKey.length] = 0;
  }

  var innerPad = [];
  var outerPad = [];

  for (var i = 0; i < blockSize; i = i + 1) {
    innerPad[i] = normalizedKey[i] ^ 0x36;
    outerPad[i] = normalizedKey[i] ^ 0x5c;
  }

  var innerHash = sha256Bytes(concatBytes(innerPad, messageBytes));
  return sha256Bytes(concatBytes(outerPad, innerHash));
}

function constantTimeEqual(left, right) {
  var maxLength = left.length > right.length ? left.length : right.length;
  var different = left.length ^ right.length;

  for (var i = 0; i < maxLength; i = i + 1) {
    var leftValue = left[i] === undefined ? 0 : left[i];
    var rightValue = right[i] === undefined ? 0 : right[i];
    different = different | (leftValue ^ rightValue);
  }

  return different === 0;
}

module.exports = {
  sha256Bytes,
  hmacSha256,
  constantTimeEqual
};
