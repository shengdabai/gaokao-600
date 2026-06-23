"""Application configuration constants.

This app currently runs in single-user mode: there is no authentication
layer, and every request is attributed to a single default user. The user id
is centralized here (overridable via the DEFAULT_USER_ID env var) so it is no
longer duplicated across route modules.

SECURITY NOTE: Because there is no auth, do NOT deploy this publicly as a
multi-user service as-is. See README "安全说明 / Security" for details.
"""

import os

# Default (and only) user id in single-user mode.
DEFAULT_USER_ID = int(os.environ.get("DEFAULT_USER_ID", "1"))
