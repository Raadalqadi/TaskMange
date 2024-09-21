const jwt = require('jsonwebtoken');
const { executeQuery } = require('./executeQuery');
const secretKey = process.env.SECRETKEY;

exports.verifyToken = (token) => {
  return new Promise(async (resolve, reject) => {
    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) return resolve(0);
      try {
        const query = `SELECT user_id FROM tokens WHERE token = ?;`;
        const results = await executeQuery(query, [token]);
        return resolve(results.length > 0 ? results[0].user_id : 0);
      } catch (error) {
        return reject(error);
      }
    });
  });
};
