import {
  Injectable,
} from '@nestjs/common';


import {
  FingerprintMatcher,
} from './matchers/fingerprint.matcher';


import {
  IrisMatcher,
} from './matchers/iris.matcher';


export interface BiometricModalityInput {
  submittedFingerprint?: string;
  storedFingerprint?:    string | null;
  submittedIris?:        string;
  storedIris?:           string | null;
}


@Injectable()
export class BiometricMatcherService {


  constructor(
    private readonly fingerprintMatcher: FingerprintMatcher,
    private readonly irisMatcher: IrisMatcher,
  ) {}


  async computeScore(input: BiometricModalityInput): Promise<number> {

    const pending: Promise<number>[] = [];

    if (input.submittedFingerprint && input.storedFingerprint) {
      pending.push(
        this.fingerprintMatcher.match({
          submitted: input.submittedFingerprint,
          stored:    input.storedFingerprint,
        }),
      );
    }

    if (input.submittedIris && input.storedIris) {
      pending.push(
        this.irisMatcher.match({
          submitted: input.submittedIris,
          stored:    input.storedIris,
        }),
      );
    }

    if (pending.length === 0) return 0;

    const scores = await Promise.all(pending);
    const clamped = scores.map(s => Math.min(100, Math.max(0, s)));

    return Math.round(
      clamped.reduce((sum, s) => sum + s, 0) / clamped.length,
    );

  }


}
