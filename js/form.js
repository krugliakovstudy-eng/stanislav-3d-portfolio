const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const recipient = 'krugliakovstudy@gmail.com';
const fields = ['name', 'email', 'subject', 'message'];

// Обычные условия для каждого из четырёх полей.
function validate(name) {
  const input = form.elements[name];
  const value = input.value.trim();
  let error = '';
  if (name === 'name' && (value.length < 2 || value.length > 80)) {
    error = 'Введите имя (от 2 до 80 символов).';
  }
  if (name === 'email' && (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || input.validity.typeMismatch)) {
    error = 'Введите корректный email.';
  }
  if (name === 'subject' && value !== '3d' && value !== 'branding') {
    error = 'Выберите тему проекта.';
  }
  if (name === 'message' && (value.length < 10 || value.length > 3000)) {
    error = 'Введите сообщение (от 10 до 3000 символов).';
  }
  document.getElementById(`${name}Error`).textContent = error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  input.closest('.form-row').classList.toggle('invalid', Boolean(error));
  return !error;
}
fields.forEach((name) => {
  const input = form.elements[name];
  input.addEventListener('blur', () => validate(name));
  input.addEventListener('input', () => {
    if (input.hasAttribute('aria-invalid')) validate(name);
    status.textContent = '';
  });
});
function prepareRequest() {
  let valid = true;
  for (const name of fields) {
    if (!validate(name)) valid = false;
  }
  if (!valid) {
    status.textContent = 'Проверьте отмеченные поля.';
    status.className = 'form-status error-status';
    form.querySelector('[aria-invalid="true"]').focus();
    return null;
  }
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const topic = form.elements.subject.selectedOptions[0].textContent;
  const text = `Заявка на проект\n\nИмя: ${name}\nEmail: ${email}\nТема: ${topic}\n\n${message}\n`;
  return { text, topic };
}
// mailto открывает письмо; отправку посетитель подтверждает сам.
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
