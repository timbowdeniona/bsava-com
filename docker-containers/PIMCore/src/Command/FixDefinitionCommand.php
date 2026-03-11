<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Pimcore\Model\DataObject;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Pimcore\Model\DataObject\ClassDefinition;

class FixDefinitionCommand extends AbstractCommand
{
    protected function configure()
    {
        $this->setName('app:fix-definition')->setDescription('Fix AccessoryPart Definition');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        \Pimcore\Model\Version::disable();

        $class = ClassDefinition::getByName('AccessoryPart');
        if ($class) {
            $layout = $class->getLayoutDefinitions();

            $definitionData = null;
            foreach ($layout->getChildren()[0]->getChildren()[0]->getChildren() as $child) {
                if ($child->getName() === 'Definition Data') {
                    $definitionData = $child;
                    break;
                }
            }

            if ($definitionData) {
                $newChildren = [];
                foreach ($definitionData->getChildren() as $field) {
                    if (!in_array($field->getName(), ['manufacturer', 'series'])) {

                        if ($field->getName() === 'mainCategory') {
                            $select = new \Pimcore\Model\DataObject\ClassDefinition\Data\Select();
                            $select->setName('mainCategory');
                            $select->setTitle('Main Category');
                            $select->setOptions([
                                ['key' => 'Event', 'value' => 'Event'],
                                ['key' => 'Membership', 'value' => 'Membership'],
                                ['key' => 'Book', 'value' => 'Book'],
                                ['key' => 'e-Book', 'value' => 'e-Book'],
                            ]);
                            $select->setWidth(400);
                            $newChildren[] = $select;
                        } else {
                            $newChildren[] = $field;
                        }
                    }
                }
                $definitionData->setChildren($newChildren);

                $class->setLayoutDefinitions($layout);
                $class->save();
                $output->writeln("Updated AccessoryPart class to remove manufacturer and series, and change mainCategory to Select.");
            } else {
                $output->writeln("Definition Data fieldset not found.");
            }
        }

        $parts = new DataObject\AccessoryPart\Listing();
        foreach ($parts as $part) {
            $catCode = $part->getCategoryCode();
            if ($catCode) {
                if (strtolower($catCode) === 'e-book') {
                    $part->setValue('mainCategory', 'e-Book');
                } else {
                    $part->setValue('mainCategory', $catCode);
                }
                $part->save();
                $output->writeln("Updated product with Main Category: " . $part->getMainCategory());
            }
        }

        return 0;
    }
}
