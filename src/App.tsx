import React, { useReducer } from "react";
import logo from "./logo.svg";
import "./App.css";
import GamePage from "./pages/game";
import { GlobalContext, initialState, reducer } from "./core/globalStore";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      <div className="App">
        <GamePage />
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
