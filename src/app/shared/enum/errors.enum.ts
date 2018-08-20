export enum LoginErrors {
  REQUIRED = 'REQUIRED',
  MIN_LENGTH_01 = 'MIN_LENGTH_01',
  MIN_LENGTH_02 = 'MIN_LENGTH_02',
  MIN_LENGTH_03 = 'MIN_LENGTH_03',
  MIN_LENGTH_04 = 'MIN_LENGTH_04',
  MIN_LENGTH_05 = 'MIN_LENGTH_05',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_HAS_NOT_OPERATOR = 'USER_HAS_NOT_OPERATOR',
  USER_HAS_NOT_PERMISSIONS = 'USER_HAS_NOT_PERMISSIONS',
  DEFAULT = 'DEFAULT',
  HTTP_SERVER_IS_NOT_AVAILABLE = 'HTTP_SERVER_IS_NOT_AVAILABLE',
}

export enum PhoneNumberErrors {
  LIBPHONENUMBER_COUNTRY_ARE_NOT_SELECTED = 'LIBPHONENUMBER_COUNTRY_ARE_NOT_SELECTED',
  LIBPHONENUMBER_COUNTRY_IS_NOT_VALID = 'LIBPHONENUMBER_COUNTRY_IS_NOT_VALID',
  LIBPHONENUMBER_PHONENUMBER_IS_NOT_MOBILE = 'LIBPHONENUMBER_PHONENUMBER_IS_NOT_MOBILE',
  LIBPHONENUMBER_PHONENUMBER_IS_NOT_VALID = 'LIBPHONENUMBER_PHONENUMBER_IS_NOT_VALID'
}
