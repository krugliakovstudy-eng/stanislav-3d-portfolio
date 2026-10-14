// Показываем один слайд и выделяем его индикатор.
const slider = document.querySelector('.hero-slider');
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.slider-dot');
const pauseButton = document.getElementById('pauseSlide');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let currentSlide = 0;
let paused = reducedMotion.matches;

function showSlide(number) {
  currentSlide = (number + slides.length) % slides.length;
  slides.forEach((slide, index) => {
    const active = index === currentSlide;
    slide.classList.toggle('active', active);
    slide.inert = !active;
    slide.setAttribute('aria-hidden', String(!active));
    dots[index].classList.toggle('active', active);
    dots[index].setAttribute('aria-pressed', String(active));
  });
}

function updatePauseButton() {
  pauseButton.textContent = paused ? '▷' : 'Ⅱ';
  pauseButton.setAttribute('aria-pressed', String(paused));
  pauseButton.setAttribute('aria-label', paused ? 'Запустить слайдер' : 'Остановить слайдер');
}

document.getElementById('nextSlide').addEventListener('click', () => showSlide(currentSlide + 1));
document.getElementById('prevSlide').addEventListener('click', () => showSlide(currentSlide - 1));
dots.forEach((dot, index) => {
  dot.addEventListener('click', () => showSlide(index));
});
pauseButton.addEventListener('click', () => {
  paused = !paused;
  updatePauseButton();
});
slider.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
  }
});

// Свайп на телефоне.
let touchStart = 0;
slider.addEventListener('touchstart', (event) => {
  touchStart = event.changedTouches[0].clientX;
}, { passive: true });
slider.addEventListener('touchend', (event) => {
  const distance = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(distance) > 50) showSlide(currentSlide + (distance < 0 ? 1 : -1));
}, { passive: true });

// Один таймер. Пока посетитель работает со слайдером, слайды не меняются.
setInterval(() => {
  if (!paused && !document.hidden && !slider.matches(':hover, :focus-within')) {
    showSlide(currentSlide + 1);
  }
}, 5500);
reducedMotion.addEventListener('change', () => {
  paused = reducedMotion.matches;
  updatePauseButton();
});
showSlide(0);
updatePauseButton();
