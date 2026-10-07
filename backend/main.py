from fastapi import FastAPI  # importa o FastAPI

app = FastAPI()


@app.get("/")
def inicio():
    return {"mensagem": "API do estúdio de tatuagem funcionando!"}