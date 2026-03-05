<?php

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

use Pimcore\Model\Document\Page;
use Pimcore\Model\Version;

try {
    Version::disable();

    echo "Updating document metadata...\n";

    $home = Page::getByPath('/');
    if ($home) {
        $home->setTitle('BSAVA Demo Home');
        $home->setDescription('Welcome to the BSAVA Demo site.');
        $home->save();
        echo "Updated Home\n";
    }

    $events = Page::getByPath('/en/events');
    if ($events) {
        $events->setTitle('BSAVA Events');
        $events->setDescription('Upcoming BSAVA Events and Congress.');
        $events->save();
        echo "Updated Events\n";
    }

    // Checking if there's an accessories page we can rename to products
    $products = Page::getByPath('/en/accessories');
    if ($products) {
        $products->setTitle('BSAVA Products');
        $products->setDescription('BSAVA Manuals, Memberships, and E-Books.');
        $products->setProperty('navigation_name', 'text', 'Products');
        $products->save();
        echo "Updated Products Document\n";
    }

    $cars = Page::getByPath('/en/cars');
    if ($cars) {
        $cars->setPublished(false);
        $cars->save();
        echo "Unpublished /cars\n";
    }

    echo "Done!\n";

} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
