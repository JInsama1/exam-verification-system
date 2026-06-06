import {
  BiometricModality,
  TemplateFormat,
} from '../../../common/enums/biometric-modality.enum';


export interface MatchInput {
  submitted: string;
  stored: string;
  /** Modality hint — existing matchers ignore this; new adapters may use it. */
  modality?: BiometricModality;
  /** Template format hint — used by normalizer-aware matchers. */
  templateFormat?: TemplateFormat;
  /** Device model identifier of the capture device, if known. */
  captureDeviceModel?: string;
}

export interface BiometricMatcher {
  match(input: MatchInput): Promise<number>;
}
