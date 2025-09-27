'use client';

import React, { useState } from 'react';
import { DEVICE_PRESETS, DEFAULT_DEVICE_ID, DevicePreset, DeviceSize } from '@/types/device';

interface DeviceSelectorProps {
  selectedDeviceId: string;
  customSize: DeviceSize;
  isLandscape: boolean;
  zoomLevel: number;
  onDeviceChange: (deviceId: string) => void;
  onCustomSizeChange: (size: DeviceSize) => void;
  onOrientationToggle: () => void;
  onZoomChange: (zoom: number) => void;
}

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1.0];

export default function DeviceSelector({
  selectedDeviceId,
  customSize,
  isLandscape,
  zoomLevel,
  onDeviceChange,
  onCustomSizeChange,
  onOrientationToggle,
  onZoomChange
}: DeviceSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(selectedDeviceId === 'custom');
  const [tempCustomSize, setTempCustomSize] = useState(customSize);

  const selectedDevice = DEVICE_PRESETS.find(d => d.id === selectedDeviceId);
  const currentSize = selectedDeviceId === 'custom' ? customSize : selectedDevice?.size || { width: 393, height: 852 };
  const displaySize = isLandscape ? { width: currentSize.height, height: currentSize.width } : currentSize;

  const handleDeviceChange = (deviceId: string) => {
    if (deviceId === 'custom') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
    onDeviceChange(deviceId);
  };

  const handleCustomSizeSubmit = () => {
    if (tempCustomSize.width > 0 && tempCustomSize.height > 0) {
      onCustomSizeChange(tempCustomSize);
    }
  };

  const handleCustomSizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomSizeSubmit();
    }
  };

  // 如果未展开，显示紧凑版本
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          title="设备尺寸设置"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isLandscape ? (
              <rect x="2" y="7" width="16" height="10" rx="2" strokeWidth={1.5} />
            ) : (
              <rect x="7" y="2" width="10" height="16" rx="2" strokeWidth={1.5} />
            )}
          </svg>
          <div className="text-sm text-gray-700 font-mono font-medium">
            {displaySize.width} × {displaySize.height}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {Math.round(zoomLevel * 100)}%
          </div>
        </button>
      </div>
    );
  }

  // 展开版本
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-lg"
           style={{ minWidth: '340px' }}>
        {/* 头部：标题和关闭按钮 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">设备尺寸</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 设备选择下拉菜单 */}
        <div className="space-y-3">
          <div className="relative">
            <select
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="w-full appearance-none bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white cursor-pointer transition-all"
            >
          <optgroup label="iPhone">
            {DEVICE_PRESETS.filter(d => d.id.includes('iphone')).map(device => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Android">
            {DEVICE_PRESETS.filter(d => d.category === 'phone' && !d.id.includes('iphone')).map(device => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Tablet">
            {DEVICE_PRESETS.filter(d => d.category === 'tablet').map(device => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </optgroup>
          <option value="custom">自定义尺寸</option>
        </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>

          {/* 尺寸显示/自定义输入 */}
          <div className="flex items-center gap-3">
            {showCustomInput ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="number"
                  placeholder="宽"
                  value={tempCustomSize.width || ''}
                  onChange={(e) => setTempCustomSize(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  onBlur={handleCustomSizeSubmit}
                  onKeyDown={handleCustomSizeKeyDown}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
                <span className="text-gray-400 text-sm font-medium">×</span>
                <input
                  type="number"
                  placeholder="高"
                  value={tempCustomSize.height || ''}
                  onChange={(e) => setTempCustomSize(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  onBlur={handleCustomSizeSubmit}
                  onKeyDown={handleCustomSizeKeyDown}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
              </div>
            ) : (
              <div className="flex-1">
                <div className="text-sm text-gray-600 font-mono bg-gray-50 px-4 py-3 rounded-xl">
                  {displaySize.width} × {displaySize.height}
                </div>
              </div>
            )}

            {/* 横竖屏切换 */}
            <button
              onClick={onOrientationToggle}
              title={isLandscape ? '切换到竖屏' : '切换到横屏'}
              className="p-3 text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isLandscape ? (
                  <rect x="7" y="2" width="10" height="16" rx="2" strokeWidth={1.5} />
                ) : (
                  <rect x="2" y="7" width="16" height="10" rx="2" strokeWidth={1.5} />
                )}
              </svg>
            </button>
          </div>

          {/* 缩放控制 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">缩放比例</span>
            <div className="relative">
              <select
                value={zoomLevel}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'fit') {
                    onZoomChange(1.0);
                  } else {
                    onZoomChange(parseFloat(value));
                  }
                }}
                className="appearance-none bg-gray-50 border-0 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white cursor-pointer transition-all"
              >
                {ZOOM_LEVELS.map(zoom => (
                  <option key={zoom} value={zoom}>
                    {Math.round(zoom * 100)}%
                  </option>
                ))}
                <option value="fit">适配窗口</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* 设备描述 */}
          {selectedDevice && selectedDevice.description && (
            <div className="text-xs text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border-l-4 border-blue-200">
              <div className="font-medium text-gray-700 mb-1">{selectedDevice.name}</div>
              {selectedDevice.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}