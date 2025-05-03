
import axios from "axios";
import { Account, ValidatedAccount, ValidationResult } from "@/types/validation";

const API_BASE_URL = "https://account-validation-service.dev.pesalink.co.ke";

export const API_SERVICE = {
  // Upload bulk validation file
  async uploadValidationFile(file: File): Promise<{ jobId: string; message: string }> {
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/accounts/validate/bulk`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      return {
        jobId: response.data.jobId || response.data.id,
        message: response.data.message || "File uploaded successfully"
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },
  
  // Get validation job status
  async getJobStatus(jobId: string): Promise<{
    status: string;
    progress: number;
    message: string;
  }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/accounts/validate/status/${jobId}`);
      return {
        status: response.data.status,
        progress: response.data.progress || 0,
        message: response.data.message
      };
    } catch (error) {
      console.error("Error fetching job status:", error);
      throw error;
    }
  },
  
  // Get validation results
  async getValidationResults(jobId: string): Promise<ValidationResult> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/accounts/validate/results/${jobId}`);
      
      // Transform API response to match our ValidationResult type
      const accounts: ValidatedAccount[] = response.data.accounts.map((account: any) => ({
        accountNumber: account.accountNumber,
        bankCode: account.bankCode,
        accountName: account.accountName || "",
        status: account.isValid ? "valid" : "invalid",
        errorCode: account.errorCode || "",
        errorMessage: account.errorMessage || ""
      }));
      
      const validAccounts = accounts.filter(acc => acc.status === "valid");
      const invalidAccounts = accounts.filter(acc => acc.status === "invalid");
      const unknownAccounts = accounts.filter(acc => acc.status === "unknown");
      
      return {
        jobId,
        timestamp: response.data.timestamp || new Date().toISOString(),
        summary: {
          total: accounts.length,
          valid: validAccounts.length,
          invalid: invalidAccounts.length,
          unknown: unknownAccounts.length
        },
        accounts
      };
    } catch (error) {
      console.error("Error fetching validation results:", error);
      throw error;
    }
  },
  
  // Validate a single account
  async validateSingleAccount(account: Account): Promise<ValidatedAccount> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/accounts/validate`, {
        accountNumber: account.accountNumber,
        bankCode: account.bankCode
      });
      
      return {
        ...account,
        status: response.data.isValid ? "valid" : "invalid",
        errorCode: response.data.errorCode || "",
        errorMessage: response.data.errorMessage || ""
      };
    } catch (error) {
      console.error("Error validating account:", error);
      
      return {
        ...account,
        status: "unknown",
        errorCode: "API_ERROR",
        errorMessage: "Failed to validate account"
      };
    }
  }
};
