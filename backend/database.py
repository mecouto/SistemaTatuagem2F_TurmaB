import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def conectar():
    print("→ Abrindo conexão com MySQL...")

    conexao = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        connection_timeout=5,
        use_pure=True
    )

    print("→ MySQL conectado!")

    return conexao