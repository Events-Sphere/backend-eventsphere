export const UserSuccess = {
  LOGIN: "User has logged in successfully.",
  REGISTER: "User has registered successfully.",
  LOGOUT: "User has logged out successfully.",
  UPDATED: "User profile has been updated successfully.",
  DELETED: "User account has been deleted successfully.",
  PASSWORD_CHANGED: "User password has been changed successfully.",
  EMAIL_VERIFIED: "User email has been verified successfully.",
};
export const UserErrors = {
  NOT_FOUND: "User not found.",
  LOGIN_FAILED: "User login failed. Please check your credentials.",
  REGISTER_FAILED: "User registration failed. Please try again.",
  EMAIL_ALREADY_REGISTERED: "This email is already registered.",
  PASSWORD_INCORRECT: "The provided password is incorrect.",
  ACCOUNT_LOCKED:
    "User account is locked due to multiple failed login attempts.",
};
export const AdminSuccess = {
  LOGIN: "Admin has logged in successfully.",
  CREATED: "Admin has been created successfully.",
  UPDATED: "Admin details have been updated successfully.",
  DELETED: "Admin account has been deleted successfully.",
};

export const AdminErrors = {
  NOT_FOUND: "Admin not found.",
  LOGIN_FAILED: "Admin login failed. Please check your credentials.",
  PERMISSION_DENIED: "Admin does not have permission to perform this action.",
};
export const TokenErrors = {
  EXPIRED: "Token has expired.",
  INVALID: "The provided token is invalid.",
  NOT_PROVIDED: "Token not provided in the request.",
};

export const TokenSuccess = {
  REFRESHED: "Token has been refreshed successfully.",
  VALIDATED: "Token is valid.",
};

export const EventsSuccess = {
  CREATED: "Product has been created successfully.",
  UPDATED: "Product has been updated successfully.",
  DELETED: "Product has been deleted successfully.",
  FETCHED: "Product details have been fetched successfully.",
  LIST_FETCHED: "Product list has been fetched successfully.",
};
export const EventsErrors = {
  NOT_FOUND: "Product not found.",
  CREATE_FAILED: "Failed to create product. Please try again.",
  UPDATE_FAILED: "Failed to update product. Please try again.",
  DELETE_FAILED: "Failed to delete product. Please try again.",
  INVALID_DATA: "The provided data is invalid.",
  INSUFFICIENT_STOCK: "Insufficient stock available for the requested product.",
};

export const InternalServerError = {
  INTERNAL_SERVER_ERROR:
    "An internal server error occurred. Please try again later.",
};
