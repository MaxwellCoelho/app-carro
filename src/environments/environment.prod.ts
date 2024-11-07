import { environment as defaults } from './environment.defaults';

export const environment = {
  ...defaults,
  production: true,
  middlewareEndpoint: 'https://app-carro-api/api',
};
