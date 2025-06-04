import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import Register from "./Components/Register";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <Provider store={store}>
    <div className="bg-slate-300 min-h-screen flex items-center justify-center">
      <App />
    </div>
  </Provider>
);
