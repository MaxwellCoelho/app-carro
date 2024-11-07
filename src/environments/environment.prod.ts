import { environment as defaults } from './environment.defaults';

export const environment = {
  ...defaults,
  production: true,
  middlewareEndpoint: 'app-carro-api.railway.internal/api',
};
