export enum ExceptionMassage {
  USER_NOT_FOUND = 'User not found',
  USER_ALREADY_EXISTS = 'User already exists',
  PASSWROD_CONFIRM = 'Password and password confirmation must be the same',
  INVALID_PASSWORD = 'Password is not valid.',
  PASSWORD_NOT_MATCH = 'Password is not match.',
  REFRESH_TOKEN_ALREADY_EXISTS = 'Refresh token already exists in the database.',
  INVALID_ACCESS_TOKEN = 'Invalid access token provided',
  INVALID_REFRESH_TOKEN = 'Invalid refresh token provided',
}
