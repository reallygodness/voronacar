document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('../api/get_orders.php', { credentials: 'same-origin' });
    if (!res.ok) throw new Error();
    const { orders } = await res.json();

    const container = document.getElementById('ordersList');
    container.innerHTML = '';

    if (!orders.length) {
      container.innerHTML = '<p>У вас пока нет заказов.</p>';
      return;
    }

    orders.forEach(o => {
      // Приводим к нижнему регистру
      const method = (o.СпособОплаты || '').toString().trim().toLowerCase();
      // Надёжное отображение
      let payText;
      if (method === 'card') {
        payText = 'картой';
      } else if (method === 'cash') {
        payText = 'наличными';
      } else {
        payText = method; // на случай, если придёт что-то ещё
      }

      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <h2>${o.Марка} ${o.Модель} (${o.ГодВыпуска})</h2>
        <p>С ${o.ДатаНачала} по ${o.ДатаОкончания}</p>
        <p>Статус: ${o.СтатусБронирования}</p>
        <p>Оплачено: ${o.Сумма} ₽ (${payText})</p>
      `;
      container.appendChild(card);
    });
  } catch {
    window.location.href = 'sign_in.html';
  }
});