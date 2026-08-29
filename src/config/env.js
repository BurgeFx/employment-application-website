import dotenv from 'dotenv';

const result = dotenv.config();

if (result.error) {
  console.warn('Warning: Could not load .env file');
}

export default process.env;
