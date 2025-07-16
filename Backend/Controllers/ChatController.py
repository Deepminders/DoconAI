from datetime import datetime, timezone
import os
import pickle
import faiss
import asyncio
from motor.motor_asyncio import AsyncIOMotorCollection
from fastapi import HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains.conversational_retrieval.base import ConversationalRetrievalChain
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.prompts import PromptTemplate
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_google_community import GoogleSearchAPIWrapper
from Config.db import chat_collection, session_collection, search_cache_collection
from dotenv import load_dotenv
GOOGLE_CSE_ID = "d72d0c92f115c4d7b"  # Replace with your actual CSE ID
GOOGLE_API_KEY = "AIzaSyAqXNdisEfTfLGxAvV6YRGZnM5s_0q3xyA"
SERPAPI_API_KEY = "4c99224275812d62f41822a85daad444ebf91a13"
# ---------------- Load Embeddings + FAISS ----------------
print(GOOGLE_API_KEY, GOOGLE_CSE_ID, SERPAPI_API_KEY)
EMBEDDING_MODEL = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
VECTOR_DB_PATH = "embeddings/index.faiss"
CHUNKS_PATH = "embeddings/doc_chunks.pkl"

if not os.path.exists(VECTOR_DB_PATH) or not os.path.exists(CHUNKS_PATH):
    raise RuntimeError("Embedding or FAISS index not found.")

VECTOR_INDEX = faiss.read_index(VECTOR_DB_PATH)

with open(CHUNKS_PATH, "rb") as f:
    DOC_CHUNKS = pickle.load(f)

documents = {str(i): Document(page_content=chunk["content"]) for i, chunk in enumerate(DOC_CHUNKS)}
docstore = InMemoryDocstore(documents)
index_to_docstore_id = {i: str(i) for i in range(len(DOC_CHUNKS))}

vectorstore = FAISS(
    index=VECTOR_INDEX,
    docstore=docstore,
    index_to_docstore_id=index_to_docstore_id,
    embedding_function=EMBEDDING_MODEL
)

custom_prompt = PromptTemplate.from_template(
    """
You are a helpful assistant specializing in construction documents. 
Answer the question using only the relevant information from the retrieved documents. 
Do not mention or refer to \"the provided text\" or \"the documents\" directly in your response. 
Be clear and concise, and explain the answer in natural language.

Question: {question}

Relevant Context:
{context}

Answer:
"""
)

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.5,
    google_api_key=GOOGLE_API_KEY
)

qa_chain = ConversationalRetrievalChain.from_llm(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    combine_docs_chain_kwargs={"prompt": custom_prompt}
)

search_tool = GoogleSearchAPIWrapper(k=5,
    google_api_key=GOOGLE_API_KEY,
    google_cse_id=GOOGLE_CSE_ID,
)

def is_meaningful_message(msg: str) -> bool:
    normalized = msg.strip().lower()
    trivial_starts = ["hi", "hello", "hey", "how are you", "good morning", "good evening", "good afternoon", "what's up", "yo"]
    return (
        len(normalized.split()) > 3 or
        all(not normalized.startswith(greet) for greet in trivial_starts)
    )

async def handle_chat(user_id: str, session_id: str, user_message: str) -> str:
    greetings = ["hi", "hello", "hey", "how are you", "good morning", "good afternoon", "good evening"]
    normalized_msg = user_message.lower().strip()

    if normalized_msg in greetings:
        reply = "Hello! How can I assist you with your construction project today?"
        await store_chat_messages(chat_collection, user_id, session_id, user_message, reply)
        return reply

    history = await chat_collection.find(
        {"user_id": user_id, "session_id": session_id}
    ).sort("created_time", -1).to_list(length=10)

    # Build LangChain-compatible chat history
    message_history = ChatMessageHistory()
    for item in reversed(history):
        message_history.add_message({"role": item["role"], "content": item["content"]})

    total_messages = await chat_collection.count_documents({"session_id": session_id})
    if total_messages <= 2 and is_meaningful_message(user_message):
        try:
            prompt = PromptTemplate.from_template(
                "Summarize this message in 5 words or fewer to use as a chat session title:\n\n{message}"
            )
            chain = prompt | llm
            title_response = await chain.ainvoke({"message": user_message})
            title = title_response.content.strip()
            await session_collection.update_one(
                {"session_id": session_id},
                {"$set": {"title": title}}
            )
        except Exception as e:
            print("Title generation failed:", e)

    try:
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        docs = await retriever.ainvoke(user_message)

        if docs:
            result = await asyncio.to_thread(qa_chain.invoke, {
                "question": user_message,
                "chat_history": [(msg["role"], msg["content"]) for msg in history[::-1]]
            })
            reply = result["answer"].strip()
            tier = "documents"
            retrieved_doc_summaries = [doc.page_content[:200].replace("\n", " ") for doc in docs]

            vague_phrases = [
                "the provided text does not",
                "does not contain information",
                "cannot find",
                "no information available",
                "no jokes",
                "not included",
                "no content",
                "not available",
                "sorry",
                "not found",
                "not specified",
                "not mentioned",
                "not provided",
                "not in the text",
                "not in the provided text",
                "not in the documents",
                "not in the provided documents",
                "not in the context",
                "not in the context provided",
                "not in the context of the question",
                "not in the context of the provided text",
                "not in the context of the documents",
            ]
            if any(phrase in reply.lower() for phrase in vague_phrases):
                print("[DEBUG] RAG response vague, trying Google Search fallback.")
                search_results = search_tool.results(user_message, num_results=5)
                snippets = [r.get("snippet", "") for r in search_results if "snippet" in r]

                if snippets:
                    combined = "\n\n".join(snippets[:5])
                    summary_prompt = f"""You are a helpful assistant. Use the search results below to answer clearly and concisely. Do NOT say 'provided text'.\n\nSearch Results:\n{combined}\n\nAnswer:"""
                    response = await llm.ainvoke(summary_prompt)
                    reply = response.content.strip()
                    tier = "google_search_live"
                    retrieved_doc_summaries = snippets[:5]

                    await search_cache_collection.insert_one({
                        "query": user_message,
                        "summary": reply,
                        "timestamp": datetime.now(timezone.utc)
                    })
                else:
                    fallback_prompt = f"""You are a helpful assistant. Answer the following question using your general knowledge. Avoid saying 'provided text'.\n\nQuestion: {user_message}"""
                    response = await asyncio.to_thread(llm.invoke, fallback_prompt)
                    reply = response.content.strip()
                    tier = "general_knowledge"
                    retrieved_doc_summaries = []
        else:
            cached = await search_cache_collection.find_one({"query": user_message})
            if cached:
                reply = cached["summary"]
                tier = "google_search_cached"
                retrieved_doc_summaries = []
            else:
                search_results = search_tool.results(user_message, num_results=5)
                snippets = [r.get("snippet", "") for r in search_results if "snippet" in r]

                if snippets:
                    combined = "\n\n".join(snippets[:5])
                    summary_prompt = f"""You are a helpful assistant. Use the search results below to answer clearly and concisely. Do NOT say 'provided text'.\n\nSearch Results:\n{combined}\n\nAnswer:"""
                    response = await llm.ainvoke(summary_prompt)
                    reply = response.content.strip()
                    tier = "google_search_live"
                    retrieved_doc_summaries = snippets[:5]

                    await search_cache_collection.insert_one({
                        "query": user_message,
                        "summary": reply,
                        "timestamp": datetime.now(timezone.utc)
                    })
                else:
                    fallback_prompt = f"""You are a helpful assistant. Answer the following question using your general knowledge. Avoid saying 'provided text'.\n\nQuestion: {user_message}"""
                    response = await asyncio.to_thread(llm.invoke, fallback_prompt)
                    reply = response.content.strip()
                    tier = "general_knowledge"
                    retrieved_doc_summaries = []

        await store_chat_messages(chat_collection, user_id, session_id, user_message, reply, tier)

        await session_collection.update_one(
            {"session_id": session_id},
            {"$set": {"last_response_tier": tier, "last_response_time": datetime.now(timezone.utc)}}
        )

        return reply

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def store_chat_messages(
    collection: AsyncIOMotorCollection,
    user_id: str,
    session_id: str,
    user_msg: str,
    assistant_msg: str,
    tier: str = None 
):
    now = datetime.now(timezone.utc)
    messages = [
        {
            "user_id": user_id,
            "session_id": session_id,
            "role": "user",
            "content": user_msg,
            "created_time": now
        },
        {
            "user_id": user_id,
            "session_id": session_id,
            "role": "assistant",
            "content": assistant_msg,
            "created_time": now
        }
    ]
    if tier:
        messages[1]["tier"] = tier

    await collection.insert_many(messages)
