// Функция для возврата на предыдущую страницу
// Получаем кнопку "Назад"
const backButton = document.getElementById('backButton');

// Добавляем обработчик события на клик
backButton.addEventListener('click', () => {
  // Если есть история навигации, возвращаемся назад
  if (document.referrer && !window.location.href.includes(document.referrer)) {
    window.history.back();
  } else {
    // Если истории нет, перенаправляем на страницу контактов
    window.location.href = 'contacts.html'; // Замените '/' на путь к вашей главной странице
  }
});
