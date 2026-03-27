var aesCore = require('./aes-core');
var bytes = require('./bytes');
var cbc = require('./cbc');
var padding = require('./padding');
var hash = require('./hash');
var random = require('./random');

var MODERN_PREFIX = 'v2$';
var MODERN_PREFIX_BYTES = [0x76, 0x32];

function deriveEncryptionKey(key) {
  var material = bytes.concatBytes(bytes.stringToBytes('enc|'), bytes.stringToBytes(key));
  return bytes.sliceBytes(hash.sha256Bytes(material), 0, aesCore.BLOCK_SIZE);
}

function deriveMacKey(key) {
  var material = bytes.concatBytes(bytes.stringToBytes('mac|'), bytes.stringToBytes(key));
  return hash.sha256Bytes(material);
}

function buildMacData(ivBytes, cipherBytes) {
  return bytes.concatBytes(bytes.concatBytes(MODERN_PREFIX_BYTES, ivBytes), cipherBytes);
}

function isModernCiphertext(value) {
  return typeof value === 'string' && value.length > 4 && value[0] === 'v' && value[1] === '2' && value[2] === '$';
}

function splitModernParts(ciphertext) {
  var parts = [];
  var current = '';
  var index = 0;

  for (var i = 0; i < ciphertext.length; i++) {
    if (ciphertext[i] === '$') {
      parts[index] = current;
      current = '';
      index++;
    } else {
      current = current + ciphertext[i];
    }
  }

  parts[index] = current;
  return parts;
}

function parseModernCiphertext(ciphertext) {
  var parts = splitModernParts(ciphertext);

  if (parts.length !== 4 || parts[0] !== 'v2') {
    throw new Error('Ciphertext khong hop le');
  }

  return {
    version: parts[0],
    iv: parts[1],
    cipher: parts[2],
    mac: parts[3]
  };
}

function encryptModern(text, key) {
  var plainBytes = padding.addPkcs7Padding(bytes.stringToBytes(text));
  var ivBytes = random.randomBytesArray(aesCore.BLOCK_SIZE);
  var expandedKey = aesCore.expandKey(deriveEncryptionKey(key));
  var cipherBytes = cbc.encryptCbc(plainBytes, expandedKey, ivBytes);
  var macBytes = hash.hmacSha256(deriveMacKey(key), buildMacData(ivBytes, cipherBytes));

  return MODERN_PREFIX + bytes.bytesToHex(ivBytes) + '$' + bytes.bytesToHex(cipherBytes) + '$' + bytes.bytesToHex(macBytes);
}

function decryptModern(ciphertext, key) {
  var parsed = parseModernCiphertext(ciphertext);
  var ivBytes = bytes.hexToBytes(parsed.iv);
  var cipherBytes = bytes.hexToBytes(parsed.cipher);
  var macBytes = bytes.hexToBytes(parsed.mac);

  if (
    ivBytes.length !== aesCore.BLOCK_SIZE ||
    macBytes.length !== 32 ||
    cipherBytes.length === 0 ||
    cipherBytes.length % aesCore.BLOCK_SIZE !== 0
  ) {
    throw new Error('Ciphertext khong hop le');
  }

  var expectedMac = hash.hmacSha256(deriveMacKey(key), buildMacData(ivBytes, cipherBytes));

  if (!hash.constantTimeEqual(macBytes, expectedMac)) {
    throw new Error('Du lieu da bi thay doi hoac khong hop le');
  }

  var expandedKey = aesCore.expandKey(deriveEncryptionKey(key));
  var plainBytes = cbc.decryptCbc(cipherBytes, expandedKey, ivBytes);
  return bytes.bytesToString(padding.removePkcs7Padding(plainBytes));
}

module.exports = {
  isModernCiphertext,
  parseModernCiphertext,
  encryptModern,
  decryptModern
};
