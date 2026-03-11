<?php
require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

use Pimcore\Bundle\DataHubBundle\Configuration;

$config = Configuration::getByName('products');
if ($config) {
    print_r($config->getConfiguration());
} else {
    echo "Config 'products' not found.";
}
