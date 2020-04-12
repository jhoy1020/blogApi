module.exports = {
  cli: {
    entitiesDir: './src/entity',
    migrationsDir: './src/migration',
  },
  database: process.env.BLOG_NAME || 'blog',
  entities: ['./src/entities/**/*{.ts,.js}'],
  host: process.env.DB_HOST || 'localhost',
  logging: false,
  migrations: ['./src/migration/**/*{.ts,.js}'],
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  synchronize: true,
  type: 'postgres',
  username: process.env.DB_USERNAME || 'admin',
};
