import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import './Canvas.css';
import { InputNode, OutputNode, MiddleNode, WatchNode } from './CustomNodes';
import BottomToolbar from './BottomToolbar';
import { PoolingConfig, ConvConfig, DenseConfig, InputConfig, OutputConfig } from './ConfigModals';
import KeyboardShortcuts from './KeyboardShortcuts';

// 定义自定义节点类型
const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  middleNode: MiddleNode,
  watchNode: WatchNode,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

// 节点碰撞检测函数
const checkNodeCollision = (newNode, existingNodes, nodeSize = { width: 150, height: 70 }) => {
  const padding = 20; // 节点间的最小间距
  
  for (const existingNode of existingNodes) {
    if (existingNode.id === newNode.id) continue; // 跳过自己
    
    const dx = Math.abs(newNode.position.x - existingNode.position.x);
    const dy = Math.abs(newNode.position.y - existingNode.position.y);
    
    // 检查是否重叠（包含间距）
    if (dx < nodeSize.width + padding && dy < nodeSize.height + padding) {
      return true; // 发生碰撞
    }
  }
  return false; // 无碰撞
};

// 寻找无碰撞的位置
const findNonCollidingPosition = (initialPosition, existingNodes, nodeSize = { width: 150, height: 70 }) => {
  const maxAttempts = 50;
  const step = 30;
  let attempts = 0;
  
  // 从初始位置开始，螺旋式搜索无碰撞位置
  for (let radius = 0; radius < maxAttempts * step; radius += step) {
    for (let angle = 0; angle < 360; angle += 45) {
      const radian = (angle * Math.PI) / 180;
      const testPosition = {
        x: initialPosition.x + radius * Math.cos(radian),
        y: initialPosition.y + radius * Math.sin(radian)
      };
      
      const testNode = { position: testPosition };
      if (!checkNodeCollision(testNode, existingNodes, nodeSize)) {
        return testPosition;
      }
      
      attempts++;
      if (attempts >= maxAttempts) break;
    }
    if (attempts >= maxAttempts) break;
  }
  
  // 如果找不到合适位置，返回右下角偏移的位置
  return {
    x: initialPosition.x + existingNodes.length * 30,
    y: initialPosition.y + existingNodes.length * 30
  };
};

export default function Canvas({ isDarkMode, onToggleDarkMode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeCount, setSelectedNodeCount] = useState(0);
  const [isCollisionDetected, setIsCollisionDetected] = useState(false);
  const [configModal, setConfigModal] = useState({
    isOpen: false,
    type: null,
    nodeId: null,
    initialConfig: null
  });
  
  // 历史记录状态
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // 保存历史记录
  const saveToHistory = useCallback((nodes, edges) => {
    const newState = { nodes: [...nodes], edges: [...edges] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // 限制历史记录数量，避免内存溢出
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // 撤销功能
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);
  
  // 自定义节点变化处理，添加碰撞检测
  const handleNodesChange = useCallback((changes) => {
    let collisionDetected = false;
    
    // 处理位置变化时的碰撞检测
    const processedChanges = changes.map(change => {
      if (change.type === 'position' && change.position) {
        const nodeToMove = nodes.find(n => n.id === change.id);
        if (nodeToMove) {
          const testNode = { ...nodeToMove, position: change.position };
          const otherNodes = nodes.filter(n => n.id !== change.id);
          
          // 检查是否会碰撞
          if (checkNodeCollision(testNode, otherNodes)) {
            console.log('检测到碰撞，调整位置'); 
            collisionDetected = true;
            // 如果碰撞，寻找最近的无碰撞位置
            const adjustedPosition = findNonCollidingPosition(change.position, otherNodes);
            return { ...change, position: adjustedPosition };
          }
        }
      }
      return change;
    });
    
    // 更新碰撞状态
    setIsCollisionDetected(collisionDetected);
    if (collisionDetected) {
      // 短暂显示碰撞提示后自动隐藏
      setTimeout(() => setIsCollisionDetected(false), 1500);
    }
    
    onNodesChange(processedChanges);
  }, [nodes, onNodesChange]);

  // 监听节点选择变化
  useEffect(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    setSelectedNodeCount(selectedNodes.length);
  }, [nodes]);

  // 设置全局双击处理函数和键盘事件监听
  useEffect(() => {
    window.onNodeDoubleClick = (nodeId, nodeData) => {
      console.log('节点双击:', nodeId, nodeData);
      
      // 根据节点类型打开对应的配置弹窗
      if (nodeData.type === 'input') {
        setConfigModal({
          isOpen: true,
          type: 'input',
          nodeId,
          initialConfig: nodeData.config
        });
      } else if (nodeData.type === 'output') {
        setConfigModal({
          isOpen: true,
          type: 'output',
          nodeId,
          initialConfig: nodeData.config
        });
      } else if (nodeData.type === 'pool') {
        setConfigModal({
          isOpen: true,
          type: 'pool',
          nodeId,
          initialConfig: nodeData.config
        });
      } else if (nodeData.type === 'conv') {
        setConfigModal({
          isOpen: true,
          type: 'conv',
          nodeId,
          initialConfig: nodeData.config
        });
      } else if (nodeData.type === 'dense') {
        setConfigModal({
          isOpen: true,
          type: 'dense',
          nodeId,
          initialConfig: nodeData.config
        });
      }
    };

    // 添加键盘事件监听
    const handleKeyDown = (event) => {
      // 检查是否按下了Delete键或Backspace键
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 防止在输入框中触发删除
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return;
        }
        
        event.preventDefault();
        deleteSelectedNodes();
      }
      
      // 检查是否按下了Ctrl+Z（撤销）
      if (event.ctrlKey && event.key === 'z') {
        // 防止在输入框中触发撤销
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return;
        }
        
        event.preventDefault();
        undo();
      }
    };

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.onNodeDoubleClick = null;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodes, edges]); // 添加nodes和edges依赖

  // 删除选中的节点和相关连接
  const deleteSelectedNodes = useCallback(() => {
    // 找到所有选中的节点
    const selectedNodes = nodes.filter(node => node.selected);
    
    if (selectedNodes.length === 0) {
      console.log('没有选中的节点');
      return;
    }

    console.log('删除选中的节点:', selectedNodes.map(n => n.id));

    // 保存当前状态到历史记录
    saveToHistory(nodes, edges);

    // 获取要删除的节点ID列表
    const selectedNodeIds = selectedNodes.map(node => node.id);
    
    // 删除节点
    setNodes((nds) => nds.filter(node => !selectedNodeIds.includes(node.id)));
    
    // 删除与这些节点相关的所有连接
    setEdges((eds) => eds.filter(edge => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    ));

    console.log(`已删除 ${selectedNodes.length} 个节点及其相关连接`);
  }, [nodes, edges, setNodes, setEdges, saveToHistory]);

  // 保存节点配置
  const saveNodeConfig = (config) => {
    // 保存当前状态到历史记录
    saveToHistory(nodes, edges);
    
    // 先计算更新后的节点数组
    const updatedNodes = nodes.map((node) => {
      if (node.id === configModal.nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            config
          }
        };
      }
      return node;
    });
    
    // 更新状态
    setNodes(updatedNodes);
    
    // 关闭配置弹窗
    closeConfigModal();
    
    // 使用更新后的节点数组立即进行重新计算
    setTimeout(() => {
      recalculateAllOutputShapesWithNodes(updatedNodes, edges);
    }, 10);
  };

  // 计算并更新输出层形状
  const calculateAndUpdateOutputShape = (inputNode, allNodes, allEdges) => {
    console.log('开始计算网络输出形状，输入配置:', inputNode.data.config);
    
    // 找到输出层节点
    const outputNodes = allNodes.filter(node => 
      node.data.label === '输出层' || node.type === 'outputNode'
    );
    
    if (outputNodes.length === 0) {
      console.log('未找到输出层节点');
      return;
    }
    
    // 计算网络的完整传播路径
    const inputConfig = inputNode.data.config;
    if (!inputConfig) {
      console.log('输入节点无配置');
      return;
    }
    
    // 对每个输出节点计算其最终形状
    outputNodes.forEach(outputNode => {
      const finalShape = calculateNetworkPropagation(inputNode, outputNode, allNodes, allEdges);
      console.log('计算得到的最终形状:', finalShape);
      
      // 根据计算结果推断任务类型
      const inputConfig = inputNode.data.config;
      const taskInfo = inferTaskType(finalShape, inputConfig);
      console.log('推断的任务类型:', taskInfo);
      
      // 更新输出层节点的配置
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === outputNode.id) {
            console.log('更新输出层节点:', node.id);
            
            // 保留用户手动配置，但更新计算结果和推断信息
            const existingConfig = node.data.config || {};
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...existingConfig,
                  // 计算得到的形状信息
                  computedShape: finalShape,
                  // 推断的任务信息
                  inferredTask: taskInfo,
                  // 计算状态
                  calculatedFromNetwork: true,
                  lastUpdated: new Date().toISOString()
                }
              }
            };
          }
          return node;
        })
      );
    });
  };

  // 计算并更新输出层形状（可以传入特定的节点和边）
  const calculateAndUpdateOutputShapeWithNodes = (inputNode, allNodes, allEdges) => {
    console.log('开始计算网络输出形状，输入配置:', inputNode.data.config);
    
    // 找到输出层节点
    const outputNodes = allNodes.filter(node => 
      node.data.label === '输出层' || node.type === 'outputNode'
    );
    
    if (outputNodes.length === 0) {
      console.log('未找到输出层节点');
      return;
    }
    
    // 计算网络的完整传播路径
    const inputConfig = inputNode.data.config;
    if (!inputConfig) {
      console.log('输入节点无配置');
      return;
    }
    
    // 对每个输出节点计算其最终形状
    outputNodes.forEach(outputNode => {
      const finalShape = calculateNetworkPropagationWithNodes(inputNode, outputNode, allNodes, allEdges);
      console.log('计算得到的最终形状:', finalShape);
      
      // 根据计算结果推断任务类型
      const inputConfig = inputNode.data.config;
      const taskInfo = inferTaskType(finalShape, inputConfig);
      console.log('推断的任务类型:', taskInfo);
      
      // 更新输出层节点的配置
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === outputNode.id) {
            console.log('更新输出层节点:', node.id);
            
            // 保留用户手动配置，但更新计算结果和推断信息
            const existingConfig = node.data.config || {};
            return {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...existingConfig,
                  // 计算得到的形状信息
                  computedShape: finalShape,
                  // 推断的任务信息
                  inferredTask: taskInfo,
                  // 计算状态
                  calculatedFromNetwork: true,
                  lastUpdated: new Date().toISOString()
                }
              }
            };
          }
          return node;
        })
      );
    });
  };

  // 计算并更新所有观察窗节点的形状
  const calculateWatchNodeShapes = (allNodes, allEdges) => {
    const inputNodes = allNodes.filter(node => node.data.type === 'input');
    const watchNodes = allNodes.filter(node => node.data.type === 'watch');
    
    if (inputNodes.length === 0 || watchNodes.length === 0) {
      return;
    }
    
    // 为每个观察窗节点计算其位置的数据形状
    watchNodes.forEach(watchNode => {
      const inputNode = inputNodes[0]; // 假设只有一个输入节点
      
      if (!inputNode.data.config) {
        return;
      }
      
      // 找到从输入到观察窗的路径
      const pathToWatch = findPathFromInputToOutput(inputNode.id, watchNode.id, allEdges, allNodes);
      
      if (pathToWatch.length === 0) {
        return;
      }
      
      // 计算到观察窗位置的形状
      let currentShape = {
        type: 'tensor',
        height: inputNode.data.config.height,
        width: inputNode.data.config.width,
        channels: inputNode.data.config.channels
      };
      
      // 逐层计算形状变化，不包括观察窗节点本身
      for (let i = 1; i < pathToWatch.length - 1; i++) {
        const layerNode = allNodes.find(node => node.id === pathToWatch[i]);
        if (layerNode && layerNode.data.type !== 'watch') {
          currentShape = calculateLayerOutput(currentShape, layerNode);
        }
      }
      
      // 更新观察窗节点的形状信息
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === watchNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                computedShape: currentShape,
                lastUpdated: new Date().toISOString()
              }
            };
          }
          return node;
        })
      );
    });
  };

  // 计算并更新所有观察窗节点的形状（可以传入特定的节点和边）
  const calculateWatchNodeShapesWithNodes = (allNodes, allEdges) => {
    const inputNodes = allNodes.filter(node => node.data.type === 'input');
    const watchNodes = allNodes.filter(node => node.data.type === 'watch');
    
    if (inputNodes.length === 0 || watchNodes.length === 0) {
      return;
    }
    
    // 收集需要更新的观察窗信息
    const watchUpdates = [];
    
    // 为每个观察窗节点计算其位置的数据形状
    watchNodes.forEach(watchNode => {
      const inputNode = inputNodes[0]; // 假设只有一个输入节点
      
      if (!inputNode.data.config) {
        return;
      }
      
      // 找到从输入到观察窗的路径
      const pathToWatch = findPathFromInputToOutput(inputNode.id, watchNode.id, allEdges, allNodes);
      
      if (pathToWatch.length === 0) {
        return;
      }
      
      // 计算到观察窗位置的形状
      let currentShape = {
        type: 'tensor',
        height: inputNode.data.config.height,
        width: inputNode.data.config.width,
        channels: inputNode.data.config.channels
      };
      
      // 逐层计算形状变化，不包括观察窗节点本身
      for (let i = 1; i < pathToWatch.length - 1; i++) {
        const layerNode = allNodes.find(node => node.id === pathToWatch[i]);
        if (layerNode && layerNode.data.type !== 'watch') {
          currentShape = calculateLayerOutputWithNodes(currentShape, layerNode, allNodes, allEdges);
        }
      }
      
      // 收集更新信息
      watchUpdates.push({
        nodeId: watchNode.id,
        computedShape: currentShape,
        lastUpdated: new Date().toISOString()
      });
    });
    
    // 批量更新观察窗节点
    if (watchUpdates.length > 0) {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const update = watchUpdates.find(u => u.nodeId === node.id);
          if (update) {
            return {
              ...node,
              data: {
                ...node.data,
                computedShape: update.computedShape,
                lastUpdated: update.lastUpdated
              }
            };
          }
          return node;
        })
      );
    }
  };

  // 计算网络传播路径和最终形状
  const calculateNetworkPropagation = (inputNode, outputNode, allNodes, allEdges) => {
    // 构建从输入到输出的路径
    const path = findPathFromInputToOutput(inputNode.id, outputNode.id, allEdges, allNodes);
    console.log('网络传播路径:', path);
    
    if (path.length === 0) {
      // 如果没有连接路径，返回输入形状（表示直接连接或重建任务）
      const inputConfig = inputNode.data.config;
      if (inputConfig) {
        return {
          type: 'tensor',
          height: inputConfig.height,
          width: inputConfig.width,
          channels: inputConfig.channels,
          description: `直接输出 (${inputConfig.height}×${inputConfig.width}×${inputConfig.channels})`
        };
      }
      return { type: 'unknown', description: '未连接' };
    }
    
    // 初始形状（输入层的配置）
    let currentShape = {
      type: 'tensor',
      height: inputNode.data.config.height,
      width: inputNode.data.config.width,
      channels: inputNode.data.config.channels
    };
    
    // 逐层计算形状变化，排除最后的输出层节点和观察窗节点
    for (let i = 1; i < path.length - 1; i++) {
      const layerNode = allNodes.find(node => node.id === path[i]);
      if (layerNode && layerNode.data.type !== 'watch') {
        currentShape = calculateLayerOutput(currentShape, layerNode);
        console.log(`经过 ${layerNode.data.label} 后的形状:`, currentShape);
      }
    }
    
    // 返回最终计算得到的形状，不进行任务类型的预设
    return currentShape;
  };

  // 计算网络传播路径和最终形状（可以传入特定的节点和边）
  const calculateNetworkPropagationWithNodes = (inputNode, outputNode, allNodes, allEdges) => {
    // 构建从输入到输出的路径
    const path = findPathFromInputToOutput(inputNode.id, outputNode.id, allEdges, allNodes);
    console.log('网络传播路径:', path);
    
    if (path.length === 0) {
      // 如果没有连接路径，返回输入形状（表示直接连接或重建任务）
      const inputConfig = inputNode.data.config;
      if (inputConfig) {
        return {
          type: 'tensor',
          height: inputConfig.height,
          width: inputConfig.width,
          channels: inputConfig.channels,
          description: `直接输出 (${inputConfig.height}×${inputConfig.width}×${inputConfig.channels})`
        };
      }
      return { type: 'unknown', description: '未连接' };
    }
    
    // 初始形状（输入层的配置）
    let currentShape = {
      type: 'tensor',
      height: inputNode.data.config.height,
      width: inputNode.data.config.width,
      channels: inputNode.data.config.channels
    };
    
    // 逐层计算形状变化，排除最后的输出层节点和观察窗节点
    for (let i = 1; i < path.length - 1; i++) {
      const layerNode = allNodes.find(node => node.id === path[i]);
      if (layerNode && layerNode.data.type !== 'watch') {
        currentShape = calculateLayerOutputWithNodes(currentShape, layerNode, allNodes, allEdges);
        console.log(`经过 ${layerNode.data.label} 后的形状:`, currentShape);
      }
    }
    
    // 返回最终计算得到的形状，不进行任务类型的预设
    return currentShape;
  };

  // 寻找从输入到输出的路径
  const findPathFromInputToOutput = (inputId, outputId, edges, nodes) => {
    const graph = {};
    
    // 构建邻接表
    edges.forEach(edge => {
      if (!graph[edge.source]) graph[edge.source] = [];
      graph[edge.source].push(edge.target);
    });
    
    // BFS寻找路径
    const queue = [[inputId]];
    const visited = new Set([inputId]);
    
    while (queue.length > 0) {
      const path = queue.shift();
      const currentNode = path[path.length - 1];
      
      if (currentNode === outputId) {
        return path;
      }
      
      if (graph[currentNode]) {
        for (const neighbor of graph[currentNode]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push([...path, neighbor]);
          }
        }
      }
    }
    
    return []; // 没找到路径
  };

  // 根据层类型计算输出形状
  const calculateLayerOutput = (inputShape, layerNode) => {
    const layerType = layerNode.data.type;
    const layerConfig = layerNode.data.config || {};
    
    switch (layerType) {
      case 'conv':
        return calculateConvOutput(inputShape, layerConfig);
      case 'pool':
        return calculatePoolOutput(inputShape, layerConfig);
      case 'dense':
        return calculateDenseOutput(inputShape, layerConfig);
      default:
        return inputShape; // 未知层类型，保持原形状
    }
  };

  // 根据层类型计算输出形状（可以传入额外的上下文信息）
  const calculateLayerOutputWithNodes = (inputShape, layerNode, allNodes, allEdges) => {
    const layerType = layerNode.data.type;
    const layerConfig = layerNode.data.config || {};
    
    switch (layerType) {
      case 'conv':
        return calculateConvOutput(inputShape, layerConfig);
      case 'pool':
        return calculatePoolOutput(inputShape, layerConfig);
      case 'dense':
        return calculateDenseOutput(inputShape, layerConfig);
      default:
        return inputShape; // 未知层类型，保持原形状
    }
  };

  // 卷积层输出计算
  const calculateConvOutput = (inputShape, config) => {
    const {
      kernelWidth = 3,
      kernelHeight = 3,
      stride = 1,
      padding = 0,
      inputChannels = 'auto',
      outputChannels = 32
    } = config;
    
    if (inputShape.type === 'vector') {
      // 如果输入是向量，无法进行卷积
      return inputShape;
    }
    
    const outputHeight = Math.floor((inputShape.height + 2 * padding - kernelHeight) / stride) + 1;
    const outputWidth = Math.floor((inputShape.width + 2 * padding - kernelWidth) / stride) + 1;
    
    // 自动获取输入通道数或使用配置的值
    const actualInputChannels = inputChannels === 'auto' ? inputShape.channels : inputChannels;
    
    return {
      type: 'tensor',
      height: outputHeight,
      width: outputWidth,
      channels: outputChannels,  // 使用配置的输出通道数
      inputChannels: actualInputChannels  // 记录实际使用的输入通道数
    };
  };

  // 池化层输出计算
  const calculatePoolOutput = (inputShape, config) => {
    const {
      kernelSize = 2,
      stride = 2
    } = config;
    
    if (inputShape.type === 'vector') {
      // 如果输入是向量，无法进行池化
      return inputShape;
    }
    
    const outputHeight = Math.floor(inputShape.height / stride);
    const outputWidth = Math.floor(inputShape.width / stride);
    
    return {
      type: 'tensor',
      height: outputHeight,
      width: outputWidth,
      channels: inputShape.channels
    };
  };

  // 全连接层输出计算
  const calculateDenseOutput = (inputShape, config) => {
    const { units = 128 } = config;
    
    return {
      type: 'vector',
      size: units,
      description: `全连接层输出 (${units} 个神经元)`
    };
  };

  // 根据计算得到的形状自动推断任务类型
  const inferTaskType = (outputShape, inputShape) => {
    if (!outputShape) return { type: 'unknown', description: '未知任务' };
    
    // 如果输出形状与输入形状完全相同，推断为重建任务
    if (outputShape.type === 'tensor' && inputShape && 
        outputShape.height === inputShape.height && 
        outputShape.width === inputShape.width && 
        outputShape.channels === inputShape.channels) {
      return {
        type: 'reconstruction',
        description: '重建任务',
        detail: `重建 ${outputShape.height}×${outputShape.width}×${outputShape.channels} 图像`
      };
    }
    
    // 如果输出是向量形状
    if (outputShape.type === 'vector') {
      const size = outputShape.size;
      
      // 根据输出维度推断任务类型
      if (size === 1) {
        return {
          type: 'binary_classification_or_regression',
          description: '二分类或回归',
          detail: '1维输出 (二分类概率或单值回归)'
        };
      } else if (size === 2) {
        return {
          type: 'binary_classification_or_coordinate',
          description: '二分类或坐标回归',
          detail: '2维输出 (二分类logits或坐标预测)'
        };
      } else if (size >= 3 && size <= 1000) {
        return {
          type: 'multiclass_classification',
          description: '多分类任务',
          detail: `${size}类分类 (${getClassificationHint(size)})`
        };
      } else if (size > 1000) {
        return {
          type: 'high_dimensional_regression',
          description: '高维回归',
          detail: `${size}维输出向量`
        };
      }
    }
    
    // 如果输出仍然是张量形状但比输入小
    if (outputShape.type === 'tensor') {
      const outputSize = outputShape.height * outputShape.width * outputShape.channels;
      const inputSize = inputShape ? inputShape.height * inputShape.width * inputShape.channels : 0;
      
      if (inputSize > 0 && outputSize < inputSize) {
        return {
          type: 'feature_extraction',
          description: '特征提取',
          detail: `提取特征 ${outputShape.height}×${outputShape.width}×${outputShape.channels}`
        };
      } else {
        return {
          type: 'tensor_output',
          description: '张量输出',
          detail: `${outputShape.height}×${outputShape.width}×${outputShape.channels} 张量`
        };
      }
    }
    
    return {
      type: 'unknown',
      description: '未知任务类型',
      detail: JSON.stringify(outputShape)
    };
  };

  // 根据类别数量给出常见分类任务的提示
  const getClassificationHint = (classCount) => {
    const commonTasks = {
      2: '二分类',
      10: 'MNIST/CIFAR-10',
      100: 'CIFAR-100',
      1000: 'ImageNet',
    };
    return commonTasks[classCount] || '自定义分类';
  };

  // 关闭配置弹窗
  const closeConfigModal = () => {
    setConfigModal({
      isOpen: false,
      type: null,
      nodeId: null,
      initialConfig: null
    });
  };

  // 重新计算所有输出形状（使用当前状态）
  const recalculateAllOutputShapes = () => {
    recalculateAllOutputShapesWithNodes(nodes, edges);
  };

  // 重新计算所有输出形状（可以传入特定的节点和边）
  const recalculateAllOutputShapesWithNodes = (allNodes, allEdges) => {
    console.log('重新计算所有输出层和观察窗形状');
    
    // 找到所有输入层节点
    const inputNodes = allNodes.filter(node => 
      node.data.label === '输入层' || node.type === 'inputNode'
    );
    
    // 对每个有配置的输入层节点重新计算输出
    inputNodes.forEach(inputNode => {
      if (inputNode.data.config) {
        calculateAndUpdateOutputShapeWithNodes(inputNode, allNodes, allEdges);
      }
    });
    
    // 计算所有观察窗节点的形状
    calculateWatchNodeShapesWithNodes(allNodes, allEdges);
    
    // 重新计算和更新所有中间层节点的形状传播信息
    recalculateMiddleLayerShapesWithNodes(allNodes, allEdges);
  };

  // 新增：重新计算所有中间层的形状传播信息
  const recalculateMiddleLayerShapes = () => {
    const inputNodes = nodes.filter(node => 
      node.data.label === '输入层' || node.type === 'inputNode'
    );
    
    if (inputNodes.length === 0) return;
    
    // 收集所有需要更新的节点信息
    const nodeUpdates = new Map();
    
    inputNodes.forEach(inputNode => {
      if (!inputNode.data.config) return;
      
      // 找到从输入层出发的所有路径
      const allMiddleLayers = nodes.filter(node => 
        ['conv', 'pool', 'dense'].includes(node.data.type)
      );
      
      // 为每个中间层计算其在网络中的实际输入形状
      allMiddleLayers.forEach(middleLayer => {
        const pathToLayer = findPathFromInputToOutput(inputNode.id, middleLayer.id, edges, nodes);
        
        if (pathToLayer.length > 1) {
          let currentShape = {
            type: 'tensor',
            height: inputNode.data.config.height,
            width: inputNode.data.config.width,
            channels: inputNode.data.config.channels
          };
          
          // 逐层计算到当前中间层之前的形状变化
          for (let i = 1; i < pathToLayer.length - 1; i++) {
            const layerNode = nodes.find(node => node.id === pathToLayer[i]);
            if (layerNode && layerNode.data.type !== 'watch') {
              currentShape = calculateLayerOutput(currentShape, layerNode);
            }
          }
          
          // 收集更新信息
          nodeUpdates.set(middleLayer.id, {
            actualInputShape: currentShape,
            lastUpdated: new Date().toISOString()
          });
        }
      });
    });
    
    // 批量更新所有节点
    if (nodeUpdates.size > 0) {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const updateData = nodeUpdates.get(node.id);
          if (updateData) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updateData
              }
            };
          }
          return node;
        })
      );
    }
  };

  // 新增：重新计算所有中间层的形状传播信息（可以传入特定的节点和边）
  const recalculateMiddleLayerShapesWithNodes = (allNodes, allEdges) => {
    const inputNodes = allNodes.filter(node => 
      node.data.label === '输入层' || node.type === 'inputNode'
    );
    
    if (inputNodes.length === 0) return;
    
    // 收集所有需要更新的节点信息
    const nodeUpdates = new Map();
    
    inputNodes.forEach(inputNode => {
      if (!inputNode.data.config) return;
      
      // 找到从输入层出发的所有路径
      const allMiddleLayers = allNodes.filter(node => 
        ['conv', 'pool', 'dense'].includes(node.data.type)
      );
      
      // 为每个中间层计算其在网络中的实际输入形状
      allMiddleLayers.forEach(middleLayer => {
        const pathToLayer = findPathFromInputToOutput(inputNode.id, middleLayer.id, allEdges, allNodes);
        
        if (pathToLayer.length > 1) {
          let currentShape = {
            type: 'tensor',
            height: inputNode.data.config.height,
            width: inputNode.data.config.width,
            channels: inputNode.data.config.channels
          };
          
          // 逐层计算到当前中间层之前的形状变化
          for (let i = 1; i < pathToLayer.length - 1; i++) {
            const layerNode = allNodes.find(node => node.id === pathToLayer[i]);
            if (layerNode && layerNode.data.type !== 'watch') {
              currentShape = calculateLayerOutputWithNodes(currentShape, layerNode, allNodes, allEdges);
            }
          }
          
          // 收集更新信息
          nodeUpdates.set(middleLayer.id, {
            actualInputShape: currentShape,
            lastUpdated: new Date().toISOString()
          });
        }
      });
    });
    
    // 批量更新所有节点
    if (nodeUpdates.size > 0) {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          const updateData = nodeUpdates.get(node.id);
          if (updateData) {
            return {
              ...node,
              data: {
                ...node.data,
                ...updateData
              }
            };
          }
          return node;
        })
      );
    }
  };

  const onConnect = useCallback(
    (params) => {
      // 保存当前状态到历史记录
      saveToHistory(nodes, edges);
      
      // 根据连接的节点类型定制边的样式
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);
      
      let edgeStyle = {
        strokeWidth: 4,
        stroke: isDarkMode ? '#60a5fa' : '#2563eb',
      };
      
      // 根据不同的节点类型组合使用不同的颜色
      if (sourceNode?.data.type === 'input') {
        edgeStyle.stroke = isDarkMode ? '#93c5fd' : '#60A5FA'; // 输入层连接线为浅蓝色
      } else if (targetNode?.data.type === 'output') {
        edgeStyle.stroke = isDarkMode ? '#c4b5fd' : '#A78BFA'; // 连接到输出层的线为紫色
      } else if (sourceNode?.data.type === 'conv' || targetNode?.data.type === 'conv') {
        edgeStyle.stroke = isDarkMode ? '#6ee7b7' : '#34D399'; // 卷积层相关连接为绿色
      }
      
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: edgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: edgeStyle.stroke,
        },
      };
      
      setEdges((eds) => {
        const newEdges = addEdge(newEdge, eds);
        
        // 连接建立后，重新计算输出形状
        setTimeout(() => {
          recalculateAllOutputShapes();
        }, 100);
        
        return newEdges;
      });
    },
    [setEdges, nodes, edges, isDarkMode, saveToHistory]
  );

  // 清空画布功能
  const clearCanvas = useCallback(() => {
    // 保存当前状态到历史记录
    saveToHistory(nodes, edges);
    
    setNodes([]);
    setEdges([]);
    console.log('画布已清空');
  }, [nodes, edges, setNodes, setEdges, saveToHistory]);

  // 关键：处理拖放事件
  const onDrop = useCallback((event) => {
    event.preventDefault();
    console.log('拖放事件触发'); // 调试信息

    try {
      // 保存当前状态到历史记录
      saveToHistory(nodes, edges);
      
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      console.log('拖放数据:', nodeData); // 调试信息

      // 更精确的坐标计算
      const initialPosition = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 20,
      };
      console.log('初始位置:', initialPosition); // 调试信息

      // 检查碰撞并找到合适的位置
      const adjustedPosition = findNonCollidingPosition(initialPosition, nodes);
      console.log('调整后位置:', adjustedPosition); // 调试信息

      // 根据节点类型选择对应的自定义节点
      const getNodeType = (nodeType) => {
        switch (nodeType) {
          case 'input':
            return 'inputNode';
          case 'output':
            return 'outputNode';
          case 'watch':
            return 'watchNode';
          default:
            return 'middleNode';
        }
      };

      const newNode = {
        id: getId(),
        type: getNodeType(nodeData.type),
        position: adjustedPosition, // 使用调整后的位置
        data: { 
          label: nodeData.label,
          type: nodeData.type,
          color: nodeData.color
        }
      };

      setNodes((nds) => nds.concat(newNode));
      console.log('节点已添加:', newNode); // 调试信息
    } catch (error) {
      console.error('拖放错误:', error);
    }
  }, [nodes, edges, setNodes, saveToHistory]);

  // 关键：允许拖放
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log('拖拽悬停'); // 调试信息
  }, []);

  return (
    <div style={{ flex: 1, height: '100%', position: 'relative' }}>
      {/* 黑夜模式切换按钮 */}
      <button
        onClick={onToggleDarkMode}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
          color: isDarkMode ? '#f9fafb' : '#111827',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 15,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
        title={isDarkMode ? '切换到亮色模式' : '切换到黑夜模式'}
      >
        {isDarkMode ? '🌞' : '🌙'}
        {isDarkMode ? '亮色' : '黑夜'}
      </button>
      
      {/* 碰撞检测指示器 */}
      {isCollisionDetected && (
        <div className="collision-indicator">
          <div className="collision-message">
            ⚠️ 位置已调整以避免重叠
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{
          strokeWidth: 4,
          stroke: isDarkMode ? '#60a5fa' : '#2563eb',
        }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: {
            strokeWidth: 4,
            stroke: isDarkMode ? '#60a5fa' : '#2563eb',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isDarkMode ? '#60a5fa' : '#2563eb',
          },
        }}
        multiSelectionKeyCode="Control"
        deleteKeyCode="Delete"
        selectionOnDrag={false}
        panOnDrag={true}
        selectNodesOnDrag={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        fitView
        className={isDarkMode ? 'dark' : ''}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: isDarkMode ? '#111827' : '#ffffff'
        }}
      >
        <Background 
          color={isDarkMode ? '#4b5563' : '#aaa'}
          className={isDarkMode ? 'dark' : ''}
          style={{
            backgroundColor: isDarkMode ? '#111827' : '#ffffff'
          }}
        />
        <Controls 
          className={isDarkMode ? 'dark-controls' : ''}
          style={{
            button: {
              backgroundColor: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#f9fafb' : '#111827',
              border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
            }
          }}
        />
        <MiniMap 
          style={{
            backgroundColor: isDarkMode ? '#374151' : '#ffffff',
            border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb'
          }}
          maskColor={isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.2)'}
        />
      </ReactFlow>
      
      {/* 快捷键提示 */}
      <KeyboardShortcuts isDarkMode={isDarkMode} />
      
      {/* 选择状态提示 */}
      {selectedNodeCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.9)' : 'rgba(37, 99, 235, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }}>
          已选择 {selectedNodeCount} 个节点 - 按 Delete 键删除
        </div>
      )}
      
      <BottomToolbar 
        onClear={clearCanvas} 
        onUndo={undo}
        canUndo={historyIndex > 0}
        isDarkMode={isDarkMode}
      />
      
      {/* 配置弹窗 */}
      <InputConfig
        isOpen={configModal.isOpen && configModal.type === 'input'}
        onClose={closeConfigModal}
        onSave={saveNodeConfig}
        initialConfig={configModal.initialConfig}
      />
      
      <OutputConfig
        isOpen={configModal.isOpen && configModal.type === 'output'}
        onClose={closeConfigModal}
        onSave={saveNodeConfig}
        initialConfig={configModal.initialConfig}
      />
      
      <PoolingConfig
        isOpen={configModal.isOpen && configModal.type === 'pool'}
        onClose={closeConfigModal}
        onSave={saveNodeConfig}
        initialConfig={configModal.initialConfig}
      />
      
      <ConvConfig
        isOpen={configModal.isOpen && configModal.type === 'conv'}
        onClose={closeConfigModal}
        onSave={saveNodeConfig}
        initialConfig={configModal.initialConfig}
      />
      
      <DenseConfig
        isOpen={configModal.isOpen && configModal.type === 'dense'}
        onClose={closeConfigModal}
        onSave={saveNodeConfig}
        initialConfig={configModal.initialConfig}
      />
    </div>
  );
}
