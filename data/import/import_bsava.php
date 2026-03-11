<?php

/**
 * BSAVA Bulk Data Import Script
 * 
 * Usage: php bin/console pimcore:run-script /var/www/html/import_bsava.php
 * 
 * Place all JSON files in /var/www/html/ before running:
 *   - Book_import.json
 *   - Ebook_import.json
 *   - Course_import.json
 *   - Event_import.json
 *   - MembershipTier_import.json
 */

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\Service;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function log_msg(string $msg): void {
    echo date('[H:i:s] ') . $msg . PHP_EOL;
}

function get_or_create_folder(string $path): DataObject\Folder {
    $folder = DataObject\Folder::getByPath($path);
    if (!$folder) {
        $folder = Service::createFolderByPath($path);
        log_msg("Created folder: $path");
    }
    return $folder;
}

function load_json(string $filename): array {
    $path = '/var/www/html/' . $filename;
    if (!file_exists($path)) {
        log_msg("WARNING: File not found: $path — skipping.");
        return [];
    }
    $data = json_decode(file_get_contents($path), true);
    if (!$data) {
        log_msg("WARNING: Could not parse JSON in $filename — skipping.");
        return [];
    }
    return $data;
}

function find_existing(string $class, string $field, string $value, int $parentId): ?DataObject\Concrete {
    $listClass = "\\Pimcore\\Model\\DataObject\\{$class}\\Listing";
    $list = new $listClass();
    $list->setCondition("$field = ? AND o_parentId = ?", [$value, $parentId]);
    $list->setLimit(1);
    $objects = $list->load();
    return $objects[0] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function import_books(string $filename, string $parentPath): void {
    $items = load_json($filename);
    if (!$items) return;

    $folder = get_or_create_folder($parentPath);
    $created = $updated = $skipped = 0;

    foreach ($items as $item) {
        $title = trim($item['title'] ?? '');
        if (!$title) { $skipped++; continue; }

        $existing = find_existing('Book', 'title', $title, $folder->getId());
        $obj = $existing ?? new DataObject\Book();

        $obj->setKey(Service::getValidKey($title, 'object'));
        $obj->setParent($folder);
        $obj->setPublished(true);
        $obj->setTitle($title);
        $obj->setIsbn($item['isbn'] ?? '');
        $obj->setAuthors($item['authors'] ?? '');
        $obj->setDescription($item['description'] ?? '');
        $obj->setMemberPrice($item['memberPrice'] !== '' ? (float)$item['memberPrice'] : null);
        $obj->setNonMemberPrice($item['nonMemberPrice'] !== '' ? (float)$item['nonMemberPrice'] : null);

        if (!empty($item['publishDate'])) {
            $obj->setPublishDate(new \Carbon\Carbon($item['publishDate']));
        }

        $obj->save();
        $existing ? $updated++ : $created++;
        log_msg(($existing ? 'Updated' : 'Created') . " Book: $title");
    }

    log_msg("Books — Created: $created, Updated: $updated, Skipped: $skipped");
}

function import_ebooks(string $filename, string $parentPath): void {
    $items = load_json($filename);
    if (!$items) return;

    $folder = get_or_create_folder($parentPath);
    $created = $updated = $skipped = 0;

    foreach ($items as $item) {
        $title = trim($item['title'] ?? '');
        if (!$title) { $skipped++; continue; }

        $existing = find_existing('Ebook', 'title', $title, $folder->getId());
        $obj = $existing ?? new DataObject\Ebook();

        $obj->setKey(Service::getValidKey($title, 'object'));
        $obj->setParent($folder);
        $obj->setPublished(true);
        $obj->setTitle($title);
        $obj->setIsbn($item['isbn'] ?? '');
        $obj->setAuthors($item['authors'] ?? '');
        $obj->setDescription($item['description'] ?? '');
        $obj->setMemberPrice($item['memberPrice'] !== '' ? (float)$item['memberPrice'] : null);
        $obj->setNonMemberPrice($item['nonMemberPrice'] !== '' ? (float)$item['nonMemberPrice'] : null);
        $obj->setDownloadUrl($item['downloadUrl'] ?? '');
        $obj->setFileFormat($item['fileFormat'] ?? '');

        if (!empty($item['publishDate'])) {
            $obj->setPublishDate(new \Carbon\Carbon($item['publishDate']));
        }

        $obj->save();
        $existing ? $updated++ : $created++;
        log_msg(($existing ? 'Updated' : 'Created') . " Ebook: $title");
    }

    log_msg("Ebooks — Created: $created, Updated: $updated, Skipped: $skipped");
}

function import_courses(string $filename, string $parentPath): void {
    $items = load_json($filename);
    if (!$items) return;

    $folder = get_or_create_folder($parentPath);
    $created = $updated = $skipped = 0;

    foreach ($items as $item) {
        $title = trim($item['title'] ?? '');
        if (!$title) { $skipped++; continue; }

        $existing = find_existing('Course', 'title', $title, $folder->getId());
        $obj = $existing ?? new DataObject\Course();

        $obj->setKey(Service::getValidKey($title, 'object'));
        $obj->setParent($folder);
        $obj->setPublished(true);
        $obj->setTitle($title);
        $obj->setCourseType($item['courseType'] ?? '');
        $obj->setDuration($item['duration'] ?? '');
        $obj->setDescription($item['description'] ?? '');
        $obj->setMemberPrice($item['memberPrice'] !== '' ? (float)$item['memberPrice'] : null);
        $obj->setNonMemberPrice($item['nonMemberPrice'] !== '' ? (float)$item['nonMemberPrice'] : null);
        $obj->setOnlineUrl($item['onlineUrl'] ?? '');

        if (!empty($item['startDate'])) {
            $obj->setStartDate(new \Carbon\Carbon($item['startDate']));
        }

        $obj->save();
        $existing ? $updated++ : $created++;
        log_msg(($existing ? 'Updated' : 'Created') . " Course: $title");
    }

    log_msg("Courses — Created: $created, Updated: $updated, Skipped: $skipped");
}

function import_events(string $filename, string $parentPath): void {
    $items = load_json($filename);
    if (!$items) return;

    $folder = get_or_create_folder($parentPath);
    $created = $updated = $skipped = 0;

    foreach ($items as $item) {
        $title = trim($item['title'] ?? '');
        if (!$title) { $skipped++; continue; }

        $existing = find_existing('Event', 'title', $title, $folder->getId());
        $obj = $existing ?? new DataObject\Event();

        $obj->setKey(Service::getValidKey($title, 'object'));
        $obj->setParent($folder);
        $obj->setPublished(true);
        $obj->setTitle($title);
        $obj->setEventType($item['eventType'] ?? '');
        $obj->setLocation($item['location'] ?? '');
        $obj->setOnlineUrl($item['onlineUrl'] ?? '');
        $obj->setDescription($item['description'] ?? '');
        $obj->setMemberPrice($item['memberPrice'] !== '' ? (float)$item['memberPrice'] : null);
        $obj->setNonMemberPrice($item['nonMemberPrice'] !== '' ? (float)$item['nonMemberPrice'] : null);

        if (!empty($item['startDate'])) {
            $obj->setStartDate(new \Carbon\Carbon($item['startDate']));
        }
        if (!empty($item['endDate'])) {
            $obj->setEndDate(new \Carbon\Carbon($item['endDate']));
        }

        $obj->save();
        $existing ? $updated++ : $created++;
        log_msg(($existing ? 'Updated' : 'Created') . " Event: $title");
    }

    log_msg("Events — Created: $created, Updated: $updated, Skipped: $skipped");
}

function import_membership_tiers(string $filename, string $parentPath): void {
    $items = load_json($filename);
    if (!$items) return;

    $folder = get_or_create_folder($parentPath);
    $created = $updated = $skipped = 0;

    foreach ($items as $item) {
        $name = trim($item['name'] ?? $item['title'] ?? '');
        if (!$name) { $skipped++; continue; }

        $existing = find_existing('MembershipTier', 'name', $name, $folder->getId());
        $obj = $existing ?? new DataObject\MembershipTier();

        $obj->setKey(Service::getValidKey($name, 'object'));
        $obj->setParent($folder);
        $obj->setPublished(true);
        $obj->setName($name);
        $obj->setTierType($item['tierType'] ?? '');
        $obj->setAnnualFee($item['annualFee'] !== '' ? (float)$item['annualFee'] : null);
        $obj->setDescription($item['description'] ?? '');
        $obj->setBenefits($item['benefits'] ?? '');

        $obj->save();
        $existing ? $updated++ : $created++;
        log_msg(($existing ? 'Updated' : 'Created') . " MembershipTier: $name");
    }

    log_msg("MembershipTiers — Created: $created, Updated: $updated, Skipped: $skipped");
}

// ─────────────────────────────────────────────────────────────────────────────
// RUN IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

log_msg("Starting BSAVA bulk import...");
log_msg(str_repeat('─', 60));

import_membership_tiers('MembershipTier_import.json', '/BSAVA/MembershipTiers');
import_events('Event_import.json',                    '/BSAVA/Events');
import_courses('Course_import.json',                  '/BSAVA/Courses');
import_books('Book_import.json',                      '/BSAVA/Books');
import_ebooks('Ebook_import.json',                    '/BSAVA/Ebooks');

log_msg(str_repeat('─', 60));
log_msg("Import complete.");
