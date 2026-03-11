<?php

use Pimcore\Model\Asset;
use Pimcore\Model\DataObject;

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::startupCli();

$imagePaths = [
    'Book' => __DIR__ . '/var/tmp_images/book_cover_1772610835421.png',
    'Event' => __DIR__ . '/var/tmp_images/event_banner_1772610850330.png',
    'Membership' => __DIR__ . '/var/tmp_images/membership_card_1772610876894.png'
];

$assets = [];

// Create folder for sample images
$folder = Asset::getByPath('/sample-images');
if (!$folder) {
    $folder = new Asset\Folder();
    $folder->setFilename('sample-images');
    $folder->setParent(Asset::getByPath('/'));
    $folder->save();
}

foreach ($imagePaths as $type => $path) {
    if (file_exists($path)) {
        $filename = basename($path);

        $asset = Asset::getByPath('/sample-images/' . $filename);
        if (!$asset) {
            $asset = new Asset\Image();
            $asset->setFilename($filename);
            $asset->setData(file_get_contents($path));
            $asset->setParent($folder);
            $asset->save();
            echo "Created asset for $type: " . $asset->getId() . "\n";
        } else {
            echo "Asset already exists for $type: " . $asset->getId() . "\n";
        }
        $assets[$type] = $asset;
    } else {
        echo "File not found: $path\n";
    }
}

$list = new DataObject\Listing();
$list->setCondition("type = 'object'");

foreach ($list as $object) {
    if ($object->getClassName() === 'Product') {
        $type = $object->getProductType();
        if (isset($assets[$type])) {
            if (method_exists($object, 'setMainImage')) {
                $object->setMainImage($assets[$type]);
                $object->save();
                echo "Updated Product ID " . $object->getId() . " of type $type with mainImage\n";
            }
        }
    }
}

echo "Image import complete.\n";
