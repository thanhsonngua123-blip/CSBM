var randomBytes = require('crypto').randomBytes;

function randomBytesArray(size) {
  return Array.from(randomBytes(size));
}

module.exports = {
  randomBytesArray
};
