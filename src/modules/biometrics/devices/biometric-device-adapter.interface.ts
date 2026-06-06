import {
  BiometricModality,
  BiometricPosition,
  TemplateFormat,
} from '../../../common/enums/biometric-modality.enum';


export interface DeviceCapability {
  name:                string;
  supportedModalities: BiometricModality[];
  supportedPositions:  BiometricPosition[];
  templateFormats:     TemplateFormat[];
}


export interface BiometricDeviceAdapter {

  /** Return static device capability metadata. */
  getDeviceInfo(): DeviceCapability;

  /**
   * Trigger a live fingerprint capture on the device.
   * Throws "SDK not installed: <AdapterName>" until real SDK is wired.
   */
  captureFingerprint(position: BiometricPosition): Promise<string>;

  /**
   * Trigger a live iris capture on the device.
   * Throws "SDK not installed: <AdapterName>" until real SDK is wired.
   */
  captureIris(position: BiometricPosition): Promise<string>;

  /**
   * Convert a vendor-specific template to the internal ISO format.
   * Throws "SDK not installed: <AdapterName>" until real SDK is wired.
   */
  normalizeTemplate(
    templateData: string,
    format:       TemplateFormat,
  ): string;

}
