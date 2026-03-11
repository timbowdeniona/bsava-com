<?php
require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    $adminUser = \Pimcore\Tool\Admin::getCurrentUser();
    if (!$adminUser) {
        \Pimcore\Tool\Admin::setCurrentUser(\Pimcore\Model\User::getByName('admin'));
    }

    $list = new \Pimcore\Model\DataObject\Listing();
    $list->setUnpublished(true);
    foreach ($list as $obj) {
        if ($obj->getId() != 1) { // Skip root
            echo "Object: " . $obj->getFullPath() . "\n";
        }
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
