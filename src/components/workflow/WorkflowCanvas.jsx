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
import ActionNotifyNode from './nodes/ActionNotifyNode';
import ActionTestNode from './nodes/ActionTestNode';

const nodeTypes = {
  STAGE: StageNode,
  CONDITION: ConditionNode,
  ACTION_EMAIL: ActionEmailNode,
  ACTION_NOTIFY: ActionNotifyNode,
  ACTION_TEST: ActionTestNode,
};

const WorkflowCanvas = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick }) => {
  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
