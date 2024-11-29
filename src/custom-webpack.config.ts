/* eslint-disable @typescript-eslint/naming-convention */
import { EnvironmentPlugin } from 'webpack';
const Dotenv = require('dotenv-webpack');

module.exports = {
  plugins: [
    new Dotenv(),
    new EnvironmentPlugin({JWT_SECRET: ''})
  ]
};
