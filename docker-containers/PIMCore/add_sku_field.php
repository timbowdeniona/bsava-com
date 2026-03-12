<?php

use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\ClassDefinition\Data\Input;
use Pimcore\Model\DataObject\ClassDefinition\Layout\Panel;
use Pimcore\Model\DataObject\ClassDefinition\Layout\Tabpanel;

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    $classesToUpdate = ['Book', 'EBook', 'Event', 'Membership'];

    foreach ($classesToUpdate as $className) {
        $class = ClassDefinition::getByName($className);
        if (!$class) {
            echo "Class $className not found.\n";
            continue;
        }

        $layout = $class->getLayoutDefinitions();

        // Find existing sku field
        $existingField = $class->getFieldDefinition('sku');
        if ($existingField) {
            echo "Field 'sku' already exists in $className.\n";
            continue;
        }

        echo "Adding 'sku' to $className...\n";

        // Create the new SKU field
        $skuField = new Input();
        $skuField->setName('sku');
        $skuField->setTitle('SKU');
        $skuField->setNoteditable(false); // Can be edited manually if needed
        $skuField->setIndex(true); // Index it for faster searching
        $skuField->setUnique(true); // SKUs should be unique!

        // Find a place to put it. Let's put it in the "Base Data" panel or similar.
        // The easiest programmatic way is to append it to the first layout element that can hold data fields.
        // Realistically, to avoid breaking complex layout structures, we'll traverse until we find a Fieldset or Panel.

        $added = false;
        if ($layout instanceof Panel && !empty($layout->getChildren())) {
            foreach ($layout->getChildren() as $child) {
                if ($child instanceof Tabpanel && !empty($child->getChildren())) {
                    foreach ($child->getChildren() as $tab) {
                        if ($tab instanceof Panel && $tab->getName() === 'Base Data') {
                            // Find the first Fieldset
                            foreach ($tab->getChildren() as $panelChild) {
                                if ($panelChild instanceof \Pimcore\Model\DataObject\ClassDefinition\Layout\Fieldset) {
                                    $children = $panelChild->getChildren();
                                    array_unshift($children, $skuField); // Put it at the top
                                    $panelChild->setChildren($children);
                                    $added = true;
                                    break 3;
                                }
                            }

                            // If no fieldset, append to Base Data panel
                            $children = $tab->getChildren();
                            array_unshift($children, $skuField);
                            $tab->setChildren($children);
                            $added = true;
                            break 2;
                        }
                    }
                }
            }
        }

        // Fallback: just append to the very top layout container
        if (!$added) {
            if ($layout instanceof \Pimcore\Model\DataObject\ClassDefinition\Layout\Panel) {
                $children = $layout->getChildren();
                array_unshift($children, $skuField);
                $layout->setChildren($children);
            }
        }

        try {
            $class->save();
            echo "Successfully updated $className.\n";
        } catch (\Exception $e) {
            echo "Failed to save $className: " . $e->getMessage() . "\n";
        }
    }

    echo "Done!\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
