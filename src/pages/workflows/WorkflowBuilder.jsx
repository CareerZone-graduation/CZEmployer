import { useEffect, useState } from 'react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addEdge, useEdgesState, useNodesState } from 'reactflow';
import { toast } from 'sonner';
import WorkflowCanvas from '@/components/workflow/WorkflowCanvas';
import NodePalette from '@/components/workflow/NodePalette';
import NodeConfigPanel from '@/components/workflow/NodeConfigPanel';
import { syncConditionNodesWithParents } from '@/components/workflow/conditionConfigSync';
import * as workflowService from '@/services/workflowService';
import * as testService from '@/services/testService';
import { useCallback } from 'react';

const createNodeSkeleton = (item, index) => {
  const type = item.type || item;
  const name = item.name || type;
  
  return {
    id: `tmp-${Date.now()}-${index}`,
    type,
    position: { x: 200 + (index * 20), y: 120 + (index * 20) },
    data: {
      type,
      name,
      config: item.config || (type === 'STAGE'
        ? { statusMapping: 'PENDING', description: '' }
        : type === 'CONDITION'
          ? { field: 'test_score', operator: '>', value: 70 }
          : {}),
    },
  };
};

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
  const [workflowName, setWorkflowName] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const wrapperRef = React.useRef(null);
  const nodesRef = React.useRef(nodes);
  const edgesRef = React.useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  useEffect(() => {
    setNodes((currentNodes) => syncConditionNodesWithParents(currentNodes, edges));
  }, [edges, nodes, setNodes]);

  useEffect(() => {
    if (!selectedNode) return;

    const latestSelectedNode = nodes.find((node) => node.id === selectedNode.id);
    if (latestSelectedNode && latestSelectedNode !== selectedNode) {
      setSelectedNode(latestSelectedNode);
    }
  }, [nodes, selectedNode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [workflowRes, testsRes] = await Promise.all([
          workflowService.getWorkflowById(workflowId),
          testService.getTests({ page: 1, limit: 100 }),
        ]);

        const workflowData = workflowRes.data;
        setWorkflowName(workflowData?.name || '');
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
      } catch {
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

  const handleRenameWorkflow = async () => {
    const trimmedName = workflowName.trim();
    if (!trimmedName) {
      toast.error('Tên workflow không được để trống');
      return;
    }
    if (trimmedName.length > 200) {
      toast.error('Tên workflow không được vượt quá 200 ký tự');
      return;
    }

    setRenaming(true);
    try {
      await workflowService.updateWorkflow(workflowId, { name: trimmedName });
      setWorkflowName(trimmedName);
      toast.success('Đã cập nhật tên workflow');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật tên workflow');
    } finally {
      setRenaming(false);
    }
  };

  const handleSave = async (silent = false, currentNodes = nodes, currentEdges = edges) => {
    // Auto-save (silent) skips validation to avoid spamming toasts
    if (!silent && !validateBeforeSave(currentNodes, currentEdges)) return;
    setSaving(true);
    try {
      // Step 1: Save nodes → backend returns saved nodes with real ObjectIds
      const savedNodes = await workflowService.saveNodesBatch(workflowId, toApiNodes(currentNodes));
      const savedNodesList = savedNodes?.data || savedNodes || [];

      // Step 2: Build tmp→real ID map by matching position (order preserved by backend)
      const idMap = {};
      const apiNodes = toApiNodes(currentNodes);
      apiNodes.forEach((sent, i) => {
        const real = savedNodesList[i];
        if (real && sent._id !== real._id) {
          // Old ID (could be tmp-...) → new ObjectId
          const oldId = currentNodes[i]?.id;
          if (oldId) idMap[oldId] = real._id;
        }
      });

      // Step 3: If we have new IDs, update local state
      if (Object.keys(idMap).length > 0) {
        const remapId = (id) => idMap[id] || id;

        const updatedNodes = currentNodes.map(n => {
          const newId = remapId(n.id);
          return newId !== n.id ? { ...n, id: newId } : n;
        });

        const updatedEdges = currentEdges.map(e => ({
          ...e,
          id: `${remapId(e.source)}-${e.sourceHandle || 'default'}-${remapId(e.target)}`,
          source: remapId(e.source),
          target: remapId(e.target),
        }));

        setNodes(updatedNodes);
        setEdges(updatedEdges);

        // Use remapped edges for connections save
        await workflowService.saveConnectionsBatch(workflowId, toApiConnections(updatedEdges));
      } else {
        await workflowService.saveConnectionsBatch(workflowId, toApiConnections(currentEdges));
      }

      if (!silent) toast.success('Lưu workflow thành công');
    } catch (error) {
      if (!silent) {
        toast.error(error?.response?.data?.message || 'Không thể lưu workflow');
      }
    } finally {
      setSaving(false);
    }
  };

  const validateBeforeSave = (nodesToValidate = nodes, edgesToValidate = edges) => {
    const errors = [];

    // 1. Phải có ít nhất 1 STAGE
    const stageNodes = nodesToValidate.filter(n => n.data.type === 'STAGE');
    if (stageNodes.length === 0) {
      errors.push('Workflow phải có ít nhất 1 giai đoạn (Stage).');
    }

    // 2. Phải có ít nhất 1 END
    const endNodes = nodesToValidate.filter(n => n.data.type === 'END');
    if (endNodes.length === 0) {
      errors.push('Workflow phải có ít nhất 1 node END.');
    }

    // 3. Phải có node bắt đầu (STAGE không có đường vào)
    const targetIds = new Set(edgesToValidate.map(e => e.target));
    const startNodes = stageNodes.filter(n => !targetIds.has(n.id));
    if (stageNodes.length > 0 && startNodes.length === 0) {
      errors.push('Không tìm thấy giai đoạn bắt đầu. Phải có ít nhất 1 Stage không có đường vào.');
    }
    if (startNodes.length > 1) {
      errors.push(`Có ${startNodes.length} giai đoạn bắt đầu (Stage không có đường vào). Chỉ nên có 1.`);
    }

    // 3. Node bắt đầu phải có đường ra
    const sourceIds = new Set(edgesToValidate.map(e => e.source));
    startNodes.forEach(n => {
      if (!sourceIds.has(n.id)) {
        errors.push(`Giai đoạn bắt đầu "${n.data.name}" chưa được nối với node tiếp theo.`);
      }
    });

    // 4. CONDITION phải có đủ 2 đường ra (true / false)
    const conditionNodes = nodesToValidate.filter(n => n.data.type === 'CONDITION');
    conditionNodes.forEach(cn => {
      const outEdges = edgesToValidate.filter(e => e.source === cn.id);
      const hasTrue = outEdges.some(e => e.sourceHandle === 'true');
      const hasFalse = outEdges.some(e => e.sourceHandle === 'false');
      if (!hasTrue || !hasFalse) {
        const missing = [];
        if (!hasTrue) missing.push('Đúng (True)');
        if (!hasFalse) missing.push('Sai (False)');
        errors.push(`Node điều kiện "${cn.data.name}" thiếu đường ra: ${missing.join(', ')}.`);
      }
    });

    // 5. CONDITION dùng test_score → phải có ACTION_TEST ở phía trước trong luồng
    const hasAncestorOfType = (nodeId, targetType, visited = new Set()) => {
      if (visited.has(nodeId)) return false;
      visited.add(nodeId);
      const incomingEdges = edgesToValidate.filter(e => e.target === nodeId);
      for (const edge of incomingEdges) {
        const parentNode = nodesToValidate.find(n => n.id === edge.source);
        if (!parentNode) continue;
        if (parentNode.data.type === targetType) return true;
        if (hasAncestorOfType(parentNode.id, targetType, visited)) return true;
      }
      return false;
    };

    conditionNodes.forEach(cn => {
      const field = cn.data.config?.field;
      if (field === 'test_score') {
        if (!hasAncestorOfType(cn.id, 'ACTION_TEST')) {
          errors.push(`Node điều kiện "${cn.data.name}" đang kiểm tra điểm bài test, nhưng phía trước không có Node Bài Test nào.`);
        }
      }
      if (field === 'cv_score') {
        if (!hasAncestorOfType(cn.id, 'ACTION_AI')) {
          errors.push(`Node điều kiện "${cn.data.name}" đang kiểm tra điểm CV AI, nhưng phía trước không có Node AI nào.`);
        }
      }
    });

    // 6. ACTION_EMAIL phải chọn template
    nodesToValidate.filter(n => n.data.type === 'ACTION_EMAIL').forEach(n => {
      if (!n.data.config?.templateId) {
        errors.push(`Node gửi email "${n.data.name}" chưa chọn mẫu email.`);
      }
    });

    // 7. ACTION_TEST phải chọn bài test
    nodesToValidate.filter(n => n.data.type === 'ACTION_TEST').forEach(n => {
      if (!n.data.config?.testId) {
        errors.push(`Node bài test "${n.data.name}" chưa chọn bài test.`);
      }
    });

    // 8. ACTION_DELAY phải có thời gian chờ
    nodesToValidate.filter(n => n.data.type === 'ACTION_DELAY').forEach(n => {
      if (!n.data.config?.delayValue || n.data.config.delayValue <= 0) {
        errors.push(`Node chờ "${n.data.name}" chưa cấu hình thời gian chờ.`);
      }
    });

    // 9. END không được có đường ra
    endNodes.forEach(n => {
      if (sourceIds.has(n.id)) {
        errors.push(`Node END "${n.data.name}" không được có kết nối đi ra.`);
      }
    });

    // 10. Mọi nhánh đều phải đi tới END
    if (nodesToValidate.length > 0 && endNodes.length > 0) {
      const adjacency = new Map(nodesToValidate.map(n => [n.id, []]));
      edgesToValidate.forEach(e => {
        const list = adjacency.get(e.source);
        if (list) list.push(e.target);
      });

      const endIdSet = new Set(endNodes.map(n => n.id));
      const memo = new Map();
      const visiting = new Set();

      const canReachEnd = (nodeId) => {
        if (endIdSet.has(nodeId)) return true;
        if (memo.has(nodeId)) return memo.get(nodeId);
        if (visiting.has(nodeId)) return false;

        visiting.add(nodeId);
        const nextNodes = adjacency.get(nodeId) || [];
        let result = false;

        for (const nextId of nextNodes) {
          if (canReachEnd(nextId)) {
            result = true;
            break;
          }
        }

        visiting.delete(nodeId);
        memo.set(nodeId, result);
        return result;
      };

      nodesToValidate.forEach(n => {
        if (!canReachEnd(n.id)) {
          errors.push(`Node "${n.data.name}" không có đường đi tới END.`);
        }
      });
    }

    // 11. Node "cô lập" (không có đường vào lẫn đường ra, trừ start node)
    nodesToValidate.forEach(n => {
      const hasIn = targetIds.has(n.id);
      const hasOut = sourceIds.has(n.id);
      if (!hasIn && !hasOut && !startNodes.some(s => s.id === n.id)) {
        errors.push(`Node "${n.data.name}" bị cô lập — không có kết nối nào.`);
      }
    });

    if (errors.length > 0) {
      errors.forEach(msg => toast.error(msg, { duration: 6000 }));
      return false;
    }
    return true;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (workflowId) {
        handleSave(true, nodesRef.current, edgesRef.current);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [workflowId]);

  const addNode = (item) => {
    setNodes((prev) => [...prev, createNodeSkeleton(item, prev.length + 1)]);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event) => {
    event.preventDefault();

    const itemStr = event.dataTransfer.getData('application/reactflow');
    if (!itemStr) return;

    const item = JSON.parse(itemStr);
    if (!reactFlowInstance || !wrapperRef.current) return;

    const reactFlowBounds = wrapperRef.current.getBoundingClientRect();
    let position;
    if (reactFlowInstance.screenToFlowPosition) {
       position = reactFlowInstance.screenToFlowPosition({
         x: event.clientX,
         y: event.clientY,
       });
    } else {
       position = reactFlowInstance.project({
         x: event.clientX - reactFlowBounds.left,
         y: event.clientY - reactFlowBounds.top,
       });
    }

    const newNode = {
      id: `tmp-${Date.now()}`,
      type: item.type || item,
      position,
      data: {
        type: item.type || item,
        name: item.name || item.type,
        config: item.config || (item.type === 'STAGE'
          ? { statusMapping: 'PENDING', description: '' }
          : item.type === 'CONDITION'
            ? { field: 'test_score', operator: '>', value: 70 }
            : {}),
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onNodeContextMenu = (event, node) => {
    event.preventDefault();
    setContextMenu({
      id: node.id,
      top: event.clientY,
      left: event.clientX,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const deleteNode = () => {
    if (!contextMenu) return;
    setNodes((nds) => nds.filter((n) => n.id !== contextMenu.id));
    setEdges((eds) => eds.filter((e) => e.source !== contextMenu.id && e.target !== contextMenu.id));
    setContextMenu(null);
    if (selectedNode?.id === contextMenu.id) {
      setSelectedNode(null);
    }
  };

  const onConnect = useCallback(
    (params) => {
      // Logic 1: Mỗi node chỉ được 1 luồng đi vào
      const targetNode = nodes.find(n => n.id === params.target);
      const targetHasIncoming = edges.some(e => e.target === params.target);
      if (targetHasIncoming && targetNode?.type !== 'END') {
        return;
      }

      // Logic 2: Số luồng đi ra của source node
      const sourceNode = nodes.find(n => n.id === params.source);
      if (sourceNode?.type === 'END') {
        return;
      }

      if (sourceNode?.type === 'CONDITION') {
        const portHasOutgoing = edges.some(e => e.source === params.source && e.sourceHandle === params.sourceHandle);
        if (portHasOutgoing) {
          return;
        }
      } else {
        const sourceHasOutgoing = edges.some(e => e.source === params.source);
        if (sourceHasOutgoing) {
          return;
        }
      }

      setEdges((eds) => {
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
    },
    [nodes, edges, setEdges]
  );

  const updateSelectedNode = (updatedNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
    setSelectedNode(updatedNode);
  };

  const handleActivate = async () => {
    // Strict validation before activation
    if (!validateBeforeSave(nodes, edges)) {
      toast.error('Vui lòng sửa các lỗi trên trước khi kích hoạt workflow.', { duration: 5000 });
      return;
    }
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
    <div className="h-[calc(100vh-80px)] flex relative">
      <NodePalette onAddNode={addNode} />
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b bg-white px-3 flex items-center gap-2">
          <input
            className="h-8 px-2 border rounded w-72"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Tên workflow"
            maxLength={200}
          />
          <button className="px-3 py-1 border rounded" onClick={handleRenameWorkflow} disabled={renaming}>
            {renaming ? 'Đang lưu tên...' : 'Lưu tên'}
          </button>
          <button className="px-3 py-1 border rounded" onClick={() => handleSave(false)} disabled={saving}>Lưu</button>
          <button className="px-3 py-1 border rounded bg-slate-900 text-white" onClick={handleActivate}>Kích hoạt</button>
          <button className="px-3 py-1 border rounded" onClick={() => navigate('/workflows')}>Quay lại</button>
        </div>
        <WorkflowCanvas
          wrapperRef={wrapperRef}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={setSelectedNode}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={closeContextMenu}
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
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu} 
            onContextMenu={(e) => { e.preventDefault(); closeContextMenu(); }} 
          />
          <div
            style={{ top: contextMenu.top, left: contextMenu.left }}
            className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-36"
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 font-medium"
              onClick={deleteNode}
            >
              Xóa Node này
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkflowBuilder;
