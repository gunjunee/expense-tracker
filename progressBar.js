//Progress Bar
export function updateProgress(progressFill, totalSpent, budget) {
  if (budget <= 0) {
    progressFill.style.width = "0%";
    progressFill.className = "progress-fill";
    return;
  }

  const percentage = (totalSpent / budget) * 100;
  progressFill.style.width = `${Math.min(percentage, 100)}%`;

  if (percentage >= 100) {
    progressFill.className = "progress-fill danger";
  } else if (percentage >= 80) {
    progressFill.className = "progress-fill warning";
  } else {
    progressFill.className = "progress-fill";
  }
}