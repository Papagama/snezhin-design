export const projectStatusLabels = {
  client: 'Клиентский проект',
  concept: 'Авторский концепт',
  educational: 'Учебный проект',
  internal: 'Внутренний проект'
};

// No testimonials have been supplied. Add only approved, attributable real text.
export const testimonials = [];

export function validateProjectTrust(projects, reviews = testimonials) {
  const errors = [];
  const seen = new Set();
  for (const project of projects) {
    if (!projectStatusLabels[project.status]) errors.push(`${project.slug}: unknown project status`);
    if (project.status === 'client' && !project.client?.name) errors.push(`${project.slug}: client name is required`);
  }
  for (const review of reviews) {
    const project = projects.find(item => item.slug === review.caseSlug);
    if (!project || project.status !== 'client') errors.push(`${review.caseSlug}: testimonial needs a real client project`);
    if (seen.has(review.caseSlug)) errors.push(`${review.caseSlug}: duplicate testimonial`);
    seen.add(review.caseSlug);
    if (!review.author?.trim() || !review.text?.trim() || !review.sourceUrl || review.permissionGranted !== true || review.approved !== true) errors.push(`${review.caseSlug}: attribution and publication approval required`);
    try { if (!['https:', 'http:'].includes(new URL(review.sourceUrl).protocol)) throw new Error(); }
    catch { errors.push(`${review.caseSlug}: invalid source URL`); }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}
