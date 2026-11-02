process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/homico_test";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test_access_secret_012345678901234567890123";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_012345678901234567890123";
process.env.ACCESS_TOKEN_EXPIRES_IN = "15m";
process.env.REFRESH_TOKEN_EXPIRES_IN = "7d";
process.env.BCRYPT_ROUNDS = "12";
