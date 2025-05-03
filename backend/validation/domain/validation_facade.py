# File 5: validation_facade.py
# Simple facade for backward compatibility

from .validation_service import AccountValidationService

def validate_accounts(accounts, api_url, api_key, max_workers=5):
    """Legacy wrapper function to maintain compatibility"""
    service = AccountValidationService(api_url, api_key, max_workers)
    return service.validate_accounts(accounts)