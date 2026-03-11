<?php
namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Pimcore\Model\DataObject;

class MigrateProductsCommand extends Command
{
    protected static $defaultName = 'app:migrate-products';

    protected function configure()
    {
        $this->setDescription('Migrates legacy BSAVA diverse objects to Unified Product objects');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        \Pimcore\Model\Version::disable();
        $bsavaFolder = DataObject\Folder::getByPath('/BSAVA');
        if (!$bsavaFolder) {
            $output->writeln("BSAVA folder not found.");
            return Command::SUCCESS;
        }

        $children = $bsavaFolder->getChildren();
        foreach ($children as $child) {
            if ($child instanceof DataObject\Folder) {
                continue;
            }
            if ($child instanceof DataObject\Product) {
                continue;
            }
            $className = $child->getClassName();
            $output->writeln("Found legacy object: " . $child->getKey() . " of class $className");
            
            // Recreate as Product
            $key = $child->getKey();
            $newKey = $key . '-unified';
            
            $productType = 'Other';
            if (str_contains(strtolower($className), 'book')) {
                $productType = 'Book';
            } elseif (str_contains(strtolower($className), 'event')) {
                $productType = 'Event';
            } elseif (str_contains(strtolower($className), 'membership')) {
                $productType = 'Membership';
            }

            $product = DataObject\Product::getByPath('/BSAVA/' . $key);
            if (!$product) {
                $product = new DataObject\Product();
                $product->setKey($key);
                $product->setParentId($bsavaFolder->getId());
                
                // Let's delete the old one first to avoid key collision
                $childId = $child->getId();
                $child->delete();
                $output->writeln("Deleted old $className");
            }

            $product->setPublished(true);
            $product->setProductType($productType);
            
            // Try to extract title if it has one, otherwise use key
            $title = $key;
            if (method_exists($product, 'setTitle')) {
                $product->setTitle(ucwords(str_replace('-', ' ', $key)));
            }
            if (method_exists($product, 'setSku')) {
                $product->setSku('BSAVA-' . strtoupper(substr(md5($key), 0, 5)));
            }
            if (method_exists($product, 'setDescription')) {
                $product->setDescription('Migrated from legacy ' . $className . ' class.');
            }

            $product->save();
            $output->writeln("Created Product: " . $product->getKey());
        }

        \Pimcore\Model\Version::enable();
        return Command::SUCCESS;
    }
}
