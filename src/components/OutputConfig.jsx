import React, { useState } from 'react';

// 输出层配置弹窗
export const OutputConfig = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [outputType, setOutputType] = useState(initialConfig?.outputType || 'classification');
  const [classCount, setClassCount] = useState(initialConfig?.classCount || 10);
  const [regressionDim, setRegressionDim] = useState(initialConfig?.regressionDim || 1);

  if (!isOpen) return null;

  // 获取计算形状的显示文本
  const getComputedShapeText = (shape) => {
    if (!shape) return '未计算';
    if (shape.type === 'vector') {
      return `向量 (${shape.size} 维)`;
    } else if (shape.type === 'tensor') {
      return `张量 (${shape.height}×${shape.width}×${shape.channels})`;
    }
    return shape.description || '未知形状';
  };

  // 预定义任务类型
  const taskTypes = {
    'classification': { 
      name: '分类任务', 
      description: '输出类别概率',
      examples: ['图像分类', '文本分类', '情感分析']
    },
    'regression': { 
      name: '回归任务', 
      description: '输出连续数值',
      examples: ['价格预测', '年龄预测', '坐标预测']
    },
    'reconstruction': { 
      name: '重建任务', 
      description: '重建输入数据',
      examples: ['图像重建', '去噪', '超分辨率']
    }
  };

  const handleSave = () => {
    const config = {
      outputType,
      classCount: outputType === 'classification' ? parseInt(classCount) : null,
      regressionDim: outputType === 'regression' ? parseInt(regressionDim) : null,
      taskDescription: taskTypes[outputType].name
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
        <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>输出层配置</h3>
        
        {/* 显示计算得到的结果 */}
        {initialConfig?.computedShape && initialConfig?.inferredTask && (
          <div style={{ 
            backgroundColor: '#e0f2fe', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #81d4fa'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#01579b' }}>
              🔍 网络计算结果
            </div>
            <div style={{ color: '#0277bd', fontSize: '14px', marginBottom: '5px' }}>
              推断任务: {initialConfig.inferredTask.description}
            </div>
            <div style={{ color: '#0277bd', fontSize: '14px', marginBottom: '5px' }}>
              输出形状: {getComputedShapeText(initialConfig.computedShape)}
            </div>
            <div style={{ color: '#0288d1', fontSize: '13px', fontStyle: 'italic' }}>
              {initialConfig.inferredTask.detail}
            </div>
          </div>
        )}
        
        <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
          👆 上方显示根据网络结构自动计算的结果，下方为手动任务类型设置（可选）
        </div>
        
        {/* 任务类型选择 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
            任务类型:
          </label>
          <select 
            value={outputType} 
            onChange={(e) => setOutputType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          >
            {Object.entries(taskTypes).map(([key, task]) => (
              <option key={key} value={key}>
                {task.name} - {task.description}
              </option>
            ))}
          </select>
        </div>

        {/* 任务描述 */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
            {taskTypes[outputType].name}
          </div>
          <div style={{ color: '#6c757d', fontSize: '13px', marginBottom: '8px' }}>
            {taskTypes[outputType].description}
          </div>
          <div style={{ color: '#007bff', fontSize: '12px' }}>
            常见应用: {taskTypes[outputType].examples.join('、')}
          </div>
        </div>

        {/* 分类任务配置 */}
        {outputType === 'classification' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              类别数量:
            </label>
            <input 
              type="number" 
              value={classCount}
              onChange={(e) => setClassCount(e.target.value)}
              min="2"
              max="1000"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              常见: CIFAR-10 (10类), ImageNet (1000类), MNIST (10类)
            </div>
          </div>
        )}

        {/* 回归任务配置 */}
        {outputType === 'regression' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              输出维度:
            </label>
            <input 
              type="number" 
              value={regressionDim}
              onChange={(e) => setRegressionDim(e.target.value)}
              min="1"
              max="100"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              1维: 价格预测, 2维: 坐标预测, 3维: RGB值预测
            </div>
          </div>
        )}

        {/* 输出预览 */}
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#0c4a6e' }}>输出预览:</div>
          {outputType === 'classification' && (
            <div style={{ color: '#0369a1', fontSize: '14px' }}>
              分类输出: {classCount} 个类别的概率分布
            </div>
          )}
          {outputType === 'regression' && (
            <div style={{ color: '#0369a1', fontSize: '14px' }}>
              回归输出: {regressionDim} 维连续数值
            </div>
          )}
          {outputType === 'reconstruction' && (
            <div style={{ color: '#0369a1', fontSize: '14px' }}>
              重建输出: 与输入相同维度的重建数据
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
