<?php

require __DIR__ . '/vendor/autoload.php';
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

try {
    \Pimcore\Model\Version::disable();
    $docs = new \Pimcore\Model\Document\Listing();
    foreach ($docs as $doc) {
        $publishState = $doc->getPublished() ? '(Published)' : '(Unpublished)';
        echo $doc->getFullPath() . " - " . $doc->getTitle() . " " . $publishState . "\n";
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
