<?php

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Pimcore\Model\DataObject\Book;
use Pimcore\Model\DataObject\Membership;
use Pimcore\Model\DataObject\EBook;
use Pimcore\Model\DataObject\Event;

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    // Set admin user to bypass permission checks
    \Pimcore\Tool\Admin::setCurrentUser(\Pimcore\Model\User::getByName('admin'));

    $csvFile = __DIR__ . '/data/catalogue.csv';

    if (!file_exists($csvFile)) {
        die("CSV file not found at $csvFile\n");
    }

    function getOrCreateFolder($path)
    {
        if ($path === '/')
            return Folder::getById(1);

        $folder = Folder::getByPath($path);
        if ($folder)
            return $folder;

        $parts = array_filter(explode('/', $path));
        $currentPath = '';
        $parent = Folder::getById(1);

        foreach ($parts as $part) {
            $lastPath = $currentPath;
            $currentPath .= '/' . $part;
            $folder = Folder::getByPath($currentPath);
            if (!$folder) {
                $folder = new Folder();
                $folder->setParentId($parent->getId());
                $folder->setKey($part);
                $folder->save();
                echo "Created folder: $currentPath\n";
            }
            $parent = $folder;
        }
        return $parent;
    }

    echo "Initializing BSAVA import...\n";

    $bsavaFolder = getOrCreateFolder('/BSAVA');

    if (($handle = fopen($csvFile, "r")) !== FALSE) {
        // Skip header
        $header = fgetcsv($handle, 1000, ",");
        $count = 0;

        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            if (count($data) < 2)
                continue;

            $department = trim($data[0]);
            $itemString = trim($data[1]);
            $memberPriceStr = trim($data[2]);
            $nonMemberPriceStr = trim($data[3]);

            if (empty($itemString))
                continue;
            if (empty($department) && empty($itemString))
                continue;

            // Clean up weird characters (like Pound sign if it's not UTF-8)
            $itemString = iconv('UTF-8', 'UTF-8//IGNORE', $itemString);

            // Parse name and ERP from "Item Name (ERP)"
            $name = $itemString;
            $erp = '';
            // Match (P00149), (PK0001), (PS080), etc.
            if (preg_match('/^(.*?)\s*\((P[0-9A-Z]+|PK[0-9A-Z]+|PR[0-9A-Z]+|PS[0-9A-Z]+|BK[0-9A-Z-]+|EBK[0-9A-Z-]+|MEM[0-9A-Z-]+)\)$/iu', $itemString, $matches)) {
                $name = trim($matches[1]);
                $erp = trim($matches[2]);
            }

            // Determine class and folder
            $className = Book::class;
            $folderName = 'Publications';

            if ($department === 'Membership') {
                $className = Membership::class;
                $folderName = 'Membership';
            } elseif (stripos($itemString, 'digital') !== false || stripos($itemString, 'e-book') !== false) {
                $className = EBook::class;
                $folderName = 'Digital';
            } elseif ($department === 'Events' || $department === 'Education') {
                $className = Event::class;
                $folderName = 'Events';
            } elseif ($department === 'PetSavers') {
                $className = Book::class;
                $folderName = 'PetSavers';
            } elseif (!empty($department)) {
                $folderName = $department;
            }

            $deptFolder = getOrCreateFolder('/BSAVA/' . \Pimcore\Model\Element\Service::getValidKey($folderName, 'folder'));

            $key = \Pimcore\Model\Element\Service::getValidKey($name, 'object');
            // Ensure key is unique within folder by adding ERP if available
            if ($erp) {
                $key .= '-' . strtolower($erp);
            }

            if (empty($key))
                continue;

            $object = $className::getByPath($deptFolder->getFullPath() . '/' . $key);

            if (!$object) {
                $object = new $className();
                $object->setParentId($deptFolder->getId());
                $object->setKey($key);
            }

            // Set Name/Title
            if ($object instanceof Event) {
                $object->setTitle($name, 'en');
            } else {
                $object->setNameAddition($name, 'en');
            }

            // Set ERP
            if (method_exists($object, 'setErpNumber')) {
                $object->setErpNumber($erp);
            }

            // Set Category
            if (method_exists($object, 'setCategoryCode')) {
                $object->setCategoryCode($department);
            }

            // Prices
            $memberPrice = floatval(preg_replace('/[^0-9.]/', '', str_replace(',', '', $memberPriceStr)));

            // Handle Sale Information if it's an AbstractProduct (Book, Membership, EBook)
            if (method_exists($object, 'getSaleInformation')) {
                $saleInformationBrick = $object->getSaleInformation();
                // DataObject\Book\SaleInformation or similar
                // We need to check if the brick itself is set
                $brickType = (new ReflectionClass($object))->getShortName() . "\\SaleInformation";
                $brickClass = "\\Pimcore\\Model\\DataObject\\Objectbrick\\Data\\" . (new ReflectionClass($object))->getShortName() . "\\SaleInformation";

                // In Pimcore 10/11, bricks are often handled via a getter that returns a brick container
                $bricks = $object->getSaleInformation();
                if ($bricks) {
                    // Set price in EUR (as a proxy for GBP)
                    if ($memberPrice > 0) {
                        // Try to find a setter for price
                        if (method_exists($bricks, 'setPriceInEUR')) {
                            $bricks->setPriceInEUR($memberPrice);
                        }
                    }
                }
            }

            $object->setPublished(true);
            try {
                $object->save();
                echo "[$count] Saved: $name ($erp) as " . (new ReflectionClass($object))->getShortName() . "\n";
                $count++;
            } catch (\Exception $e) {
                echo "[$count] Error saving $name: " . $e->getMessage() . "\n";
            }
        }
        fclose($handle);
    }

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

echo "Import completed! $count items processed.\n";
