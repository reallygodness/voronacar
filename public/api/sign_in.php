<?php
// файл: public/api/sign_in.php

// ни пробелов, ни BOM до <?php

header('Content-Type: application/json; charset=utf-8');
session_start();

require 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email    = trim($data['email']    ?? '');
$password = $data['password']      ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email и пароль требуются']);
    exit;
}

$stmt = $pdo->prepare("
  SELECT `ПользовательID`,`Пароль` 
  FROM `Пользователь` 
  WHERE `ЭлектроннаяПочта` = ?
");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['Пароль'])) {
    http_response_code(401);
    echo json_encode(['error'=>'Неправильный логин или пароль']);
    exit;
}

// Успех
$_SESSION['user_id'] = $user['ПользовательID'];
echo json_encode(['success'=>true]);
