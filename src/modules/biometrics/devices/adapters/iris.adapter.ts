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
export class IrisAdapter implements BiometricDeviceAdapter {

  private static readonly CAPABILITY: DeviceCapability = {
    name:                'Iris ID iCAM 7s',
    supportedModalities: [BiometricModality.IRIS],
    supportedPositions:  [
      BiometricPosition.LEFT_EYE,
      BiometricPosition.RIGHT_EYE,
    ],
    templateFormats:     [
      TemplateFormat.ISO_19794_6,
      TemplateFormat.VENDOR_SPECIFIC,
    ],
  };

  getDeviceInfo(): DeviceCapability {
    return IrisAdapter.CAPABILITY;
  }

  captureFingerprint(_position: BiometricPosition): Promise<string> {
    throw new Error('IrisAdapter does not support fingerprint capture');
  }

  captureIris(_position: BiometricPosition): Promise<string> {
    throw new Error('SDK not installed: IrisAdapter');
  }

  normalizeTemplate(_templateData: string, _format: TemplateFormat): string {
    throw new Error('SDK not installed: IrisAdapter');
  }

}
