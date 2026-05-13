export const getConditionParentNode = (conditionNode, nodes, edges) => {
  const incomingEdge = edges.find((edge) => edge.target === conditionNode.id);
  if (!incomingEdge) return null;

  return nodes.find((node) => node.id === incomingEdge.source) || null;
};

export const getConditionParentKind = (parentNode) => {
  const parentType = parentNode?.data?.type;
  if (parentType === 'ACTION_TEST') return 'TEST';
  if (parentType === 'ACTION_AI') return 'AI';

  const statusMapping = parentNode?.data?.config?.statusMapping;
  const parentName = parentNode?.data?.name || '';
  if (
    parentType === 'STAGE' &&
    (statusMapping === 'SCHEDULED_INTERVIEW' || parentName.toLowerCase().includes('phỏng vấn'))
  ) {
    return 'INTERVIEW';
  }

  return null;
};

export const syncConditionConfigForParent = (config = {}, parentNode) => {
  const parentKind = getConditionParentKind(parentNode);

  if (parentKind === 'TEST') {
    return config.field === 'test_score' ? config : { ...config, field: 'test_score' };
  }

  if (parentKind === 'AI') {
    return config.field === 'cv_score' ? config : { ...config, field: 'cv_score' };
  }

  if (parentKind === 'INTERVIEW') {
    const nextConfig = {
      ...config,
      field: 'interview_result',
      operator: '==',
      value: config.value === 'FAILED' ? 'FAILED' : 'PASSED',
    };

    if (
      config.field === nextConfig.field &&
      config.operator === nextConfig.operator &&
      config.value === nextConfig.value
    ) {
      return config;
    }

    return nextConfig;
  }

  return config;
};

export const syncConditionNodesWithParents = (nodes, edges) => {
  let changed = false;

  const syncedNodes = nodes.map((node) => {
    if (node.data?.type !== 'CONDITION') return node;

    const parentNode = getConditionParentNode(node, nodes, edges);
    const currentConfig = node.data?.config || {};
    const nextConfig = syncConditionConfigForParent(currentConfig, parentNode);

    if (nextConfig === currentConfig) return node;

    changed = true;
    return {
      ...node,
      data: {
        ...node.data,
        config: nextConfig,
      },
    };
  });

  return changed ? syncedNodes : nodes;
};
