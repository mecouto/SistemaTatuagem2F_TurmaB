from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from database import conectar
from dotenv import load_dotenv
import bcrypt
import jwt
import os

load_dotenv()   # garante SECRET_KEY carregada mesmo se este módulo for importado antes de database.py

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITMO = "HS256"

class Login(BaseModel):
    email: str
    senha: str

# POST /login — confere email e senha, devolve um token se estiverem certos
@router.post("/login")
def login(dados: Login):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuario WHERE email = %s", (dados.email,))
    usuario = cursor.fetchone()
    conn.close()
    
    if not usuario:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    senha_confere = bcrypt.checkpw(dados.senha.encode("utf-8"), usuario["senha"].encode("utf-8"))

    if not senha_confere:
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")

    expira_em = datetime.now(timezone.utc) + timedelta(hours=2)
    payload = {
        "sub": usuario["email"],
        "tipo": usuario["tipo"],
        "exp": expira_em
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITMO)

    return {"access_token": token, "token_type": "bearer"}