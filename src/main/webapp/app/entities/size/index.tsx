import React from 'react';
import { Switch } from 'react-router-dom';

import ErrorBoundaryRoute from 'app/shared/error/error-boundary-route';

import Size from './size';
import SizeDetail from './size-detail';
import SizeUpdate from './size-update';
import SizeDeleteDialog from './size-delete-dialog';

const Routes = ({ match }) => (
  <>
    <Switch>
      <ErrorBoundaryRoute exact path={`${match.url}/new`} component={SizeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id/edit`} component={SizeUpdate} />
      <ErrorBoundaryRoute exact path={`${match.url}/:id`} component={SizeDetail} />
      <ErrorBoundaryRoute path={match.url} component={Size} />
    </Switch>
    <ErrorBoundaryRoute path={`${match.url}/:id/delete`} component={SizeDeleteDialog} />
  </>
);

export default Routes;
