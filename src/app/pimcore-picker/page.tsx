'use client';

import React, { useState, useEffect } from 'react';
import { 
  TextInput, 
  Button, 
  Spinner, 
  Paragraph, 
  Heading, 
  EntityList,
  EntityListItem,
  Note,
  GlobalStyles
} from '@contentful/f36-components';
import { MagnifyingGlassIcon as SearchIcon, ArrowSquareOutIcon as ExternalLinkIcon } from '@contentful/f36-icons';
import { init, FieldAppSDK } from '@contentful/app-sdk';
import { getProductList } from '@/lib/pimcore-service';

const PIMCORE_ADMIN_URL = process.env.NEXT_PUBLIC_PIMCORE_ADMIN_URL || 'http://35.246.19.193';

type ProductNode = {
  id: string | number;
  sku?: string;
  title?: string;
  price?: number;
  thumbnail?: string;
};

export default function PimcorePickerPage() {
  const [sdk, setSdk] = useState<FieldAppSDK | null>(null);
  const [value, setValue] = useState<ProductNode | null>(null);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<{ node: ProductNode }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init((sdk) => {
      const fieldSdk = sdk as FieldAppSDK;
      setSdk(fieldSdk);
      setValue(fieldSdk.field.getValue());
      fieldSdk.window.startAutoResizer();
    });
  }, []);

  const searchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getProductList(query);
      setProducts(results.edges || []);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to fetch products from Pimcore. Please check configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product: ProductNode) => {
    const data = {
      id: product.id,
      sku: product.sku,
      title: product.title
    };
    if (sdk) {
      sdk.field.setValue(data);
    }
    setValue(data);
  };

  if (!sdk) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ padding: '15px', background: '#fff', minHeight: '100vh' }}>
      <GlobalStyles />
      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        <TextInput 
          placeholder="Search Pimcore products..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
        />
        <Button onClick={searchProducts} startIcon={<SearchIcon />}>
          Search
        </Button>
      </div>

      {loading && <Spinner />}
      {error && <Note variant="negative" style={{ marginBottom: '10px' }}>{error}</Note>}

      {!loading && products.length > 0 && (
        <EntityList>
          {products.map(({ node: product }: { node: ProductNode }) => (
            <EntityListItem
              key={product.id}
              title={product.title || 'Untitled'}
              description={`SKU: ${product.sku || 'N/A'} | Price: ${product.price || 'N/A'}`}
              thumbnailUrl={product.thumbnail}
              onClick={() => handleSelect(product)}
              actions={[
                <Button 
                  key="view" 
                  variant="transparent" 
                  as="a"
                  href={`${PIMCORE_ADMIN_URL}/admin/#object/${product.id}`} 
                  target="_blank"
                  startIcon={<ExternalLinkIcon />}
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Button>
              ]}
            />
          ))}
        </EntityList>
      )}

      {!loading && products.length === 0 && query && (
        <Paragraph>No products found for &quot;{query}&quot;.</Paragraph>
      )}

      {value !== null && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <Heading as="h4">Linked Product</Heading>
          <Note variant="neutral">
            <strong>{value.title}</strong> (ID: {value.id}, SKU: {value.sku})
          </Note>
        </div>
      )}
    </div>
  );
}
