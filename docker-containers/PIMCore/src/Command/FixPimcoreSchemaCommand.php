<?php

namespace App\Command;

use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\ClassDefinition\Layout;
use Pimcore\Bundle\DataHubBundle\Configuration;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class FixPimcoreSchemaCommand extends Command
{
    protected static $defaultName = 'app:fix-schema';

    protected function configure()
    {
        $this->addOption('dump', 'd', null, 'Dump the configuration after processing');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        try {
            \Pimcore\Model\Version::disable();

            if ($input->getOption('dump')) {
                $config = Configuration::getByName('products');
                if ($config) {
                    $output->writeln(print_r($config->getConfiguration(), true));
                }
                return Command::SUCCESS;
            }

            $output->writeln("Creating Product class...");
            $class = ClassDefinition::getByName('Product');
            if (!$class) {
                $class = new ClassDefinition();
                $class->setName('Product');
            }

            // Root Panel
            $root = new Layout\Panel();
            $root->setName('pimcore_root');

            // Tab Panel
            $tabs = new Layout\Tabpanel();
            $tabs->setName('pimcore_root');

            // --- General Information ---
            $generalPanel = new Layout\Panel();
            $generalPanel->setName('General Information');
            $generalPanel->setTitle('General Information');

            $productType = new Data\Select();
            $productType->setName('productType');
            $productType->setTitle('Product Type');
            $productType->setOptions([
                ["key" => "Book", "value" => "Book"],
                ["key" => "Event", "value" => "Event"],
                ["key" => "EBook", "value" => "EBook"],
                ["key" => "Membership", "value" => "Membership"],
                ["key" => "Course", "value" => "Course"]
            ]);

            $title = new Data\Input();
            $title->setName('title');
            $title->setTitle('Title');

            $sku = new Data\Input();
            $sku->setName('sku');
            $sku->setTitle('SKU');

            $description = new Data\Textarea();
            $description->setName('description');
            $description->setTitle('Description');

            $mainImage = new Data\Image();
            $mainImage->setName('mainImage');
            $mainImage->setTitle('Main Image');

            $basePrice = new Data\Numeric();
            $basePrice->setName('basePrice');
            $basePrice->setTitle('Base Price');

            $generalPanel->setChildren([$productType, $title, $sku, $description, $mainImage, $basePrice]);

            // --- Publications ---
            $pubPanel = new Layout\Panel();
            $pubPanel->setName('Publications');
            $pubPanel->setTitle('Publications');

            $author = new Data\Input();
            $author->setName('author');
            $author->setTitle('Author');

            $isbn = new Data\Input();
            $isbn->setName('isbn');
            $isbn->setTitle('ISBN');

            $pubDate = new Data\Date();
            $pubDate->setName('publicationDate');
            $pubDate->setTitle('Publication Date');

            $pubPanel->setChildren([$author, $isbn, $pubDate]);

            // --- Events & LMS ---
            $eventPanel = new Layout\Panel();
            $eventPanel->setName('Events & LMS');
            $eventPanel->setTitle('Events & LMS');

            $startDate = new Data\Date();
            $startDate->setName('startDate');
            $startDate->setTitle('Start Date');

            $endDate = new Data\Date();
            $endDate->setName('endDate');
            $endDate->setTitle('End Date');

            $location = new Data\Input();
            $location->setName('location');
            $location->setTitle('Location');

            $swoogoId = new Data\Input();
            $swoogoId->setName('swoogoId');
            $swoogoId->setTitle('Swoogo ID');

            $brightspaceId = new Data\Input();
            $brightspaceId->setName('brightspaceId');
            $brightspaceId->setTitle('Brightspace ID');

            $eventPanel->setChildren([$startDate, $endDate, $location, $swoogoId, $brightspaceId]);

            // --- Security ---
            $securityPanel = new Layout\Panel();
            $securityPanel->setName('Security');
            $securityPanel->setTitle('Security');

            $entitlement = new Data\Checkbox();
            $entitlement->setName('entitlementRequired');
            $entitlement->setTitle('Entitlement Required');

            $securityPanel->setChildren([$entitlement]);

            $tabs->setChildren([$generalPanel, $pubPanel, $eventPanel, $securityPanel]);
            $root->setChildren([$tabs]);

            $class->setLayoutDefinitions($root);
            $class->setGroup('BSAVA');
            $class->save();
            $output->writeln("Successfully created/updated Product class.");

            $output->writeln("Updating Data Hub configuration 'products'...");
            $config = Configuration::getByName('products');
            if ($config) {
                $data = $config->getConfiguration();

                // Clean up any numeric-keyed Product entries from previous failed attempts
                if (isset($data['schema']['queryEntities'])) {
                    foreach ($data['schema']['queryEntities'] as $key => $entity) {
                        if (is_numeric($key) && isset($entity['id']) && $entity['id'] === 'Product') {
                            unset($data['schema']['queryEntities'][$key]);
                        }
                    }
                }

                $columns = [];
                $fields = [
                    'productType',
                    'productType' => 'select',
                    'title' => 'input',
                    'sku' => 'input',
                    'description' => 'wysiwyg',
                    'mainImage' => 'image',
                    'basePrice' => 'numeric',
                    'author' => 'input',
                    'isbn' => 'input',
                    'publicationDate' => 'date',
                    'startDate' => 'date',
                    'endDate' => 'date',
                    'location' => 'input',
                    'swoogoId' => 'input',
                    'brightspaceId' => 'input',
                    'entitlementRequired' => 'checkbox'
                ];
                foreach ($fields as $field => $type) {
                    $columns[] = [
                        'attributes' => [
                            'attribute' => $field,
                            'label' => $field,
                            'dataType' => $type
                        ],
                        'isOperator' => false
                    ];
                }

                $data['schema']['queryEntities']['Product'] = [
                    'id' => 'Product',
                    'name' => 'Product',
                    'read' => true,
                    'create' => false,
                    'update' => false,
                    'delete' => false,
                    'columnConfig' => [
                        'columns' => $columns
                    ]
                ];

                // Add /BSAVA to workspaces if not present
                $bsavaWorkspaceFound = false;
                if (!isset($data['workspaces']['object'])) {
                    $data['workspaces']['object'] = [];
                }
                foreach ($data['workspaces']['object'] as $ws) {
                    if (isset($ws['cpath']) && $ws['cpath'] === '/BSAVA') {
                        $bsavaWorkspaceFound = true;
                        break;
                    }
                }
                if (!$bsavaWorkspaceFound) {
                    $data['workspaces']['object'][] = [
                        'read' => true,
                        'cpath' => '/BSAVA',
                        'create' => true,
                        'update' => true,
                        'delete' => false,
                        'id' => 'bsava-workspace'
                    ];
                }

                $output->writeln("Updated Product in queryEntities and added /BSAVA workspace.");

                $data['general']['modificationDate'] = time();
                $config->setConfiguration($data);
                $config->save();
                $output->writeln("Successfully updated Data Hub configuration.");
            }

            // --- Create Dummy Product ---
            $output->writeln("Creating dummy Product...");
            $parent = \Pimcore\Model\DataObject::getByPath('/BSAVA');
            if (!$parent) {
                $parent = new \Pimcore\Model\DataObject\Folder();
                $parent->setKey('BSAVA');
                $parent->setParentId(0);
                $parent->save();
            }

            $testProduct = \Pimcore\Model\DataObject\Product::getByPath('/BSAVA/test-product');
            if (!$testProduct) {
                $testProduct = new \Pimcore\Model\DataObject\Product();
                $testProduct->setKey('test-product');
                $testProduct->setParent($parent);
                $testProduct->setPublished(true);
            }

            $testProduct->setProductType('Book');
            $testProduct->setTitle('Test BSAVA Book');
            $testProduct->setSku('BSAVA-TEST-001');
            $testProduct->setDescription('A test product created for schema verification.');
            $testProduct->save();
            $output->writeln("Dummy Product created/updated at /BSAVA/test-product");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $output->writeln("ERROR: " . $e->getMessage());
            $output->writeln($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
