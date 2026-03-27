var bytes = require('./bytes');
var hash = require('./hash');

var generatorState = [];
var generatorCounter = 0;

function numberToBytes(value) {
  var safeValue = value >>> 0;
  return [
    (safeValue >>> 24) & 0xff,
    (safeValue >>> 16) & 0xff,
    (safeValue >>> 8) & 0xff,
    safeValue & 0xff
  ];
}

function seedMaterialBytes() {
  var now = Date.now();
  var processId = typeof process !== 'undefined' && process.pid ? process.pid : 0;
  var uptime = typeof process !== 'undefined' && process.uptime ? process.uptime() : 0;
  var uptimeMillis = (uptime * 1000) >>> 0;

  return bytes.concatBytes(
    bytes.concatBytes(numberToBytes(now >>> 0), numberToBytes((now / 0x100000000) >>> 0)),
    bytes.concatBytes(numberToBytes(processId), numberToBytes(uptimeMillis))
  );
}

function ensureState() {
  if (generatorState.length === 0) {
    generatorState = hash.sha256Bytes(
      bytes.concatBytes(bytes.stringToBytes('seed|manual-prng|'), seedMaterialBytes())
    );
    generatorCounter = 1;
  }
}

function nextBlock() {
  ensureState();

  var counterBytes = numberToBytes(generatorCounter);
  var mixed = bytes.concatBytes(bytes.concatBytes(generatorState, counterBytes), seedMaterialBytes());
  var output = hash.sha256Bytes(mixed);
  generatorState = hash.sha256Bytes(bytes.concatBytes(bytes.concatBytes(output, generatorState), counterBytes));
  generatorCounter = (generatorCounter + 1) >>> 0;

  return output;
}

function randomBytesArray(size) {
  var result = [];
  var index = 0;

  while (index < size) {
    var block = nextBlock();

    for (var i = 0; i < block.length && index < size; i++) {
      result[index] = block[i];
      index++;
    }
  }

  return result;
}

module.exports = {
  randomBytesArray
};
