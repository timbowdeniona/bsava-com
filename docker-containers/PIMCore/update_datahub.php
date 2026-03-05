<?php
require 'vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::startupCli();

$config = \Pimcore\Bundle\DataHubBundle\Configuration::getByName('products');

if ($config) {
    $arr = $config->getConfiguration();

    // Check if the permission already exists
    $found = false;
    foreach ($arr['workspaces']['asset'] ?? [] as $workspace) {
        if ($workspace['cpath'] === '/sample-images') {
            $found = true;
            break;
        }
    }

    if (!$found) {
        // Add minimal required permissions for the GraphQL API to read these assets
        $arr['workspaces']['asset'][] = [
            'read' => true,
            'create' => false,
            'update' => false,
            'delete' => false,
            'cpath' => '/sample-images',
            'id' => 'sample-images-' . time()
        ];
        $config->setConfiguration($arr);
        $config->save();
        echo "Updated Data Hub configuration 'products' to grant read access to /sample-images.\n";
    } else {
        echo "Data Hub configuration already has access to /sample-images.\n";
    }
} else {
    echo "Could not find 'products' endpoint.\n";
}
