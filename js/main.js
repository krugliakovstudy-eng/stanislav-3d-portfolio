// Общее мобильное меню для трёх страниц.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
function setMenu(open) {
  mainNav.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  menuToggle.textContent = open ? '×' : '☰';
}
menuToggle.addEventListener('click', () =>
  setMenu(!mainNav.classList.contains('open')),
);
mainNav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mainNav.classList.contains('open')) {
    setMenu(false);
    menuToggle.focus();
  }
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.site-header')) setMenu(false);
});
matchMedia('(min-width: 651px)').addEventListener('change', () =>
  setMenu(false),
);
document.querySelector('.site-footer span').textContent =
  `© ${new Date().getFullYear()} Stanislav 3D`;
