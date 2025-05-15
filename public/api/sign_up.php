<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/db.php';

// читаем JSON
$data = json_decode(file_get_contents('php://input'), true);
$first = trim($data['firstname']  ?? '');
$last  = trim($data['lastname']   ?? '');
$email = trim($data['email']      ?? '');
$phone = trim($data['phone']      ?? '');
$pass  = $data['password'] ?? '';

// валидация...
if (!$first || !$last || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$phone || strlen($pass) < 8) {
  http_response_code(400);
  echo json_encode(['error'=>'Все поля обязательны']);
  exit;
}

// хешируем пароль
$hash = password_hash($pass, PASSWORD_BCRYPT);

try {
  $stmt = $pdo->prepare("
    INSERT INTO Пользователь
      (Имя, Фамилия, ЭлектроннаяПочта, Телефон, Пароль)
    VALUES (?, ?, ?, ?, ?)
  ");
  $stmt->execute([$first, $last, $email, $phone, $hash]);
  echo json_encode(['success'=>true]);
} catch (PDOException $e) {
  if ($e->getCode() === '23000') {
    http_response_code(409);
    echo json_encode(['error'=>'Пользователь с таким email уже существует']);
  } else {
    http_response_code(500);
    echo json_encode(['error'=>'Серверная ошибка']);
  }
}
