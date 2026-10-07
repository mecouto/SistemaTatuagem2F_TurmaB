from fastapi import FastAPI
from rotas import clientes

app = FastAPI()

app.include_router(clientes.router) 


@app.get("/")
def inicio():
    return {"mensagem": "API do estúdio de tatuagem funcionando!"}