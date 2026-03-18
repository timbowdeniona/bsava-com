import React from 'react';
import { render } from 'react-dom';
import { init, locations } from '@contentful/app-sdk';
import { GlobalStyles } from '@contentful/f36-components';
import { Sidebar } from './locations/Sidebar';
import { Field } from './locations/Field';

init((sdk) => {
  const root = document.getElementById('root');

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
      render(
        <React.Fragment>
          <GlobalStyles />
          {at.component}
        </React.Fragment>,
        root
      );
    }
  });
});
