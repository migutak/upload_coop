module.exports = {
  user          : process.env.NODE_ORACLEDB_USER || "ecol",

  // Instead of hard coding the password, consider prompting for it,
  // passing it in an environment variable via process.env, or using
  // External Authentication. L#TTc011
  password      : process.env.NODE_ORACLEDB_PASSWORD || 'L#TTc011',

  // For information on connection strings see:
  // https://oracle.github.io/node-oracledb/doc/api.html#connectionstrings
  connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "dbsvr2dr:1523/ecoltst",

  // Setting externalAuth is optional.  It defaults to false.  See:
  // https://oracle.github.io/node-oracledb/doc/api.html#extauth
  externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
  mongo: 'mongodb://localhost:27017/easy-notes'
};