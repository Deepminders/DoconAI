import os
from langchain_google_community import GoogleSearchAPIWrapper
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

async def test_google_search():
    search_tool = GoogleSearchAPIWrapper(
        k=5,
        google_api_key="AIzaSyAqXNdisEfTfLGxAvV6YRGZnM5s_0q3xyA",
        google_cse_id="d72d0c92f115c4d7b",
    )
    
    query = "concrete construction technology"
    results = search_tool.results(query, num_results=5)
    print(f"Search results for '{query}':")
    for r in results:
        print(r.get("title", "No Title"))
        print(r.get("snippet", "No snippet"))
        print("---")

import asyncio
asyncio.run(test_google_search())
