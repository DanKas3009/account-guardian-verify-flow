from django.db import models

class BankAccountValidation(models.Model):
    """Basic model to track validation status"""
    account_number = models.CharField(max_length=100, db_index=True)
    bank_Code = models.CharField(max_length=50, db_index=True) 
    is_valid = models.BooleanField(default=False, db_index=True)
    api_response = models.JSONField(default=dict)
    validation_date = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_number} - {'Valid' if self.is_valid else 'Invalid'}"


class BankAccountDetail(models.Model):
    """Detailed model to store validated bank account information"""
    ACCOUNT_STATUS_CHOICES = [
        ('Valid', 'Valid'),
        ('Invalid', 'Invalid'),
        ('Pending', 'Pending'),
        ('Error', 'Error'),
    ]
    
    CURRENCY_CHOICES = [
        ('KES', 'Kenyan Shilling'),
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
        ('GBP', 'British Pound'),
        # Add other currencies as needed
    ]
    
    # Link to the validation record
    validation = models.OneToOneField(
        BankAccountValidation, 
        on_delete=models.CASCADE,
        related_name='account_detail'
    )
    
    # Fields from the API response
    account_number = models.CharField(max_length=100)
    bank_code = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=ACCOUNT_STATUS_CHOICES, default='Pending')
    account_holder_name = models.CharField(max_length=255, blank=True, null=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='KES')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.account_holder_name} - {self.account_number}"
    
    class Meta:
        verbose_name = "Bank Account Detail"
        verbose_name_plural = "Bank Account Details"
        indexes = [
            models.Index(fields=['account_number']),
            models.Index(fields=['bank_code']),
        ]