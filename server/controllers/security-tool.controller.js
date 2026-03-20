const { encryptAES, decryptAES } = require('../utils/encryption');
const modern = require('../utils/crypto/modern');

const AES_KEY = process.env.AES_SECRET_KEY;

function normalizeInput(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function createEmptyPreview() {
  return {
    mode: 'AES-CBC',
    padding: 'PKCS#7',
    integrity: 'HMAC-SHA256',
    version: 'v2',
    iv: '',
    cipher: '',
    mac: '',
    ciphertext: '',
    decrypted: ''
  };
}

async function preview(req, res) {
  try {
    const input = normalizeInput(req.body.input);

    if (!input) {
      return res.json({
        input: '',
        aes: createEmptyPreview()
      });
    }

    const ciphertext = encryptAES(input, AES_KEY);
    const parsed = modern.parseModernCiphertext(ciphertext);

    res.json({
      input,
      aes: {
        mode: 'AES-CBC',
        padding: 'PKCS#7',
        integrity: 'HMAC-SHA256',
        version: parsed.version,
        iv: parsed.iv,
        cipher: parsed.cipher,
        mac: parsed.mac,
        ciphertext,
        decrypted: decryptAES(ciphertext, AES_KEY)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { preview };
