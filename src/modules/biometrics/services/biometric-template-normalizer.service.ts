import { Injectable } from '@nestjs/common';

import { TemplateFormat } from '../../../common/enums/biometric-modality.enum';


@Injectable()
export class BiometricTemplateNormalizerService {

  /**
   * Normalize a biometric template toward ISO format.
   * ISO templates are returned unchanged.
   * Vendor-specific templates receive a placeholder conversion
   * until real SDK adapters are wired in.
   */
  normalize(templateData: string, format: TemplateFormat): string {

    switch (format) {
      case TemplateFormat.ISO_19794_2:
      case TemplateFormat.ISO_19794_6:
        return templateData;

      case TemplateFormat.VENDOR_SPECIFIC:
        // Placeholder: real conversion delegated to per-device SDK adapter
        return `iso_converted::${templateData}`;
    }

  }

}
