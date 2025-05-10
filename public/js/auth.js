// auth.js

// Общая функция для POST-запроса JSON
async function postJSON(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
    }
    return res.json();
}

// Регистрация
const signUpForm = document.getElementById('signUpForm');
if (signUpForm) {
    signUpForm.addEventListener('submit', async e => {
        e.preventDefault();
        const first = document.getElementById('su-firstname').value.trim();
    const last  = document.getElementById('su-lastname').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const phone = document.getElementById('su-phone').value.trim();
    const pass  = document.getElementById('su-password').value;

    // Клиентские проверки
    if (!email.includes('@')) {
      return alert('Email должен содержать @');
    }
    if (!/^\+7\d{10}$/.test(phone)) {
      return alert('Телефон должен быть в формате +7XXXXXXXXXX');
    }
    if (!/(?=.*\d)/.test(pass) ||
        !/(?=.*[a-z])/.test(pass) ||
        !/(?=.*[A-Z])/.test(pass) ||
        !/(?=.*\W)/.test(pass) ||
        pass.length < 8) {
      return alert('Пароль должен быть минимум 8 симв., с цифрой, строчной, заглавной буквой и спецсимволом');
    }
        try {
            await postJSON('../api/sign_up.php', {
                firstname: document.getElementById('su-firstname').value,
                lastname: document.getElementById('su-lastname').value,
                email: document.getElementById('su-email').value,
                phone: document.getElementById('su-phone').value,
                password: document.getElementById('su-password').value
            });
            alert('Регистрация прошла успешно!');
            window.location.href = 'sign_in.html';
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    });
}

// Вход
const signInForm = document.getElementById('signInForm');
if (signInForm) {
    signInForm.addEventListener('submit', async e => {
        e.preventDefault();
        try {
            await postJSON('../api/sign_in.php', {
                email: document.getElementById('si-email').value,
                password: document.getElementById('si-password').value
            });
            // После успешного логина — на главную
            window.location.href = 'index.html';
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
  const authLink = document.getElementById('authLink');
  try {
    // проверяем сессию
    const res = await fetch('../api/get_profile.php', { credentials: 'same-origin' });
    if (!res.ok) throw new Error();
    // если OK — показываем «Профиль»
    authLink.textContent = 'Профиль';
    authLink.href = 'profile.html';
  } catch {
    // иначе оставляем «Вход»
    authLink.textContent = 'Вход';
    authLink.href = 'sign_in.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async e => {
      e.preventDefault();
      try {
        await fetch('../api/sign_out.php', {
          method: 'POST',
          credentials: 'same-origin'
        });
      } catch {}
      // после выхода — на страницу входа
      window.location.href = 'sign_in.html';
    });
  }
});