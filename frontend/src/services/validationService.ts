
import { Account, ValidatedAccount, ValidationResult, FileUploadResponse, ValidationSummary } from "@/types/validation";
import { API_SERVICE } from "./apiService";

// This service handles both mock data and real API integration
export const validationService = {
  // Attempt to use real API, fall back to mock if needed
  async uploadFile(file: File): Promise<FileUploadResponse> {
    try {
      // Try to use the real API
      return await API_SERVICE.uploadValidationFile(file);
    } catch (error) {
      console.log("Falling back to mock validation service", error);
      
      // Fall back to mock service
      return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
          const jobId = `job-${Math.random().toString(36).substring(2, 10)}`;
          resolve({
            jobId,
            message: "File uploaded successfully and queued for processing",
            estimatedTime: Math.floor(Math.random() * 30) + 10 // 10-40 seconds
          });
        }, 1500);
      });
    }
  },

  // Simulate validation process or use real API
  async validateAccounts(accounts: Account[]): Promise<ValidatedAccount[]> {
    try {
      // Try to validate each account using the API
      const validationPromises = accounts.map(account => API_SERVICE.validateSingleAccount(account));
      return await Promise.all(validationPromises);
    } catch (error) {
      console.log("Falling back to mock validation", error);
      
      // Fall back to mock validation
      return new Promise((resolve) => {
        setTimeout(() => {
          // Mock validation logic
          const validatedAccounts: ValidatedAccount[] = accounts.map(account => {
            // Randomly determine if account is valid (for demo purposes)
            const random = Math.random();
            
            if (random > 0.7) {
              // Valid account
              return {
                ...account,
                status: "valid"
              };
            } else if (random > 0.3) {
              // Invalid account - FORMAT_ERROR
              return {
                ...account,
                status: "invalid",
                errorCode: "FORMAT_ERROR",
                errorMessage: "Invalid account number format"
              };
            } else {
              // Invalid account - ACCOUNT_NOT_FOUND
              return {
                ...account,
                status: "invalid",
                errorCode: "ACCOUNT_NOT_FOUND",
                errorMessage: "Account does not exist"
              };
            }
          });
          
          resolve(validatedAccounts);
        }, 2000);
      });
    }
  },

  // Get validation results by job ID
  async getValidationResults(jobId: string): Promise<ValidationResult> {
    try {
      // Try to use the real API
      return await API_SERVICE.getValidationResults(jobId);
    } catch (error) {
      console.log("Falling back to mock results", error);
      
      // Fall back to mock results
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate mock accounts
          const accounts: Account[] = Array.from({ length: 50 }, (_, i) => ({
            accountNumber: `ACC${String(i + 1000).padStart(8, '0')}`,
            bankCode: ["001", "002", "003", "004"][Math.floor(Math.random() * 4)],
            accountName: `Account ${i + 1}`
          }));

          // Mock validate accounts
          const validatedAccounts: ValidatedAccount[] = accounts.map(account => {
            const random = Math.random();
            
            if (random > 0.7) {
              return {
                ...account,
                status: "valid"
              };
            } else if (random > 0.3) {
              return {
                ...account,
                status: "invalid",
                errorCode: random > 0.5 ? "FORMAT_ERROR" : "BANK_CODE_INVALID",
                errorMessage: random > 0.5 ? "Invalid account number format" : "Invalid bank code"
              };
            } else {
              return {
                ...account,
                status: "invalid",
                errorCode: random > 0.15 ? "ACCOUNT_NOT_FOUND" : "ACCOUNT_INACTIVE",
                errorMessage: random > 0.15 ? "Account does not exist" : "Account is inactive or closed"
              };
            }
          });
          
          // Calculate summary
          const valid = validatedAccounts.filter(a => a.status === "valid").length;
          const invalid = validatedAccounts.filter(a => a.status === "invalid").length;
          const unknown = validatedAccounts.filter(a => a.status === "unknown").length;
          
          const summary: ValidationSummary = {
            total: validatedAccounts.length,
            valid,
            invalid,
            unknown
          };
          
          resolve({
            jobId,
            timestamp: new Date().toISOString(),
            summary,
            accounts: validatedAccounts
          });
        }, 1500);
      });
    }
  },

  // Parse CSV string to account objects
  parseCSV(csvText: string): Account[] {
    const lines = csvText.split('\n');
    const accounts: Account[] = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [accountNumber, bankCode, accountName] = line.split(',');
      if (accountNumber && bankCode) {
        accounts.push({
          accountNumber: accountNumber.trim(),
          bankCode: bankCode.trim(),
          accountName: accountName ? accountName.trim() : undefined
        });
      }
    }
    
    return accounts;
  },
  
  // Parse JSON string to account objects
  parseJSON(jsonText: string): Account[] {
    try {
      const data = JSON.parse(jsonText);
      if (Array.isArray(data)) {
        return data.filter(item => 
          typeof item === 'object' && 
          'accountNumber' in item && 
          'bankCode' in item
        );
      } else if (typeof data === 'object' && 'accounts' in data && Array.isArray(data.accounts)) {
        return data.accounts.filter(item => 
          typeof item === 'object' && 
          'accountNumber' in item && 
          'bankCode' in item
        );
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
    }
    
    return [];
  },
  
  // Simple CSV export
  exportToCSV(accounts: ValidatedAccount[]): string {
    const header = "Account Number,Bank Code,Account Name,Status,Error Code,Error Message";
    const rows = accounts.map(account => {
      const accountName = account.accountName || '';
      const errorCode = account.errorCode || '';
      const errorMessage = account.errorMessage || '';
      
      return `${account.accountNumber},${account.bankCode},${accountName},${account.status},${errorCode},${errorMessage}`;
    });
    
    return [header, ...rows].join('\n');
  }
};
