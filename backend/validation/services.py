from .domain import validation_facade

def validate_accounts(api_url, api_key, accounts):
    facade = validation_facade(accounts, api_url, api_key)
    print(f"Validating {len(accounts)} accounts...")
    print(facade)
    