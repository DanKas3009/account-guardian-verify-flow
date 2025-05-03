# File 3: workers/validation_workers.py
# Contains worker classes that process validations

import threading

class ValidationWorker(threading.Thread):
    """Worker that processes account validations"""
    
    def __init__(self, task_queue, result_collector, api_client):
        threading.Thread.__init__(self)
        self.task_queue = task_queue
        self.result_collector = result_collector
        self.api_client = api_client
    
    def run(self):
        while True:
            account = self.task_queue.get_task()
            if account is None:  # Termination signal
                self.task_queue.mark_task_done()
                break
                
            try:
                # Validate via API
                api_response = self.api_client.validate_account(account.account_number)
                is_valid = api_response.get('is_valid', False)
                
                # Store results
                self.result_collector.add_result({
                    'id': account.id,
                    'is_valid': is_valid,
                    'api_response': api_response
                })
            except Exception as e:
                self.result_collector.add_result({
                    'id': account.id,
                    'error': str(e)
                })
            finally:
                self.task_queue.mark_task_done()


class WorkerPool:
    """Manages a pool of validation workers"""
    
    def __init__(self, task_queue, result_collector, api_client, max_workers=5):
        self.task_queue = task_queue
        self.result_collector = result_collector
        self.api_client = api_client
        self.max_workers = max_workers
        self.workers = []
    
    def start_workers(self):
        """Create and start worker threads"""
        for _ in range(self.max_workers):
            worker = ValidationWorker(
                self.task_queue, 
                self.result_collector,
                self.api_client
            )
            worker.start()
            self.workers.append(worker)
    
    def add_termination_signals(self):
        """Add termination signals for all workers"""
        for _ in range(self.max_workers):
            self.task_queue.add_termination_signal()

