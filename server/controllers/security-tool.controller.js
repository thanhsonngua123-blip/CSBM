const { encryptAES, decryptAES } = require('../utils/encryption');

const AES_KEY = process.env.AES_SECRET_KEY;

function normalizeInput(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function preview(req, res) {
  try {
    const input = normalizeInput(req.body.input);

    if (!input) {
      return res.json({
        input: '',
        aes: {
          ciphertext: '',
          decrypted: ''
        }
      });
    }

    const ciphertext = encryptAES(input, AES_KEY);

    res.json({
      input,
      aes: {
        ciphertext,
        decrypted: decryptAES(ciphertext, AES_KEY)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { preview };
