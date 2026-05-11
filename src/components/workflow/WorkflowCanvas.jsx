import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import StageNode from './nodes/StageNode';
import ConditionNode from './nodes/ConditionNode';
import ActionEmailNode from './nodes/ActionEmailNode';
import ActionAINode from './nodes/ActionAINode';
import ActionTestNode from './nodes/ActionTestNode';
import ActionDelayNode from './nodes/ActionDelayNode';
import EndNode from './nodes/EndNode';

const nodeTypes = {
  STAGE: StageNode,
  END: EndNode,
  CONDITION: ConditionNode,
  ACTION_EMAIL: ActionEmailNode,
  ACTION_AI: ActionAINode,
  ACTION_TEST: ActionTestNode,
  ACTION_DELAY: ActionDelayNode,
};

const WorkflowCanvas = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect, 
  onNodeClick, 
  wrapperRef, 
  onDrop, 
  onDragOver, 
  onInit, 
  onNodeContextMenu, 
  onPaneClick,
  readOnly = false
}) => {
  return (
    <div className={`flex-1 h-full bg-slate-50 ${readOnly ? '' : 'custom-cursor-flow'}`} ref={wrapperRef} onDrop={readOnly ? undefined : onDrop} onDragOver={readOnly ? undefined : onDragOver}>
      <style>
        {`
          /* Con trỏ chuột cho nền canvas (áp dụng chung cho cả Editor và Tracking) */
          .custom-cursor-flow .react-flow__pane,
          .readonly-flow .react-flow__pane {
            cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><path d='M9 2v7H2v2h7v7h2v-7h7V9h-7V2H9z' fill='%231e293b'/></svg>") 10 10, crosshair !important;
          }
          
          /* Con trỏ chuột cho chế độ Tracking (ReadOnly) trên Node */
          .readonly-flow .react-flow__node {
            cursor: pointer !important;
            transition: transform 0.2s;
          }
          .readonly-flow .react-flow__node:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
      <ReactFlow
        className={readOnly ? 'readonly-flow' : 'custom-cursor-flow'}
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node)}
        onInit={onInit}
        onNodeContextMenu={readOnly ? undefined : onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
        fitView
      >
        <Background color="#cbd5e1" gap={16} size={1.5} />
        <Controls className="bg-white border-slate-200" showInteractive={!readOnly} />
        <MiniMap nodeStrokeColor="#94a3b8" nodeColor="#e2e8f0" maskColor="rgba(241, 245, 249, 0.7)" />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
