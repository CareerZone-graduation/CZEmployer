import assert from 'node:assert/strict';

import {
  syncConditionNodesWithParents,
} from '../../src/components/workflow/conditionConfigSync.js';

const conditionNode = {
  id: 'condition-1',
  data: {
    type: 'CONDITION',
    name: 'Điều kiện',
    config: { field: 'test_score', operator: '>', value: 70 },
  },
};

const edges = [{ source: 'parent-1', target: 'condition-1' }];

const withParent = (parentNode) => [parentNode, conditionNode];

const syncedAiNodes = syncConditionNodesWithParents(
  withParent({ id: 'parent-1', data: { type: 'ACTION_AI', name: 'Chấm CV', config: {} } }),
  edges
);
assert.equal(syncedAiNodes[1].data.config.field, 'cv_score');
assert.equal(syncedAiNodes[1].data.config.operator, '>');

const syncedInterviewNodes = syncConditionNodesWithParents(
  withParent({
    id: 'parent-1',
    data: { type: 'STAGE', name: 'Phỏng vấn vòng 1', config: { statusMapping: 'SCHEDULED_INTERVIEW' } },
  }),
  edges
);
assert.deepEqual(syncedInterviewNodes[1].data.config, {
  field: 'interview_result',
  operator: '==',
  value: 'PASSED',
});

const unchangedNodes = syncConditionNodesWithParents(
  withParent({ id: 'parent-1', data: { type: 'STAGE', name: 'Phù hợp', config: { statusMapping: 'SUITABLE' } } }),
  edges
);
assert.equal(unchangedNodes[1], conditionNode);
