import React from "react";
import Clicker from "./components/Clicker";

export default function App() {
  return React.createElement(
    "div",
    { className: "app-wrapper" },
    React.createElement(Clicker)
  );
}
