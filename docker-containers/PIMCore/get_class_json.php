<?php
require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

$class = \Pimcore\Model\DataObject\ClassDefinition::getByName('AccessoryPart');
if ($class) {
    echo \Pimcore\Model\DataObject\ClassDefinition\Service::generateClassDefinitionJson($class);
} else {
    echo "Class not found.";
}
