// car_rental.js

let carsData = [];  // теперь будет заполняться из API

function renderCars(cars) {
    const container = document.getElementById("carContainer");
    container.innerHTML = "";

    cars.forEach(car => {
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("data-class", car.class);
        card.setAttribute("data-price", car.price);
        card.setAttribute("data-year", car.year);
        card.setAttribute("data-power", car.power);

        card.innerHTML = `
            <img src="${car.image}" alt="${car.title}">
            <div class="card-content">
                <h2 class="card-title">${car.title}</h2>
                <p class="card-info">Год выпуска: ${car.year}</p>
                <p class="card-info">Мощность: ${car.power} л.с.</p>
                <p class="card-price">Цена: ${car.price}$ за день</p>
                <button class="btn" onclick="openModal(this)">Забронировать</button>
            </div>
        `;

        container.appendChild(card);
    });
}

function loadCars() {
  fetch('../api/get_cars.php')            // из pages/ поднимаемся в public/
    .then(res => {
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then(data => {
      carsData = data.map(car => ({
        title: `${car.Марка} ${car.Модель}`,
        // возьмём первый тип из списка
        class: car.Типы.split(',')[0],    
        price: car.ЦенаЗаЧас,
        year: car.ГодВыпуска,
        power: car.Мощность,
        image: `../img/cars/${car.Изображение}`
      }));
      renderCars(carsData);
    })
    .catch(err => {
      console.error(err);
      document.getElementById("carContainer")
              .innerHTML = '<p>Не удалось загрузить список машин.</p>';
    });
}

function filterCars(carClass) {
  // Кнопки: у каждой добавлен data-class="cabriolet" и т.п.
  document.querySelectorAll('.class-btn').forEach(btn => {
    btn.classList.toggle('active',
      carClass === 'all' || btn.dataset.class === carClass
    );
  });
  const filtered = carsData.filter(car =>
    carClass === 'all' || car.class === carClass
  );
  renderCars(filtered);
}

function sortCars() {
    const selected = document.getElementById("priceSort").value;
    let sorted = [...carsData];

    if (selected === "price") {
        sorted.sort((a, b) => a.price - b.price);
    } else if (selected === "year") {
        sorted.sort((a, b) => a.year - b.year);
    } else if (selected === "power") {
        sorted.sort((a, b) => a.power - b.power);
    }

    renderCars(sorted);
}

// модалки, меню и т.д. без изменений...
function openModal(button) {
    document.getElementById("myModal").style.display = "block";
}
function closeModal() {
    document.getElementById("myModal").style.display = "none";
}
function toggleCardInput() {
    const cardInput = document.getElementById("cardInput");
    document.getElementById("paymentMethod").value === "card"
      ? cardInput.classList.remove("hidden")
      : cardInput.classList.add("hidden");
}

const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.querySelector('.navbar');
mobileMenu.addEventListener('click', () => navbar.classList.toggle('active'));

// в самом конце — загрузка и рендер
loadCars();
