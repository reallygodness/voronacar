<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Не авторизован']);
  exit;
}
require 'db.php';

$data   = json_decode(file_get_contents('php://input'), true);
$carId  = (int)   ($data['carId']   ?? 0);
$phone  = trim(   $data['phone']    ?? '');
$method =         $data['method']   ?? '';
$days   = max(1,  (int) ($data['duration'] ?? 1));

// простая валидация
if (!$carId || !$phone || !$method) {
  http_response_code(400);
  echo json_encode(['error' => 'Неверные данные']);
  exit;
}

// даты брони
$start = new DateTime();
$end   = (clone $start)->modify("+{$days} days");

try {
  // 1) создаём бронирование
  $stmt = $pdo->prepare(
    "INSERT INTO `Бронирование`
      (`ПользовательID`,`АвтоID`,`ДатаНачала`,`ДатаОкончания`,`СтатусБронирования`)
     VALUES (?, ?, ?, ?, 'активно')"
  );
  $stmt->execute([
    $_SESSION['user_id'],
    $carId,
    $start->format('Y-m-d H:i:s'),
    $end->format('Y-m-d H:i:s'),
  ]);
  $bookingId = $pdo->lastInsertId();

  // 2) рассчитываем сумму
  $p = $pdo->prepare("SELECT ЦенаЗаЧас FROM `Автомобили` WHERE `АвтоID` = ?");
  $p->execute([$carId]);
  $car = $p->fetch();
  $sum = $car['ЦенаЗаЧас'] * 24 * $days;

  // 3) создаём запись об оплате без номера карты
  $stmt2 = $pdo->prepare("
  INSERT INTO `Оплата`
    (`БронированиеID`,`Сумма`,`ДатаОплаты`,`СпособОплаты`)
  VALUES (?,?,NOW(),?)
");
  $stmt2->execute([$bookingId, $sum, $method]);

  echo json_encode(['success' => true, 'bookingId' => $bookingId]);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Серверная ошибка']);
}
