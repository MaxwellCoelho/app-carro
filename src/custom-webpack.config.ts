/* eslint-disable @typescript-eslint/naming-convention */
import { environment } from './environments/environment';
import { EnvironmentPlugin } from 'webpack';
const Dotenv = require('dotenv-webpack');
const myPlugin = environment.production
  ? new EnvironmentPlugin({JWT_SECRET: ''})
  : new Dotenv();

module.exports = {
  plugins: [myPlugin]
};
