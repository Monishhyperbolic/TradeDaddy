from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import requests
import os

app = Flask(__name__)
CORS(app)

# Replace with your Supabase project ref
PROJECT_REF = os.getenv("SUPABASE_PROJECT_REF", "kwnmlteewlnrogbwijoe")
JWKS_URL = f"https://{PROJECT_REF}.supabase.co/auth/v1/jwks"

# Cache JWKS so we don't fetch on every request
JWKS = None

def get_jwks():
    global JWKS
    if JWKS is None:
        resp = requests.get(JWKS_URL)
        if resp.status_code != 200:
            raise Exception("Failed to fetch JWKS")
        JWKS = resp.json()
    return JWKS

def verify_token(req):
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth.split(" ")[1]

    try:
        jwks = get_jwks()

        unverified = jwt.get_unverified_header(token)
        kid = unverified.get("kid")

        public_key = None
        for key in jwks["keys"]:
            if key["kid"] == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break

        if public_key is None:
            print("No matching JWK key found for token")
            return None

        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=None,  # Supabase tokens may not include audience
            options={"verify_exp": True}
        )

        # sub = Supabase user ID
        return decoded.get("sub")

    except Exception as e:
        print("JWT decode error:", e)
        return None


@app.get("/api/check")
def check():
    user_id = verify_token(request)
    if not user_id:
        return "Unauthorized", 401
    return jsonify({"message": "Hello user!", "user_id": user_id}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
