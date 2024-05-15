"""Server configuration for integration tests.

!! Never use this configuration in production because it
opens the server to the world and provide access to JupyterLab
JavaScript objects through the global window variable.
"""
import os
from jupyterlab.galata import configure_jupyter_server

# Set JUPYTERLAB_GALATA_ROOT_DIR start directory
#os.environ["JUPYTERLAB_GALATA_ROOT_DIR"] = os.path.abspath("./content")

# Use Galatata recommended server settings
configure_jupyter_server(c)

# Uncomment to set server log level to debug level
# c.ServerApp.log_level = "DEBUG"
