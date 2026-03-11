<?php

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
$kernel = \Pimcore\Bootstrap::startupCli();

use Pimcore\Model\DataObject\ClassDefinition;
use Pimcore\Model\DataObject\ClassDefinition\Service;
use Pimcore\Bundle\DataHubBundle\Configuration;
use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Folder;
use Pimcore\Model\Asset;
use Carbon\Carbon;

try {
    \Pimcore\Model\Version::disable();
    /*
    $adminUser = \Pimcore\Tool\Admin::getCurrentUser();
    if (!$adminUser) {
        \Pimcore\Tool\Admin::setCurrentUser(\Pimcore\Model\User::getByName('admin'));
    }
    */

    echo "--- Phase 1: Creating Product Class ---\n";
    $class = ClassDefinition::getByName('Product');
    if (!$class) {
        $class = new ClassDefinition();
        $class->setName('Product');
    }

    $classData = [
        "name" => "Product",
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
    echo "  -> Saved Product class.\n";

    echo "--- Phase 2: Updating Data Hub configuration 'products' ---\n";
    $config = Configuration::getByName('products');
    if ($config) {
        $data = $config->getConfiguration();
        $found = false;
        foreach ($data['schema']['queryEntities'] ?? [] as $entity) {
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
            echo "  -> Added Product to Data Hub query entities.\n";
        }
        $data['workspaces']['object'][] = [
            'cpath' => '/BSAVA',
            'read' => true,
            'create' => true,
            'update' => true,
            'delete' => true,
            'id' => 'bsava-ws-' . time()
        ];
        $config->setConfiguration($data);
        $config->save();
        echo "  -> Saved Data Hub config.\n";
    }

    echo "--- Phase 3: Creating BSAVA Folder ---\n";
    $bsavaFolder = Folder::getByPath('/BSAVA');
    if (!$bsavaFolder) {
        $bsavaFolder = new Folder();
        $bsavaFolder->setParentId(1);
        $bsavaFolder->setKey('BSAVA');
        $bsavaFolder->save();
        echo "  -> Created /BSAVA\n";
    }

    echo "--- Phase 4: Importing Sample Products ---\n";
    $productsData = [
        ['title' => 'Vet Member', 'type' => 'Membership', 'sku' => 'MEM-VET-01', 'desc' => 'Professional membership for veterinarians.'],
        ['title' => 'Nurse Member', 'type' => 'Membership', 'sku' => 'MEM-NUR-01', 'desc' => 'Professional membership for veterinary nurses.'],
        ['title' => 'BSAVA Manual of Canine and Feline Neurology', 'type' => 'Book', 'sku' => 'BK-NEURO-05', 'desc' => 'Comprehensive guide to neurology.'],
        ['title' => 'BSAVA Small Animal Formulary', 'type' => 'Book', 'sku' => 'BK-FORM-10', 'desc' => 'Essential drug dosage information.'],
        ['title' => 'E-Book: BSAVA Manual of Feline Practice', 'type' => 'EBook', 'sku' => 'EBK-FEL-01', 'desc' => 'Digital edition for feline practice.'],
        ['title' => 'BSAVA Congress 2026', 'type' => 'Event', 'sku' => 'EV-CONG-26', 'desc' => 'Annual small animal conference.']
    ];

    foreach ($productsData as $pd) {
        $key = \Pimcore\Model\Element\Service::getValidKey($pd['title'], 'object');
        $product = DataObject\Product::getByPath('/BSAVA/' . $key);
        if (!$product) {
            $product = new DataObject\Product();
            $product->setParentId($bsavaFolder->getId());
            $product->setKey($key);
        }
        $product->setTitle($pd['title']);
        $product->setProductType($pd['type']);
        $product->setSku($pd['sku']);
        $product->setDescription($pd['desc']);
        $product->setPublished(true);
        $product->save();
        echo "  -> Saved Product: {$pd['title']}\n";
    }

    echo "--- Phase 5: Importing Assets & Mapping Images ---\n";
    $imgFolder = Asset::getByPath('/sample-images');
    if (!$imgFolder) {
        $imgFolder = new Asset\Folder();
        $imgFolder->setFilename('sample-images');
        $imgFolder->setParent(Asset::getByPath('/'));
        $imgFolder->save();
    }

    $imageFiles = [
        'Book' => 'book_cover_1772610835421.png',
        'Event' => 'event_banner_1772610850330.png',
        'Membership' => 'membership_card_1772610876894.png'
    ];

    foreach ($imageFiles as $type => $fname) {
        $lpath = __DIR__ . '/var/tmp_images/' . $fname;
        if (file_exists($lpath)) {
            $asset = Asset::getByPath('/sample-images/' . $fname);
            if (!$asset) {
                $asset = new Asset\Image();
                $asset->setFilename($fname);
                $asset->setData(file_get_contents($lpath));
                $asset->setParent($imgFolder);
                $asset->save();
                echo "  -> Created Asset for $type\n";
            }
            // Link to products of this type
            $list = new DataObject\Product\Listing();
            $list->setCondition("productType = ?", [$type]);
            foreach ($list as $p) {
                $p->setMainImage($asset);
                $p->save();
            }
        }
    }

    echo "--- PHASE 6: Deleting Demo Data ---\n";
    $demoFolder = Folder::getByPath('/Demo');
    if ($demoFolder) {
        echo "  -> Deleting /Demo and its children...\n";
        $demoFolder->delete();
    }

    echo "RESTORE COMPLETE!\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
