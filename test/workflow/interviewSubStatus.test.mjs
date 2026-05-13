import assert from 'node:assert/strict';

import { getInterviewSubStatus, getInterviewEvaluationNote } from '../../src/components/workflow/interviewSubStatus.js';

assert.equal(getInterviewSubStatus(null), null);
assert.equal(getInterviewEvaluationNote(null), null);

const evaluatedInterviewApplication = {
  status: 'SCHEDULED_INTERVIEW',
  interview_result: null,
  interview: {
    status: 'COMPLETED',
    result: 'PASSED',
    evaluationNote: 'ok1',
  },
};

assert.equal(getInterviewSubStatus(evaluatedInterviewApplication).label, 'PV Đạt');
assert.equal(getInterviewEvaluationNote(evaluatedInterviewApplication), 'ok1');

const applicationDetailResponse = {
  status: 'SCHEDULED_INTERVIEW',
  interview_result: null,
  latestInterviewInfo: {
    interviewId: '6a020a70bc65d8b83d1761bd',
    status: 'COMPLETED',
    result: 'PASSED',
  },
  interviewHistory: [
    {
      interviewId: '6a0208dbbc65d8b83d175f2d',
      status: 'COMPLETED',
      result: 'PASSED',
      evaluationNote: 'đạt',
    },
    {
      interviewId: '6a020a70bc65d8b83d1761bd',
      status: 'COMPLETED',
      result: 'PASSED',
      evaluationNote: 'ok1',
    },
  ],
  notes: 'a',
};

assert.equal(getInterviewSubStatus(applicationDetailResponse).label, 'PV Đạt');
assert.equal(getInterviewEvaluationNote(applicationDetailResponse), 'ok1');

const secondInterviewNodeApplication = {
  status: 'SCHEDULED_INTERVIEW',
  interview_result: null,
  interview: {
    workflowNodeId: 'interview-node-1',
    status: 'COMPLETED',
    result: 'PASSED',
    evaluationNote: 'round 1 ok',
  },
};

assert.equal(
  getInterviewSubStatus(secondInterviewNodeApplication, { workflowNodeId: 'interview-node-2' }).label,
  'Chờ lên lịch',
);
assert.equal(
  getInterviewEvaluationNote(secondInterviewNodeApplication, { workflowNodeId: 'interview-node-2' }),
  null,
);
assert.equal(
  getInterviewSubStatus(secondInterviewNodeApplication, { workflowNodeId: 'interview-node-1' }).label,
  'PV Đạt',
);

assert.equal(
  getInterviewSubStatus(secondInterviewNodeApplication, {
    workflowNodeId: 'end-node',
    isInterviewNode: false,
    hasInterviewNodeInWorkflow: true,
  }).label,
  'PV Đạt',
);

const completedWithoutEvaluationApplication = {
  status: 'SCHEDULED_INTERVIEW',
  interview_result: null,
  interview: {
    status: 'COMPLETED',
    result: null,
  },
};

assert.equal(getInterviewSubStatus(completedWithoutEvaluationApplication).label, 'Chờ đánh giá');
assert.equal(
  getInterviewSubStatus(completedWithoutEvaluationApplication, {
    workflowNodeId: 'end-node',
    isInterviewNode: false,
    hasInterviewNodeInWorkflow: true,
  }),
  null,
);

const failedInterviewAtEndNodeApplication = {
  status: 'SCHEDULED_INTERVIEW',
  interview_result: null,
  interview: {
    workflowNodeId: 'interview-node-2',
    status: 'COMPLETED',
    result: 'FAILED',
  },
};

assert.equal(
  getInterviewSubStatus(failedInterviewAtEndNodeApplication, {
    workflowNodeId: 'end-node',
    isInterviewNode: false,
    hasInterviewNodeInWorkflow: true,
  }).label,
  'PV Không Đạt',
);

assert.equal(
  getInterviewSubStatus(failedInterviewAtEndNodeApplication, {
    workflowNodeId: 'end-node',
    isInterviewNode: false,
    hasInterviewNodeInWorkflow: false,
  }),
  null,
);
