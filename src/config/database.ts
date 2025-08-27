import { Sequelize } from 'sequelize';

const isTest = process.env.NODE_ENV === 'test';

let sequelizeInstance: Sequelize;
if (isTest) {
  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: { underscored: true, freezeTableName: true },
  });
} else {
  const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/sentiment_db';
  sequelizeInstance = new Sequelize(databaseUrl, {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? false : false,
    define: { underscored: true, freezeTableName: true },
  });
}

export const sequelize = sequelizeInstance;

export async function initDb(): Promise<void> {
  await sequelize.authenticate();
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync();
  }
}
