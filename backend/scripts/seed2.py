import json
import os
import sys

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal, Base
# Import directly from the module since we added backend to sys.path
# And to avoid relative import issues in models.py if it's not run as a package, 
# we should ensure models.py doesn't use relative imports.
# Wait, models.py uses `from .database import Base`
# Let's just fix it properly by not appending to sys.path and running as module
