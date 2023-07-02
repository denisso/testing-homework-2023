import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Router } from "react-router-dom";
import { Application } from "../../../src/client/Application";
import { createMemoryHistory } from "history";
import store from "./store"
import { basename } from "./ExampleApiMock";

export const history = createMemoryHistory();

const application = (
    <BrowserRouter basename={basename}>
      <Router history={history}>
        <Provider store={store}>
          <Application />
        </Provider>
      </Router>
    </BrowserRouter>
  );


export default application;
