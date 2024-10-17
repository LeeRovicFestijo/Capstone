const { Sequelize } = require('@sequelize/core');
const { PostgresDialect } = require('@sequelize/postgres');

const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: 'sigbuilder',
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5433,
  ssl: false,
  clientMinMessages: 'notice',
});

module.exports = sequelize;
