import React, { useState } from 'react';

export default function KeyboardShortcuts({ isDarkMode }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {/* 快捷键按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'absolute',
          top: '16px',
          left: '240px', // 调整位置避免与黑夜模式按钮重叠
          backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(0, 0, 0, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(0, 0, 0, 0.7)';
        }}
      >
        快捷键 {isVisible ? '−' : '+'}
      </button>

      {/* 快捷键面板 */}
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '56px',
          left: '240px', // 调整位置
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e5e5',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
          zIndex: 10,
          boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: isDarkMode ? '#f9fafb' : '#333' }}>快捷键说明</h4>
          <div style={{ lineHeight: '1.6', color: isDarkMode ? '#d1d5db' : '#666' }}>
            <div><strong>Delete/Backspace</strong> - 删除选中节点</div>
            <div><strong>Ctrl + Z</strong> - 撤销操作</div>
            <div><strong>Ctrl + 单击</strong> - 多选节点</div>
            <div><strong>双击节点</strong> - 配置节点参数</div>
            <div><strong>拖拽</strong> - 移动节点/连接节点</div>
            <div><strong>鼠标滚轮</strong> - 缩放画布</div>
            <div><strong>右键拖拽</strong> - 平移画布</div>
          </div>
        </div>
      )}
    </>
  );
}
