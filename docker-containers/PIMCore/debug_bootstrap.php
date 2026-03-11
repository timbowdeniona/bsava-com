<?php
require __DIR__ . '/vendor/autoload.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Autoloading successful.\n";

use Symfony\Component\Dotenv\Dotenv;
use App\Kernel;

if (file_exists(__DIR__ . '/.env')) {
    echo "Loading .env file...\n";
    (new Dotenv())->bootEnv(__DIR__ . '/.env');
}

echo "Booting kernel...\n";
try {
    $kernel = new Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? true));
    $kernel->boot();
    echo "Kernel booted successfully.\n";

    $container = $kernel->getContainer();
    \Pimcore::setContainer($container);
    echo "Pimcore container set.\n";

    echo "Testing Database connectivity...\n";
    $db = \Pimcore\Db::get();
    echo "Database connection ok.\n";

} catch (\Throwable $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
