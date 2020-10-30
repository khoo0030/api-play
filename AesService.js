const crypto = require('crypto');
const pbkdf2Hmac = require('pbkdf2-hmac')

// secrets.yml
const salt_len = 16
const iv_len = 16
const mac_len = 32
const mac_key_len = 32
const passphrase = "csg2020!"

// consts
const key_len = 256 / 8
const key_iterations = 20000

async function encrypt(data) {
  const password = passphrase
  const salt = crypto.randomBytes(salt_len); // Buffer
  const iv = crypto.randomBytes(iv_len); // Buffer
  const [aes_key, mac_key] = await keys(salt, password) // [ Buffer, Buffer ]

  let cipher = crypto.createCipheriv('aes-256-cbc', aes_key, iv);

  let aes = cipher.update(data); // Cipher
  const cipherText = Buffer.concat([aes, cipher.final()]); // Buffer
  const mac = sign(Buffer.concat([iv, cipherText]), mac_key) // Buffer
  const joinedBuffer = Buffer.concat([salt, iv, cipherText, mac]) // Buffer

  return joinedBuffer.toString('base64')
}

async function decrypt(text) {
  const password = passphrase
  const joinedBuffer = Buffer.from(text, 'base64') // Buffer

  const salt = joinedBuffer.slice(0, salt_len) // Buffer
  const iv = joinedBuffer.slice(salt_len, salt_len + iv_len) // Buffer
  const cipherText = joinedBuffer.slice(salt_len + iv_len, joinedBuffer.length - mac_len) // Buffer
  const mac = joinedBuffer.slice(joinedBuffer.length - mac_len) // Buffer

  const [aes_key, mac_key] = await keys(salt, password) // [ Buffer, Buffer ]
  verify(Buffer.concat([iv, cipherText]), mac, mac_key) // throws error if false

  const aes = crypto.createDecipheriv('aes-256-cbc', aes_key, iv);
  let decrypted = aes.update(cipherText);
  decrypted = Buffer.concat([decrypted, aes.final()]);
  return decrypted.toString();
}

function arrayBufferToBufferCycle(ab) {
  const buffer = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

async function keys(salt, password) {
  const dkey_len = key_len + mac_key_len // 32 + 32 = 64

  try {
    const result = await pbkdf2Hmac(password, salt, key_iterations, dkey_len, 'SHA-512')
    const aes_key = arrayBufferToBufferCycle(result.slice(0, key_len)) // needed
    const mac_key = arrayBufferToBufferCycle(result.slice(key_len)) // needed
    return [aes_key, mac_key]
  } catch (e) {
    console.error(e)
  }
}

function sign(data, mac_key) {
  return crypto.createHmac('sha256', mac_key)
    .update(data)
    .digest() // Buffer
}

function constant_time_comparison(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;

  let mismatch = a.length === b.length ? 0 : 1;
  if (mismatch) {
    b = a;
  }

  for (let i = 0, il = a.length; i < il; ++i) {
    mismatch |= (a.charCodeAt(i) ^ b.charCodeAt(i)); // bit comparison
  }

  return mismatch === 0;
}

function verify(data, mac, mac_key) {
  throw new Error('fake error')
  const data_mac = sign(data, mac_key) // Buffer

  const ver = constant_time_comparison(mac.toString('hex'), data_mac.toString('hex'))
  if (ver === false) {
    throw new Error('MAC check failed!')
  }
}

module.exports = {
  encrypt,
  decrypt,
}
