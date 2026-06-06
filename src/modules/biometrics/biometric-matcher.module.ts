import { Module } from '@nestjs/common';


import { FingerprintMatcher } from './matchers/fingerprint.matcher';
import { IrisMatcher } from './matchers/iris.matcher';
import { BiometricMatcherService } from './biometric-matcher.service';


@Module({
  providers: [
    FingerprintMatcher,
    IrisMatcher,
    BiometricMatcherService,
  ],
  exports: [BiometricMatcherService],
})
export class BiometricMatcherModule {}
