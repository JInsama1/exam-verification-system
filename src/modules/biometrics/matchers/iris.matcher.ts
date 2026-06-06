import {
  Injectable,
} from '@nestjs/common';


import {
  BiometricMatcher,
  MatchInput,
} from './biometric-matcher.interface';


@Injectable()
export class IrisMatcher implements BiometricMatcher {

  async match(input: MatchInput): Promise<number> {
    return input.submitted === input.stored ? 100 : 30;
  }

}
