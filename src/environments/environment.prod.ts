import { environment as defaults } from './environment.defaults';

export const environment = {
  ...defaults,
  production: true,
  middlewareEndpoint: `${window.location.origin}/api`
};
