<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['user_id'])) {
  http_response_code(401);
  echo json_encode(['error'=>'Не авторизован']);
  exit;
}
require 'db.php';

// вытаскиваем все брони текущего юзера
$stmt = $pdo->prepare("
  SELECT B.БронированиеID, B.ДатаНачала, B.ДатаОкончания, B.СтатусБронирования,
         A.Марка, A.Модель, A.ГодВыпуска, A.ЦенаЗаЧас,
         O.Сумма, O.СпособОплаты
  FROM `Бронирование` B
  JOIN `Автомобили` A ON B.АвтоID = A.АвтоID
  JOIN `Оплата`      O ON B.БронированиеID = O.БронированиеID
  WHERE B.ПользовательID = ?
  ORDER BY B.ДатаНачала DESC
");
$stmt->execute([$_SESSION['user_id']]);
$orders = $stmt->fetchAll();

echo json_encode(['orders'=>$orders]);
