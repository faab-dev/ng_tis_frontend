// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  front_url: 'http://ng.tis-frontend',
  api_url: 'http://128.199.60.22:9090',
  x_api_version: 1,
  x_hrc_app_key: 'e34ab8cb0c62481a1a0a0aa63a8fa344',

  languages: [
    {id: 'ru', title: 'Русский', wysiwyg_code: 'ru'},
    {id: 'en', title: 'English', wysiwyg_code: 'en_GB'},
  ]
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
