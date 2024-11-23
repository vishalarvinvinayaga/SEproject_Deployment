# Don't Make any changes.

import os
from .startup_tasks import logger  # Import vector stores from startup_tasks
from langchain_openai import OpenAI  # type:ignore
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate  # type:ignore
from langchain.schema import HumanMessage, SystemMessage  # type:ignore
from langchain.chains.combine_documents import (create_stuff_documents_chain,)  # type:ignore
from langchain.chains import create_retrieval_chain  # type:ignore
from langchain.chains import create_history_aware_retriever  # type:ignore
from chatbot.db_store import faculty_db, eecs_db

logger.info(f"faculty_db query handler: {faculty_db} ")
logger.info(f"eecs_db query handler: {eecs_db} ")

llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

faculty_retriever = faculty_db.as_retriever(search_kwargs={"k": 3})
eecs_retriever = eecs_db.as_retriever(search_kwargs={"k": 3})

history_prompt = PromptTemplate.from_template(
    "You are assisting with questions about the EECS department. "
    "Analyze the conversation history and the user's current question to retrieve the most relevant information. "
    "\n\nTypes of questions to consider:\n"
    "1. Professor-related (e.g., teaching, ratings, research interests)\n"
    "2. Course-related (e.g., subjects, codes, course levels)\n"
    "3. General department information (e.g., graduate advising, contact details)\n\n"
    "Determine the type of question and respond appropriately:\n"
    "- If the question is about a professor, focus on details like their courses, research, or ratings.\n"
    "- If the question is about a course, provide details like course name, code, and level.\n"
    "- For general department questions, focus on relevant information like department policies, advising, or general contacts.\n\n"
    "Current question: {input}.\n"
    "Conversation history: {history}"
)

faculty_history_retriever = create_history_aware_retriever(
    llm=llm, retriever=faculty_retriever, prompt=history_prompt
)

eecs_history_retriever = create_history_aware_retriever(
    llm=llm, retriever=eecs_retriever, prompt=history_prompt
)


def determine_context(user_question):
    # Convert question to lowercase for case-insensitive comparison
    user_question = user_question.lower()

    # Keywords for faculty-related queries
    faculty_keywords = [
        "professor",
        "faculty",
        "rating",
        "ratings",
        "course",
        "courses",
        "subject",
        "subjects",
        "code",
        "course code",
        "subject code",
        "teaches",
        "taught",
    ]

    # Keywords for general EECS information queries
    general_keywords = [
        "advising",
        "department",
        "contact",
        "policy",
        "graduate advising",
        "advisor",
    ]

    # Check if any faculty-related keywords are in the question
    if any(keyword in user_question for keyword in faculty_keywords):
        return "professor"  # Using "professor" to signify faculty-related queries

    # Check if any general EECS-related keywords are in the question
    elif any(keyword in user_question for keyword in general_keywords):
        return "general"

    # Default to general if context is unclear
    else:
        return "professor"


# Define a function to select the appropriate retriever based on question type
def get_appropriate_retriever(user_question, history):
    question_type = determine_context(user_question)
    if question_type == "professor":
        return faculty_history_retriever
    elif question_type == "general":
        return eecs_history_retriever
    else:
        return eecs_history_retriever  # Default to general retriever if unsure


def generate_standalone_question(chat_history, user_question):
    if chat_history:
        history_text = "\n".join(
            [
                f"User: {entry['user']}\nAssistant: {entry['assistant']}"
                for entry in chat_history
            ]
        )
    else:
        history_text = ""

    prompt_text = (
        "You are given a conversation history and a new user question. Based on this information, generate a "
        "standalone question that can be understood independently of the conversation history. \n\n"
        "Instructions:\n"
        "1. If the new question is directly related to the previous conversation, include the context necessary to make it standalone.\n"
        "2. If the new question introduces a new topic not covered in the previous conversation, treat it as a fresh question and retain it as is do not modify the question.\n\n"
        f"Conversation History:\n{history_text}\n\n"
        f"User Question: {user_question}\n\n"
        "Standalone Question:"
    )

    # Generate standalone question using the prompt
    standalone_question = llm.invoke(
        [
            SystemMessage(content="Stand-alone question generation."),
            HumanMessage(content=prompt_text),
        ]
    )
    return (
        standalone_question["content"]
        if "content" in standalone_question
        else standalone_question
    )


qa_system_prompt = (
    "You are an assistant answering specific questions about the EECS department. "
    "Answer directly based on provided information without unnecessary detail."
)

qa_prompt = ChatPromptTemplate.from_messages(
    [("system", qa_system_prompt), ("human", "{context}"), ("human", "{user_question}")]
)

combine_docs_chain = create_stuff_documents_chain(llm, qa_prompt)


faculty_retrieval_chain = create_retrieval_chain(
    retriever=faculty_history_retriever, combine_docs_chain=combine_docs_chain
)

eecs_retrieval_chain = create_retrieval_chain(
    retriever=eecs_history_retriever, combine_docs_chain=combine_docs_chain
)


# Function to select the appropriate retrieval chain
def get_appropriate_retrieval_chain(user_question):
    question_type = determine_context(user_question)
    if question_type == "professor" or question_type == "course":
        return faculty_retrieval_chain
    elif question_type == "general":
        return eecs_retrieval_chain
    else:
        return eecs_retrieval_chain  # Default to general if uncertain


def get_relevant_docs(user_query, history):
    retriever = get_appropriate_retriever(user_query, history)
    input_data = {"input": user_query, "history": history}
    retrieved_docs = retriever.invoke(input_data)
    return retrieved_docs


def summarize_interaction(user_query, assistant_response):
    summary_prompt = PromptTemplate.from_template(
        "Briefly summarize the interaction: User Question: {user_query}, Assistant Response: {assistant_response}"
    )

    summary_message = summary_prompt.format(
        user_query=user_query, assistant_response=assistant_response.strip()
    )
    messages = [
        SystemMessage(
            content="You are a summarizer that creates concise interaction summaries."
        ),
        HumanMessage(content=summary_message),
    ]

    response = llm.invoke(messages)
    if isinstance(response, dict) and "content" in response:
        return response["content"]
    elif isinstance(response, str):
        return response
    else:
        return "Summary could not be generated."


def update_chat_history(chat_history, user_input, assistant_response):
    summary = summarize_interaction(user_input, assistant_response)
    chat_history.append(
        {"user": user_input, "assistant": assistant_response, "summary": summary}
    )
    return chat_history


def manage_chat_history(chat_history, max_length=5):
    if len(chat_history) > max_length:
        chat_history = chat_history[-max_length:]
    return chat_history


def get_response(user_query, chat_history):
    standalone_question = generate_standalone_question(chat_history, user_query)

    # Select the appropriate retrieval chain
    retrieval_chain = get_appropriate_retrieval_chain(standalone_question)

    # Retrieve relevant documents
    retrieved_docs = get_relevant_docs(standalone_question, chat_history)
    context = "\n".join([doc.page_content for doc in retrieved_docs])

    # Prepare input for the retrieval chain
    input_data = {
        "input": standalone_question,
        "user_question": standalone_question,
        "context": context,
        "history": [entry.get("summary", "") for entry in chat_history],
    }

    # Get the response from the appropriate retrieval chain
    response = retrieval_chain.invoke(input_data)
    assistant_response = response.get("answer", "No answer found")

    # Update and manage chat history
    chat_history = update_chat_history(chat_history, user_query, assistant_response)
    chat_history = manage_chat_history(chat_history)

    return assistant_response
