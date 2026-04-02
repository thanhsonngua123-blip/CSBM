var aesCore = require('./aes-core');
var bytes = require('./bytes');
var cbc = require('./cbc');
var padding = require('./padding');
var hash = require('./hash');
var random = require('./random');

var CURRENT_VERSION = 'v2';
var MODERN_PREFIX = CURRENT_VERSION + '$';
var VERSION_BYTES = {
  v2: [0x76, 0x32]
};
var SALT_SIZE = 16;

function buildKeyMaterial(label, key, saltBytes) {
  var material = bytes.concatBytes(bytes.stringToBytes(label), saltBytes || []);
  return bytes.concatBytes(material, bytes.stringToBytes(key));
}

function deriveEncryptionKey(key, saltBytes) {
  var material = buildKeyMaterial('enc|', key, saltBytes);
  return bytes.sliceBytes(hash.sha256Bytes(material), 0, aesCore.BLOCK_SIZE);
}

function deriveMacKey(key, saltBytes) {
  var material = buildKeyMaterial('mac|', key, saltBytes);
  return hash.sha256Bytes(material);
}

function buildMacData(version, saltBytes, ivBytes, cipherBytes) {
  var headerBytes = bytes.concatBytes(VERSION_BYTES[version], saltBytes || []);
  return bytes.concatBytes(bytes.concatBytes(headerBytes, ivBytes), cipherBytes);
}

function isModernCiphertext(value) {
  return (
    typeof value === 'string' &&
    value.length > 4 &&
    value[0] === 'v' &&
    value[1] === '2' &&
    value[2] === '$'
  );
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

  if (parts[0] === CURRENT_VERSION && parts.length === 5) {
    return {
      version: parts[0],
      salt: parts[1],
      iv: parts[2],
      cipher: parts[3],
      mac: parts[4]
    };
  }

  throw new Error('Ciphertext khong hop le');
}

function encryptModern(text, key) {
  var plainBytes = padding.addPkcs7Padding(bytes.stringToBytes(text));
  var saltBytes = random.randomBytesArray(SALT_SIZE);
  var ivBytes = random.randomBytesArray(aesCore.BLOCK_SIZE);
  var expandedKey = aesCore.expandKey(deriveEncryptionKey(key, saltBytes));
  var cipherBytes = cbc.encryptCbc(plainBytes, expandedKey, ivBytes);
  var macBytes = hash.hmacSha256(
    deriveMacKey(key, saltBytes),
    buildMacData(CURRENT_VERSION, saltBytes, ivBytes, cipherBytes)
  );

  return (
    MODERN_PREFIX +
    bytes.bytesToHex(saltBytes) +
    '$' +
    bytes.bytesToHex(ivBytes) +
    '$' +
    bytes.bytesToHex(cipherBytes) +
    '$' +
    bytes.bytesToHex(macBytes)
  );
}

function decryptModern(ciphertext, key) {
  var parsed = parseModernCiphertext(ciphertext);
  var saltBytes = parsed.salt ? bytes.hexToBytes(parsed.salt) : [];
  var ivBytes = bytes.hexToBytes(parsed.iv);
  var cipherBytes = bytes.hexToBytes(parsed.cipher);
  var macBytes = bytes.hexToBytes(parsed.mac);

  if (
    saltBytes.length !== SALT_SIZE ||
    ivBytes.length !== aesCore.BLOCK_SIZE ||
    macBytes.length !== 32 ||
    cipherBytes.length === 0 ||
    cipherBytes.length % aesCore.BLOCK_SIZE !== 0
  ) {
    throw new Error('Ciphertext khong hop le');
  }

  var expectedMac = hash.hmacSha256(
    deriveMacKey(key, saltBytes),
    buildMacData(parsed.version, saltBytes, ivBytes, cipherBytes)
  );

  if (!hash.constantTimeEqual(macBytes, expectedMac)) {
    throw new Error('Du lieu da bi thay doi hoac khong hop le');
  }

  var expandedKey = aesCore.expandKey(deriveEncryptionKey(key, saltBytes));
  var plainBytes = cbc.decryptCbc(cipherBytes, expandedKey, ivBytes);
  return bytes.bytesToString(padding.removePkcs7Padding(plainBytes));
}

module.exports = {
  isModernCiphertext,
  parseModernCiphertext,
  encryptModern,
  decryptModern
};
