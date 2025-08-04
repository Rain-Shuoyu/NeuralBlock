import React, { useState } from 'react';

// 导入输入层配置组件
export { InputConfig } from './InputConfig';
// 导入输出层配置组件  
export { OutputConfig } from './OutputConfig';

// 池化层配置弹窗
export const PoolingConfig = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [poolingType, setPoolingType] = useState(initialConfig?.poolingType || 'max');
  const [kernelSize, setKernelSize] = useState(initialConfig?.kernelSize || 2);
  const [stride, setStride] = useState(initialConfig?.stride || 2);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      poolingType,
      kernelSize: parseInt(kernelSize),
      stride: parseInt(stride)
    });
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
        padding: '20px',
        borderRadius: '12px',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>池化层配置</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            池化类型:
          </label>
          <select 
            value={poolingType} 
            onChange={(e) => setPoolingType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="max">最大池化</option>
            <option value="average">平均池化</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            池化核大小:
          </label>
          <input 
            type="number" 
            value={kernelSize}
            onChange={(e) => setKernelSize(e.target.value)}
            min="1"
            max="10"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            步长:
          </label>
          <input 
            type="number" 
            value={stride}
            onChange={(e) => setStride(e.target.value)}
            min="1"
            max="10"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// 卷积层配置弹窗
export const ConvConfig = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [kernelWidth, setKernelWidth] = useState(initialConfig?.kernelWidth || 3);
  const [kernelHeight, setKernelHeight] = useState(initialConfig?.kernelHeight || 3);
  const [stride, setStride] = useState(initialConfig?.stride || 1);
  const [padding, setPadding] = useState(initialConfig?.padding || 0);
  const [inputChannels, setInputChannels] = useState(initialConfig?.inputChannels || 'auto');
  const [outputChannels, setOutputChannels] = useState(initialConfig?.outputChannels || 32);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      kernelWidth: parseInt(kernelWidth),
      kernelHeight: parseInt(kernelHeight),
      stride: parseInt(stride),
      padding: parseInt(padding),
      inputChannels: inputChannels === 'auto' ? 'auto' : parseInt(inputChannels),
      outputChannels: parseInt(outputChannels)
    });
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
        padding: '20px',
        borderRadius: '12px',
        minWidth: '320px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>卷积层配置</h3>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              卷积核宽度 (a):
            </label>
            <input 
              type="number" 
              value={kernelWidth}
              onChange={(e) => setKernelWidth(e.target.value)}
              min="1"
              max="11"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              卷积核高度 (b):
            </label>
            <input 
              type="number" 
              value={kernelHeight}
              onChange={(e) => setKernelHeight(e.target.value)}
              min="1"
              max="11"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              输入通道数:
            </label>
            <select 
              value={inputChannels}
              onChange={(e) => setInputChannels(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            >
              <option value="auto">自动（从前面层获取）</option>
              <option value="1">1</option>
              <option value="3">3</option>
              <option value="16">16</option>
              <option value="32">32</option>
              <option value="64">64</option>
              <option value="128">128</option>
              <option value="256">256</option>
              <option value="512">512</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              输出通道数 (滤波器数量):
            </label>
            <input 
              type="number" 
              value={outputChannels}
              onChange={(e) => setOutputChannels(e.target.value)}
              min="1"
              max="1024"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              步长 (c):
            </label>
            <input 
              type="number" 
              value={stride}
              onChange={(e) => setStride(e.target.value)}
              min="1"
              max="10"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              填充 (d):
            </label>
            <input 
              type="number" 
              value={padding}
              onChange={(e) => setPadding(e.target.value)}
              min="0"
              max="10"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

// 全连接层配置弹窗
export const DenseConfig = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [activation, setActivation] = useState(initialConfig?.activation || 'relu');
  const [units, setUnits] = useState(initialConfig?.units || 128);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      activation,
      units: parseInt(units)
    });
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
        padding: '20px',
        borderRadius: '12px',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>全连接层配置</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            神经元数量:
          </label>
          <input 
            type="number" 
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            min="1"
            max="2048"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            激活函数:
          </label>
          <select 
            value={activation} 
            onChange={(e) => setActivation(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="leaky_relu">Leaky ReLU</option>
            <option value="softmax">Softmax</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
