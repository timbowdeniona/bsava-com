import React, { useState } from 'react';
import { 
  Heading, 
  Paragraph, 
} from '@contentful/f36-components';
import PimcorePicker from '../components/PimcorePicker';

export const Sidebar = ({ sdk }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const onSelect = (product) => {
    // For sidebar, we might store this in a specific field or metadata.
    // If there is a field named 'linkedPimcoreProduct', we set it.
    const field = sdk.entry.fields['linkedPimcoreProduct'];
    if (field) {
      field.setValue(product);
      setSelectedProduct(product);
    } else {
      sdk.notifier.error('Missing "linkedPimcoreProduct" field in Content Type.');
    }
  };

  return (
    <div style={{ padding: '15px' }}>
      <Heading variant="h3">Pimcore Connector</Heading>
      <Paragraph>Select a product to link in the entry.</Paragraph>
      <PimcorePicker onSelect={onSelect} currentValue={selectedProduct} />
    </div>
  );
};
