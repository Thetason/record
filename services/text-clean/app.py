from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

try:
    import kss
except Exception:
    kss = None

try:
    from pykospacing import Spacing
    spacing = Spacing()
except Exception:
    spacing = None

app = FastAPI()

class Req(BaseModel):
    text: str

@app.post("/")
def clean(req: Req):
    text = req.text or ""
    # sentence split
    if kss is not None:
        try:
            sents = kss.split_sentences(text)
            text = "\n".join(sents)
        except Exception:
            pass
    # spacing
    if spacing is not None:
        try:
            text = spacing(text)
        except Exception:
            pass
    return {"cleaned": text}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

