<?php
require 'db.php';
$stmt = $pdo->query("SELECT АвтоID, Марка, Модель, ГодВыпуска, Статус, ЦенаЗаЧас FROM Автомобили");
$cars = $stmt->fetchAll();
echo json_encode($cars);
