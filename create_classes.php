<?php
require_once __DIR__ . "/vendor/autoload.php";
\Pimcore\Bootstrap::setProjectRoot();
\Pimcore\Bootstrap::bootstrap();

$classes = [
    "MembershipTier" => [
        ["type" => "input", "name" => "name", "title" => "Name"],
        ["type" => "select", "name" => "tierType", "title" => "Tier Type", "options" => [["key" => "Vet", "value" => "vet"], ["key" => "Nurse", "value" => "nurse"], ["key" => "Student", "value" => "student"]]],
        ["type" => "numeric", "name" => "annualFee", "title" => "Annual Fee"],
        ["type" => "image", "name" => "membershipImage", "title" => "Membership Image"],
        ["type" => "textarea", "name" => "description", "title" => "Description"],
        ["type" => "wysiwyg", "name" => "benefits", "title" => "Benefits"],
    ],
    "Event" => [
        ["type" => "input", "name" => "title", "title" => "Title"],
        ["type" => "select", "name" => "eventType", "title" => "Event Type", "options" => [["key" => "Congress", "value" => "congress"], ["key" => "Regional", "value" => "regional"], ["key" => "Webinar", "value" => "webinar"], ["key" => "Alba", "value" => "alba"], ["key" => "Cymru", "value" => "cymru"]]],
        ["type" => "date", "name" => "startDate", "title" => "Start Date"],
        ["type" => "date", "name" => "endDate", "title" => "End Date"],
        ["type" => "input", "name" => "location", "title" => "Location"],
        ["type" => "input", "name" => "onlineUrl", "title" => "Online URL"],
        ["type" => "image", "name" => "eventImage", "title" => "Event Image"],
        ["type" => "wysiwyg", "name" => "description", "title" => "Description"],
        ["type" => "numeric", "name" => "memberPrice", "title" => "Member Price"],
        ["type" => "numeric", "name" => "nonMemberPrice", "title" => "Non-Member Price"],
    ],
    "Course" => [
        ["type" => "input", "name" => "title", "title" => "Title"],
        ["type" => "select", "name" => "courseType", "title" => "Course Type", "options" => [["key" => "Webinar", "value" => "webinar"], ["key" => "Regional CPD", "value" => "regional-cpd"], ["key" => "Postgraduate Certificate", "value" => "postgraduate-certificate"], ["key" => "Masters", "value" => "masters"], ["key" => "Dispensing", "value" => "dispensing"], ["key" => "LUMOS", "value" => "lumos"]]],
        ["type" => "date", "name" => "startDate", "title" => "Start Date"],
        ["type" => "input", "name" => "duration", "title" => "Duration"],
        ["type" => "image", "name" => "courseImage", "title" => "Course Image"],
        ["type" => "wysiwyg", "name" => "description", "title" => "Description"],
        ["type" => "numeric", "name" => "memberPrice", "title" => "Member Price"],
        ["type" => "numeric", "name" => "nonMemberPrice", "title" => "Non-Member Price"],
        ["type" => "input", "name" => "onlineUrl", "title" => "Online URL"],
    ],
    "Book" => [
        ["type" => "input", "name" => "title", "title" => "Title"],
        ["type" => "input", "name" => "isbn", "title" => "ISBN"],
        ["type" => "input", "name" => "authors", "title" => "Authors"],
        ["type" => "wysiwyg", "name" => "description", "title" => "Description"],
        ["type" => "numeric", "name" => "memberPrice", "title" => "Member Price"],
        ["type" => "numeric", "name" => "nonMemberPrice", "title" => "Non-Member Price"],
        ["type" => "image", "name" => "coverImage", "title" => "Cover Image"],
        ["type" => "date", "name" => "publishDate", "title" => "Publish Date"],
    ],
    "Ebook" => [
        ["type" => "input", "name" => "title", "title" => "Title"],
        ["type" => "input", "name" => "isbn", "title" => "ISBN"],
        ["type" => "input", "name" => "authors", "title" => "Authors"],
        ["type" => "wysiwyg", "name" => "description", "title" => "Description"],
        ["type" => "numeric", "name" => "memberPrice", "title" => "Member Price"],
        ["type" => "numeric", "name" => "nonMemberPrice", "title" => "Non-Member Price"],
        ["type" => "image", "name" => "coverImage", "title" => "Cover Image"],
        ["type" => "date", "name" => "publishDate", "title" => "Publish Date"],
        ["type" => "input", "name" => "downloadUrl", "title" => "Download URL"],
        ["type" => "select", "name" => "fileFormat", "title" => "File Format", "options" => [["key" => "PDF", "value" => "pdf"], ["key" => "ePub", "value" => "epub"]]],
    ],
];

foreach ($classes as $className => $fields) {
    $existing = \Pimcore\Model\DataObject\ClassDefinition::getByName($className);
    if ($existing) {
        $existing->delete();
        echo "Deleted existing: $className\n";
    }

    $class = new \Pimcore\Model\DataObject\ClassDefinition();
    $class->setName($className);

    $layout = new \Pimcore\Model\DataObject\ClassDefinition\Layout\Panel();
    $layout->setName("Layout");

    $panel = new \Pimcore\Model\DataObject\ClassDefinition\Layout\Panel();
    $panel->setName("Main");

    foreach ($fields as $f) {
        $fc = "Pimcore\\Model\\DataObject\\ClassDefinition\\Data\\" . ucfirst($f["type"]);
        if (!class_exists($fc)) {
            echo "Skipping unknown type: {$f["type"]}\n";
            continue;
        }
        $field = new $fc();
        $field->setName($f["name"]);
        $field->setTitle($f["title"]);
        if (isset($f["options"]) && method_exists($field, "setOptions")) {
            $field->setOptions($f["options"]);
        }
        $panel->addChild($field);
    }

    $layout->addChild($panel);
    $class->setLayoutDefinitions($layout);
    $class->save();
    echo "Created: $className\n";
}

echo "Done!\n";