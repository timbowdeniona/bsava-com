<?php

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\AbstractObject;
use Pimcore\Model\DataObject\Folder;

include_once('vendor/autoload.php');
\Pimcore::bootstrap();

// Configuration
$importDir = 'data/import/';
$rootPath = '/BSAVA';

function getOrCreateFolder($path)
{
    $folder = Folder::getByPath($path);
    if (!$folder) {
        $parts = explode('/', trim($path, '/'));
        $currentPath = '';
        $parent = Folder::getByPath('/');
        foreach ($parts as $part) {
            $currentPath .= '/' . $part;
            $f = Folder::getByPath($currentPath);
            if (!$f) {
                $f = new Folder();
                $f->setParentId($parent->getId());
                $f->setKey($part);
                $f->setPublished(true);
                $f->save();
            }
            $parent = $f;
        }
        $folder = $parent;
    }
    return $folder;
}

$rootFolder = getOrCreateFolder($rootPath);

$classes = ['Book', 'Ebook', 'Event', 'Course', 'MembershipTier'];

foreach ($classes as $className) {
    $jsonFile = $importDir . $className . '_import.json';
    if (!file_exists($jsonFile)) {
        echo "File not found: $jsonFile\n";
        continue;
    }

    echo "Importing $className...\n";
    $data = json_decode(file_get_contents($jsonFile), true);
    $classFolder = getOrCreateFolder($rootPath . '/' . $className . 's');

    foreach ($data as $item) {
        $key = \Pimcore\Model\Element\Service::getValidKey($item['title'] ?? $item['name'] ?? 'object');
        // Ensure uniqueness by prefixing with index or using a unique field if available
        // For now, let's check if it exists
        $path = $classFolder->getFullPath() . '/' . $key;
        $object = DataObject::getByPath($path);

        if (!$object) {
            $fqn = "\\Pimcore\\Model\\DataObject\\" . $className;
            $object = new $fqn();
            $object->setParentId($classFolder->getId());
            $object->setKey($key);
        }

        foreach ($item as $field => $value) {
            $setter = 'set' . ucfirst($field);
            if (method_exists($object, $setter)) {
                // Special handling for dates if needed, but PIMcore usually handles carbon objects or strings
                if ($field == 'publishDate' || $field == 'startDate' || $field == 'endDate') {
                    if (empty($value))
                        continue;
                    try {
                        $value = new \Carbon\Carbon($value);
                    } catch (\Exception $e) {
                        continue;
                    }
                }
                $object->$setter($value);
            }
        }

        $object->setPublished(true);
        try {
            $object->save();
            echo " Saved: $path\n";
        } catch (\Exception $e) {
            echo " Error saving $path: " . $e->getMessage() . "\n";
        }
    }
}
