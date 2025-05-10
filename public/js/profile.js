// public/js/profile.js

document.addEventListener('DOMContentLoaded', async () => {
  // 1) Попытаться получить данные профиля
  try {
    const res = await fetch('../api/get_profile.php', {
      method: 'GET',
      credentials: 'same-origin'
    });
    if (!res.ok) throw new Error();

    const { user } = await res.json();
    // Заполняем поля на странице
    document.getElementById('profile-firstname').textContent = user.Имя;
    document.getElementById('profile-lastname').textContent  = user.Фамилия;
    document.getElementById('profile-email').textContent     = user.email;
    document.getElementById('profile-phone').textContent     = user.phone;
  } catch (e) {
    // Если не авторизован или ошибка — перенаправляем на вход
    window.location.href = 'sign_in.html';
    return;
  }

  // 2) Навешиваем логику кнопки «Выйти»
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('../api/sign_out.php', {
          method: 'POST',
          credentials: 'same-origin'
        });
      } catch (e) {
        console.error('Не удалось выйти:', e);
      }
      window.location.href = 'sign_in.html';
    });
  }
});
