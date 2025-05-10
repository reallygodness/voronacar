<?php
// sign_up.php
require 'db.php';
header('Content-Type: application/json; charset=utf-8');

// получаем JSON из тела запроса
$data = json_decode(file_get_contents('php://input'), true);
$firstname = trim($data['firstname'] ?? '');
$lastname  = trim($data['lastname']  ?? '');
$email    = trim($data['email']    ?? '');
$phone    = trim($data['phone']    ?? '');
$password = $data['password']      ?? '';

// простая валидация
if (!$firstname || !$lastname || !$email || !$password || !$phone) {
  http_response_code(400);
  echo json_encode(['error' => 'Все поля обязательны']);
  exit;
}

// хэшируем пароль
$hash = password_hash($password, PASSWORD_BCRYPT);

// пытаемся вставить нового пользователя
try {
   $stmt = $pdo->prepare("
     INSERT INTO `Пользователь`
       (`Имя`, `Фамилия`, `ЭлектроннаяПочта`, `Телефон`, `Пароль`)
     VALUES (?,      ?,          ?,               ?,        ?)
   ");
   $stmt->execute([$firstname, $lastname, $email, $phone, $hash]);
  echo json_encode(['success' => true]);
} catch (PDOException $e) {
  // 1062 — дублирование уникального поля (email)
  if ($e->errorInfo[1] === 1062) {
    http_response_code(409);
    echo json_encode(['error' => 'Пользователь уже существует']);
  } else {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера']);
  }
}
