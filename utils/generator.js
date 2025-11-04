const crypto = require('crypto');

function hashWithSCrypt(password, salt, fn) {
  const keylen = 64; // Desired length of the derived key
  crypto.scrypt(password, salt, keylen, (err, derivedKey) => {
    if (err) {
	console.error('Error hashing password:', err);
        return;
    }
    // derivedKey is a Buffer containing the hashed password
    const hashedPassword = derivedKey.toString('hex');
    return fn(hashedPassword);
  })
};

function compareHashedValues(storedHashedPassword, 
    storedSalt, enteredPassword) {
 return new Promise((resolve, reject) => {
    const keylen = 64; // Desired length of the derived key
    crypto.scrypt(enteredPassword, storedSalt, keylen, (err, derivedKey) => 
{
	if (err) {
	  console.error('Error verifying password:', err);
	  // Reject the promise on error
	  reject(err);
	  return;
  	}
	resolve(derivedKey.toString('hex') === storedHashedPassword);
     });
  })
}

function generateUniqueId() {
    const prefix = "P00";
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let suffix = '';

    // Generate 9 random characters
    for (let i = 0; i < 9; i++) {
        const randomByte = crypto.randomBytes(1)[0];
        suffix += chars[randomByte % chars.length];
    }

    return prefix + suffix;
}

function generatePassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;

    // Ensure at least one of each required type
    let password = [
        uppercase[crypto.randomBytes(1)[0] % uppercase.length],
        lowercase[crypto.randomBytes(1)[0] % lowercase.length],
        numbers[crypto.randomBytes(1)[0] % numbers.length]
    ];

    // Add remaining 9 characters
    for (let i = 0; i < 9; i++) {
        const randomByte = crypto.randomBytes(1)[0];
        password.push(allChars[randomByte % allChars.length]);
    }

    // Secure shuffle
    for (let i = password.length - 1; i > 0; i--) {
        const j = crypto.randomBytes(4).readUInt32LE(0) % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}

function generateSecretCode() {
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += crypto.randomBytes(1)[0] % 10;
    }
    return code;
}

function generateMasterKey() {
    let key = '';
    for (let i = 0; i < 4; i++) {
        key += crypto.randomBytes(1)[0] % 10;
    }
    return key;
}

// Generate sample data
const userData = {
    uniqueId: generateUniqueId(),
    password: generatePassword(),
    secretCode: generateSecretCode(),
    masterKey: generateMasterKey()
};

function generateData() {
  return new Promise((resolve) => {

    let userData = {
      uniqueId: generateUniqueId(),
      password: generatePassword(),
      secretCode: generateSecretCode(),
      masterKey: generateMasterKey()                                            };
  
    console.log(userData.password, 'pass without hash')
    hashWithSCrypt(userData.password, userData.secretCode, (pass) => {
      userData.password = pass;
    
      resolve(userData);
    });

  });
}

// console.log("Generated User Data:");
// console.log(`Unique ID: ${userData.uniqueId}`);
// console.log(`Password: ${userData.password}`);
// console.log(`Secret Code: ${userData.secretCode}`);
// console.log(`Master Key: ${userData.masterKey}`);

module.exports = { generateData, hashWithSCrypt, compareHashedValues };
