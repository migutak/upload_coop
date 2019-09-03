module.exports = {
  user          : process.env.NODE_ORACLEDB_USER || "ecol",

  // Instead of hard coding the password, consider prompting for it,
  // passing it in an environment variable via process.env, or using
  // External Authentication. L#TTc011
  password      : process.env.NODE_ORACLEDB_PASSWORD || 'L#TTc011',

  // For information on connection strings see:
  // https://oracle.github.io/node-oracledb/doc/api.html#connectionstrings
  connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "dbsvr2dr:1523/ecoltst",
  // connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "192.168.78.148:1521/ecol",

  // Setting externalAuth is optional.  It defaults to false.  See:
  // https://oracle.github.io/node-oracledb/doc/api.html#extauth
  externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
  // mongo: 'mongodb://172.16.204.72:27017/easy-notes',
  mongo: 'mongodb://localhost:27017/easy-notes',
  mongoLocal: 'mongodb://localhost:27017/',
  RABBITMQ : 'amqp://guest:guest@172.16.19.151',
  // RABBITMQ : 'amqp://guest:guest@localhost',
};