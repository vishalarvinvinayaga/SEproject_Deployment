import json
import requests # type: ignore
from bs4 import BeautifulSoup # type: ignore
import ratemyprofessor # type: ignore
import weaviate # type: ignore
import os
from dotenv import load_dotenv # type: ignore
from langchain_openai import OpenAIEmbeddings, OpenAI # type: ignore
from langchain_weaviate.vectorstores import WeaviateVectorStore # type: ignore
from langchain.chains import create_retrieval_chain # type: ignore
from langchain.chains.combine_documents import create_stuff_documents_chain # type: ignore
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate # type: ignore
from langchain.schema import HumanMessage, AIMessage, SystemMessage # type: ignore
from langchain.chains import create_history_aware_retriever # type: ignore
import weaviate.classes.config as wvc # type: ignore
import logging

logging.basicConfig(
    level=logging.INFO,  # Set the level to INFO or DEBUG as needed
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler()  # This will log to the console
    ]
)

# Create a logger instance for this module
logger = logging.getLogger(__name__)

load_dotenv()
# Get Professor Info
def get_professor_info(professor_name, school_name="Florida Atlantic University"):
    school = ratemyprofessor.get_school_by_name(school_name)
    school.id = 1268
    professor = ratemyprofessor.get_professor_by_school_and_name(school, professor_name)
    
    if professor:
        info = {
            "name": professor.name,
            "department": professor.department,
            "school": professor.school.name,
            "rating": professor.rating,
            "difficulty": professor.difficulty,
            "num_ratings": professor.num_ratings,
            "would_take_again": professor.would_take_again
        }
        return info
    else:
        return None


def subjectDetails():
    with open('UniqueFacultySub.json', 'r') as file:
        data = json.load(file)

    facultyDict = {}
    for i in range(len(data['data'])):
        facultyName = data['data'][i]['faculty'][0]['displayName']
        subjects = []
        for j in range(len(data['data'][i]['courses'])):
            eachSubjects = []
            eachSubjects.append(data['data'][i]['courses'][j]['courseTitle'])
            eachSubjects.append(data['data'][i]['courses'][j]['subjectCourse'])
            eachSubjects.append(data['data'][i]['courses'][j]['sectionAttributes'][0]['description'])
            subjects.append(eachSubjects)
        facultyDict[facultyName] = subjects

    return facultyDict


def get_faculty_links():
    url = "https://www.fau.edu/engineering/eecs/directory/"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')
    links = soup.find_all("a", class_="button")
    faculty_urls = [link['href'] for link in links if link]
    return faculty_urls


def scrape_faculty_details(faculty_url,facultyName,facultySubj):
    faculty_page = requests.get(faculty_url)
    faculty_soup = BeautifulSoup(faculty_page.text, 'html.parser')
    name = faculty_soup.find("h1").get_text()
    facultyName.append(name)
    contact_details = faculty_soup.find("div", class_="body").get_text()
    profile_details = faculty_soup.find("section", id="section").get_text()
    last_name, first_name = name.split(" ",1)
    convertedName = f"{first_name}, {last_name}"
    sentence = " "
    if convertedName in facultySubj:
        subjectDetails = facultySubj[convertedName]
        unique_courses = set(map(tuple, subjectDetails))

    # Loop through each unique course and construct the sentence
        for subject_name, subject_code, course_level in unique_courses:
            sentence += f"{subject_name}, the subject code is {subject_code} and it's a {course_level.lower()}.\n"

    embedding_text = [
        f"{name} Contact Details:\n{contact_details}\n",
        f"{name} Profile Details:\n{profile_details}\n",
        f"Courses Taught by {name} :\n{sentence if sentence else 'No courses available'}"

        
    ]


    return [embedding_text, facultyName]



def scrape_graduate_advising():
    url = "https://www.fau.edu/engineering/dessa/graduate-advising/"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, 'html.parser')

    content_store = []
    dept_tags = soup.find_all("strong")
    
    for dep_tag in dept_tags:
        dep_name = dep_tag.get_text(strip=True)
        ul_tag = dep_tag.find_next("ul")
        
        if ul_tag:
            details = "\n".join([li.get_text(strip=True) for li in ul_tag.find_all("li")])
            embedding_text = f"Department: {dep_name}\nGraduate Advising Details: {details}"
        else:
            embedding_text = f"Department: {dep_name}\nGraduate Advising Details: No details available."
        
        content_store.append(embedding_text)
    
    return content_store

def intialise_langchain():
    facultysubjDetails = subjectDetails()    
    faculty_urls = get_faculty_links()
    advising_details = scrape_graduate_advising()
    eecs_details = []
    facultyName = []

    for url in faculty_urls:
        faculty_details = scrape_faculty_details(url,facultyName,facultysubjDetails)
        eecs_details.append(faculty_details[0][0])
        eecs_details.append(faculty_details[0][1])
        eecs_details.append(faculty_details[0][2])
    

    return [eecs_details,facultyName, advising_details]

init = intialise_langchain()

rpmDictionary = {}


for faculty in init[1]:
    response = []
    response.append(get_professor_info(faculty))
    rpmDictionary[faculty] = response

for professor, details_list in rpmDictionary.items():
    for details in details_list:
        name = details["name"]
        rating = details["rating"]
        difficulty = details["difficulty"]
        num_ratings = details["num_ratings"]
        would_take_again = (
            f"{details['would_take_again']}% of students would take the class again"
            if details["would_take_again"] != -1 else "No data on repeat students"
        )

        sentence = (
            f"{name} has a rating of {rating} out of 5, with a difficulty level of {difficulty}. "
            f"They have received {num_ratings} ratings, and {would_take_again}."
        )
        
        init[0].append(sentence)  # Add this sentence to eecs_details list

URL = os.getenv("WEAVIATE_URL")
APIKEY = os.getenv("WEAVIATE_APIKEY") 
  
# Connect to a WCS instance
client = weaviate.connect_to_wcs(
    cluster_url=URL,
    auth_credentials=weaviate.auth.AuthApiKey(APIKEY))

faculty_collection_name = "FacultyDetails"
eecs_collection_name = "EECSInformation"

# Check for FacultyDetails collection
if faculty_collection_name not in client.collections.list_all():
    faculty_schema = client.collections.create(
        name=faculty_collection_name,
        vectorizer_config=wvc.Configure.Vectorizer.text2vec_openai(),
        properties=[
            wvc.Property(name="text", data_type=wvc.DataType.TEXT),
            wvc.Property(name="embedding", data_type=wvc.DataType.BLOB)
        ]
    )
else:
    logger.info(f"Collection '{faculty_collection_name}' already exists.")

# Check for EECSInformation collection
if eecs_collection_name not in client.collections.list_all():
    eecs_schema = client.collections.create(
        name=eecs_collection_name,
        vectorizer_config=wvc.Configure.Vectorizer.text2vec_openai(),
        properties=[
            wvc.Property(name="text", data_type=wvc.DataType.TEXT),
            wvc.Property(name="embedding", data_type=wvc.DataType.BLOB)
        ]
    )
else:
    logger.info(f"Collection '{eecs_collection_name}' already exists.")


embeddings = OpenAIEmbeddings(
    api_key = os.getenv("OPENAI_API_KEY") ,
    model="text-embedding-3-large",
)

# Initialize Weaviate VectorStores for each collection
faculty_db = WeaviateVectorStore(client=client, index_name=faculty_collection_name, text_key='text', embedding=embeddings)
eecs_db = WeaviateVectorStore(client=client, index_name=eecs_collection_name, text_key='text', embedding=embeddings)


# Populate FacultyDetails collection
for entry in init[0]:  # Assuming init[0] contains the faculty-related entries
    faculty_db.add_texts([entry])

# Populate EECSInformation collection with general EECS details
for entry in init[2]:  # Assuming advising_details contains the EECS general information entries
    eecs_db.add_texts([entry])

llm = OpenAI(api_key = os.getenv("OPENAI_API_KEY") )




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
    llm=llm,
    retriever=faculty_retriever,
    prompt=history_prompt
)

eecs_history_retriever = create_history_aware_retriever(
    llm=llm,
    retriever=eecs_retriever,
    prompt=history_prompt
)



def determine_context(user_question):
    # Convert question to lowercase for case-insensitive comparison
    user_question = user_question.lower()
    
    # Keywords for faculty-related queries
    faculty_keywords = ["professor", "faculty", "rating", "ratings", "course", "courses", 
                        "subject", "subjects", "code", "course code", "subject code", "teaches", "taught"]
    
    # Keywords for general EECS information queries
    general_keywords = ["advising", "department", "contact", "policy", "graduate advising", "advisor"]

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
        history_text = "\n".join([f"User: {entry['user']}\nAssistant: {entry['assistant']}" for entry in chat_history])
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
    standalone_question = llm.invoke([SystemMessage(content="Stand-alone question generation."), HumanMessage(content=prompt_text)])
    return standalone_question['content'] if 'content' in standalone_question else standalone_question



qa_system_prompt = (
    "You are an assistant answering specific questions about the EECS department. "
    "Answer directly based on provided information without unnecessary detail."
)

qa_prompt = ChatPromptTemplate.from_messages([
    ("system", qa_system_prompt),
    ("human", "{context}"),
    ("human", "{user_question}")
])

combine_docs_chain = create_stuff_documents_chain(llm, qa_prompt)


faculty_retrieval_chain = create_retrieval_chain(
    retriever=faculty_history_retriever,
    combine_docs_chain=combine_docs_chain
)

eecs_retrieval_chain = create_retrieval_chain(
    retriever=eecs_history_retriever,
    combine_docs_chain=combine_docs_chain
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
    input_data = {
        "input": user_query,
        "history": history
    }
    retrieved_docs = retriever.invoke(input_data)
    return retrieved_docs


def summarize_interaction(user_query, assistant_response):
    summary_prompt = PromptTemplate.from_template(
        "Briefly summarize the interaction: User Question: {user_query}, Assistant Response: {assistant_response}"
    )
    
    summary_message = summary_prompt.format(user_query=user_query, assistant_response=assistant_response.strip())
    messages = [
        SystemMessage(content="You are a summarizer that creates concise interaction summaries."),
        HumanMessage(content=summary_message)
    ]
    
    response = llm.invoke(messages)
    if isinstance(response, dict) and 'content' in response:
        return response['content']
    elif isinstance(response, str):
        return response
    else:
        return "Summary could not be generated."


def update_chat_history(chat_history, user_input, assistant_response):
    summary = summarize_interaction(user_input, assistant_response)
    chat_history.append({"user": user_input, "assistant": assistant_response, "summary": summary})
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
        "history": [entry["summary"] for entry in chat_history]
    }
    
    # Get the response from the appropriate retrieval chain
    response = retrieval_chain.invoke(input_data)
    assistant_response = response.get('answer', "No answer found")
    
    # Update and manage chat history
    chat_history = update_chat_history(chat_history, user_query, assistant_response)
    chat_history = manage_chat_history(chat_history)
    
    return assistant_response

