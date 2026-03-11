<?php

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Carbon\Carbon;

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    $adminUser = \Pimcore\Tool\Admin::getCurrentUser();
    if (!$adminUser) {
        \Pimcore\Tool\Admin::setCurrentUser(\Pimcore\Model\User::getByName('admin'));
    }

    echo "Creating import folder...\n";
    $parentFolder = Folder::getByPath('/Demo/BSAVA');
    if (!$parentFolder) {
        if (!Folder::getByPath('/Demo')) {
            $demo = new Folder();
            $demo->setParentId(1);
            $demo->setKey('Demo');
            $demo->save();
        }
        $parentFolder = new Folder();
        $parentFolder->setParentId(Folder::getByPath('/Demo')->getId());
        $parentFolder->setKey('BSAVA');
        $parentFolder->save();
    }
    $parentId = $parentFolder->getId();

    $eventsData = [
        ['title' => 'BSAVA Congress 2026', 'desc' => 'The ultimate small animal veterinary event.', 'date' => Carbon::now()->addMonths(6)],
        ['title' => 'Online Diagnostic Dilemmas with Infectious Diseases', 'desc' => 'Endemic and Exotic cases discussed by experts.', 'date' => Carbon::now()->addDays(14)],
        ['title' => 'Clinical Rounds: Managing GI disease', 'desc' => 'Managing GI disease without recourse to antibiotics.', 'date' => Carbon::now()->addDays(30)]
    ];

    echo "Creating Events...\n";
    foreach ($eventsData as $ed) {
        $key = \Pimcore\Model\Element\Service::getValidKey($ed['title'], 'object');
        $event = DataObject\Event::getByPath($parentFolder->getFullPath() . '/' . $key);
        if (!$event) {
            $event = new DataObject\Event();
            $event->setParentId($parentId);
            $event->setKey($key);
        }
        $event->setTitle($ed['title'], 'en');
        $event->setDescription($ed['desc'], 'en');
        $event->setFromDate($ed['date']);
        $event->setToDate((clone $ed['date'])->addDays(2));
        $event->setPublished(true);
        $event->save();
        echo "  -> Saved Event: {$ed['title']}\n";
    }

    $productsData = [
        ['name' => 'Vet Member', 'type' => 'Membership', 'erp' => 'MEM-VET-01'],
        ['name' => 'Nurse Member', 'type' => 'Membership', 'erp' => 'MEM-NUR-01'],
        ['name' => 'Student Member', 'type' => 'Membership', 'erp' => 'MEM-STU-01'],
        ['name' => 'BSAVA Manual of Canine and Feline Neurology', 'type' => 'Book', 'erp' => 'BK-NEURO-05'],
        ['name' => 'BSAVA Small Animal Formulary', 'type' => 'Book', 'erp' => 'BK-FORM-10'],
        ['name' => 'E-Book: BSAVA Manual of Feline Practice', 'type' => 'E-Book', 'erp' => 'EBK-FEL-01'],
        ['name' => 'E-Book: BSAVA Guide to Nutrition', 'type' => 'E-Book', 'erp' => 'EBK-NUT-02'],
    ];

    echo "Creating Products...\n";
    foreach ($productsData as $pd) {
        $key = \Pimcore\Model\Element\Service::getValidKey($pd['name'], 'object');
        $prod = DataObject\AccessoryPart::getByPath($parentFolder->getFullPath() . '/' . $key);
        if (!$prod) {
            $prod = new DataObject\AccessoryPart();
            $prod->setParentId($parentId);
            $prod->setKey($key);
        }
        $prod->setNameAddition($pd['name'], 'en');
        $prod->setErpNumber($pd['erp']);
        $prod->setCategoryCode($pd['type']);
        $prod->setPublished(true);
        $prod->save();
        echo "  -> Saved Product: {$pd['name']}\n";
    }

    echo "Done!\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
