"""
App configuration file
"""

import json
import os
from base64 import b64decode

from dotenv import load_dotenv
from google.cloud import language_v2
from google.oauth2 import service_account
from loguru import logger

load_dotenv()  # take environment variables from .env.
logger.info("Loading environment variables from .env file")

### ENVIRONMENT ###
# To check if we are in production or `test` environment.
# ENV can be test, staging or production. Default: preview
ENVIRONMENT = os.getenv("ENVIRONMENT", "preview")
logger.info(f"ENVIRONMENT: {ENVIRONMENT}")

### MONGODB ###
MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_NAME = os.getenv("MONGODB_NAME")
MONGODB_MAXPOOLSIZE = 10
MONGODB_MINPOOLSIZE = 1

if ENVIRONMENT == "production" and MONGODB_NAME != "production":
    raise Exception("MONGODB_NAME is not set to 'production' in production environment")
if MONGODB_NAME == "production" and ENVIRONMENT != "production":
    raise Exception("MONGODB_NAME is set to 'production' in non-production environment")

### SECURITY ###
# Secret key for the application
EXTRACTOR_SECRET_KEY = os.getenv("EXTRACTOR_SECRET_KEY")
if not EXTRACTOR_SECRET_KEY:
    raise Exception("EXTRACTOR_SECRET_KEY is not set")
# Waiting time if the API key is wrong
API_KEY_WAITING_TIME = 0.1  # in seconds

### OPENAI ###
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

### WATCHERS ###
OPENAI_MODEL_ID = "gpt-4"  # "gpt-4"
OPENAI_MODEL_ID_FOR_EVAL = "gpt-4"
OPENAI_MODEL_ID_FOR_EVENTS = "gpt-3.5-turbo-16k"
EVALUATION_SOURCE = "phospho-6"  # If phospho
FEW_SHOT_MIN_NUMBER_OF_EXAMPLES = 10  # Make it even
FEW_SHOT_MAX_NUMBER_OF_EXAMPLES = 10


### SENTRY ###
EXTRACTOR_SENTRY_DSN = os.getenv("EXTRACTOR_SENTRY_DSN")

### Vector Search ###
QDRANT_URL = os.getenv("QDRANT_URL")
if QDRANT_URL is None:
    raise Exception("QDRANT_URL is missing from the environment variables")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
if QDRANT_API_KEY is None:
    raise Exception("QDRANT_API_KEY is missing from the environment variables")

### Hardcoded Jobs object ###

# Evaluation job
TASK_EVALUATION_JOB_ID = "task_evaluation"

# Sentiment analysis
credentials_natural_language = os.getenv(
    "GCP_JSON_CREDENTIALS_NATURAL_LANGUAGE_PROCESSING"
)
GCP_SENTIMENT_CLIENT = None
if credentials_natural_language is not None:
    credentials_dict = json.loads(
        b64decode(credentials_natural_language).decode("utf-8")
    )
    credentials = service_account.Credentials.from_service_account_info(
        credentials_dict
    )
    GCP_SENTIMENT_CLIENT = language_v2.LanguageServiceClient(credentials=credentials)
