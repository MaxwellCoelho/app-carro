/* eslint-disable @typescript-eslint/dot-notation */
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  middlewareEndpoint: 'http://localhost:3001/api',
  rolesAction: 'roles',
  customersAction: 'customers',
  filterCustomersAction: 'customers/filter',
  categoriesAction: 'cars/categories',
  brandsAction: 'cars/brands',
  filterBrandsAction: 'cars/brands/filter',
  modelsAction: 'cars/models',
  filterModelsAction: 'cars/models/filter',
  versionsAction: 'cars/versions',
  filterVersionsAction: 'cars/versions/filter',
  opinionBrandAction: 'opinion/brand',
  filterOpinionBrandAction: 'opinion/brand/filter',
  opinionModelAction: 'opinion/model',
  filterOpinionModelAction: 'opinion/model/filter',
  bestBrandsAction: 'best/brands',
  bestModelsAction: 'best/models',
  filterBestModelsAction: 'best/models/filter',
  feedbackAction: 'feedback',
  adsAction: 'ads',
  filterAdsAction: 'ads/filter',
  resetPassword: 'password/reset',
  jstSecret: process.env['JWT_SECRET']
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
