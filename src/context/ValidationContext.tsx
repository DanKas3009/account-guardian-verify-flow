
import React, { createContext, useContext, useReducer, useState } from "react";
import { 
  ValidationResult, 
  ValidatedAccount, 
  ValidationStatus,
  FileUploadResponse
} from "@/types/validation";

interface ValidationState {
  status: ValidationStatus;
  currentJobId: string | null;
  progress: number;
  results: ValidationResult | null;
  error: string | null;
}

interface ValidationContextType extends ValidationState {
  setStatus: (status: ValidationStatus) => void;
  setJobId: (jobId: string) => void;
  setProgress: (progress: number) => void;
  setResults: (results: ValidationResult) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: ValidationState = {
  status: "idle",
  currentJobId: null,
  progress: 0,
  results: null,
  error: null
};

const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

export const ValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ValidationState>(initialState);

  const setStatus = (status: ValidationStatus) => {
    setState(prev => ({ ...prev, status }));
  };

  const setJobId = (jobId: string) => {
    setState(prev => ({ ...prev, currentJobId: jobId }));
  };

  const setProgress = (progress: number) => {
    setState(prev => ({ ...prev, progress }));
  };

  const setResults = (results: ValidationResult) => {
    setState(prev => ({ ...prev, results, status: "completed" }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, status: error ? "error" : prev.status }));
  };

  const reset = () => {
    setState(initialState);
  };

  return (
    <ValidationContext.Provider
      value={{
        ...state,
        setStatus,
        setJobId,
        setProgress,
        setResults,
        setError,
        reset
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};

export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (context === undefined) {
    throw new Error("useValidation must be used within a ValidationProvider");
  }
  return context;
};
