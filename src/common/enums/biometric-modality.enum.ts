export enum BiometricModality {
  FINGERPRINT = 'FINGERPRINT',
  IRIS        = 'IRIS',
  FACE        = 'FACE',
}

export enum BiometricPosition {
  RIGHT_THUMB  = 'RIGHT_THUMB',
  LEFT_THUMB   = 'LEFT_THUMB',
  RIGHT_INDEX  = 'RIGHT_INDEX',
  LEFT_INDEX   = 'LEFT_INDEX',
  LEFT_EYE     = 'LEFT_EYE',
  RIGHT_EYE    = 'RIGHT_EYE',
}

export enum TemplateFormat {
  ISO_19794_2     = 'ISO_19794_2',
  ISO_19794_6     = 'ISO_19794_6',
  VENDOR_SPECIFIC = 'VENDOR_SPECIFIC',
}
