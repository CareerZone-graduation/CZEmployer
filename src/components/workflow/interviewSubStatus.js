import { isPast } from 'date-fns';

const toStringId = (value) => {
  if (value === null || value === undefined) return null;
  return String(value);
};

const getInterviewId = (interview) => toStringId(interview?.interviewId || interview?._id);
const getInterviewWorkflowNodeId = (interview) => toStringId(interview?.workflowNodeId);

const getSummaryInterviews = (app) => [
  app.latestInterviewInfo,
  app.interview,
  app.interviewInfo,
].filter(Boolean);

const findLastMatching = (items, predicate) => {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) return items[index];
  }

  return null;
};

const isSameInterview = (firstInterview, secondInterview) => {
  const firstId = getInterviewId(firstInterview);
  const secondId = getInterviewId(secondInterview);

  if (!firstId || !secondId) return true;
  return firstId === secondId;
};

const mergeInterviews = (historyInterview, summaryInterview) => ({
  ...historyInterview,
  ...summaryInterview,
  evaluationNote: summaryInterview.evaluationNote || historyInterview.evaluationNote,
  evaluatedAt: summaryInterview.evaluatedAt || historyInterview.evaluatedAt,
  roundName: summaryInterview.roundName || historyInterview.roundName,
});

const getInterviewForWorkflowNode = (app, workflowNodeId) => {
  const targetWorkflowNodeId = toStringId(workflowNodeId);
  if (!targetWorkflowNodeId) return null;

  const historyInterview = findLastMatching(
    app.interviewHistory || [],
    (interview) => getInterviewWorkflowNodeId(interview) === targetWorkflowNodeId,
  );
  const summaryInterview = getSummaryInterviews(app).find(
    (interview) => getInterviewWorkflowNodeId(interview) === targetWorkflowNodeId,
  );

  if (historyInterview && summaryInterview && isSameInterview(historyInterview, summaryInterview)) {
    return mergeInterviews(historyInterview, summaryInterview);
  }

  return historyInterview || summaryInterview || null;
};

const getLatestInterviewFromHistory = (app) => {
  if (!app) return null;

  const history = app.interviewHistory || [];
  if (!history.length) return null;

  const latestInterviewId = getInterviewId(app.latestInterviewInfo || app.interviewInfo || app.interview);
  if (latestInterviewId) {
    const matchedInterview = history.find((interview) => getInterviewId(interview) === latestInterviewId);
    if (matchedInterview) return matchedInterview;
  }

  return history[history.length - 1];
};

export const getApplicationInterview = (app, options = {}) => {
  if (!app) return null;
  if (options.workflowNodeId) return getInterviewForWorkflowNode(app, options.workflowNodeId);

  const historyInterview = getLatestInterviewFromHistory(app);
  const summaryInterview = app.latestInterviewInfo || app.interview || app.interviewInfo || null;

  if (historyInterview && summaryInterview) {
    return mergeInterviews(historyInterview, summaryInterview);
  }

  return historyInterview || summaryInterview;
};

export const getInterviewResult = (app, options = {}) => {
  if (!app) return null;

  const interview = getApplicationInterview(app, options);
  if (options.workflowNodeId) return interview?.result || null;

  return interview?.result || app.interview_result || null;
};

const getEvaluatedInterviewStatus = (interviewResult) => {
  if (interviewResult === 'PASSED') {
    return { label: 'PV Đạt', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }

  if (interviewResult === 'FAILED') {
    return { label: 'PV Không Đạt', className: 'bg-rose-100 text-rose-800 border-rose-200' };
  }

  return null;
};

/**
 * Xác định trạng thái chi tiết của ứng viên trong bước phỏng vấn (SCHEDULED_INTERVIEW).
 * Trả về { label, className }
 */
export const getInterviewSubStatus = (app, options = {}) => {
  if (!app) return null;
  if (app.status !== 'SCHEDULED_INTERVIEW') return null;
  if (options.workflowNodeId && options.isInterviewNode === false) {
    if (options.hasInterviewNodeInWorkflow === false) return null;
    return getEvaluatedInterviewStatus(getInterviewResult(app));
  }

  const interview = getApplicationInterview(app, options);
  const interviewResult = getInterviewResult(app, options);
  const evaluatedStatus = getEvaluatedInterviewStatus(interviewResult);
  if (evaluatedStatus) return evaluatedStatus;

  if (!interview) {
    return { label: 'Chờ lên lịch', className: 'bg-amber-100 text-amber-800 border-amber-200' };
  }

  switch (interview.status) {
    case 'SCHEDULED': {
      const isPastTime = interview.scheduledTime && isPast(new Date(interview.scheduledTime));
      if (isPastTime) {
        return { label: 'Chờ phỏng vấn', className: 'bg-orange-100 text-orange-800 border-orange-200' };
      }
      return { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    case 'IN_PROGRESS':
      return { label: 'Đang phỏng vấn', className: 'bg-green-100 text-green-800 border-green-200' };
    case 'COMPLETED':
    case 'ENDED':
      return { label: 'Chờ đánh giá', className: 'bg-purple-100 text-purple-800 border-purple-200' };
    default:
      return { label: 'Chờ phỏng vấn', className: 'bg-amber-100 text-amber-800 border-amber-200' };
  }
};

export const getInterviewEvaluationNote = (app, options = {}) => {
  const interview = getApplicationInterview(app, options);
  return interview?.evaluationNote || null;
};
