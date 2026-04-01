var concatBytes = require('./bytes').concatBytes;
var copyBytes = require('./bytes').copyBytes;

var INITIAL_HASH = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

var ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function addWords() {
  var sum = 0;

  for (var i = 0; i < arguments.length; i++) {
    sum = (sum + (arguments[i] >>> 0)) >>> 0;
  }

  return sum >>> 0;
}

function rightRotate(value, bits) {
  return ((value >>> bits) | (value << (32 - bits))) >>> 0;
}

function ch(x, y, z) {
  return ((x & y) ^ ((~x) & z)) >>> 0;
}

function maj(x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z)) >>> 0;
}

function bigSigma0(x) {
  return (rightRotate(x, 2) ^ rightRotate(x, 13) ^ rightRotate(x, 22)) >>> 0;
}

function bigSigma1(x) {
  return (rightRotate(x, 6) ^ rightRotate(x, 11) ^ rightRotate(x, 25)) >>> 0;
}

function smallSigma0(x) {
  return (rightRotate(x, 7) ^ rightRotate(x, 18) ^ (x >>> 3)) >>> 0;
}

function smallSigma1(x) {
  return (rightRotate(x, 17) ^ rightRotate(x, 19) ^ (x >>> 10)) >>> 0;
}

function appendLengthBits(paddedBytes, originalLength) {
  var bitLengthLow = (originalLength << 3) >>> 0;
  var bitLengthHigh = (originalLength >>> 29) >>> 0;

  paddedBytes[paddedBytes.length] = (bitLengthHigh >>> 24) & 0xff;
  paddedBytes[paddedBytes.length] = (bitLengthHigh >>> 16) & 0xff;
  paddedBytes[paddedBytes.length] = (bitLengthHigh >>> 8) & 0xff;
  paddedBytes[paddedBytes.length] = bitLengthHigh & 0xff;
  paddedBytes[paddedBytes.length] = (bitLengthLow >>> 24) & 0xff;
  paddedBytes[paddedBytes.length] = (bitLengthLow >>> 16) & 0xff;
  paddedBytes[paddedBytes.length] = (bitLengthLow >>> 8) & 0xff;
  paddedBytes[paddedBytes.length] = bitLengthLow & 0xff;
}

function padSha256Message(sourceBytes) {
  var paddedBytes = copyBytes(sourceBytes);
  var originalLength = paddedBytes.length;

  paddedBytes[paddedBytes.length] = 0x80;

  while ((paddedBytes.length % 64) !== 56) {
    paddedBytes[paddedBytes.length] = 0x00;
  }

  appendLengthBits(paddedBytes, originalLength);
  return paddedBytes;
}

function loadMessageSchedule(blockBytes, startOffset, schedule) {
  for (var i = 0; i < 16; i++) {
    var offset = startOffset + (i * 4);
    schedule[i] = (
      ((blockBytes[offset] << 24) >>> 0) |
      ((blockBytes[offset + 1] << 16) >>> 0) |
      ((blockBytes[offset + 2] << 8) >>> 0) |
      (blockBytes[offset + 3] >>> 0)
    ) >>> 0;
  }

  for (i = 16; i < 64; i++) {
    schedule[i] = addWords(
      smallSigma1(schedule[i - 2]),
      schedule[i - 7],
      smallSigma0(schedule[i - 15]),
      schedule[i - 16]
    );
  }
}

function processChunk(schedule, state) {
  var a = state[0];
  var b = state[1];
  var c = state[2];
  var d = state[3];
  var e = state[4];
  var f = state[5];
  var g = state[6];
  var h = state[7];

  for (var i = 0; i < 64; i++) {
    var temp1 = addWords(h, bigSigma1(e), ch(e, f, g), ROUND_CONSTANTS[i], schedule[i]);
    var temp2 = addWords(bigSigma0(a), maj(a, b, c));

    h = g;
    g = f;
    f = e;
    e = addWords(d, temp1);
    d = c;
    c = b;
    b = a;
    a = addWords(temp1, temp2);
  }

  state[0] = addWords(state[0], a);
  state[1] = addWords(state[1], b);
  state[2] = addWords(state[2], c);
  state[3] = addWords(state[3], d);
  state[4] = addWords(state[4], e);
  state[5] = addWords(state[5], f);
  state[6] = addWords(state[6], g);
  state[7] = addWords(state[7], h);
}

function wordsToBytes(words) {
  var result = [];
  var index = 0;

  for (var i = 0; i < words.length; i++) {
    result[index] = (words[i] >>> 24) & 0xff;
    result[index + 1] = (words[i] >>> 16) & 0xff;
    result[index + 2] = (words[i] >>> 8) & 0xff;
    result[index + 3] = words[i] & 0xff;
    index = index + 4;
  }

  return result;
}

function sha256Bytes(messageBytes) {
  var paddedBytes = padSha256Message(messageBytes);
  var state = copyBytes(INITIAL_HASH);
  var schedule = [];

  for (var offset = 0; offset < paddedBytes.length; offset = offset + 64) {
    loadMessageSchedule(paddedBytes, offset, schedule);
    processChunk(schedule, state);
  }

  return wordsToBytes(state);
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
//innerpad = key XOR 0x36
//outerpad = key XOR 0x5c
  var innerPad = [];
  var outerPad = [];

  for (var i = 0; i < blockSize; i++) {
    innerPad[i] = normalizedKey[i] ^ 0x36;
    outerPad[i] = normalizedKey[i] ^ 0x5c;
  }

  var innerHash = sha256Bytes(concatBytes(innerPad, messageBytes));
  return sha256Bytes(concatBytes(outerPad, innerHash));
}

function constantTimeEqual(left, right) {
  var maxLength = left.length > right.length ? left.length : right.length;
  var different = left.length ^ right.length;

  for (var i = 0; i < maxLength; i++) {
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
