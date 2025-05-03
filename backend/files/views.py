from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views import View
import csv
import json
import xml.etree.ElementTree as ET
from io import TextIOWrapper
import requests
from concurrent.futures import ThreadPoolExecutor
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class FileUploadView(View):
    def get(self, request):
        """Return sample response structure for GET requests"""
        sample_data = [
            {"accountNumber": "12345678", "bankCode": "01", "status": "VALID"},
            {"accountNumber": "INVALID123", "bankCode": "99", "status": "INVALID", "error": "Invalid bank code"}
        ]
        
        return JsonResponse({
            "message": "POST a file to this endpoint for validation",
            "supported_formats": ["csv", "json", "xml"],
            "expected_structure": {
                "csv": "accountNumber,bankCode\n12345678,01",
                "json": json.dumps(sample_data),
                "xml": "<accounts><account><accountNumber>12345678</accountNumber><bankCode>01</bankCode></account></accounts>"
            },
            "sample_response": {
                "file_info": {"name": "example.csv", "type": "csv", "size": "2 records"},
                "validation_results": sample_data,
                "summary": {"total": 2, "valid": 1, "invalid": 1}
            }
        })
    
    def post(self, request):
        """Process uploaded file and return extracted data as JSON"""
        if not request.FILES:
            return JsonResponse({"error": "No file provided"}, status=400)
        
        uploaded_file = request.FILES['file']
        file_type = uploaded_file.name.split('.')[-1].lower()
        
        try:
            # Process the file based on its type
            processor = {
                'csv': self._process_csv,
                'json': self._process_json,
                'xml': self._process_xml
            }.get(file_type)
            
            if not processor:
                return JsonResponse({"error": f"Unsupported file type: {file_type}"}, status=400)
            
            records = processor(uploaded_file)
            
            # Return the extracted data in consistent JSON format
            return JsonResponse({
                "file_info": {
                    "name": uploaded_file.name,
                    "type": file_type,
                    "size": f"{len(records)} records"
                },
                "extracted_data": records,
                "processing_summary": {
                    "status": "success",
                    "records_processed": len(records)
                }
            })
            
        except Exception as e:
            return JsonResponse({
                "error": "File processing failed",
                "details": str(e),
                "status": "error"
            }, status=400)
    
    def _process_csv(self, file):
        """Extract data from CSV file"""
        records = []
        csv_file = TextIOWrapper(file, encoding='utf-8')
        reader = csv.DictReader(csv_file)
        for row in reader:
            records.append({k: v.strip() for k, v in row.items()})
        return records
    
    def _process_json(self, file):
        """Extract data from JSON file"""
        return json.load(file)
    
    def _process_xml(self, file):
        """Extract data from XML file"""
        records = []
        tree = ET.parse(file)
        root = tree.getroot()
        
        for account in root.findall('account'):
            record = {
                'accountNumber': account.find('accountNumber').text.strip(),
                'bankCode': account.find('bankCode').text.strip()
            }
            # Add any optional fields
            for child in account:
                if child.tag not in ['accountNumber', 'bankCode']:
                    record[child.tag] = child.text.strip() if child.text else None
            records.append(record)
        
        return records
    
    


VALIDATION_API_URL = "https://account-validation-service.dev.pesalink.co.ke/api/validate"
BATCH_SIZE = 10  # Number of accounts to validate in each batch

@method_decorator(csrf_exempt, name='dispatch')
class BulkAccountValidationView(View):
    def post(self, request):
        """Process extracted account data and validate against external API"""
        try:
            data = json.loads(request.body)
            extracted_data = data.get('extracted_data', [])
            
            if not extracted_data:
                return JsonResponse({"error": "No account data provided"}, status=400)
            
            # Validate accounts in parallel batches
            validation_results = self._validate_accounts_in_batches(extracted_data)
            
            # Categorize results
            valid_results = []
            invalid_results = []
            
            for result in validation_results:
                if result.get('status', '').lower() == 'valid':
                    valid_results.append(result)
                else:
                    invalid_results.append({
                        "accountNumber": result.get('accountNumber'),
                        "bankCode": result.get('bankCode'),
                        "error": "Invalid account"
                    })
            
            return JsonResponse({
                "processed_count": len(validation_results),
                "valid": len(valid_results),
                "invalid": len(invalid_results),
                "valid_results": valid_results,
                "invalid_results": invalid_results,
                "status": "completed"
            })
            
        except Exception as e:
            return JsonResponse({
                "error": "Bulk validation failed",
                "details": str(e),
                "status": "error"
            }, status=500)
    
    def _validate_single_account(self, account):
        """Validate a single account against the external API"""
        try:
            payload = {
                "accountNumber": account.get("Account Number") or account.get("accountNumber"),
                "bankCode": account.get("Bank Code") or account.get("bankCode")
            }
            
            response = requests.post(
                VALIDATION_API_URL,
                json=payload,
                timeout=5
            )
            
            # Handle response
            if response.status_code == 200:
                response_data = response.json()
                if response_data:  # Valid account
                    return {
                        "accountNumber": payload["accountNumber"],
                        "bankCode": payload["bankCode"],
                        "status": "Valid",
                        "accountHolderName": response_data.get("accountHolderName", ""),
                        "bankName": response_data.get("bankName", ""),
                        "currency": response_data.get("currency", "KES")
                    }
                else:  # Invalid account (200 but empty response)
                    return {
                        "accountNumber": payload["accountNumber"],
                        "bankCode": payload["bankCode"],
                        "status": "Invalid",
                        "error": "Account not found"
                    }
            else:
                return {
                    "accountNumber": payload["accountNumber"],
                    "bankCode": payload["bankCode"],
                    "status": "Error",
                    "error": f"API error: {response.status_code}"
                }
                
        except requests.exceptions.RequestException as e:
            return {
                "accountNumber": account.get("Account Number") or account.get("accountNumber"),
                "bankCode": account.get("Bank Code") or account.get("bankCode"),
                "status": "Error",
                "error": str(e)
            }
    
    def _validate_accounts_in_batches(self, accounts):
        """Validate accounts in parallel batches"""
        results = []
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Process accounts in batches to avoid rate limiting
            for i in range(0, len(accounts), BATCH_SIZE):
                batch = accounts[i:i + BATCH_SIZE]
                batch_results = list(executor.map(self._validate_single_account, batch))
                results.extend(batch_results)
        return results