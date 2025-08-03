import React, { useState } from 'react';

// 输入层配置弹窗
export const InputConfig = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [formatType, setFormatType] = useState(initialConfig?.formatType || 'custom');
  const [height, setHeight] = useState(initialConfig?.height || 28);
  const [width, setWidth] = useState(initialConfig?.width || 28);
  const [channels, setChannels] = useState(initialConfig?.channels || 1);
  const [datasetType, setDatasetType] = useState(initialConfig?.datasetType || 'MNIST');

  if (!isOpen) return null;

  // 预定义数据集格式
  const datasetFormats = {
    'MNIST': { height: 28, width: 28, channels: 1, description: '28×28 灰度图像' },
    'FashionMNIST': { height: 28, width: 28, channels: 1, description: '28×28 灰度图像' },
    'CIFAR-10': { height: 32, width: 32, channels: 3, description: '32×32 彩色图像' },
    'PASCAL-VOC': { height: 224, width: 224, channels: 3, description: '224×224 彩色图像' },
    'ImageNet': { height: 224, width: 224, channels: 3, description: '224×224 彩色图像' }
  };

  // 当选择数据集类型时自动更新尺寸
  const handleDatasetChange = (dataset) => {
    setDatasetType(dataset);
    if (formatType === 'dataset') {
      const format = datasetFormats[dataset];
      setHeight(format.height);
      setWidth(format.width);
      setChannels(format.channels);
    }
  };

  const handleSave = () => {
    const config = {
      formatType,
      height: parseInt(height),
      width: parseInt(width),
      channels: parseInt(channels),
      datasetType: formatType === 'dataset' ? datasetType : null,
      totalSize: parseInt(height) * parseInt(width) * parseInt(channels)
    };
    onSave(config);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>输入层数据格式配置</h3>
        
        {/* 格式类型选择 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            数据格式类型:
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="custom"
                checked={formatType === 'custom'}
                onChange={(e) => setFormatType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              自定义格式
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="dataset"
                checked={formatType === 'dataset'}
                onChange={(e) => setFormatType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              预设数据集格式
            </label>
          </div>
        </div>

        {/* 数据集选择 */}
        {formatType === 'dataset' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              选择数据集:
            </label>
            <select 
              value={datasetType} 
              onChange={(e) => handleDatasetChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            >
              {Object.entries(datasetFormats).map(([key, format]) => (
                <option key={key} value={key}>
                  {key} - {format.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 尺寸配置 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '15px', 
          marginBottom: '20px',
          opacity: formatType === 'dataset' ? 0.6 : 1
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              高度 (H):
            </label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              disabled={formatType === 'dataset'}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              宽度 (W):
            </label>
            <input 
              type="number" 
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              disabled={formatType === 'dataset'}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
              通道数 (C):
            </label>
            <input 
              type="number" 
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
              disabled={formatType === 'dataset'}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* 数据格式预览 */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#495057' }}>数据格式预览:</div>
          <div style={{ color: '#6c757d', fontSize: '14px' }}>
            形状: ({height} × {width} × {channels})
          </div>
          <div style={{ color: '#6c757d', fontSize: '14px' }}>
            总参数量: {(parseInt(height) * parseInt(width) * parseInt(channels)).toLocaleString()}
          </div>
          {formatType === 'dataset' && (
            <div style={{ color: '#007bff', fontSize: '14px', marginTop: '5px' }}>
              数据集: {datasetType}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};
