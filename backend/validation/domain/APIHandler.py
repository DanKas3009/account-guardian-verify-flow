# File 1: api/client.py
# Contains classes related to external API communication

import requests

class APIClient:
    """Handles communication with the external validation API"""
    
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key
    
    def validate_account(self, account):
        """Send validation request to API and return response"""
        response = requests.post(
            self.api_url,
            json= {
                    'account_number': account.account_number,
                    'bank_code': account.bank_code,
                },
            headers={'Authorization': f'Bearer {self.api_key}'},
            timeout=10
        )
        return response.json()
