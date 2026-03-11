<?php

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    \Pimcore\Model\Version::disable();
    $adminUser = \Pimcore\Tool\Admin::getCurrentUser();
    if (!$adminUser) {
        \Pimcore\Tool\Admin::setCurrentUser(\Pimcore\Model\User::getByName('admin'));
    }

    $sourceClass = \Pimcore\Model\DataObject\ClassDefinition::getByName('AccessoryPart');
    if (!$sourceClass) {
        throw new \Exception("Source class AccessoryPart not found.");
    }

    $json = \Pimcore\Model\DataObject\ClassDefinition\Service::generateClassDefinitionJson($sourceClass);
    // Remove the mainCategory select entirely as requested for Books/Membership/Ebook
    $array = json_decode($json, true);

    // We want to remove mainCategory. Let's iterate over the array to find and remove it.
    // In our definition, it is in: layoutDefinitions -> childs[0] -> childs[0] -> childs[2] => 'Definition Data' -> childs where name is 'mainCategory'

    // An easier regex replace for mainCategory property node
    // Let's just do an array filter
    if (isset($array['layoutDefinitions']['children'][0]['children'][0]['children'])) {
        foreach ($array['layoutDefinitions']['children'][0]['children'][0]['children'] as &$panel) {
            if ($panel['name'] === 'Definition Data') {
                $newChildren = [];
                foreach ($panel['children'] as $field) {
                    if ($field['name'] !== 'mainCategory') {
                        $newChildren[] = $field;
                    }
                }
                $panel['children'] = $newChildren;
            }
        }
    }
    $filteredJson = json_encode($array);

    $classesToCreate = [
        ['id' => 'BOOK', 'name' => 'Book', 'title' => 'Book'],
        ['id' => 'MEMB', 'name' => 'Membership', 'title' => 'Membership'],
        ['id' => 'EBOK', 'name' => 'EBook', 'title' => 'e-Book']
    ];

    foreach ($classesToCreate as $cd) {
        $class = \Pimcore\Model\DataObject\ClassDefinition::getByName($cd['name']);
        if (!$class) {
            $class = new \Pimcore\Model\DataObject\ClassDefinition();
            $class->setName($cd['name']);
        }

        \Pimcore\Model\DataObject\ClassDefinition\Service::importClassDefinitionFromJson($class, $filteredJson);
        $class->setId($cd['id']);
        $class->setName($cd['name']);
        $class->setTitle($cd['title']);
        $class->setIcon(null); // Clear icon to fall back or manually change later
        $class->save();
        echo "Successfully created {$cd['name']}\n";
    }

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
