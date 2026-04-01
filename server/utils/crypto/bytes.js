function copyBytes(data) {
  if (!data) {
    return [];
  }

  var result = [];

  for (var i = 0; i < data.length; i++) {
    result[i] = data[i];
  }

  return result;
}

function concatBytes(a, b) {
  var result = [];
  var index = 0;

  for (var i = 0; i < a.length; i++) {
    result[index] = a[i];
    index++;
  }

  for (var j = 0; j < b.length; j++) {
    result[index] = b[j];
    index++;
  }

  return result;
}

function sliceBytes(data, start, end) {
  var result = [];
  var index = 0;
  var limit = end === undefined ? data.length : end;

  for (var i = start; i < limit && i < data.length; i++) {
    result[index] = data[i];
    index++;
  }

  return result;
}

function splitBlocks(bytes, blockSize) {
  var blocks = [];
  var index = 0;

  for (var i = 0; i < bytes.length; i = i + blockSize) {
    blocks[index] = sliceBytes(bytes, i, i + blockSize);
    index++;
  }

  if (blocks.length === 0) {
    blocks[0] = [];
  }

  return blocks;
}

function stringToBytes(value) {
  var bytes = [];
  var index = 0;
  var i = 0;

  while (i < value.length) {
    //1. Lấy mã Unicode của ký tự tại vị trí i
    var codeUnit = value.charCodeAt(i);
    var codePoint = codeUnit;
    //2. Xử lý surrogate pair
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff && i + 1 < value.length) {
      var nextCodeUnit = value.charCodeAt(i + 1);
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        codePoint = (((codeUnit - 0xd800) << 10) | (nextCodeUnit - 0xdc00)) + 0x10000;
        i = i + 2;
      } else {
        i++;
      }
    } else {
      i++;
    }

    if (codePoint <= 0x7f) {
      bytes[index] = codePoint;
      index++;
    } 
    // 110xxxxx 10xxxxxx
    else if (codePoint <= 0x7ff) {
      bytes[index] = 0xc0 | (codePoint >>> 6);
      bytes[index + 1] = 0x80 | (codePoint & 0x3f);
      index = index + 2;
    } 
    // 1110xxxx 10xxxxxx 10xxxxxx
    else if (codePoint <= 0xffff) {
      bytes[index] = 0xe0 | (codePoint >>> 12);
      bytes[index + 1] = 0x80 | ((codePoint >>> 6) & 0x3f);
      bytes[index + 2] = 0x80 | (codePoint & 0x3f);
      index = index + 3;
    } else {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      bytes[index] = 0xf0 | (codePoint >>> 18);
      bytes[index + 1] = 0x80 | ((codePoint >>> 12) & 0x3f);
      bytes[index + 2] = 0x80 | ((codePoint >>> 6) & 0x3f);
      bytes[index + 3] = 0x80 | (codePoint & 0x3f);
      index = index + 4;
    }
  }

  return bytes;
}

function bytesToString(bytes) {
  var result = '';
  var i = 0;

  while (i < bytes.length) {
    var b0 = bytes[i];

    if (b0 < 0x80) {
      result = result + String.fromCharCode(b0);
      i++;
      continue;
    }

    if ((b0 & 0xe0) === 0xc0 && i + 1 < bytes.length) {
      var b1 = bytes[i + 1];
      var codePoint2 = ((b0 & 0x1f) << 6) | (b1 & 0x3f);
      result = result + String.fromCharCode(codePoint2);
      i = i + 2;
      continue;
    }

    if ((b0 & 0xf0) === 0xe0 && i + 2 < bytes.length) {
      var b2 = bytes[i + 1];
      var b3 = bytes[i + 2];
      var codePoint3 = ((b0 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
      result = result + String.fromCharCode(codePoint3);
      i = i + 3;
      continue;
    }

    if ((b0 & 0xf8) === 0xf0 && i + 3 < bytes.length) {
      var b4 = bytes[i + 1];
      var b5 = bytes[i + 2];
      var b6 = bytes[i + 3];
      var codePoint4 = ((b0 & 0x07) << 18) | ((b4 & 0x3f) << 12) | ((b5 & 0x3f) << 6) | (b6 & 0x3f);
      var offset = codePoint4 - 0x10000;
      result = result + String.fromCharCode(0xd800 + (offset >>> 10));
      result = result + String.fromCharCode(0xdc00 + (offset & 0x3ff));
      i = i + 4;
      continue;
    }

    result = result + '?';
    i++;
  }

  return result;
}

function byteToHex(value) {
  var hexChars = '0123456789abcdef';
  var high = (value - (value % 16)) / 16;
  var low = value % 16;
  return hexChars[high] + '' + hexChars[low];
}

function bytesToHex(bytes) {
  var result = '';

  for (var i = 0; i < bytes.length; i++) {
    result = result + byteToHex(bytes[i]);
  }

  return result;
}

function hexCharToNumber(value) {
  var lowerHex = '0123456789abcdef';
  var upperHex = '0123456789ABCDEF';

  for (var i = 0; i < 16; i++) {
    if (lowerHex[i] === value || upperHex[i] === value) {
      return i;
    }
  }

  return 0;
}

function hexToBytes(hexValue) {
  var result = [];
  var index = 0;

  for (var i = 0; i < hexValue.length; i = i + 2) {
    var high = hexCharToNumber(hexValue[i]);
    var low = hexCharToNumber(hexValue[i + 1]);
    result[index] = high * 16 + low;
    index++;
  }

  return result;
}

module.exports = {
  copyBytes,
  concatBytes,
  sliceBytes,
  splitBlocks,
  stringToBytes,
  bytesToString,
  bytesToHex,
  hexToBytes
};
