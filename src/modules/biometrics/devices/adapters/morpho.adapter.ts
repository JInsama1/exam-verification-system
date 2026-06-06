import {
  Injectable,
} from '@nestjs/common';

import {
  BiometricModality,
  BiometricPosition,
  TemplateFormat,
} from '../../../../common/enums/biometric-modality.enum';

import {
  BiometricDeviceAdapter,
  DeviceCapability,
} from '../biometric-device-adapter.interface';


@Injectable()
export class MorphoAdapter implements BiometricDeviceAdapter {

  private static readonly CAPABILITY: DeviceCapability = {
    name:                'Morpho MSO 1300 E3',
    supportedModalities: [BiometricModality.FINGERPRINT],
    supportedPositions:  [
      BiometricPosition.RIGHT_THUMB,
      BiometricPosition.LEFT_THUMB,
      BiometricPosition.RIGHT_INDEX,
      BiometricPosition.LEFT_INDEX,
    ],
    templateFormats:     [
      TemplateFormat.ISO_19794_2,
      TemplateFormat.VENDOR_SPECIFIC,
    ],
  };

  getDeviceInfo(): DeviceCapability {
    return MorphoAdapter.CAPABILITY;
  }

  captureFingerprint(_position: BiometricPosition): Promise<string> {
    throw new Error('SDK not installed: MorphoAdapter');
  }

  captureIris(_position: BiometricPosition): Promise<string> {
    throw new Error('MorphoAdapter does not support iris capture');
  }

  normalizeTemplate(_templateData: string, _format: TemplateFormat): string {
    throw new Error('SDK not installed: MorphoAdapter');
  }

}
