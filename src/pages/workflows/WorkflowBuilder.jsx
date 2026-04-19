import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addEdge, useEdgesState, useNodesState } from 'reactflow';
import { toast } from 'sonner';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import NodePalette from '@/components/workflow/NodePalette';
import NodeConfigPanel from '@/components/workflow/NodeConfigPanel';
import * as workflowService from '@/services/workflowService';
import * as testService from '@/services/testService';

const createNodeSkeleton = (type, index) => ({
  id: `tmp-${Date.now()}-${index}`,
  type,
  position: { x: 200 + (index * 20), y: 120 + (index * 20) },
  data: {
    type,
    name: type,
    config: type === 'STAGE'
      ? { statusMapping: 'PENDING', description: '' }
      : type === 'CONDITION'
        ? { field: 'test_score', operator: '>', value: 70 }
        : {},
  },
});

const toApiNodes = (nodes) => nodes.map((n) => ({
  _id: n.id.startsWith('tmp-') ? undefined : n.id,
  type: n.data.type,
  name: n.data.name,
  position: n.position,
  config: n.data.config || {},
}));

const toApiConnections = (edges) => edges.map((e) => ({
  sourceNodeId: e.source,
  sourcePort: e.sourceHandle || 'default',
  targetNodeId: e.target,
  targetPort: e.targetHandle || 'input',
}));

const WorkflowBuilder = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workflowRes, testsRes] = await Promise.all([
          workflowService.getWorkflowById(workflowId),
          testService.getTests({ page: 1, limit: 100 }),
        ]);

        const workflowData = workflowRes.data;
        const initialNodes = (workflowData?.nodes || []).map((n) => ({
          id: n._id,
          type: n.type,
          position: n.position,
          data: {
            type: n.type,
            name: n.name,
            config: n.config || {},
          },
        }));

        const initialEdges = (workflowData?.connections || []).map((c) => {
          let label;
          let style;
          if (c.sourcePort === 'true') {
            label = 'Đúng';
            style = { stroke: '#10b981', strokeWidth: 2 };
          } else if (c.sourcePort === 'false') {
            label = 'Sai';
            style = { stroke: '#ef4444', strokeWidth: 2 };
          }
          
          return {
            id: c._id,
            source: c.sourceNodeId,
            sourceHandle: c.sourcePort,
            target: c.targetNodeId,
            targetHandle: c.targetPort,
            type: 'smoothstep',
            label,
            style,
            labelBgPadding: [8, 4],
            labelBgBorderRadius: 4,
            labelStyle: { fill: c.sourcePort === 'true' ? '#10b981' : c.sourcePort === 'false' ? '#ef4444' : '#333', fontWeight: 600 },
          };
        });

        setNodes(initialNodes);
        setEdges(initialEdges);
        setTests(testsRes.data || []);
      } catch (error) {
        toast.error('Không thể tải workflow');
      } finally {
        setLoading(false);
      }
    };

    if (workflowId) {
        loadData();
    } else {
        setLoading(false);
    }
  }, [workflowId, setNodes, setEdges]);

  const handleSave = async (silent = false, currentNodes = nodes, currentEdges = edges) => {
    if (!validateBeforeSave(currentNodes)) return;
    setSaving(true);
    try {
      await workflowService.saveNodesBatch(workflowId, toApiNodes(currentNodes));
      await workflowService.saveConnectionsBatch(workflowId, toApiConnections(currentEdges));
      if (!silent) toast.success('Lưu workflow thành công');
    } catch {
      if (!silent) toast.error('Không thể lưu workflow');
    } finally {
      setSaving(false);
    }
  };

  const validateBeforeSave = (nodesToValidate = nodes) => {
    const stageCount = nodesToValidate.filter((n) => n.data.type === 'STAGE').length;
    if (!stageCount) {
      toast.error('Workflow phải có ít nhất 1 stage');
      return false;
    }
    return true;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (workflowId) {
        setNodes((currentNodes) => {
          setEdges((currentEdges) => {
            handleSave(true, currentNodes, currentEdges);
            return currentEdges;
          });
          return currentNodes;
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const addNode = (type) => {
    setNodes((prev) => [...prev, createNodeSkeleton(type, prev.length + 1)]);
  };

  const onConnect = (params) => setEdges((eds) => {
    let label;
    let style;
    if (params.sourceHandle === 'true') {
      label = 'Đúng';
      style = { stroke: '#10b981', strokeWidth: 2 };
    } else if (params.sourceHandle === 'false') {
      label = 'Sai';
      style = { stroke: '#ef4444', strokeWidth: 2 };
    }
    return addEdge({
      ...params,
      type: 'smoothstep',
      label,
      style,
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelStyle: { fill: params.sourceHandle === 'true' ? '#10b981' : params.sourceHandle === 'false' ? '#ef4444' : '#333', fontWeight: 600 },
    }, eds);
  });

  const updateSelectedNode = (updatedNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setSelectedNode(updatedNode);
  };

  const handleActivate = async () => {
    await handleSave(true);
    try {
      await workflowService.activateWorkflow(workflowId);
      toast.success('Kích hoạt workflow thành công');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể kích hoạt workflow');
    }
  };

  if (loading) return <div className="p-6">Đang tải workflow...</div>;

  return (
    <div className="h-[calc(100vh-80px)] flex">
      <NodePalette onAddNode={addNode} />
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b bg-white px-3 flex items-center gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => handleSave(false)} disabled={saving}>Lưu</button>
          <button className="px-3 py-1 border rounded bg-slate-900 text-white" onClick={handleActivate}>Kích hoạt</button>
          <button className="px-3 py-1 border rounded" onClick={() => navigate('/workflows')}>Quay lại</button>
        </div>
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={setSelectedNode}
        />
      </div>
      <NodeConfigPanel
        node={selectedNode}
        nodes={nodes}
        edges={edges}
        tests={tests}
        onChange={updateSelectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default WorkflowBuilder;
