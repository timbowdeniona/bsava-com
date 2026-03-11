<?php

namespace App\Model\Product;

use Pimcore\Model\DataObject\Data\Hotspotimage;

class Book extends \Pimcore\Model\DataObject\Book
{
    public function getOSName(): ?string
    {
        return $this->getGeneratedName();
    }

    public function getProductName($language = null): string
    {
        return $this->getNameAddition($language) ?? $this->getKey();
    }

    public function getOSProductNumber(): ?string
    {
        return $this->getErpNumber();
    }

    public function getOSIndexType(): string
    {
        return self::OBJECT_TYPE_VARIANT;
    }

    public function getMainImage(): ?Hotspotimage
    {
        return $this->getImage();
    }

    public function getCategories(): array
    {
        return [];
    }
}
