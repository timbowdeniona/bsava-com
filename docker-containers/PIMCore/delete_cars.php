<?php

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    // Disable versioning to avoid needing a logged-in admin user during CLI execution
    \Pimcore\Model\Version::disable();

    echo "Deleting Cars...\n";
    $cars = new DataObject\Car\Listing();
    $cars->setUnpublished(true);
    foreach ($cars as $car) {
        echo "Deleting Car: " . $car->getFullPath() . "\n";
        $car->delete();
    }

    // You might also want to delete AccessoryParts, Categories, Manufacturers etc. that are demo data,
    // but the user only explicitly asked for "cars data that is the demo". I will delete the categories, manufacturers, etc.,
    // that are under /Demo.

    $demoFolder = Folder::getByPath('/Demo');
    if ($demoFolder) {
        $children = $demoFolder->getChildren();
        foreach ($children as $child) {
            if ($child->getKey() !== 'BSAVA') {
                echo "Deleting Demo Component: " . $child->getFullPath() . "\n";
                $child->delete();
            }
        }
    }

    echo "Done!\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
