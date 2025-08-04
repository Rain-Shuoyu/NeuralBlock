import React from 'react';
import { Handle, Position } from 'reactflow';

// 辅助函数：格式化配置信息显示
const formatConfig = (config, type, actualInputShape) => {
  if (!config) return '';
  
  switch (type) {
    case 'pool':
      return `${config.poolingType === 'max' ? '最大' : '平均'}池化 ${config.kernelSize}×${config.kernelSize} 步长${config.stride}`;
    case 'conv':
      let inputCh = config.inputChannels === 'auto' ? '自动' : config.inputChannels;
      // 如果有实际输入形状信息，显示实际的输入通道数
      if (actualInputShape && actualInputShape.channels && config.inputChannels === 'auto') {
        inputCh = actualInputShape.channels;
      }
      return `${config.kernelWidth || 3}×${config.kernelHeight || 3} 步长${config.stride || 1} 填充${config.padding || 0} | ${inputCh}→${config.outputChannels || 32}通道`;
    case 'dense':
      return `${config.units}神经元 ${config.activation.toUpperCase()}`;
    default:
      return '';
  }
};

// 输入节点 - 只有输出连接点
export const InputNode = ({ data, id }) => {
  const handleDoubleClick = () => {
    if (window.onNodeDoubleClick) {
      window.onNodeDoubleClick(id, data);
    }
  };

  // 显示配置信息
  const getConfigDisplay = () => {
    if (data.config) {
      const { height, width, channels, formatType, datasetType } = data.config;
      if (formatType === 'dataset' && datasetType) {
        return `${datasetType} (${height}×${width}×${channels})`;
      } else {
        return `${height}×${width}×${channels}`;
      }
    }
    return '点击配置';
  };

  return (
    <div 
      style={{
        backgroundColor: '#60A5FA',
        color: 'white',
        border: '3px solid #1e40af',
        borderRadius: '15px',
        padding: '18px 22px',
        minWidth: '150px',
        minHeight: '70px',
        fontSize: '15px',
        fontWeight: 'bold',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 12px rgba(30, 64, 175, 0.4)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease'
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 8px 16px rgba(30, 64, 175, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 6px 12px rgba(30, 64, 175, 0.4)';
      }}
    >
      <div>{data.label}</div>
      {data.config && (
        <div style={{ 
          fontSize: '11px', 
          marginTop: '4px', 
          opacity: 0.9,
          fontWeight: 'normal'
        }}>
          {getConfigDisplay()}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#1e40af',
          width: '14px',
          height: '14px',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(30, 64, 175, 0.3)'
        }}
      />
    </div>
  );
};

// 输出节点 - 只有输入连接点
export const OutputNode = ({ data, id }) => {
  const handleDoubleClick = () => {
    if (window.onNodeDoubleClick) {
      window.onNodeDoubleClick(id, data);
    }
  };

  // 显示配置信息
  const getConfigDisplay = () => {
    // 优先显示计算得到的结果和推断的任务类型
    if (data.config && data.config.computedShape && data.config.inferredTask) {
      const shape = data.config.computedShape;
      const task = data.config.inferredTask;
      
      // 显示推断的任务类型和形状信息
      const shapeText = getShapeDisplayText(shape);
      return `${task.description} | ${shapeText}`;
    }
    
    // 如果有用户手动配置，显示用户配置
    if (data.config && data.config.taskDescription) {
      if (data.config.outputType === 'classification') {
        return `${data.config.taskDescription}: ${data.config.classCount} 类`;
      } else if (data.config.outputType === 'regression') {
        return `${data.config.taskDescription}: ${data.config.regressionDim} 维`;
      } else {
        return data.config.taskDescription;
      }
    }
    
    return '等待网络连接';
  };

  // 获取形状显示文本
  const getShapeDisplayText = (shape) => {
    if (shape.type === 'vector') {
      return `${shape.size} 维输出`;
    } else if (shape.type === 'tensor') {
      return `${shape.height}×${shape.width}×${shape.channels}`;
    }
    return shape.description || '计算完成';
  };

  return (
    <div 
      style={{
        backgroundColor: '#A78BFA',
        color: 'white',
        border: '3px solid #7c2d12',
        borderRadius: '15px',
        padding: '18px 22px',
        minWidth: '150px',
        minHeight: '70px',
        fontSize: '15px',
        fontWeight: 'bold',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 12px rgba(124, 45, 18, 0.4)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease'
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 8px 16px rgba(124, 45, 18, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 6px 12px rgba(124, 45, 18, 0.4)';
      }}
    >
      <div>{data.label}</div>
      <div style={{ 
        fontSize: '11px', 
        marginTop: '4px', 
        opacity: 0.9,
        fontWeight: 'normal',
        lineHeight: '1.2'
      }}>
        {getConfigDisplay()}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#7c2d12',
          width: '14px',
          height: '14px',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(124, 45, 18, 0.3)'
        }}
      />
    </div>
  );
};

// 观察窗节点 - 显示数据尺寸，不参与计算
export const WatchNode = ({ data, id }) => {
  // 获取数据尺寸显示文本
  const getShapeDisplay = () => {
    if (data.computedShape) {
      const shape = data.computedShape;
      if (shape.type === 'vector') {
        return `${shape.size} 维向量`;
      } else if (shape.type === 'tensor') {
        return `${shape.height}×${shape.width}×${shape.channels}`;
      }
      return shape.description || '已计算';
    }
    return '等待计算';
  };

  return (
    <div 
      style={{
        backgroundColor: '#10B981',
        color: 'white',
        border: '3px solid #047857',
        borderRadius: '15px',
        padding: '18px 22px',
        minWidth: '150px',
        minHeight: '70px',
        fontSize: '15px',
        fontWeight: 'bold',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 12px rgba(4, 120, 87, 0.4)',
        position: 'relative',
        cursor: 'default',
        transition: 'box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 8px 16px rgba(4, 120, 87, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 6px 12px rgba(4, 120, 87, 0.4)';
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#047857',
          width: '14px',
          height: '14px',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(4, 120, 87, 0.3)'
        }}
      />
      <div style={{ fontSize: '13px', marginBottom: '4px' }}>📊 {data.label}</div>
      <div style={{
        fontSize: '11px',
        fontWeight: 'normal',
        opacity: 0.95,
        lineHeight: '1.3'
      }}>
        {getShapeDisplay()}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#047857',
          width: '14px',
          height: '14px',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(4, 120, 87, 0.3)'
        }}
      />
    </div>
  );
};

// 中间层节点 - 有输入和输出连接点
export const MiddleNode = ({ data, id }) => {
  const handleDoubleClick = () => {
    // 触发配置弹窗
    if (window.onNodeDoubleClick) {
      window.onNodeDoubleClick(id, data);
    }
  };

  const configText = formatConfig(data.config, data.type, data.actualInputShape);

  return (
    <div 
      style={{
        backgroundColor: data.color || '#F87171',
        color: 'white',
        border: '3px solid #374151',
        borderRadius: '15px',
        padding: '18px 22px',
        minWidth: '150px',
        minHeight: '70px',
        fontSize: '15px',
        fontWeight: 'bold',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease'
      }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: '#374151',
          width: '14px',
          height: '14px',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(55, 65, 81, 0.3)'
        }}
      />
      <div>{data.label}</div>
      {configText && (
        <div style={{
          fontSize: '10px',
          fontWeight: 'normal',
          marginTop: '4px',
          opacity: 0.9
        }}>
          {configText}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: '#374151',
          width: '14px',
          height: '14px',
          border: '3px solid white',
          boxShadow: '0 2px 4px rgba(55, 65, 81, 0.3)'
        }}
      />
    </div>
  );
};
