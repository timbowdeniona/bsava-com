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

    $class = \Pimcore\Model\DataObject\ClassDefinition::getByName('AccessoryPart');
    if ($class) {
        $layout = $class->getLayoutDefinitions();

        // Find the "Definition Data" fieldset
        $definitionData = null;
        foreach ($layout->getChilds()[0]->getChilds()[0]->getChilds() as $child) {
            if ($child->getName() === 'Definition Data') {
                $definitionData = $child;
                break;
            }
        }

        if ($definitionData) {
            $newChildren = [];
            foreach ($definitionData->getChilds() as $field) {
                if (!in_array($field->getName(), ['manufacturer', 'series'])) {
                    $newChildren[] = $field;
                }
            }
            $definitionData->setChilds($newChildren);

            $class->setLayoutDefinitions($layout);
            $class->save();
            echo "Successfully updated AccessoryPart class to remove manufacturer and series.\n";
        } else {
            echo "Definition Data fieldset not found.\n";
        }
    } else {
        echo "Class AccessoryPart not found.\n";
    }

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
