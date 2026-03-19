var crypto = require('crypto');

var Sbox = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
];

var invSbox = [
  0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
  0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
  0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
  0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
  0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
  0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
  0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
  0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
  0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
  0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
  0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
  0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
  0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
  0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
  0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
  0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
];

var Rcon = [0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder('utf-8');

function layDoDai(data) {
  var dem = 0;
  while (data[dem] !== undefined) {
    dem = dem + 1;
  }
  return dem;
}


function chuoiSangBytes(str) {
  var encoded = textEncoder.encode(str);
  var bytes = [];
  for (var i = 0; i < encoded.length; i = i + 1) {
    bytes[i] = encoded[i];
  }
  return bytes;
}


function bytesSangChuoi(bytes) {
  var len = layDoDai(bytes);
  var cleanBytes = [];
  var idx = 0;
  for (var i = 0; i < len; i = i + 1) {
    if (bytes[i] !== 0) {
      cleanBytes[idx] = bytes[i];
      idx = idx + 1;
    }
  }
  return textDecoder.decode(Uint8Array.from(cleanBytes));
}

// Chuyá»ƒn 1 byte thÃ nh 2 kÃ½ tá»± hex (dÃ¹ng chia láº¥y dÆ°)
function byteSangHex(byte) {
  var hexKyTu = '0123456789abcdef';
  var cao = (byte - (byte % 16)) / 16;
  var thap = byte % 16;
  return hexKyTu[cao] + '' + hexKyTu[thap];
}

// Chuyá»ƒn máº£ng byte thÃ nh chuá»—i hex
function bytesSangHexString(bytes) {
  var len = layDoDai(bytes);
  var result = '';
  for (var i = 0; i < len; i = i + 1) {
    result = result + byteSangHex(bytes[i]);
  }
  return result;
}

// Chuyá»ƒn 1 kÃ½ tá»± hex thÃ nh sá»‘ (0-15)
function hexKyTuSangSo(c) {
  var bang = '0123456789abcdef';
  for (var i = 0; i < 16; i = i + 1) {
    if (bang[i] === c) return i;
  }
  var bangHoa = '0123456789ABCDEF';
  for (var i = 0; i < 16; i = i + 1) {
    if (bangHoa[i] === c) return i;
  }
  return 0;
}

// Chuyá»ƒn chuá»—i hex thÃ nh máº£ng byte
function hexStringSangBytes(hexStr) {
  var len = layDoDai(hexStr);
  var bytes = [];
  var idx = 0;
  for (var i = 0; i < len; i = i + 2) {
    var cao = hexKyTuSangSo(hexStr[i]);
    var thap = hexKyTuSangSo(hexStr[i + 1]);
    bytes[idx] = cao * 16 + thap;
    idx = idx + 1;
  }
  return bytes;
}

// ---- CÃC PHÃ‰P BIáº¾N Äá»”I AES ----

function subBytes(state) {
  for (var i = 0; i < 16; i = i + 1) {
    state[i] = Sbox[state[i]];
  }
}

function invSubBytes(state) {
  for (var i = 0; i < 16; i = i + 1) {
    state[i] = invSbox[state[i]];
  }
}

// ShiftRows: hoÃ¡n vá»‹ máº£ng tÄ©nh thá»§ cÃ´ng
// State theo cá»™t: index = row + 4*col
function shiftRows(state) {
  var tmp;
  // Row 1: dá»‹ch trÃ¡i 1 (vá»‹ trÃ­ 1,5,9,13)
  tmp = state[1];
  state[1] = state[5];
  state[5] = state[9];
  state[9] = state[13];
  state[13] = tmp;
  // Row 2: dá»‹ch trÃ¡i 2 (vá»‹ trÃ­ 2,6,10,14)
  tmp = state[2];
  state[2] = state[10];
  state[10] = tmp;
  tmp = state[6];
  state[6] = state[14];
  state[14] = tmp;
  // Row 3: dá»‹ch trÃ¡i 3 = dá»‹ch pháº£i 1 (vá»‹ trÃ­ 3,7,11,15)
  tmp = state[15];
  state[15] = state[11];
  state[11] = state[7];
  state[7] = state[3];
  state[3] = tmp;
}

function invShiftRows(state) {
  var tmp;
  // Row 1: dá»‹ch pháº£i 1
  tmp = state[13];
  state[13] = state[9];
  state[9] = state[5];
  state[5] = state[1];
  state[1] = tmp;
  // Row 2: dá»‹ch pháº£i 2
  tmp = state[2];
  state[2] = state[10];
  state[10] = tmp;
  tmp = state[6];
  state[6] = state[14];
  state[14] = tmp;
  // Row 3: dá»‹ch pháº£i 3 = dá»‹ch trÃ¡i 1
  tmp = state[3];
  state[3] = state[7];
  state[7] = state[11];
  state[11] = state[15];
  state[15] = tmp;
}

// NhÃ¢n Galois GF(2^8), Ä‘a thá»©c rÃºt gá»n x^8+x^4+x^3+x+1
function gmul(a, b) {
  var p = 0;
  for (var i = 0; i < 8; i = i + 1) {
    if ((b & 1) !== 0) {
      p = p ^ a;
    }
    var hiBit = a & 0x80;
    a = (a << 1) & 0xff;
    if (hiBit !== 0) {
      a = a ^ 0x1b;
    }
    b = b >> 1;
  }
  return p;
}

function mixColumns(state) {
  for (var c = 0; c < 4; c = c + 1) {
    var i = c * 4;
    var s0 = state[i], s1 = state[i+1], s2 = state[i+2], s3 = state[i+3];
    state[i]   = gmul(2,s0) ^ gmul(3,s1) ^ s2 ^ s3;
    state[i+1] = s0 ^ gmul(2,s1) ^ gmul(3,s2) ^ s3;
    state[i+2] = s0 ^ s1 ^ gmul(2,s2) ^ gmul(3,s3);
    state[i+3] = gmul(3,s0) ^ s1 ^ s2 ^ gmul(2,s3);
  }
}

function invMixColumns(state) {
  for (var c = 0; c < 4; c = c + 1) {
    var i = c * 4;
    var s0 = state[i], s1 = state[i+1], s2 = state[i+2], s3 = state[i+3];
    state[i]   = gmul(0x0e,s0)^gmul(0x0b,s1)^gmul(0x0d,s2)^gmul(0x09,s3);
    state[i+1] = gmul(0x09,s0)^gmul(0x0e,s1)^gmul(0x0b,s2)^gmul(0x0d,s3);
    state[i+2] = gmul(0x0d,s0)^gmul(0x09,s1)^gmul(0x0e,s2)^gmul(0x0b,s3);
    state[i+3] = gmul(0x0b,s0)^gmul(0x0d,s1)^gmul(0x09,s2)^gmul(0x0e,s3);
  }
}

function addRoundKey(state, expandedKey, offset) {
  for (var i = 0; i < 16; i = i + 1) {
    state[i] = state[i] ^ expandedKey[offset + i];
  }
}

// ---- Má»ž Rá»˜NG KHÃ“A (Key Expansion cho AES-128) ----

function keyExpansion(key) {
  // AES-128: má»Ÿ rá»™ng 16 byte â†’ 176 byte (11 round keys)
  var expanded = [];
  var i;
  for (i = 0; i < 16; i = i + 1) {
    expanded[i] = key[i];
  }
  var generated = 16;
  var rconIdx = 0;
  var temp = [0, 0, 0, 0];

  while (generated < 176) {
    for (i = 0; i < 4; i = i + 1) {
      temp[i] = expanded[generated - 4 + i];
    }
    if (generated % 16 === 0) {
      // RotWord
      var t = temp[0];
      temp[0] = temp[1]; temp[1] = temp[2];
      temp[2] = temp[3]; temp[3] = t;
      // SubWord
      for (i = 0; i < 4; i = i + 1) {
        temp[i] = Sbox[temp[i]];
      }
      temp[0] = temp[0] ^ Rcon[rconIdx];
      rconIdx = rconIdx + 1;
    }
    for (i = 0; i < 4; i = i + 1) {
      expanded[generated] = expanded[generated - 16] ^ temp[i];
      generated = generated + 1;
    }
  }
  return expanded;
}

// ---- MÃƒ HÃ“A / GIáº¢I MÃƒ 1 BLOCK 16 BYTE ----

function encryptBlock(block, expandedKey) {
  var state = [];
  for (var i = 0; i < 16; i = i + 1) state[i] = block[i];

  addRoundKey(state, expandedKey, 0);
  for (var round = 1; round <= 9; round = round + 1) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, expandedKey, round * 16);
  }
  // Round cuá»‘i: khÃ´ng MixColumns
  subBytes(state);
  shiftRows(state);
  addRoundKey(state, expandedKey, 160);
  return state;
}

function decryptBlock(block, expandedKey) {
  var state = [];
  for (var i = 0; i < 16; i = i + 1) state[i] = block[i];

  addRoundKey(state, expandedKey, 160);
  for (var round = 9; round >= 1; round = round - 1) {
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, expandedKey, round * 16);
    invMixColumns(state);
  }
  invShiftRows(state);
  invSubBytes(state);
  addRoundKey(state, expandedKey, 0);
  return state;
}

// ---- CHIA BLOCK & PADDING ----

// Chia data thÃ nh cÃ¡c block 16 byte, padding 0 náº¿u thiáº¿u
function tachBlock(data) {
  var len = layDoDai(data);
  var blocks = [];
  var count = 0;
  var i = 0;
  while (i < len) {
    var block = [];
    for (var j = 0; j < 16; j = j + 1) {
      if (i + j < len) {
        block[j] = data[i + j];
      } else {
        block[j] = 0;
      }
    }
    blocks[count] = block;
    count = count + 1;
    i = i + 16;
  }
  if (count === 0) {
    var empty = [];
    for (var j = 0; j < 16; j = j + 1) empty[j] = 0;
    blocks[0] = empty;
  }
  return blocks;
}

// ---- HÃ€M CHÃNH XUáº¤T RA ----

// MÃ£ hÃ³a: text (chuá»—i) + key (chuá»—i) â†’ chuá»—i hex
function encryptAES(text, key) {
  if (!text) return '';
  var textBytes = chuoiSangBytes(text);
  var keyBytes = chuoiSangBytes(key);

  // Láº¥y Ä‘Ãºng 16 byte key (AES-128)
  var key16 = [];
  for (var i = 0; i < 16; i = i + 1) {
    key16[i] = (i < layDoDai(keyBytes)) ? keyBytes[i] : 0;
  }

  var expandedKey = keyExpansion(key16);
  var blocks = tachBlock(textBytes);
  var result = '';
  var numBlocks = layDoDai(blocks);

  for (var b = 0; b < numBlocks; b = b + 1) {
    var encrypted = encryptBlock(blocks[b], expandedKey);
    result = result + bytesSangHexString(encrypted);
  }
  return result;
}

// Giáº£i mÃ£: hexString (chuá»—i hex) + key (chuá»—i) â†’ plaintext
function decryptAES(hexString, key) {
  if (!hexString) return '';
  var cipherBytes = hexStringSangBytes(hexString);
  var keyBytes = chuoiSangBytes(key);

  var key16 = [];
  for (var i = 0; i < 16; i = i + 1) {
    key16[i] = (i < layDoDai(keyBytes)) ? keyBytes[i] : 0;
  }

  var expandedKey = keyExpansion(key16);
  var blocks = tachBlock(cipherBytes);
  var allBytes = [];
  var idx = 0;
  var numBlocks = layDoDai(blocks);

  for (var b = 0; b < numBlocks; b = b + 1) {
    var decrypted = decryptBlock(blocks[b], expandedKey);
    for (var j = 0; j < 16; j = j + 1) {
      allBytes[idx] = decrypted[j];
      idx = idx + 1;
    }
  }
  return bytesSangChuoi(allBytes);
}
function layKey16(key) {
  var keyBytes = chuoiSangBytes(key);
  var key16 = [];

  for (var i = 0; i < 16; i = i + 1) {
    key16[i] = (i < layDoDai(keyBytes)) ? keyBytes[i] : 0;
  }

  return key16;
}

function xorBlock(blockA, blockB) {
  var result = [];
  for (var i = 0; i < 16; i = i + 1) {
    result[i] = blockA[i] ^ blockB[i];
  }
  return result;
}

function taoBlockNgauNhien() {
  var randomBuffer = crypto.randomBytes(16);
  var bytes = [];

  for (var i = 0; i < 16; i = i + 1) {
    bytes[i] = randomBuffer[i];
  }

  return bytes;
}





module.exports = {
  encryptAES,
  decryptAES,
};
