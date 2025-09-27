/**
 * 设备尺寸类型定义
 */

export interface DeviceSize {
  width: number;
  height: number;
}

export interface DevicePreset {
  id: string;
  name: string;
  category: 'phone' | 'tablet' | 'custom';
  size: DeviceSize;
  description?: string;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  // iPhone 系列
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro',
    category: 'phone',
    size: { width: 393, height: 852 },
    description: '6.1" Super Retina XDR'
  },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    category: 'phone',
    size: { width: 430, height: 932 },
    description: '6.7" Super Retina XDR'
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    category: 'phone',
    size: { width: 375, height: 667 },
    description: '4.7" Retina HD'
  },
  {
    id: 'iphone-13-mini',
    name: 'iPhone 13 mini',
    category: 'phone',
    size: { width: 375, height: 812 },
    description: '5.4" Super Retina XDR'
  },

  // Android 手机
  {
    id: 'pixel-7',
    name: 'Pixel 7',
    category: 'phone',
    size: { width: 412, height: 915 },
    description: '6.3" OLED'
  },
  {
    id: 'galaxy-s23',
    name: 'Galaxy S23',
    category: 'phone',
    size: { width: 360, height: 780 },
    description: '6.1" Dynamic AMOLED'
  },
  {
    id: 'oneplus-11',
    name: 'OnePlus 11',
    category: 'phone',
    size: { width: 412, height: 919 },
    description: '6.7" LTPO AMOLED'
  },

  // 平板设备
  {
    id: 'ipad-mini',
    name: 'iPad mini',
    category: 'tablet',
    size: { width: 744, height: 1133 },
    description: '8.3" Liquid Retina'
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    size: { width: 820, height: 1180 },
    description: '10.9" Liquid Retina'
  },
  {
    id: 'ipad-pro-11',
    name: 'iPad Pro 11"',
    category: 'tablet',
    size: { width: 834, height: 1194 },
    description: '11" Liquid Retina XDR'
  }
];

export const DEFAULT_DEVICE_ID = 'iphone-14-pro';

export interface DeviceSelectorState {
  selectedDeviceId: string;
  customSize: DeviceSize;
  isLandscape: boolean;
  zoomLevel: number;
}