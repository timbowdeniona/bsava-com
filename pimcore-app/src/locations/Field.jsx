import React, { useState, useEffect } from 'react';
import PimcorePicker from '../components/PimcorePicker';

export const Field = ({ sdk }) => {
  const [value, setValue] = useState(sdk.field.getValue() || null);

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  const onSelect = (product) => {
    // Requirements: store {id, sku, title}
    sdk.field.setValue(product);
    setValue(product);
  };

  return <PimcorePicker onSelect={onSelect} currentValue={value} />;
};
