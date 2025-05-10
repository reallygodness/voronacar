<?php
header('Content-Type: application/json; charset=utf-8');
$host = 'localhost';
$db   = 'voronacar';
$user = 'myapp_user';
$pass = 'moysaitImba!';
$pdo = new PDO(
  "mysql:host=$host;dbname=$db;charset=utf8mb4",
  $user, $pass,
  [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
   PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]
);
