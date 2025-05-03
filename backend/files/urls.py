from django.urls import path

from .views import  FileUploadView, BulkAccountValidationView
    

    
urlpatterns = [
    
    path('upload/', FileUploadView.as_view(), name='file_upload'),     
    path('bulk-validate/', BulkAccountValidationView.as_view(), name='bulk_account_validation'),
]