/**
 * 设备尺寸状态本地存储钩子
 * 保存用户的设备选择偏好
 */

import { useEffect } from 'react';
import { DeviceSelectorState } from '@/types/device';

const STORAGE_KEY = 'mach-device-preferences';

export function useDeviceStorage(
  deviceState: DeviceSelectorState,
  setDeviceState: (state: DeviceSelectorState | ((prev: DeviceSelectorState) => DeviceSelectorState)) => void
) {
  // 加载保存的偏好设置
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const preferences = JSON.parse(saved);
        // 只恢复部分偏好，保持当前会话的某些状态
        setDeviceState(prev => ({
          ...prev,
          selectedDeviceId: preferences.selectedDeviceId || prev.selectedDeviceId,
          customSize: preferences.customSize || prev.customSize,
          isLandscape: preferences.isLandscape || prev.isLandscape,
          // 不恢复 zoomLevel，每次都从默认值开始
        }));
      }
    } catch (error) {
      console.warn('Failed to load device preferences:', error);
    }
  }, [setDeviceState]);

  // 保存偏好设置
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const preferences = {
        selectedDeviceId: deviceState.selectedDeviceId,
        customSize: deviceState.customSize,
        isLandscape: deviceState.isLandscape,
        // 不保存 zoomLevel
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save device preferences:', error);
    }
  }, [deviceState.selectedDeviceId, deviceState.customSize, deviceState.isLandscape]);
}