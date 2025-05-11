<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}
require 'db.php';

// 1) Получаем и логируем тело запроса
$body = file_get_contents('php://input');
$data = json_decode($body, true);
error_log("book_car payload: " . print_r($data, true));

// 2) Извлекаем параметры
$carId  = (int)   ($data['carId']            ?? 0);
$phone  = trim(   $data['phone']            ?? '');
// поддерживаем оба варианта ключей
$method = trim(   $data['method']
              ?? $data['paymentMethod']
              ?? $data['СпособОплаты']
              ?? '');
$days   = max(1,  (int) ($data['duration']   ?? 1));

// 3) Валидация
if (!$carId || !$phone || !$method) {
    http_response_code(400);
    echo json_encode([
      'error'   => 'Неверные данные',
      'gotMethod' => $method, 
      'gotCarId'  => $carId,
      'gotPhone'  => $phone
    ]);
    exit;
}

// 4) Вычисляем даты
$start = new DateTime();
$end   = (clone $start)->modify("+{$days} days");

try {
    // 5) Вставляем бронь
    $stmt = $pdo->prepare("
      INSERT INTO `Бронирование`
        (`ПользовательID`,`АвтоID`,`ДатаНачала`,`ДатаОкончания`,`СтатусБронирования`)
      VALUES (?, ?, ?, ?, 'активно')
    ");
    $stmt->execute([
      $_SESSION['user_id'],
      $carId,
      $start->format('Y-m-d H:i:s'),
      $end->format('Y-m-d H:i:s'),
    ]);
    $bookingId = $pdo->lastInsertId();

    // 6) Считаем сумму
    $q = $pdo->prepare("SELECT ЦенаЗаЧас FROM `Автомобили` WHERE `АвтоID` = ?");
    $q->execute([$carId]);
    $car = $q->fetch();
    $sum = $car['ЦенаЗаЧас'] * 24 * $days;

    // 7) Вставляем оплату с корректным методом
    $pay = $pdo->prepare("
      INSERT INTO `Оплата`
        (`БронированиеID`,`Сумма`,`ДатаОплаты`,`СпособОплаты`)
      VALUES (?, ?, NOW(), ?)
    ");
    $pay->execute([
      $bookingId,
      $sum,
      $method
    ]);

    echo json_encode(['success' => true, 'bookingId' => $bookingId]);
} catch (PDOException $e) {
    error_log("book_car error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Серверная ошибка']);
}
