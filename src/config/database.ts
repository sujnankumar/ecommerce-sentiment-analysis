import { Sequelize } from 'sequelize';

const isTest = process.env.NODE_ENV === 'test';

let sequelizeInstance: Sequelize;
if (isTest) {
  // Use in-memory SQLite for tests
  sequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    define: { underscored: true, freezeTableName: true },
  });
} else {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl?.startsWith('sqlite')) {
    // Allow DATABASE_URL like 'sqlite::memory:' or 'sqlite:./dev.sqlite'
    const storage = databaseUrl === 'sqlite::memory:'
      ? ':memory:'
      : databaseUrl.replace(/^sqlite:/, '') || './dev.sqlite';

    sequelizeInstance = new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: process.env.NODE_ENV === 'development' ? false : false,
      define: { underscored: true, freezeTableName: true },
    });
  } else if (databaseUrl) {
    // Use provided MySQL (or other SQL) URL; default to MySQL dialect options
    sequelizeInstance = new Sequelize(databaseUrl, {
      logging: process.env.NODE_ENV === 'development' ? false : false,
      define: { underscored: true, freezeTableName: true },
    });
  } else {
    // Default to a local SQLite file in development to avoid MySQL setup hurdles
    sequelizeInstance = new Sequelize({
      dialect: 'sqlite',
      storage: './dev.sqlite',
      logging: process.env.NODE_ENV === 'development' ? false : false,
      define: { underscored: true, freezeTableName: true },
    });
  }
}

export const sequelize = sequelizeInstance;

export async function initDb(): Promise<void> {
  await sequelize.authenticate();
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync();
  }
}
