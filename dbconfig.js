module.exports = {
  user          : process.env.DB_USER || "ecol",
  password      : process.env.DB_PASSWORD || 'L#TTc011', // L#TTc011
  connectString : process.env.DB_CONNECTIONSTRING || "dbsvr2dr:1523/ecoltst",
  mongo         : process.env.MONGO || 'mongodb://localhost:27017/easy-notes',
  rabbitmq      : process.env.RABBITMQ || 'amqp://guest:guest@172.16.19.151'
};
