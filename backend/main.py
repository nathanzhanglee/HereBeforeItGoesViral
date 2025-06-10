from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router

# Define the FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from all origins. Replace "*" with your frontend origin for security (e.g., "http://[::]:8000")
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(router, prefix="", tags=["Items"])

# Start the server: Run `uvicorn backend:app --reload`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="::", port=8000)