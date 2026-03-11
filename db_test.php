<?php
$url = getenv('DATABASE_URL');
$parts = parse_url($url);
$host = $parts['host'];
$port = $parts['port'] ?? 3306;
$user = $parts['user'];
$pass = $parts['pass'];
$db = ltrim($parts['path'], '/');

$pdo = new \PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass);
$stmt = $pdo->query('SHOW TABLES');
$tables = $stmt->fetchAll(\PDO::FETCH_COLUMN);
echo "Found " . count($tables) . " tables:\n";
print_r($tables);

