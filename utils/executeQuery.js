const { Connection } = require("../config/dbConfig");

const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    Connection.query(query, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { executeQuery };
