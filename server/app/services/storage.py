"""
Supabase Storage Service
Handles image uploads (avatars, thumbnails) to Supabase Storage.
Videos use direct URLs from TikTok/Instagram CDN (no storage needed).
"""

import os
import logging
import requests
from typing import Optional, Tuple
from io import BytesIO
from supabase import create_client, Client
from datetime import datetime
import hashlib
from dotenv import load_dotenv
from PIL import Image

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Register HEIC/HEIF support for Pillow (TikTok CDN sometimes returns HEIC)
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    logger.info("[OK] HEIC/HEIF support registered via pillow-heif")
except ImportError:
    logger.warning("[WARNING] pillow-heif not installed -- HEIC images won't be converted")

# Initialize Supabase client lazily (don't crash at import if env vars missing)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

_supabase_client: Optional[Client] = None

def _get_supabase() -> Optional[Client]:
    """Lazy init Supabase client -- only connect when actually needed."""
    global _supabase_client
    if _supabase_client is None:
        url = SUPABASE_URL or os.getenv("SUPABASE_URL")
        key = SUPABASE_KEY or os.getenv("SUPABASE_KEY")
        if not url or not key:
            logger.warning("[WARNING] SUPABASE_URL or SUPABASE_KEY not set -- storage disabled")
            return None
        _supabase_client = create_client(url, key)
    return _supabase_client

# Storage bucket name
IMAGES_BUCKET = "rizko-images"


class SupabaseStorage:
    """Helper for uploading images to Supabase Storage"""

    # Formats that browsers can't display -- must convert to JPEG
    UNSUPPORTED_FORMATS = {'image/heic', 'image/heif', 'image/tiff', 'image/bmp'}
    # Formats browsers support natively -- keep as-is
    SUPPORTED_FORMATS = {'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'}

    @staticmethod
    def _generate_filename(url: str, prefix: str = "image") -> str:
        """Generate unique filename from URL hash"""
        url_hash = hashlib.md5(url.encode()).hexdigest()[:12]
        timestamp = datetime.now().strftime("%Y%m%d")
        extension = "jpg"  # Default to jpg, we'll convert images

        return f"{prefix}/{timestamp}_{url_hash}.{extension}"

    @staticmethod
    def _convert_to_jpeg(image_data: bytes, content_type: str) -> Tuple[bytes, str]:
        """
        Convert unsupported image formats (HEIC, HEIF, TIFF, etc.) to JPEG.
        Returns (image_bytes, content_type).
        """
        ct = content_type.lower().strip()

        # If format is browser-supported, return as-is
        if ct in SupabaseStorage.SUPPORTED_FORMATS:
            return image_data, ct

        # Convert unsupported formats to JPEG via Pillow
        try:
            img = Image.open(BytesIO(image_data))
            # Convert RGBA/P modes to RGB (JPEG doesn't support alpha)
            if img.mode in ('RGBA', 'P', 'LA'):
                img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            output = BytesIO()
            img.save(output, format='JPEG', quality=85, optimize=True)
            converted = output.getvalue()
            logger.info(f"[REFRESH] Converted {ct} --> image/jpeg ({len(image_data)} --> {len(converted)} bytes)")
            return converted, 'image/jpeg'
        except Exception as e:
            logger.warning(f"[WARNING] Failed to convert {ct} to JPEG: {e} -- uploading as-is")
            return image_data, ct

    @staticmethod
    def upload_from_url(
        image_url: str,
        folder: str = "avatars",
        max_size_mb: int = 5
    ) -> Optional[str]:
        """
        Download image from URL and upload to Supabase Storage.
        Automatically converts HEIC/HEIF/TIFF to JPEG for browser compatibility.

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

            # Convert unsupported formats (HEIC, HEIF, etc.) to JPEG
            raw_content_type = response.headers.get("content-type", "image/jpeg")
            image_bytes, final_content_type = SupabaseStorage._convert_to_jpeg(
                response.content, raw_content_type
            )

            # Generate filename
            filename = SupabaseStorage._generate_filename(image_url, folder)

            client = _get_supabase()
            if not client:
                logger.warning("Supabase not configured -- skipping upload")
                return None

            # Upload to Supabase Storage
            result = client.storage.from_(IMAGES_BUCKET).upload(
                path=filename,
                file=image_bytes,
                file_options={
                    "content-type": final_content_type,
                    "cache-control": "3600",
                    "upsert": "true"  # Overwrite if exists
                }
            )

            # Get public URL
            public_url = client.storage.from_(IMAGES_BUCKET).get_public_url(filename)

            logger.info(f"[OK] Uploaded image to Supabase: {filename} ({final_content_type})")
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
            logger.info(f"[DELETE] Deleted image from Supabase: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete image: {e}")
            return False

    @staticmethod
    def extract_path_from_url(public_url: str) -> Optional[str]:
        """
        Extract storage path from Supabase public URL.
        Example: https://xxx.supabase.co/storage/v1/object/public/rizko-images/thumbnails/20260210_abc123.jpg
        Returns: thumbnails/20260210_abc123.jpg
        """
        if not public_url or "supabase" not in public_url:
            return None
        try:
            marker = f"{IMAGES_BUCKET}/"
            idx = public_url.index(marker)
            return public_url[idx + len(marker):]
        except (ValueError, IndexError):
            return None

    @staticmethod
    def cleanup_competitor(avatar_url: str, recent_videos: list) -> int:
        """
        Delete all Supabase images for a competitor (avatar + video thumbnails).
        Returns count of deleted files.
        """
        deleted = 0
        paths_to_delete = []

        # Avatar
        avatar_path = SupabaseStorage.extract_path_from_url(avatar_url)
        if avatar_path:
            paths_to_delete.append(avatar_path)

        # Video thumbnails from recent_videos JSON
        for video in (recent_videos or []):
            for field in ["cover_url", "thumbnail_url"]:
                url = video.get(field, "")
                path = SupabaseStorage.extract_path_from_url(url)
                if path and path not in paths_to_delete:
                    paths_to_delete.append(path)

        if not paths_to_delete:
            return 0

        try:
            client = _get_supabase()
            if not client:
                return 0
            client.storage.from_(IMAGES_BUCKET).remove(paths_to_delete)
            deleted = len(paths_to_delete)
            logger.info(f"[DELETE] Cleaned up {deleted} images from Supabase Storage")
        except Exception as e:
            logger.error(f"Failed to cleanup competitor images: {e}")

        return deleted


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
            logger.info(f"[OK] Bucket '{IMAGES_BUCKET}' exists")
        else:
            try:
                client.storage.from_(IMAGES_BUCKET).list()
                logger.info(f"[OK] Bucket '{IMAGES_BUCKET}' exists (verified via list)")
            except:
                logger.warning(f"[WARNING] Bucket '{IMAGES_BUCKET}' not found.")
    except Exception as e:
        try:
            client.storage.from_(IMAGES_BUCKET).list()
            logger.info(f"[OK] Bucket '{IMAGES_BUCKET}' accessible")
        except:
            logger.warning(f"[WARNING] Could not verify bucket: {e}")
