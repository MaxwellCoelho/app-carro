/* eslint-disable @typescript-eslint/dot-notation */
import { environment as defaults } from './environment.defaults';

export const environment = {
  ...defaults,
  production: true,
  middlewareEndpoint: 'https://api.krro.com.br/api'
};
