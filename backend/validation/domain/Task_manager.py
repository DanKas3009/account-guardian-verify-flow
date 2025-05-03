# File 2: queues/task_management.py
# Contains classes related to task and result queue management

from queue import Queue

class TaskQueue:
    """Manages the queue of accounts to be validated"""
    
    def __init__(self):
        self.queue = Queue()
    
    def add_task(self, account):
        """Add an account to the validation queue"""
        self.queue.put(account)
    
    def add_termination_signal(self):
        """Add termination signal to queue"""
        self.queue.put(None)
    
    def get_task(self):
        """Get next account from queue"""
        return self.queue.get()
    
    def mark_task_done(self):
        """Mark current task as completed"""
        self.queue.task_done()
    
    def wait_for_completion(self):
        """Wait for all tasks to complete"""
        self.queue.join()


class ResultCollector:
    """Collects and manages validation results"""
    
    def __init__(self):
        self.queue = Queue()
    
    def add_result(self, result):
        """Add a validation result"""
        self.queue.put(result)
    
    def get_all_results(self):
        """Retrieve all collected results"""
        results = []
        while not self.queue.empty():
            results.append(self.queue.get())
        return results

