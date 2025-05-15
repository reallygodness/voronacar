// public/js/car_rental.js

let carsData = [];
let profile = null;

// Проверяем авторизацию, получаем профиль и показываем ссылку «Заказы»
async function loadProfile() {
  try {
    const res = await fetch('./api/get_profile.php', { credentials: 'same-origin' });
    if (!res.ok) throw new Error();
    const { user } = await res.json();
    profile = user;

    // Меняем «Вход» → «Профиль»
    const authLink = document.getElementById('authLink');
    if (authLink) {
      authLink.textContent = 'Профиль';
      authLink.href = 'profile.html';
    }

    // Если есть заказы — показываем пункт «Заказы»
    const ordersNav = document.getElementById('ordersNav');
    if (ordersNav) {
      const ordRes = await fetch('./api/get_orders.php', { credentials: 'same-origin' });
      if (ordRes.ok) {
        const { orders } = await ordRes.json();
        if (orders && orders.length) {
          ordersNav.innerHTML = `<li><a href="orders.html">Заказы</a></li>`;
        }
      }
    }
  } catch {
    // не авторизован — оставляем «Вход»
  }
}

// Рисуем карточки машин
function renderCars(cars) {
  const container = document.getElementById("carContainer");
  container.innerHTML = "";

  cars.forEach(car => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id     = car.id;
    card.dataset.class  = car.class;
    card.dataset.price  = car.price;
    card.dataset.year   = car.year;
    card.dataset.power  = car.power;

    card.innerHTML = `
      <img src="${car.image}" alt="${car.title}">
      <div class="card-content">
        <h2 class="card-title">${car.title}</h2>
        <p class="card-info">Год выпуска: ${car.year}</p>
        <p class="card-info">Мощность: ${car.power} л.с.</p>
        <p class="card-price">Цена: ${car.price}$ за день</p>
        <button class="btn btn-book">Забронировать</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Навешиваем открытие модалки
  document.querySelectorAll('.btn-book').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn))
  );
}

// Открываем модалку бронирования
window.openModal = function(btn) {
  if (!profile) {
    window.location.href = 'sign_in.html';
    return;
  }
  const card = btn.closest('.card');
  const modalId = document.getElementById('modalCarId');
  if (!modalId) return console.error('Не найден #modalCarId');
  modalId.value = card.dataset.id;

  // Сброс формы, подставляем телефон из профиля
  const form = document.getElementById('bookingForm');
  if (form) form.reset();
  document.getElementById('paymentMethod').value = 'cash';
  document.getElementById('duration').value = 1;

  const phoneIn = document.getElementById('phone');
  if (phoneIn) phoneIn.value = profile.phone || '';

  const modal = document.getElementById('myModal');
  if (modal) modal.style.display = 'block';
};

// Закрываем модалку
window.closeModal = function() {
  const modal = document.getElementById('myModal');
  if (modal) modal.style.display = 'none';
};

// Загружаем список машин
function loadCars() {
  fetch('../api/get_cars.php', { credentials: 'same-origin' })
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(data => {
      carsData = data.map(car => ({
        id:    car.АвтоID,
        title: `${car.Марка} ${car.Модель}`,
        class: car.Типы.split(',')[0],
        price: car.ЦенаЗаЧас,
        year:  car.ГодВыпуска,
        power: car.Мощность,
        image: `../img/cars/${car.Изображение}`
      }));
      renderCars(carsData);
    })
    .catch(err => {
      console.error(err);
      const c = document.getElementById("carContainer");
      if (c) c.innerHTML = '<p>Не удалось загрузить список машин.</p>';
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();

  const bookingForm = document.getElementById('bookingForm');
  const mobileMenu  = document.getElementById('mobile-menu');
  const navbar      = document.querySelector('.navbar');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async e => {
      e.preventDefault();
      const carId    = document.getElementById('modalCarId').value;
      const phone    = document.getElementById('phone').value.trim();
      const method   = document.getElementById('paymentMethod').value;
      const duration = parseInt(document.getElementById('duration').value, 10);
      if (duration < 1) return alert('Длительность минимум 1 день');

      try {
        const res = await fetch('../api/book_car.php', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ carId, phone, method, duration })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || res.statusText);

        alert(`Бронирование успешно! №${data.bookingId}`);
        closeModal();
        window.location.href = 'orders.html';
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
  }

  if (mobileMenu && navbar) {
    mobileMenu.addEventListener('click', () => navbar.classList.toggle('active'));
  }

  loadCars();
});
