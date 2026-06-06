import {
  Injectable,
} from '@nestjs/common';

import {
  BiometricModality,
  TemplateFormat,
} from '../../common/enums/biometric-modality.enum';

import {
  FingerprintMatcher,
} from './matchers/fingerprint.matcher';

import {
  IrisMatcher,
} from './matchers/iris.matcher';

import {
  FaceMatcher,
} from './matchers/face.matcher';

import {
  MatchInput,
} from './matchers/biometric-matcher.interface';


export interface BiometricModalityInput {
  submittedFingerprint?: string;
  storedFingerprint?:    string | null;
  submittedIris?:        string;
  storedIris?:           string | null;
}

export interface StoredTemplateRef {
  templateData:   string;
  modality:       BiometricModality;
  templateFormat: TemplateFormat;
}

export interface MultiTemplateMatchInput {
  submittedTemplate: string;
  modality:          BiometricModality;
  format:            TemplateFormat;
  storedTemplates:   StoredTemplateRef[];
  /** Device model of the incoming capture, forwarded to the matcher. */
  captureDeviceModel?: string;
}


@Injectable()
export class BiometricMatcherService {


  constructor(
    private readonly fingerprintMatcher: FingerprintMatcher,
    private readonly irisMatcher: IrisMatcher,
    private readonly faceMatcher: FaceMatcher,
  ) {}


  /**
   * Legacy dual-modality scorer used by the existing enroll/verify flow.
   * Averages fingerprint and iris scores when both are present.
   * Do not remove — existing BiometricsService depends on this signature.
   */
  async computeScore(input: BiometricModalityInput): Promise<number> {

    const pending: Promise<number>[] = [];

    if (input.submittedFingerprint && input.storedFingerprint) {
      pending.push(
        this.fingerprintMatcher.match({
          submitted: input.submittedFingerprint,
          stored:    input.storedFingerprint,
          modality:  BiometricModality.FINGERPRINT,
        }),
      );
    }

    if (input.submittedIris && input.storedIris) {
      pending.push(
        this.irisMatcher.match({
          submitted: input.submittedIris,
          stored:    input.storedIris,
          modality:  BiometricModality.IRIS,
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


  /**
   * Multi-template scorer for the new BiometricTemplate store.
   * Filters stored templates to the submitted modality, runs the matcher
   * against each, and returns the highest clamped score (0-100).
   *
   * A candidate with RIGHT_THUMB enrolled and LEFT_THUMB submitted will
   * pass if either template matches above threshold.
   */
  async computeScoreMultiTemplate(
    input: MultiTemplateMatchInput,
  ): Promise<number> {

    const compatible = input.storedTemplates.filter(
      t => t.modality === input.modality,
    );

    if (compatible.length === 0) return 0;

    const matchInput = (storedData: string): MatchInput => ({
      submitted:          input.submittedTemplate,
      stored:             storedData,
      modality:           input.modality,
      templateFormat:     input.format,
      captureDeviceModel: input.captureDeviceModel,
    });

    const scores = await Promise.all(
      compatible.map(t =>
        this.matchByModality(input.modality, matchInput(t.templateData)),
      ),
    );

    const clamped = scores.map(s => Math.min(100, Math.max(0, s)));
    return Math.max(...clamped);

  }


  private matchByModality(
    modality: BiometricModality,
    input: MatchInput,
  ): Promise<number> {

    switch (modality) {
      case BiometricModality.FINGERPRINT:
        return this.fingerprintMatcher.match(input);
      case BiometricModality.IRIS:
        return this.irisMatcher.match(input);
      case BiometricModality.FACE:
        return this.faceMatcher.match(input);
      default:
        return Promise.resolve(0);
    }

  }


}
