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
export class StartekAdapter implements BiometricDeviceAdapter {

  private static readonly CAPABILITY: DeviceCapability = {
    name:                'Startek FM220U',
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
    return StartekAdapter.CAPABILITY;
  }

  captureFingerprint(_position: BiometricPosition): Promise<string> {
    throw new Error('SDK not installed: StartekAdapter');
  }

  captureIris(_position: BiometricPosition): Promise<string> {
    throw new Error('StartekAdapter does not support iris capture');
  }

  normalizeTemplate(_templateData: string, _format: TemplateFormat): string {
    throw new Error('SDK not installed: StartekAdapter');
  }

}
