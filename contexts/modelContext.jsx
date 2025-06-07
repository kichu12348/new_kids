import { createContext,useContext,useState,useRef } from "react";

const ModelContext = createContext();

const useModel = () => useContext(ModelContext);

function ModelProvider({ children }) {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const modelRef = useRef(null);

  return (
    <ModelContext.Provider value={{ modelRef,isModelLoading, setIsModelLoading }}>
      {children}
    </ModelContext.Provider>
  );
}

export {ModelProvider, useModel};