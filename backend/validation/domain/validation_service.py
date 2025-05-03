# services/validation_service.py

from ..models import BankAccountValidation, BankAccountDetail
from APIHandler import APIClient
from Task_manager import TaskQueue, ResultCollector
from validation_worker import WorkerPool

class ResultProcessor:
    """Processes validation results and prepares database updates"""
    
    @staticmethod
    def process_results(results):
        """Process results and return objects ready for database update"""
        valid_results = []
        invalid_results = []
        processed_count = 0
        
        for result in results:
            processed_count += 1
            if 'error' not in result:
                valid_results.append({
                    'id': result['id'],
                    'is_valid': result['is_valid'],
                    'api_response': result['api_response']
                })
            else:
                invalid_results.append({
                    'id': result['id'],
                    'error': result['error']
                })
                
        return valid_results, processed_count, invalid_results


class AccountValidationService:
    """Main service orchestrating the validation process"""
    
    def __init__(self, api_url, api_key, max_workers=5):
        self.task_queue = TaskQueue()
        self.result_collector = ResultCollector()
        self.api_client = APIClient(api_url, api_key)
        self.worker_pool = WorkerPool(
            self.task_queue,
            self.result_collector,
            self.api_client,
            max_workers
        )
        self.result_processor = ResultProcessor()
    
    def validate_accounts(self, accounts):
        """Run the validation process for a list of accounts"""
        # Enqueue tasks
        for account in accounts:
            self.task_queue.add_task(account)
        
        # Start worker threads
        self.worker_pool.start_workers()
        
        # Add termination signals
        self.worker_pool.add_termination_signals()
        
        # Wait for all tasks to complete
        self.task_queue.wait_for_completion()
        
        # Process results
        results = self.result_collector.get_all_results()
        valid_results, total_processed, invalid_results = self.result_processor.process_results(results)
        
        # Update database using Django's ORM capabilities
        self._update_database(valid_results)
        
        # Handle invalid results
        self._handle_invalid_results(invalid_results)
        
        return total_processed
    
    def _update_database(self, valid_results):
        """Update database with validation results using Django's ORM"""
        updates = []
        for result in valid_results:
            # Get existing validation record
            validation = BankAccountValidation.objects.get(id=result['id'])
            
            # Update validation fields
            validation.is_valid = result['is_valid']
            validation.api_response = result['api_response']
            updates.append(validation)
            
            # Process account details if valid
            if result['is_valid'] and result['api_response']:
                self._create_or_update_account_details(validation, result['api_response'])
        
        # Use Django's bulk update for validation records
        if updates:
            BankAccountValidation.objects.bulk_update(
                updates,
                fields=['is_valid', 'api_response'],
                batch_size=100
            )
    
    def _create_or_update_account_details(self, validation, api_response):
        """Create or update the detailed bank account information"""
        # Skip if response is empty
        if not api_response or api_response == {}:
            return
            
        # Extract fields from API response with proper case conversion
        account_detail_data = {
            'account_number': api_response.get('accountNumber', ''),
            'bank_code': api_response.get('bankCode', ''),
            'status': api_response.get('status', 'Pending'),
            'account_holder_name': api_response.get('accountHolderName', ''),
            'bank_name': api_response.get('bankName', ''),
            'currency': api_response.get('currency', 'KES')
        }
        
        # Create or update account details
        try:
            account_detail, created = BankAccountDetail.objects.update_or_create(
                validation=validation,
                defaults=account_detail_data
            )
        except Exception as e:
            # Log error but don't block the process
            print(f"Error updating account details for validation {validation.id}: {str(e)}")
    
    def _handle_invalid_results(self, invalid_results):
        """Handle accounts that failed validation due to errors"""
        if invalid_results:
            for result in invalid_results:
                try:
                    # Update validation record
                    validation = BankAccountValidation.objects.get(id=result['id'])
                    validation.is_valid = False
                    validation.api_response = {'error': result['error']}
                    validation.save()
                    
                    # Create or update account detail with error status
                    try:
                        BankAccountDetail.objects.update_or_create(
                            validation=validation,
                            defaults={
                                'account_number': validation.account_number,
                                'bank_code': '',
                                'status': 'Error',
                                'account_holder_name': '',
                                'bank_name': '',
                                'currency': 'KES'
                            }
                        )
                    except Exception as detail_error:
                        # Log secondary error but continue processing
                        print(f"Error creating detail record for invalid account {validation.id}: {str(detail_error)}")
                        
                except Exception as e:
                    # Log primary error
                    print(f"Error processing invalid result {result['id']}: {str(e)}")

    def _str_(self):
        return f"AccountValidationService(api_url={self.api_client.api_url}, max_workers={self.worker_pool.max_workers})"