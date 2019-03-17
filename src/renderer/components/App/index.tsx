import * as React from 'react';
import { createGlobalStyle } from 'styled-components';

import { AppBar } from '../AppBar';
import store from '~/renderer/store';
import { Style } from '~/renderer/styles';
import { NavDrawer } from '../NavDrawer';

const GlobalStyle = createGlobalStyle`${Style}`;

export default class App extends React.Component {
  componentDidMount() {
    store.tabsStore.addTab('New tab');
  }

  render() {
    return (
      <React.Fragment>
        <GlobalStyle />
        <NavDrawer />
      </React.Fragment>
    );
  }
}

// <AppBar />
