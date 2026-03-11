<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Carbon\Carbon;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ImportBsavaCommand extends AbstractCommand
{
    protected static $defaultName = 'app:import-bsava';

    protected function configure()
    {
        $this->setDescription('Imports bsava.com demo products into Pimcore');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            // Disable versioning to avoid needing a logged-in admin user during CLI execution
            \Pimcore\Model\Version::disable();

            $output->writeln("Creating import folder...");
            $parentFolder = Folder::getByPath('/Demo/BSAVA');
            if (!$parentFolder) {
                if (!Folder::getByPath('/Demo')) {
                    $demo = new Folder();
                    $demo->setParentId(1); // root
                    $demo->setKey('Demo');
                    $demo->save();
                }
                $parentFolder = new Folder();
                $parentFolder->setParentId(Folder::getByPath('/Demo')->getId());
                $parentFolder->setKey('BSAVA');
                $parentFolder->save();
            }
            $parentId = $parentFolder->getId();

            // 1. Events
            $eventsData = [
                [
                    'title' => 'BSAVA Congress 2026',
                    'desc' => 'The ultimate small animal veterinary event. Join us for 4 days of unparalleled CPD, networking and exhibition.',
                    'date' => Carbon::now()->addMonths(6)
                ],
                [
                    'title' => 'Online Diagnostic Dilemmas with Infectious Diseases',
                    'desc' => 'Endemic and Exotic cases discussed by experts.',
                    'date' => Carbon::now()->addDays(14)
                ],
                [
                    'title' => 'Clinical Rounds: Managing GI disease',
                    'desc' => 'Managing GI disease without recourse to antibiotics.',
                    'date' => Carbon::now()->addDays(30)
                ]
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

            // 2. Memberships, Books, E-Books (using AccessoryPart as a generic product)
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
                $output->writeln("  -> Saved Product: {$pd['name']}");
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
