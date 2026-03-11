<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class RemoveDemoCarsCommand extends AbstractCommand
{
    protected static $defaultName = 'app:remove-demo-cars';

    protected function configure()
    {
        $this->setDescription('Removes the demo cars from Pimcore');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            \Pimcore\Model\Version::disable();

            $output->writeln("Deleting Cars...");
            $cars = new DataObject\Car\Listing();
            $cars->setUnpublished(true);
            foreach ($cars as $car) {
                $output->writeln("Deleting Car: " . $car->getFullPath());
                $car->delete();
            }

            // Also delete the Categories and Manufacturer folder under /Demo if they exist
            $output->writeln("Deleting other Demo components (Categories, Manufacturers, Body Styles)...");

            $components = [
                '/Demo/Body Styles',
                '/Demo/Categories',
                '/Demo/Manufacturers',
                '/Demo/Cars',
            ];

            foreach ($components as $path) {
                $folder = Folder::getByPath($path);
                if ($folder) {
                    $output->writeln("Deleting folder: " . $path);
                    $folder->delete();
                }
            }

            $output->writeln("Done!");

            return \Symfony\Component\Console\Command\Command::SUCCESS;
        } catch (\Throwable $e) {
            $output->writeln("<error>ERROR: " . $e->getMessage() . "</error>");
            $output->writeln("<error>" . $e->getTraceAsString() . "</error>");
            return \Symfony\Component\Console\Command\Command::FAILURE;
        }
    }
}
