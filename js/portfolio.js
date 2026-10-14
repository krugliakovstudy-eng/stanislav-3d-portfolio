// Скрываем работы, которые не относятся к выбранной категории.
const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll(
  '.project-card, .filterable-project',
);
function filterProjects(filter) {
  if (!['all', '3d', 'branding'].includes(filter)) filter = 'all';
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  projects.forEach((project) => {
    project.hidden = filter !== 'all' && project.dataset.category !== filter;
  });
  document.getElementById('filterStatus').textContent =
    `Показано проектов: ${document.querySelectorAll('.project-card:not([hidden])').length}`;
}
filterButtons.forEach((button) =>
  button.addEventListener('click', () => {
    filterProjects(button.dataset.filter);
    history.replaceState(null, '', '?filter=' + button.dataset.filter + location.hash);
  }),
);
// Ссылка с главной может сразу открыть категорию «Брендинг».
filterProjects(new URLSearchParams(location.search).get('filter') || 'all');
