# Don't make any changes.

import json
import requests  # type: ignore
from bs4 import BeautifulSoup  # type: ignore
import ratemyprofessor  # type: ignore
import weaviate  # type: ignore
import os
import logging
from dotenv import load_dotenv  # type: ignore
import weaviate.classes.config as wvc  # type: ignore
from langchain_openai import OpenAIEmbeddings  # type: ignore
from langchain_weaviate.vectorstores import WeaviateVectorStore  # type: ignore
from django.conf import settings  # type: ignore
from chatbot import db_store


# Setup logging
logging.basicConfig(
    level=logging.INFO,  # Set the level to INFO or DEBUG as needed
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],  # This will log to the console
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def get_professor_info(professor_name, school_name="Florida Atlantic University"):
    logger.info("Starting get_professor_info for professor: %s", professor_name)
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
            "would_take_again": professor.would_take_again,
        }
        return info
    else:
        return None


def subjectDetails():
    file_path = os.path.join(
        settings.BASE_DIR, "chatbot", "data", "UniqueFacultySub.json"
    )
    logger.info("Starting subjectDetails")
    try:
        with open(file_path, "r") as file:
            data = json.load(file)

        facultyDict = {}
        for i in range(len(data["data"])):
            facultyName = data["data"][i]["faculty"][0]["displayName"]
            subjects = []
            for j in range(len(data["data"][i]["courses"])):
                eachSubjects = []
                eachSubjects.append(data["data"][i]["courses"][j]["courseTitle"])
                eachSubjects.append(data["data"][i]["courses"][j]["subjectCourse"])
                eachSubjects.append(
                    data["data"][i]["courses"][j]["sectionAttributes"][0]["description"]
                )
                subjects.append(eachSubjects)
            facultyDict[facultyName] = subjects
        logger.info("Completed subjectDetails successfully")
        return facultyDict
    except Exception as e:
        logger.error("Error in subjectDetails: %s", str(e))
        return {}


def get_faculty_links():
    logger.info("Starting get_faculty_links")
    try:
        url = "https://www.fau.edu/engineering/eecs/directory/"
        page = requests.get(url)
        soup = BeautifulSoup(page.text, "html.parser")
        links = soup.find_all("a", class_="button")
        faculty_urls = [link["href"] for link in links if link]
        return faculty_urls
    except Exception as e:
        logger.error("Error in get_faculty_links: %s", str(e))
        return []


def scrape_faculty_details(faculty_url, facultyName, facultySubj):
    logger.info("Starting scrape_faculty_details for URL: %s", faculty_url)
    try:
        faculty_page = requests.get(faculty_url)
        faculty_soup = BeautifulSoup(faculty_page.text, "html.parser")
        name = faculty_soup.find("h1").get_text()
        facultyName.append(name)
        logger.debug("Scraped faculty name: %s", name)
        contact_details = faculty_soup.find("div", class_="body").get_text()
        profile_details = faculty_soup.find("section", id="section").get_text()
        last_name, first_name = name.split(" ", 1)
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
            f"Courses Taught by {name} :\n{sentence if sentence else 'No courses available'}",
        ]

        logger.info("Completed scrape_faculty_details for URL: %s", faculty_url)
        return [embedding_text, facultyName]
    except Exception as e:
        logger.error(
            "Error in scrape_faculty_details for URL %s: %s", faculty_url, str(e)
        )


def scrape_graduate_advising():
    logger.info(f"Scraping graduate advising details")
    url = "https://www.fau.edu/engineering/dessa/graduate-advising/"
    page = requests.get(url)
    soup = BeautifulSoup(page.text, "html.parser")

    content_store = []
    dept_tags = soup.find_all("strong")

    for dep_tag in dept_tags:
        dep_name = dep_tag.get_text(strip=True)
        ul_tag = dep_tag.find_next("ul")

        if ul_tag:
            details = "\n".join(
                [li.get_text(strip=True) for li in ul_tag.find_all("li")]
            )
            embedding_text = (
                f"Department: {dep_name}\nGraduate Advising Details: {details}"
            )
        else:
            embedding_text = f"Department: {dep_name}\nGraduate Advising Details: No details available."

        content_store.append(embedding_text)
    logger.info(f"Scraping graduate advising details SUCCESSFULL")
    return content_store


def intialise_langchain():
    logger.info(f"BEGINING INITIALISE_LANGCHAIN")
    facultysubjDetails = subjectDetails()
    faculty_urls = get_faculty_links()
    advising_details = scrape_graduate_advising()
    eecs_details = []
    facultyName = []

    for url in faculty_urls:
        faculty_details = scrape_faculty_details(url, facultyName, facultysubjDetails)
        eecs_details.append(faculty_details[0][0])
        eecs_details.append(faculty_details[0][1])
        eecs_details.append(faculty_details[0][2])

    logger.info(f"END INITIALISE_LANGCHAIN")
    return [eecs_details, facultyName, advising_details]


def setup_vector_database():
    global faculty_db, eecs_db
    try:
        init = intialise_langchain()
        rpmDictionary = {}
        logger.info(f"Starting to perform rate my professor fetch ")
        for faculty in init[1]:
            response = []
            response.append(get_professor_info(faculty))
            rpmDictionary[faculty] = response
            logger.info(f"Rate my professor fetched: {faculty}")
            break

        for professor, details_list in rpmDictionary.items():
            for details in details_list:
                name = details["name"]
                rating = details["rating"]
                difficulty = details["difficulty"]
                num_ratings = details["num_ratings"]
                would_take_again = (
                    f"{details['would_take_again']}% of students would take the class again"
                    if details["would_take_again"] != -1
                    else "No data on repeat students"
                )
                sentence = (
                    f"{name} has a rating of {rating} out of 5, with a difficulty level of {difficulty}. "
                    f"They have received {num_ratings} ratings, and {would_take_again}."
                )

                init[0].append(sentence)  # Add this sentence to eecs_details list

        logger.info("Starting setup_vector_database")
        URL = os.getenv("WEAVIATE_URL")
        APIKEY = os.getenv("WEAVIATE_API_KEY")

        # Connect to a WCS instance
        client = weaviate.connect_to_wcs(
            cluster_url=URL, auth_credentials=weaviate.auth.AuthApiKey(APIKEY)
        )
        logger.debug("Connected to Weaviate")
        faculty_collection_name = "FacultyDetails"
        eecs_collection_name = "EECSInformation"

        # Check for FacultyDetails collection
        if faculty_collection_name not in client.collections.list_all():
            faculty_schema = client.collections.create(
                name=faculty_collection_name,
                vectorizer_config=wvc.Configure.Vectorizer.text2vec_openai(),
                properties=[
                    wvc.Property(name="text", data_type=wvc.DataType.TEXT),
                    wvc.Property(name="embedding", data_type=wvc.DataType.BLOB),
                ],
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
                    wvc.Property(name="embedding", data_type=wvc.DataType.BLOB),
                ],
            )
        else:
            logger.info(f"Collection '{eecs_collection_name}' already exists.")

        embeddings = OpenAIEmbeddings(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="text-embedding-3-large",
        )

        # Initialize Weaviate VectorStores for each collection
        logger.info("I am here at startup_tasks.py ")
        db_store.faculty_db = WeaviateVectorStore(
            client=client,
            index_name=faculty_collection_name,
            text_key="text",
            embedding=embeddings,
        )
        db_store.eecs_db = WeaviateVectorStore(
            client=client,
            index_name=eecs_collection_name,
            text_key="text",
            embedding=embeddings,
        )

        logger.info(f"faculty_db startup:{db_store.faculty_db}")
        logger.info(f"eecs_db startup: {db_store.eecs_db}")
        # Populate FacultyDetails collection
        for entry in init[0]:  # Assuming init[0] contains the faculty-related entries
            faculty_db.add_texts([entry])

        # Populate EECSInformation collection with general EECS details¸
        for entry in init[
            2
        ]:  # Assuming advising_details contains the EECS general information entries
            eecs_db.add_texts([entry])

        logger.info("Completed setup_vector_database successfully")
        client.close()
    except Exception as e:
        logger.error("Error in setup_vector_database: %s", str(e))


def main():
    setup_vector_database()
