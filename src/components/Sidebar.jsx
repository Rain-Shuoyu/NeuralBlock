import React from 'react';
import './Sidebar.css'; // 添加样式文件

const types = [
  { type: 'input', label: '输入层', color: '#60A5FA' },
  { type: 'dense', label: '全连接层', color: '#F87171' },
  { type: 'conv', label: '卷积层', color: '#34D399' },
  { type: 'pool', label: '池化层', color: '#FBBF24' },
  { type: 'watch', label: '观察窗', color: '#10B981' },
  { type: 'output', label: '输出层', color: '#A78BFA' },
];

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    console.log('拖拽开始:', nodeType); // 调试信息
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar">
      {types.map((item) => {
        // 为不同类型的节点定制样式
        const getItemStyle = (type) => {
          const baseStyle = {
            backgroundColor: item.color,
            padding: '16px 12px',
            margin: '8px 0',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'grab',
            userSelect: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            border: '2px solid',
            transition: 'all 0.2s ease',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          };

          switch (type) {
            case 'input':
              return {
                ...baseStyle,
                borderColor: '#1e40af',
                boxShadow: '0 3px 6px rgba(30, 64, 175, 0.3)',
              };
            case 'output':
              return {
                ...baseStyle,
                borderColor: '#7c2d12',
                boxShadow: '0 3px 6px rgba(124, 45, 18, 0.3)',
              };
            default:
              return {
                ...baseStyle,
                borderColor: '#374151',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
              };
          }
        };

        return (
          <div
            key={item.type}
            className="drag-item"
            style={getItemStyle(item.type)}
            draggable
            onDragStart={(event) => onDragStart(event, item)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = getItemStyle(item.type).boxShadow;
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
