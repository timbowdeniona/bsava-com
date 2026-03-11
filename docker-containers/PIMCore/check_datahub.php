<?php
require 'vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::startupCli();

$config = \Pimcore\Bundle\DataHubBundle\Configuration::getByName('products');
var_dump($config);
