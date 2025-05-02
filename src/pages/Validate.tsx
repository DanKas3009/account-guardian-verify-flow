
import React, { useState, useEffect } from "react";
import NavLayout from "@/components/layout/NavLayout";
import FileUploader from "@/components/upload/FileUploader";
import ValidationSummary from "@/components/results/ValidationSummary";
import AccountsTable from "@/components/results/AccountsTable";
import ErrorBreakdown from "@/components/results/ErrorBreakdown";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { validationService } from "@/services/validationService";
import { useValidation } from "@/context/ValidationContext";
import { toast } from "@/components/ui/sonner";

const Validate: React.FC = () => {
  const { 
    status, 
    progress, 
    results, 
    error,
    currentJobId,
    setStatus,
    setJobId,
    setProgress,
    setResults,
    setError,
    reset
  } = useValidation();
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setStatus("uploading");
      setProgress(0);
      setError(null);
      
      // Simulate progressive upload
      const uploadInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(uploadInterval);
            return 95;
          }
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 300);
      
      // Upload file
      const response = await validationService.uploadFile(file);
      clearInterval(uploadInterval);
      setProgress(100);
      setJobId(response.jobId);
      
      toast.success("File uploaded successfully!");
      
      // Start processing
      await simulateProcessing(response.jobId);
      
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error("Failed to upload file");
    }
  };
  
  // Simulate processing the validation job
  const simulateProcessing = async (jobId: string) => {
    setStatus("processing");
    
    try {
      // Get validation results (this would be a polling mechanism in a real app)
      const results = await validationService.getValidationResults(jobId);
      setResults(results);
      toast.success("Validation completed!");
    } catch (err) {
      setError(`Validation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      toast.error("Validation process failed");
    }
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    if (!results) return;
    
    const csvContent = validationService.exportToCSV(results.accounts);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `validation-results-${results.jobId}.csv`);
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV file downloaded successfully");
  };

  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Account Validation</h1>
          <p className="text-gray-500 mt-1">
            Upload a file containing bank account details for bulk validation.
          </p>
        </div>
        
        {status === "idle" || status === "error" ? (
          <div className="max-w-2xl mx-auto my-8">
            <FileUploader 
              onFileUpload={handleFileUpload} 
              isUploading={status === "uploading"} 
              progress={progress}
            />
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : status === "uploading" ? (
          <div className="max-w-2xl mx-auto my-8">
            <FileUploader 
              onFileUpload={handleFileUpload} 
              isUploading={true} 
              progress={progress}
            />
          </div>
        ) : status === "processing" ? (
          <div className="max-w-2xl mx-auto my-12 text-center space-y-4">
            <div className="animate-pulse-opacity">
              <div className="inline-block p-4 rounded-full bg-pesalink-100">
                <svg className="w-10 h-10 text-pesalink-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V6M12 18V20M6 12H4M20 12H18M18.364 5.63604L16.95 7.05025M7.05025 16.95L5.63604 18.364M16.95 16.95L18.364 18.364M7.05025 7.05025L5.63604 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-medium">Processing Your Data</h2>
            <p className="text-gray-500">
              We're validating your account data. This may take a few moments...
            </p>
          </div>
        ) : results ? (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-medium">Validation Results</h2>
              <div className="flex gap-2">
                <Button onClick={handleExportCSV}>Export CSV</Button>
                <Button variant="outline" onClick={reset}>Validate Another File</Button>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <ValidationSummary summary={results.summary} />
              <ErrorBreakdown accounts={results.accounts} />
            </div>
            
            {/* Accounts Table */}
            <div>
              <h3 className="text-lg font-medium mb-4">Account Details</h3>
              <AccountsTable accounts={results.accounts} />
            </div>
          </div>
        ) : null}
      </div>
    </NavLayout>
  );
};

export default Validate;
