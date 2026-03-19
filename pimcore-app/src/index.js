import React from 'react';
import { createRoot } from 'react-dom/client';
import { init, locations } from '@contentful/app-sdk';
import { GlobalStyles } from '@contentful/f36-components';
import { Sidebar } from './locations/Sidebar';
import { Field } from './locations/Field';

init((sdk) => {
  const container = document.getElementById('root');
  const root = createRoot(container);

  const ComponentLocationSettings = [
    {
      location: locations.LOCATION_APP_CONFIG,
      component: null,
    },
    {
      location: locations.LOCATION_ENTRY_SIDEBAR,
      component: <Sidebar sdk={sdk} />,
    },
    {
      location: locations.LOCATION_ENTRY_FIELD,
      component: <Field sdk={sdk} />,
    },
  ];

  ComponentLocationSettings.forEach((at) => {
    if (sdk.location.is(at.location)) {
      root.render(
        <React.Fragment>
          <GlobalStyles />
          {at.component}
        </React.Fragment>
      );
    }
  });
});
