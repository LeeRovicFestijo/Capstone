const { Sequelize } = require('@sequelize/core');
const { PostgresDialect } = require('@sequelize/postgres');

const sequelize = new Sequelize({
  dialect: PostgresDialect,
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  clientMinMessages: 'notice',
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = sequelize;
