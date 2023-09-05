// knexfile.ts

import 'dotenv/config';

function convertCamelCaseToSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, (match, letter) => `_${letter.toLowerCase()}`);
}

const convertSnakeCaseToCamelCase = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  return Object.keys(obj).reduce((accumulator, key) => {
    const camelCaseKey = key.replace(/_([a-z])/g, (match, letter) =>
      letter.toUpperCase()
    );
    accumulator[camelCaseKey] = convertSnakeCaseToCamelCase(obj[key]);

    return accumulator;
  }, {});
};

const development = {
  client: 'postgresql',
  connection: {
    database: process.env.DEV_DB_DATABASE,
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
  },
  seeds: {
    directory: './src/database/seeds/development',
  },
};

const test = {
  client: 'postgresql',
  connection: {
    database: process.env.TEST_DB_DATABASE,
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
  },
  seeds: {
    directory: 'src/database/seeds/test',
  },
  postProcessResponse: (result) => {
    if (Array.isArray(result)) {
      return result.map((row) => convertSnakeCaseToCamelCase(row));
    } else {
      return convertSnakeCaseToCamelCase(result);
    }
  },
  wrapIdentifier: (
    value,
    origImpl
    // queryContext,
  ) => {
    return origImpl(convertCamelCaseToSnakeCase(value));
  },
};

const production = {
  // TODO: Configure the production database config
};

const knexConfig = {
  development,
  test,
  // TODO: Export production config
};

export default knexConfig;
