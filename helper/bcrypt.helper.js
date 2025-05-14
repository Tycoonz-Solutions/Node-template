const bcrypt = require('bcryptjs');

const SALT_ROUNDS = parseInt(process.env.SALT) || 10;

module.exports = {
  generateHashPassword: async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  generate: async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  compare: async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword);
  }
};
