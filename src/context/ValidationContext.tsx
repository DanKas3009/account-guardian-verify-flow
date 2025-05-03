
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  ValidationResult, 
  ValidatedAccount, 
  ValidationStatus,
  FileUploadResponse
} from "@/types/validation";
import { API_SERVICE } from "@/services/apiService";

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

  // Poll for job status when processing
  useEffect(() => {
    let pollingInterval: any = null;
    
    if (state.status === "processing" && state.currentJobId) {
      pollingInterval = setInterval(async () => {
        try {
          const statusResponse = await API_SERVICE.getJobStatus(state.currentJobId!);
          
          // Update progress
          setProgress(statusResponse.progress);
          
          // Check if completed
          if (statusResponse.status === "completed") {
            clearInterval(pollingInterval);
            
            // Get final results
            const results = await API_SERVICE.getValidationResults(state.currentJobId!);
            setResults(results);
          } 
          // Check if failed
          else if (statusResponse.status === "failed") {
            clearInterval(pollingInterval);
            setError(`Validation failed: ${statusResponse.message}`);
          }
        } catch (err) {
          console.error("Error polling job status:", err);
          // Don't stop polling on error, just log it
        }
      }, 2000); // Poll every 2 seconds
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [state.status, state.currentJobId]);

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
