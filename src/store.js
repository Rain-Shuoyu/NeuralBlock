import create from 'zustand';

export const useStore = create((set) => ({
  nodes: [],
  edges: [],
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  setNodes: (nodes) => set(() => ({ nodes })),
  setEdges: (edges) => set(() => ({ edges })),
  clear: () => set(() => ({ nodes: [], edges: [] })),
}));