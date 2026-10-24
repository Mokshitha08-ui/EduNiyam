/**
 * Deterministic, rule-based deadline risk score engine
 * Evaluates operational risk for an institutional application based on:
 * - Deadline proximity and overdue status
 * - Timeline percentage consumed vs standard SLA
 * - Outstanding deficient documents
 * - Prior deficiency return cycles
 */

export const calculateRiskScore = (application, slaDays = 30) => {
  if (!application) {
    return { level: 'LOW', score: 10, reasons: ['Standard application parameters'], badgeColor: 'green' };
  }

  const {
    submissionDate,
    nextDeadline,
    status = 'PENDING',
    deficiencyCount = 0,
    missingDocCount = 0,
  } = application;

  if (status === 'APPROVED' || status === 'REJECTED') {
    return {
      level: 'RESOLVED',
      score: 0,
      reasons: ['Application workflow finalized'],
      badgeColor: 'gray'
    };
  }

  let score = 0;
  const reasons = [];

  // 1. Overdue or proximity evaluation
  const daysRemaining = (() => {
    if (!nextDeadline) return 15;
    const target = new Date(nextDeadline);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  })();

  if (daysRemaining < 0) {
    score += 50;
    reasons.push(`Target deadline breached by ${Math.abs(daysRemaining)} days`);
  } else if (daysRemaining <= 3) {
    score += 35;
    reasons.push(`Critical deadline: only ${daysRemaining} day(s) remaining`);
  } else if (daysRemaining <= 7) {
    score += 20;
    reasons.push(`Approaching deadline within ${daysRemaining} days`);
  }

  // 2. Timeline consumption
  if (submissionDate) {
    const start = new Date(submissionDate);
    const now = new Date();
    const daysElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const percentConsumed = Math.round((daysElapsed / slaDays) * 100);

    if (percentConsumed >= 100) {
      score += 25;
      reasons.push(`SLA timeline fully consumed (${daysElapsed}/${slaDays} days)`);
    } else if (percentConsumed >= 75) {
      score += 15;
      reasons.push(`Consuming ${percentConsumed}% of configured stage timeline`);
    }
  }

  // 3. Repeated deficiency returns
  if (deficiencyCount >= 2) {
    score += 25;
    reasons.push(`Multiple deficiency cycles (${deficiencyCount} returns recorded)`);
  } else if (deficiencyCount === 1) {
    score += 10;
    reasons.push(`1 previous deficiency cycle returned to institution`);
  }

  // 4. Missing required documents
  if (missingDocCount > 0) {
    score += Math.min(20, missingDocCount * 10);
    reasons.push(`${missingDocCount} mandatory compliance document(s) pending`);
  }

  // Categorize
  let level = 'LOW';
  let badgeColor = 'green';

  if (score >= 45) {
    level = 'HIGH';
    badgeColor = 'red';
  } else if (score >= 25) {
    level = 'MEDIUM';
    badgeColor = 'amber';
  }

  if (reasons.length === 0) {
    reasons.push('On-track within standard processing timeline');
  }

  return {
    score: Math.min(100, score),
    level,
    reasons,
    badgeColor,
    daysRemaining
  };
};
