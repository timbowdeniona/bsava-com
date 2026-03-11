<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Carbon\Carbon;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportBsavaProductsCommand extends AbstractCommand
{
    protected static $defaultName = 'app:import-bsava';

    protected function configure()
    {
        $this->setDescription('Imports BSAVA products into Pimcore');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            \Pimcore\Model\Version::disable();

            $output->writeln("Creating import folder...");
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

            $output->writeln("Creating Events...");
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
                $output->writeln("  -> Saved Event: {$ed['title']}");
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

            $output->writeln("Creating Products...");
            foreach ($productsData as $pd) {
                $key = \Pimcore\Model\Element\Service::getValidKey($pd['name'], 'object');

                // Choose the correct class based on the product type
                $type = $pd['type'];
                $lcType = strtolower($type);
                if (str_contains($lcType, 'e-book') || str_contains($lcType, 'ebook')) {
                    $existingPath = DataObject\EBook::getByPath($parentFolder->getFullPath() . '/' . $key);
                    if (!$existingPath) {
                        $prod = new DataObject\EBook();
                    } else {
                        $prod = $existingPath;
                    }
                } elseif (str_contains($lcType, 'book')) {
                    $existingPath = DataObject\Book::getByPath($parentFolder->getFullPath() . '/' . $key);
                    if (!$existingPath) {
                        $prod = new DataObject\Book();
                    } else {
                        $prod = $existingPath;
                    }
                } elseif (str_contains($lcType, 'membership')) {
                    $existingPath = DataObject\Membership::getByPath($parentFolder->getFullPath() . '/' . $key);
                    if (!$existingPath) {
                        $prod = new DataObject\Membership();
                    } else {
                        $prod = $existingPath;
                    }
                } else {
                    $output->writeln("  Skipping unknown type: {$type}");
                    continue;
                }

                $prod->setParentId($parentId);
                $prod->setKey($key);
                $prod->setNameAddition($pd['name'], 'en');
                $prod->setErpNumber($pd['erp']);
                $prod->setCategoryCode($type);
                $prod->setPublished(true);
                $prod->save();
                $output->writeln("  -> Saved {$type}: {$pd['name']}");
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
