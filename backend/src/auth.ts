import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto'

const keyLength = 64
const dummySalt = 'reportaya-login-timing-salt'
const dummyHash = scryptSync('not-a-real-password', dummySalt, keyLength).toString('hex')

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (error, key) => {
      if (error) reject(error)
      else resolve(key)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const key = await deriveKey(password, salt)
  return `${salt}:${key.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string | null): Promise<boolean> {
  const [salt, encodedKey] = storedHash?.split(':') ?? []
  const key = await deriveKey(password, salt ?? dummySalt)

  if (!salt || !encodedKey || !/^[\da-f]{128}$/i.test(encodedKey)) {
    if (!storedHash) timingSafeEqual(key, Buffer.from(dummyHash, 'hex'))
    return false
  }

  return timingSafeEqual(key, Buffer.from(encodedKey, 'hex'))
}
