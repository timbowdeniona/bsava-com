import React, { useState } from 'react';
import { 
  TextInput, 
  Button, 
  Spinner, 
  Paragraph, 
  Heading, 
  EntityList,
  EntityListItem,
  Note
} from '@contentful/f36-components';
import { SearchIcon, ExternalLinkIcon } from '@contentful/f36-icons';
import { getProductList } from '../PimcoreService';

const PIMCORE_ADMIN_URL = process.env.REACT_APP_PIMCORE_ADMIN_URL || 'https://pimcore.example.com';

const PimcorePicker = ({ onSelect, currentValue }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await getProductList(query);
      setProducts(results.edges || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products from Pimcore. Please check credentials or middleware.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product) => {
    // Mapping as per instructions: {id, sku, title}
    onSelect({
      id: product.id,
      sku: product.sku,
      title: product.title
    });
  };

  return (
    <div style={{ padding: '10px' }}>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
        <TextInput 
          placeholder="Search Pimcore products..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchProducts()}
        />
        <Button onClick={searchProducts} startIcon={<SearchIcon />}>
          Search
        </Button>
      </div>

      {loading && <Spinner />}
      {error && <Note variant="negative">{error}</Note>}

      {!loading && products.length > 0 && (
        <EntityList>
          {products.map(({ node: product }) => (
            <EntityListItem
              key={product.id}
              title={product.title}
              description={`SKU: ${product.sku} | Price: ${product.price}`}
              thumbnailUrl={product.thumbnail}
              onClick={() => handleSelect(product)}
              actions={[
                <Button 
                  key="view" 
                  variant="transparent" 
                  href={`${PIMCORE_ADMIN_URL}/admin/#object/${product.id}`} 
                  target="_blank"
                  startIcon={<ExternalLinkIcon />}
                >
                  View in Pimcore
                </Button>
              ]}
            />
          ))}
        </EntityList>
      )}

      {!loading && products.length === 0 && query && (
        <Paragraph>No products found for &quot;{query}&quot;.</Paragraph>
      )}

      {currentValue && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <Heading variant="h4">Linked Product</Heading>
          <Note variant="neutral">
            <strong>{currentValue.title}</strong> (ID: {currentValue.id}, SKU: {currentValue.sku})
          </Note>
        </div>
      )}
    </div>
  );
};

export default PimcorePicker;
