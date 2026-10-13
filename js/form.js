const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const recipient = 'krugliakovstudy@gmail.com';
const rules = {
  name: (v) => (v.length >= 2 && v.length <= 80 ? '' : 'Введите имя (от 2 до 80 символов).'),
  email: (v) =>
    v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && !form.elements.email.validity.typeMismatch
      ? '' : 'Введите корректный email.',
  subject: (v) =>
    ['3d', 'branding'].includes(v) ? '' : 'Выберите тему проекта.',
  message: (v) =>
    v.length >= 10 && v.length <= 3000 ? '' : 'Введите сообщение (от 10 до 3000 символов).',
};
function validate(name) {
  const input = form.elements[name];
  const error = rules[name](input.value.trim());
  document.getElementById(`${name}Error`).textContent = error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  input.closest('.form-row').classList.toggle('invalid', Boolean(error));
  return !error;
}
Object.keys(rules).forEach((name) => {
  const input = form.elements[name];
  input.addEventListener('blur', () => validate(name));
  input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) validate(name);
    status.textContent = '';
  });
});
function prepareRequest() {
  const valid = Object.keys(rules).map(validate).every(Boolean);
  if (!valid) {
    status.textContent = 'Проверьте отмеченные поля.';
    status.className = 'form-status error-status';
    form.querySelector('[aria-invalid="true"]').focus();
    return null;
  }
  const values = Object.fromEntries(new FormData(form));
  const topic = form.elements.subject.selectedOptions[0].textContent;
  const text = `Заявка на проект\n\nИмя: ${values.name.trim()}\nEmail: ${values.email.trim()}\nТема: ${topic}\n\n${values.message.trim()}\n`;
  return { text, topic };
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const request = prepareRequest();
  if (!request) return;
  const subject = encodeURIComponent(`Заявка с портфолио: ${request.topic}`);
  const body = encodeURIComponent(request.text);
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  status.textContent =
    'Письмо подготовлено. Отправьте его из почтового приложения. Если оно не открылось, скопируйте заявку и отправьте её на ' + recipient + '.';
  status.className = 'form-status';
});
document.getElementById('copyRequest').addEventListener('click', async () => {
  const request = prepareRequest();
  if (!request) return;
  try {
    await navigator.clipboard.writeText(request.text);
    document.getElementById('requestFallback').hidden = true;
    status.textContent = 'Заявка скопирована. Вставьте её в письмо на ' + recipient + '.';
    status.className = 'form-status success';
  } catch {
    const text = document.getElementById('requestText');
    text.value = request.text;
    document.getElementById('requestFallback').hidden = false;
    text.focus();
    text.select();
    status.textContent = 'Скопируйте выделенный текст и отправьте его на ' + recipient + '.';
    status.className = 'form-status';
  }
});
