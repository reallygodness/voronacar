<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require __DIR__ . '/db.php';

$sql = "
  SELECT 
    A.АвтоID, A.Марка, A.Модель, A.ГодВыпуска, A.Статус, 
    A.ЦенаЗаЧас, A.Мощность, A.Изображение,
    GROUP_CONCAT(T.Название) AS Типы
  FROM `Автомобили` A
  LEFT JOIN `Автомобили_Тип` AT ON A.АвтоID = AT.АвтоID
  LEFT JOIN `ТипыАвтомобилей` T ON AT.ТипАвтомобиляID = T.ТипАвтомобиляID
  GROUP BY A.АвтоID
";
$stmt = $pdo->query($sql);
$cars = $stmt->fetchAll();
echo json_encode($cars);