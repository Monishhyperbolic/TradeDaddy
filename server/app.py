from flask import Flask, request
from flask_cors import CORS
import jwt
import os

app = Flask(__name__)
CORS(app)

# get this from Supabase -> Project Settings -> API -> JWT Secret
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET") or "YOUR_SUPABASE_JWT_SECRET"

def verify_token(req):
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.split(" ")[1]
    try:
        decoded = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return decoded["sub"]  # supabase user id
    except Exception as e:
        print(e)
        return None

@app.get("/api/check")
def check():
    user_id = verify_token(request)
    if not user_id:
        return "Unauthorized", 401
    return f"Hello user: {user_id}"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
