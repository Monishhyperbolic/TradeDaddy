from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import requests
import os

app = Flask(__name__)
CORS(app)

# ========== CONFIG ==========
PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "kwnmlteewlnrogbwijoe")
JWKS_URL = f"https://{PROJECT_REF}.supabase.co/auth/v1/jwks"

JWKS = None  # cached

# ========== HELPERS ==========

def fetch_jwks():
    """Fetch and cache JWKS keys from Supabase."""
    global JWKS
    if JWKS is None:
        resp = requests.get(JWKS_URL)
        if resp.status_code != 200:
            raise Exception("Failed to fetch JWKS from Supabase")
        JWKS = resp.json()
    return JWKS


def verify_token(req):
    """Verify Supabase JWT using JWKS."""
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    
    token = auth.split(" ")[1]

    try:
        jwks = fetch_jwks()
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        public_key = None
        for key in jwks["keys"]:
            if key["kid"] == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break

        if public_key is None:
            print("[AUTH] No matching JWK found for token")
            return None

        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=None,
            options={"verify_exp": True}
        )

        return decoded.get("sub")  # Supabase user ID

    except Exception as e:
        print("[AUTH ERROR]", e)
        return None


# ========== ROUTES ==========

@app.get("/api/check")
def check():
    user_id = verify_token(request)
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "message": "Token verified",
        "user_id": user_id
    }), 200


@app.get("/api/health")
def health():
    """Health check for Render/Vercel."""
    return jsonify({"status": "ok"}), 200


# ========== GUNICORN ENTRYPOINT ==========

# IMPORTANT:
# We do NOT call app.run() here because Gunicorn will bind the port.
# Render start command should be: gunicorn app:app

app = app
