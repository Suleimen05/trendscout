"""
Apify Storage Service for storing avatars and thumbnails.

Uses Apify Key-Value Store to host images and bypass CORS restrictions.
Public URLs don't require authentication and work directly in <img> tags.

Retention: 90 days (on $39/month Apify plan)
"""
import os
import logging
import time
from typing import Optional
import httpx
from apify_client import ApifyClient

logger = logging.getLogger(__name__)

# Initialize Apify client
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
if not APIFY_API_TOKEN:
    logger.warning("[WARNING] APIFY_API_TOKEN not set - Apify Storage disabled")
    _apify_client = None
else:
    _apify_client = ApifyClient(APIFY_API_TOKEN)

STORE_NAME = "rizko-avatars"
_store_id_cache = None  # Cache store ID to avoid repeated API calls


class ApifyStorage:
    """Service for storing images in Apify Key-Value Store."""

    @staticmethod
    def fix_tiktok_url(url: str) -> str:
        """
        Fix TikTok CDN URL by removing signature parameters.

        TikTok CDN URLs contain expiring signatures (x-expires, x-signature).
        By removing these and the -sign- subdomain, we get permanent URLs.

        Source: https://github.com/aimadnet/tiktok-cdn-image-expiration-hack

        Args:
            url: Original TikTok CDN URL with signatures

        Returns:
            Permanent URL without signatures

        Example:
            Input:  https://p16-sign-va.tiktokcdn.com/...?x-expires=123&x-signature=abc
            Output: https://p16-va.tiktokcdn.com/...
        """
        if not url or not isinstance(url, str):
            return url

        # Only process TikTok URLs
        if "tiktokcdn" not in url:
            return url

        # Remove "-sign-" from domain (critical!)
        url = url.replace("-sign-", "-")
        url = url.replace("-sign.", ".")

        # Remove all query parameters (x-expires, x-signature, etc.)
        url = url.split("?")[0]

        return url

    @staticmethod
    def _get_or_create_store() -> Optional[str]:
        """
        Get or create the Apify Key-Value Store.

        Returns:
            Store ID if successful, None otherwise
        """
        global _store_id_cache

        if not _apify_client:
            return None

        # Return cached store ID
        if _store_id_cache:
            return _store_id_cache

        try:
            # Check if store already exists
            stores = list(_apify_client.key_value_stores().list().items)
            existing_store = next((s for s in stores if s.get("name") == STORE_NAME), None)

            if existing_store:
                _store_id_cache = existing_store["id"]
                logger.info(f"[OK] Using existing Apify store: {_store_id_cache}")
            else:
                # Create new store
                store = _apify_client.key_value_stores().get_or_create(name=STORE_NAME)
                _store_id_cache = store["id"]
                logger.info(f"[OK] Created new Apify store: {_store_id_cache}")

            return _store_id_cache

        except Exception as e:
            logger.error(f"[ERROR] Failed to get/create Apify store: {e}")
            return None

    @staticmethod
    def download_and_store(
        image_url: str,
        key_prefix: str,
        platform: str = "tiktok"
    ) -> Optional[str]:
        """
        Download image from CDN and store in Apify Key-Value Store.

        Args:
            image_url: Original CDN URL (TikTok/Instagram)
            key_prefix: Unique identifier (e.g., username)
            platform: 'tiktok' or 'instagram'

        Returns:
            Public Apify URL if successful, None otherwise
        """
        if not _apify_client or not image_url:
            return None

        try:
            # Get or create store
            store_id = ApifyStorage._get_or_create_store()
            if not store_id:
                return None

            # Download image using Apify Proxy (residential IPs to bypass 403)
            # Note: Apify proxy requires password which is your API token
            proxy_url = f"http://auto:{APIFY_API_TOKEN}@proxy.apify.com:8000"

            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": f"https://www.{platform}.com/",
                "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
            }

            logger.info(f"[DOWNLOAD] Downloading image from {platform} via Apify Proxy: {image_url[:80]}...")

            # Note: httpx uses 'proxy' parameter with dict format
            proxies = {
                "http://": proxy_url,
                "https://": proxy_url
            }

            response = httpx.get(
                image_url,
                headers=headers,
                proxy=proxy_url,
                timeout=60,  # Longer timeout for proxy
                follow_redirects=True
            )
            response.raise_for_status()

            image_data = response.content
            content_type = response.headers.get("content-type", "image/jpeg")

            logger.info(f"[OK] Downloaded {len(image_data)} bytes ({content_type})")

            # Generate unique key
            timestamp = int(time.time() * 1000)
            key = f"{platform}_{key_prefix}_{timestamp}"

            # Upload to Apify Key-Value Store
            _apify_client.key_value_store(store_id).set_record(
                key=key,
                value=image_data,
                content_type=content_type
            )

            # Generate public URL
            public_url = f"https://api.apify.com/v2/key-value-stores/{store_id}/records/{key}"

            logger.info(f"[OK] Stored in Apify: {key}")
            logger.info(f"[LINK] Public URL: {public_url}")

            return public_url

        except Exception as e:
            logger.error(f"[ERROR] Failed to download/store image: {e}")
            logger.error(f"   URL: {image_url[:100] if image_url else 'None'}")
            return None

    @staticmethod
    def upload_avatar(avatar_url: str, username: str, platform: str = "tiktok") -> Optional[str]:
        """
        Fix and return permanent avatar URL.

        Args:
            avatar_url: Original CDN URL with expiring signatures
            username: User's username (for key generation)
            platform: 'tiktok' or 'instagram'

        Returns:
            Permanent URL without expiring signatures

        NOTE: Uses GitHub solution to remove TikTok signature parameters.
        Source: https://github.com/aimadnet/tiktok-cdn-image-expiration-hack
        """
        # Fix TikTok URL (remove signatures)
        return ApifyStorage.fix_tiktok_url(avatar_url)

    @staticmethod
    def upload_thumbnail(thumbnail_url: str, video_id: str, platform: str = "tiktok") -> Optional[str]:
        """
        Upload video thumbnail to Apify Storage.

        Args:
            thumbnail_url: Original CDN URL
            video_id: Video ID (for key generation)
            platform: 'tiktok' or 'instagram'

        Returns:
            Original CDN URL (frontend handles proxying)

        NOTE: Direct download disabled - TikTok/Instagram block all external requests (403).
        Frontend automatically proxies through images.weserv.nl (see /client/src/utils/imageProxy.ts)
        """
        # Fix TikTok URL (remove signatures)
        return ApifyStorage.fix_tiktok_url(thumbnail_url)
