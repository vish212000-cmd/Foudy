from django.db import models
from core.models import BaseModel
from django.conf import settings

class MediaFile(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='media_files')
    file_path = models.CharField(max_length=500)
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100)

    def __str__(self):
        return f"Media {self.id} for {self.user}"
