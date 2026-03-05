<?php

require __DIR__ . '/vendor/autoload.php';

\Pimcore\Bootstrap::setProjectRoot();

use Symfony\Component\Dotenv\Dotenv;
use App\Kernel;

if (file_exists(\Pimcore\PIMCORE_PROJECT_ROOT . '/.env')) {
    (new Dotenv())->bootEnv(\Pimcore\PIMCORE_PROJECT_ROOT . '/.env');
}

$kernel = new Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? true));
$kernel->boot();

$container = $kernel->getContainer();
\Pimcore::setContainer($container);

use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\ClassDefinition\Service;
use Pimcore\Bundle\DataHubBundle\Configuration;

try {
    \Pimcore\Model\Version::disable();
    // In standalone scripts, we don't necessarily need the admin user for ClassDefinitions
    // but we might need it for Data Hub. Let's try without first.

    echo "Creating Product class...\n";
    $class = ClassDefinition::getByName('Product');
    if (!$class) {
        $class = new ClassDefinition();
        $class->setName('Product');
    }

    $classData = [
        "name" => "Product",
        "userOwner" => 1,
        "creationDate" => time(),
        "modificationDate" => time(),
        "userModification" => 1,
        "title" => "Product",
        "description" => "Unified BSAVA Product Class",
        "group" => "BSAVA",
        "layoutDefinitions" => [
            "childs" => [
                [
                    "childs" => [
                        [
                            "childs" => [
                                [
                                    "name" => "productType",
                                    "title" => "Product Type",
                                    "fieldtype" => "select",
                                    "options" => [
                                        ["key" => "Book", "value" => "Book"],
                                        ["key" => "Event", "value" => "Event"],
                                        ["key" => "EBook", "value" => "EBook"],
                                        ["key" => "Membership", "value" => "Membership"],
                                        ["key" => "Course", "value" => "Course"]
                                    ],
                                    "width" => 250
                                ],
                                [
                                    "name" => "title",
                                    "title" => "Title",
                                    "fieldtype" => "input",
                                    "width" => 400
                                ],
                                [
                                    "name" => "sku",
                                    "title" => "SKU",
                                    "fieldtype" => "input"
                                ],
                                [
                                    "name" => "description",
                                    "title" => "Description",
                                    "fieldtype" => "textarea",
                                    "width" => 400,
                                    "height" => 100
                                ],
                                [
                                    "name" => "mainImage",
                                    "title" => "Main Image",
                                    "fieldtype" => "image"
                                ],
                                [
                                    "name" => "basePrice",
                                    "title" => "Base Price",
                                    "fieldtype" => "numeric"
                                ]
                            ],
                            "name" => "General Information",
                            "fieldtype" => "panel"
                        ],
                        [
                            "childs" => [
                                [
                                    "name" => "author",
                                    "title" => "Author",
                                    "fieldtype" => "input"
                                ],
                                [
                                    "name" => "isbn",
                                    "title" => "ISBN",
                                    "fieldtype" => "input"
                                ],
                                [
                                    "name" => "publicationDate",
                                    "title" => "Publication Date",
                                    "fieldtype" => "date"
                                ]
                            ],
                            "name" => "Publications",
                            "fieldtype" => "panel"
                        ],
                        [
                            "childs" => [
                                [
                                    "name" => "startDate",
                                    "title" => "Start Date",
                                    "fieldtype" => "date"
                                ],
                                [
                                    "name" => "endDate",
                                    "title" => "End Date",
                                    "fieldtype" => "date"
                                ],
                                [
                                    "name" => "location",
                                    "title" => "Location",
                                    "fieldtype" => "input"
                                ],
                                [
                                    "name" => "swoogoId",
                                    "title" => "Swoogo ID",
                                    "fieldtype" => "input"
                                ],
                                [
                                    "name" => "brightspaceId",
                                    "title" => "Brightspace ID",
                                    "fieldtype" => "input"
                                ]
                            ],
                            "name" => "Events & LMS",
                            "fieldtype" => "panel"
                        ],
                        [
                            "childs" => [
                                [
                                    "name" => "entitlementRequired",
                                    "title" => "Entitlement Required",
                                    "fieldtype" => "checkbox"
                                ]
                            ],
                            "name" => "Security",
                            "fieldtype" => "panel"
                        ]
                    ],
                    "name" => "pimcore_root",
                    "fieldtype" => "tabpanel"
                ]
            ],
            "fieldtype" => "panel",
            "name" => "pimcore_root"
        ]
    ];

    Service::importClassDefinitionFromJson($class, json_encode($classData));
    $class->save();
    echo "Successfully created/updated Product class.\n";

    echo "Updating Data Hub configuration 'products'...\n";
    $config = Configuration::getByName('products');
    if ($config) {
        $data = $config->getConfiguration();

        // Ensure Product is in queryEntities
        $found = false;
        foreach ($data['schema']['queryEntities'] as $entity) {
            if ($entity['id'] === 'Product') {
                $found = true;
                break;
            }
        }

        if (!$found) {
            $data['schema']['queryEntities'][] = [
                'id' => 'Product',
                'read' => true,
                'create' => false,
                'update' => false,
                'delete' => false
            ];
            echo "Added Product to queryEntities.\n";
        }

        // Add workspace permission for Product
        if (!isset($data['workspaces']['object'])) {
            $data['workspaces']['object'] = [];
        }

        // Add a broad permission for testing or specific if path is known
        $data['workspaces']['object'][] = [
            'path' => '/BSAVA',
            'read' => true,
            'create' => true,
            'update' => true,
            'delete' => true
        ];

        $data['general']['modificationDate'] = time();
        $config->setConfiguration($data);
        $config->save();
        echo "Successfully updated Data Hub configuration.\n";
    } else {
        echo "Data Hub configuration 'products' not found.\n";
    }

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
