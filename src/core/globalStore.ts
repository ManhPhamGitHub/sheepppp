import React, { createContext, useReducer, useContext } from "react";
import { defaultGameConfig } from "./gameConfig";

// Define types
interface GameConfigType {
  // 槽容量
  slotNum: number;
  // 需要多少个一样块的才能合成
  composeNum: number;
  // 动物类别数
  typeNum: number;
  // 每层块数（大致）
  levelBlockNum: number;
  // 边界收缩步长
  borderStep: number;
  // 总层数（最小为 2）
  levelNum: number;
  // 随机区块数（数组长度代表随机区数量，值表示每个随机区生产多少块）
  randomBlocks: number[];
  // 动物数组
  animals: string[];
  // 最上层块数（已废弃）
  // topBlockNum: 40,
  // 最下层块数最小值（已废弃）
  // minBottomBlockNum: 20,
}

// Define initial state
export const initialState = {
  customConfig: { ...defaultGameConfig },
  gameConfig: { ...defaultGameConfig },
};

// Define actions
type Action =
  | { type: "SET_GAME_CONFIG"; payload: GameConfigType }
  | { type: "SET_CUSTOM_CONFIG"; payload: GameConfigType }
  | { type: "RESET" };

// Define reducer function
export const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case "SET_GAME_CONFIG":
      return { ...state, gameConfig: action.payload };
    case "SET_CUSTOM_CONFIG":
      return { ...state, customConfig: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
};

// // Create context
// const GlobalContext = createContext<
//   | {
//       state: typeof initialState;
//       dispatch: React.Dispatch<Action>;
//     }
//   | undefined
// >(undefined);

// // Create provider
// export const GlobalProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(reducer, initialState);

//   return (
//     <GlobalContext.Provider value={{ state, dispatch }}>
//       {children}
//     </GlobalContext.Provider>
//   );
// };

// // Create custom hook for using the context
// export const useGlobalStore = () => {
//   const context = useContext(GlobalContext);
//   if (!context) {
//     throw new Error("useGlobalStore must be used within a GlobalProvider");
//   }
//   return context;
// };

// Create context
export const GlobalContext = createContext<
  | {
      state: typeof initialState;
      dispatch: React.Dispatch<Action>;
    }
  | undefined
>(undefined);

// Create custom hook for using the context
export const useGlobalStore = () => {
  const context = useContext(GlobalContext);
  console.log("context", context);

  if (!context) {
    throw new Error("useGlobalStore must be used within a GlobalProvider");
  }
  return context;
};
