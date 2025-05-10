<?php
// public/api/get_profile.php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

require 'db.php';
$stmt = $pdo->prepare("
    SELECT `Имя`, `Фамилия`, `ЭлектроннаяПочта` AS email, `Телефон` AS phone
    FROM `Пользователь`
    WHERE `ПользовательID` = ?
");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'Пользователь не найден']);
    exit;
}

echo json_encode(['user' => $user]);

