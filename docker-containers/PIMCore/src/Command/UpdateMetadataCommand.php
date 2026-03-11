<?php

namespace App\Command;

use Pimcore\Console\AbstractCommand;
use Pimcore\Model\Document\Page;
use Pimcore\Model\Version;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class UpdateMetadataCommand extends AbstractCommand
{
    protected static $defaultName = 'app:update-metadata';

    protected function configure()
    {
        $this->setDescription('Updates Document titles from Pimcore Demo to BSAVA Demo');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            Version::disable();

            $output->writeln("Updating document metadata...");

            $home = Page::getByPath('/en');
            if ($home && method_exists($home, 'setTitle')) {
                $home->setTitle('BSAVA Demo Home');
                $home->setDescription('Welcome to the BSAVA Demo site.');
                $home->save();
                $output->writeln("Updated /en Home");
            } else {
                $home = Page::getByPath('/');
                if ($home && method_exists($home, 'setTitle')) {
                    $home->setTitle('BSAVA Demo Home');
                    $home->setDescription('Welcome to the BSAVA Demo site.');
                    $home->save();
                    $output->writeln("Updated / Home");
                }
            }

            $events = Page::getByPath('/en/Events');
            if ($events && method_exists($events, 'setTitle')) {
                $events->setTitle('BSAVA Events');
                $events->setDescription('Upcoming BSAVA Events and Congress.');
                $events->setProperty('navigation_name', 'text', 'Events');
                $events->save();
                $output->writeln("Updated Events");
            }

            // Also check the Find-and-Buy link or page
            $shop = Page::getByPath('/en/Find-and-Buy');
            if ($shop && method_exists($shop, 'setTitle')) {
                $shop->setTitle('BSAVA Store');
                $shop->setDescription('BSAVA Manuals, Memberships, and E-Books.');
                $shop->setProperty('navigation_name', 'text', 'Store');
                $shop->save();
                $output->writeln("Updated Store Document");
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
