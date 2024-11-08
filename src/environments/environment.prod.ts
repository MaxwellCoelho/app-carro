import { environment as defaults } from './environment.defaults';

export const environment = {
  ...defaults,
  production: true,
  middlewareEndpoint: 'http://app-carro-api.railway.internal/api',
};
