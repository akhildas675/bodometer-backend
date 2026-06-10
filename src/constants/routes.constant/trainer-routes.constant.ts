export const TRAINER_ROUTES = {
  BASE: '/trainer',

  SUBMIT_PROFILE_DATA: '/trainer/submit-profile-data',
  GET_PROFILE_STATUS: "/trainer/profile/status",
  GET_TRAINER_PROFILE: '/trainer/trainer-profile',
  TRAINER_PROFILE_UPDATE: '/trainer/trainer-profile-update',
  TRAINER_PROFILE_PICTURE_UPDATE: '/trainer/trainer-profile-picture',
  UPLOAD_DOCUMENT: '/trainer/upload-document',
  GET_CATEGORIES: '/trainer/categories',
  


  // Trainer Bookings
  GET_MY_BOOKINGS: '/trainer/bookings',
  CONFIRM_BOOKING: '/trainer/bookings/:bookingId/confirm',
  REJECT_BOOKING: '/trainer/bookings/:bookingId/reject',
  COMPLETE_BOOKING: '/trainer/bookings/:bookingId/complete',
  CANCEL_BOOKING: '/trainer/bookings/:bookingId/cancel',
} as const;