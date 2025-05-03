
export type AccountStatus = "valid" | "invalid" | "unknown";

export interface Account {
  accountNumber: string;
  bankCode: string;
  accountName?: string;
}

export interface ValidatedAccount extends Account {
  status: AccountStatus;
  errorCode?: string;
  errorMessage?: string;
}

export interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  unknown: number;
}

export interface ValidationResult {
  jobId: string;
  timestamp: string;
  summary: ValidationSummary;
  accounts: ValidatedAccount[];
}

export interface FileUploadResponse {
  jobId: string;
  message: string;
  estimatedTime?: number;
}

export type ValidationStatus = "idle" | "uploading" | "processing" | "completed" | "error";

export type FileType = "csv" | "json" | "xml" | "unknown";

export interface ErrorCode {
  code: string;
  description: string;
}

export const ERROR_CODES: Record<string, string> = {
  "FORMAT_ERROR": "Invalid account number format",
  "BANK_CODE_INVALID": "Invalid bank code",
  "ACCOUNT_NOT_FOUND": "Account does not exist",
  "ACCOUNT_INACTIVE": "Account is inactive or closed",
  "API_TIMEOUT": "Validation service timeout",
  "API_ERROR": "Validation service error",
};
