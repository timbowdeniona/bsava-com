<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Pimcore\Model\DataObject\Service;
use Pimcore\Model\Element\AdminStyle;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CleanAllProductsCommand extends AbstractCommand
{
    protected static $defaultName = 'app:clean-all-products';

    protected function configure()
    {
        $this->setDescription('Removes all products/objects under /Demo from Pimcore');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            \Pimcore\Model\Version::disable();

            $output->writeln("Finding all objects under /Demo...");

            $demoFolder = Folder::getByPath('/Demo');
            if ($demoFolder) {
                // Delete everything under /Demo
                $list = new DataObject\Listing();
                $list->setObjectTypes([DataObject::OBJECT_TYPE_OBJECT, DataObject::OBJECT_TYPE_FOLDER, DataObject::OBJECT_TYPE_VARIANT]);
                $list->setUnpublished(true);

                $objectsToDelete = [];
                foreach ($list as $obj) {
                    if (str_starts_with($obj->getFullPath(), '/Demo/')) {
                        if ($obj->getId() != $demoFolder->getId()) {
                            $objectsToDelete[] = $obj;
                        }
                    }
                }

                // sort descending by path length to delete children first
                usort($objectsToDelete, function ($a, $b) {
                    return strlen($b->getFullPath()) <=> strlen($a->getFullPath());
                });

                foreach ($objectsToDelete as $obj) {
                    $output->writeln("Deleting: " . $obj->getFullPath());
                    $obj->delete();
                }

                $output->writeln("Deleting /Demo folder itself.");
                $demoFolder->delete();
            } else {
                $output->writeln("No /Demo folder found.");
            }

            $output->writeln("Done cleaning!");

            return \Symfony\Component\Console\Command\Command::SUCCESS;
        } catch (\Throwable $e) {
            $output->writeln("<error>ERROR: " . $e->getMessage() . "</error>");
            $output->writeln("<error>" . $e->getTraceAsString() . "</error>");
            return \Symfony\Component\Console\Command\Command::FAILURE;
        }
    }
}
