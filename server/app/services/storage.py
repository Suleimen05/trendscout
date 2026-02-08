"""
Supabase Storage Service
Handles image uploads (avatars, thumbnails) to Supabase Storage.
Videos use direct URLs from TikTok/Instagram CDN (no storage needed).
"""

import os
import logging
import requests
from typing import Optional
from io import BytesIO
from supabase import create_client, Client
from datetime import datetime
import hashlib
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Supabase client lazily (don't crash at import if env vars missing)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_supabase_client: Optional[Client] = None

def _get_supabase() -> Optional[Client]:
    """Lazy init Supabase client — only connect when actually needed."""
    global _supabase_client
    if _supabase_client is None:
        url = SUPABASE_URL or os.getenv("SUPABASE_URL")
        key = SUPABASE_KEY or os.getenv("SUPABASE_KEY")
        if not url or not key:
            logger.warning("⚠️  SUPABASE_URL or SUPABASE_KEY not set — storage disabled")
            return None
        _supabase_client = create_client(url, key)
    return _supabase_client

# Storage bucket name
IMAGES_BUCKET = "rizko-images"


class SupabaseStorage:
    """Helper for uploading images to Supabase Storage"""

    @staticmethod
    def _generate_filename(url: str, prefix: str = "image") -> str:
        """Generate unique filename from URL hash"""
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        timestamp = datetime.now().strftime("%Y%m%d")
        extension = "jpg"  # Default to jpg, we'll convert images

        return f"{prefix}/{timestamp}_{url_hash}.{extension}"

    @staticmethod
    def upload_from_url(
        image_url: str,
        folder: str = "avatars",
        max_size_mb: int = 5
    ) -> Optional[str]:
        """
        Download image from URL and upload to Supabase Storage.

        Args:
            image_url: URL of the image to download
            folder: Folder in bucket (avatars, thumbnails, etc)
            max_size_mb: Maximum file size in MB

        Returns:
            Public URL of uploaded image, or None if failed
        """
        try:
            # Download image with proper headers to avoid 403
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.tiktok.com/',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
            response = requests.get(image_url, timeout=10, stream=True, headers=headers)
            response.raise_for_status()

            # Check content length
            content_length = int(response.headers.get('content-length', 0))
            if content_length > max_size_mb * 1024 * 1024:
                logger.warning(f"Image too large: {content_length / 1024 / 1024:.2f}MB")
                return None

            # Read image data
            image_data = BytesIO(response.content)

            # Generate filename
            filename = SupabaseStorage._generate_filename(image_url, folder)

            client = _get_supabase()
            if not client:
                logger.warning("Supabase not configured — skipping upload")
                return None

            # Upload to Supabase Storage
            result = client.storage.from_(IMAGES_BUCKET).upload(
                path=filename,
                file=image_data.getvalue(),
                file_options={
                    "content-type": response.headers.get("content-type", "image/jpeg"),
                    "cache-control": "3600",
                    "upsert": "true"  # Overwrite if exists
                }
            )

            # Get public URL
            public_url = client.storage.from_(IMAGES_BUCKET).get_public_url(filename)

            logger.info(f"✅ Uploaded image to Supabase: {filename}")
            return public_url

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to download image from {image_url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to upload image to Supabase: {e}")
            return None

    @staticmethod
    def upload_avatar(avatar_url: str) -> Optional[str]:
        """Upload user/competitor avatar to Supabase"""
        return SupabaseStorage.upload_from_url(avatar_url, folder="avatars")

    @staticmethod
    def upload_thumbnail(thumbnail_url: str) -> Optional[str]:
        """Upload video thumbnail to Supabase"""
        return SupabaseStorage.upload_from_url(thumbnail_url, folder="thumbnails")

    @staticmethod
    def delete_image(file_path: str) -> bool:
        """Delete image from Supabase Storage"""
        try:
            client = _get_supabase()
            if not client:
                return False
            client.storage.from_(IMAGES_BUCKET).remove([file_path])
            logger.info(f"🗑️ Deleted image from Supabase: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete image: {e}")
            return False


# Check bucket on first use, not at import time
def _ensure_bucket_exists():
    """
    Create bucket if it doesn't exist.
    Called lazily, not at import time.
    """
    client = _get_supabase()
    if not client:
        return

    try:
        buckets = client.storage.list_buckets()
        bucket_names = [b.get("name") or b.get("id") for b in buckets]

        if IMAGES_BUCKET in bucket_names:
            logger.info(f"✅ Bucket '{IMAGES_BUCKET}' exists")
        else:
            try:
                client.storage.from_(IMAGES_BUCKET).list()
                logger.info(f"✅ Bucket '{IMAGES_BUCKET}' exists (verified via list)")
            except:
                logger.warning(f"⚠️ Bucket '{IMAGES_BUCKET}' not found.")
    except Exception as e:
        try:
            client.storage.from_(IMAGES_BUCKET).list()
            logger.info(f"✅ Bucket '{IMAGES_BUCKET}' accessible")
        except:
            logger.warning(f"⚠️ Could not verify bucket: {e}")
