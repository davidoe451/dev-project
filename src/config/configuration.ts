export default () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_key';

  if (nodeEnv === 'production' && jwtSecret === 'default_jwt_secret_key') {
    throw new Error('FATAL: JWT_SECRET must be configured with a secure key in production environment');
  }

  return {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv,
    database: {
      url: process.env.DATABASE_URL,
    },
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env.JWT_EXPIRATION || '7d',
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
  };
};
