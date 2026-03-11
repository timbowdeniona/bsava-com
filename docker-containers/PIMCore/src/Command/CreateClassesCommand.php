<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Pimcore\Model\DataObject\ClassDefinition;

class CreateClassesCommand extends AbstractCommand
{
    protected function configure()
    {
        $this->setName('app:create-classes')->setDescription('Create Book, Membership, EBook classes based on AccessoryPart');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        \Pimcore\Model\Version::disable();

        $sourceClass = ClassDefinition::getByName('AccessoryPart');
        if (!$sourceClass) {
            $output->writeln('<error>Source class AccessoryPart not found.</error>');
            return 1;
        }

        $json = \Pimcore\Model\DataObject\ClassDefinition\Service::generateClassDefinitionJson($sourceClass);
        $array = json_decode($json, true);

        // Remove the mainCategory select entirely from Definition Data panel
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

        $classesToCreate = [
            ['id' => 'BOOK', 'name' => 'Book', 'title' => 'Book', 'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/book.svg'],
            ['id' => 'MEMB', 'name' => 'Membership', 'title' => 'Membership', 'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/key.svg'],
            ['id' => 'EBOK', 'name' => 'EBook', 'title' => 'e-Book', 'icon' => '/bundles/pimcoreadmin/img/flat-color-icons/tablet.svg']
        ];

        foreach ($classesToCreate as $cd) {
            // Skip if ID already exists
            if (ClassDefinition::getById($cd['id'])) {
                $output->writeln("Class {$cd['name']} (ID: {$cd['id']}) already exists, skipping.");
                continue;
            }

            // Tweak the JSON so the import carries the correct name/id
            $classArray = $array;
            $classArray['id'] = $cd['id'];
            $classArray['name'] = $cd['name'];
            $classArray['title'] = $cd['title'];
            $classArray['icon'] = $cd['icon'];
            $classArray['group'] = 'Product Data';
            $classJson = json_encode($classArray);

            $class = new ClassDefinition();
            // Pre-set the id so Pimcore knows to INSERT not UPDATE
            $class->setId($cd['id']);
            $class->setName($cd['name']);

            \Pimcore\Model\DataObject\ClassDefinition\Service::importClassDefinitionFromJson($class, $classJson);

            // importClassDefinitionFromJson may reset name/id from the JSON, so force them again
            $class->setId($cd['id']);
            $class->setName($cd['name']);
            $class->setTitle($cd['title']);
            $class->setIcon($cd['icon']);
            $class->setGroup('Product Data');

            $class->save();
            $output->writeln("Successfully created class: {$cd['name']} (ID: {$cd['id']})");
        }

        return 0;
    }
}
