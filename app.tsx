import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "./src/store";

export default function App() {
  return (
    <Provider store={store}>
      <Stack />
    </Provider>
  );
}
