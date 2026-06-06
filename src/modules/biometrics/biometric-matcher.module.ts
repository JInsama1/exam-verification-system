import { Module } from '@nestjs/common';

import { FingerprintMatcher } from './matchers/fingerprint.matcher';
import { IrisMatcher } from './matchers/iris.matcher';
import { FaceMatcher } from './matchers/face.matcher';
import { BiometricMatcherService } from './biometric-matcher.service';
import {
  BiometricTemplateNormalizerService,
} from './services/biometric-template-normalizer.service';


@Module({
  providers: [
    FingerprintMatcher,
    IrisMatcher,
    FaceMatcher,
    BiometricMatcherService,
    BiometricTemplateNormalizerService,
  ],
  exports: [
    BiometricMatcherService,
    BiometricTemplateNormalizerService,
  ],
})
export class BiometricMatcherModule {}
