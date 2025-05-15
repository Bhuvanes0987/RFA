from flask import Flask, request, redirect, session, url_for, render_template_string, send_from_directory
from flask_cors import CORS
import os
import zipfile
import fitz
from docx import Document
from google import genai
import time
import json
import re
from dotenv import load_dotenv
from functools import wraps
from authlib.integrations.flask_client import OAuth
import mysql.connector
from jose import jwt
import requests
import subprocess
import hashlib
from datetime import datetime
from urllib.parse import urlencode
import smtplib
from email.message import EmailMessage

load_dotenv()
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = os.getenv("TENANT_ID")
APP_PWD = os.getenv("APP_PWD")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
REDIRECT_URI = "http://localhost:5000/microsoft/callback"

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("SECRET_KEY")

app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config["SESSION_COOKIE_SECURE"] = False

client = genai.Client(api_key=os.getenv("API_KEY"))

upload_dir = os.path.join(os.getcwd(),"static/uploads")
os.makedirs(upload_dir,exist_ok=True)

oauth = OAuth(app)

microsoft = oauth.register(
    name='microsoft',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url=f"https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
    client_kwargs={
        'scope': 'openid profile email User.Read',
    },
    validate_issuer=False
)

if microsoft is None:
    print("Failed to register Microsoft OAuth client.")
else:
    print("OAuth Initialized")

# Establish a connection to the PostgreSQL database
def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PWD"),
        database=os.getenv("DB_NAME"),
        autocommit=True
    )
    return conn

def init_database():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        with open("setup.sql", 'r') as commands:
            cmd_list = commands.read()
        for statement in cmd_list.split(";"):
            if statement.strip():
                cursor.execute(statement)
    print("Database initialized")

def compute_resume_hash(text):
    cleaned = text.strip().lower()
    return hashlib.sha256(cleaned.encode('utf-8')).hexdigest()

def extract_text_from_file(file_path):
    extension = os.path.splitext(file_path)[1].lower()
    try:
        if extension == ".pdf":
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        elif extension == ".docx":
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        elif extension == ".txt":
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        else:
            raise ValueError(f"Unsupported file type: {extension}")
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return ""
    
def list_files_walk(start_path):
    file_list = []
    for root, _, files in os.walk(start_path):
        for file in files:
            if file.endswith(".doc"):
                doc_path = os.path.join(root, file)
                docx_path = os.path.splitext(doc_path)[0] + ".docx"
                if os.path.exists(docx_path):
                    file_list.append(docx_path)
                else:
                    subprocess.run([
                        "soffice", "--headless", "--convert-to", "docx",
                        doc_path,
                        "--outdir", root  # Save .docx in the same directory
                    ])
                    file_list.append(docx_path)
            else:
                file_list.append(os.path.join(root,file))
    return file_list

def llm_match_resume(resume_text, job_description):

    prompt = f"""
        You are a recruitment assistant.
        Here is a resume:

        \"\"\"
        {resume_text}
        \"\"\"

        Here is the job description:

        \"\"\"
        {job_description}
        \"\"\"

        What are the core skills of this candidate, and how well does the candidate match the job? Give me an answer ONLY in the JSON format:
        ("FName":First Name of candidate,"LName":Last Name of candidate,"Email":Email id, "Phone":Phone Number,"Position":Latest worked position, "Skills":List of skills, "Experience": Years of experience (only numeric), "Score": Score from 1-100, "Reason": Brief one line reason)
        Replace any non-existent fields with "NA", no experience with 0
    """

    try: 
        response = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt,
        )
        return response.text
    except:
        return None
    
@app.route("/microsoft/login", methods=["GET","POST"])
def authenticate():
    email = request.args.get("email")
    #email=''
    session["login_email"] = email  # Save for use after authentication
    redirect_uri = url_for("auth_callback", _external=True)
    return microsoft.authorize_redirect(redirect_uri, login_hint=email, prompt='login')


@app.route("/microsoft/callback")
def auth_callback():
    try:
        code = request.args.get("code")
        if not code:
            return {"error": "No code received"}, 400

        redirect_uri = url_for("auth_callback", _external=True)

        token_url = f"https://login.microsoftonline.com/common/oauth2/v2.0/token"
        data = {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "scope": "openid profile email User.Read",
        }

        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            return {"error": "Token exchange failed", "details": response.text}, 400

        token = response.json()
        id_token = token.get("id_token")
        if not id_token:
            return {"error": "No id_token in response"}, 400

        # Now decode and validate manually
        unverified_header = jwt.get_unverified_header(id_token)
        unverified_claims = jwt.get_unverified_claims(id_token)
        tenant_id = unverified_claims.get("tid")

        jwks_url = f"https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys"
        jwks = requests.get(jwks_url).json()
        public_keys = {
            key["kid"]: key
            for key in jwks["keys"]
        }
        key = public_keys.get(unverified_header["kid"])
        if not key:
            return {"error": "Key not found for token"}, 400

        claims = jwt.decode(
            id_token,
            key=key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=f"https://login.microsoftonline.com/{tenant_id}/v2.0"
        )

        session["user"] = claims
        print(len(claims))
        print("USER IN CALLBACK:",session['user'])
        user_email = claims.get('email') or claims.get('preferred_username')
        print("CALLBACK MAIL:", user_email)

        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = "INSERT INTO Users (email) VALUES (%s) ON DUPLICATE KEY UPDATE email=email;"
            cursor.execute(query, (user_email,))

        # Construct query string with session data
        params = urlencode({
            "email": user_email,
            "name": claims.get("name", ""),
        })
        print(os.getenv("FRONTEND_URL") + f'/dashboard?{params}')
        return redirect(os.getenv("FRONTEND_URL") + f'/dashboard?{params}')

    except Exception as e:
        return {"error": f"Callback failed: {e}"}, 500

    
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return redirect(url_for("authenticate"))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/filter", methods=["POST"])
def filter_docs():
    print("USER IN FILTER:",session.get("user"))
    filter = request.form['search'].lower()
    upload = request.files['file']

    if upload.filename.endswith(".zip"):
        # Extract ZIP file into the temporary directory
        with zipfile.ZipFile(upload.stream, 'r') as zip_file:
            zip_file.extractall(upload_dir)
    else:
        # Save the uploaded file temporarily
        temp_file_path = os.path.join(upload_dir, upload.filename)
        upload.save(temp_file_path)

    file_list = list_files_walk(upload_dir)

    # Process the files (e.g., extract text from PDFs)
    resumes = {}
    for file_path in file_list:
        resumes[file_path] = extract_text_from_file(file_path)

    print("TEXT EXTRACTION COMPLETE")

    print(filter)
    job_description = "Looking for a candidate with the following qualities: " + filter

    matches = []
    keys = ["ID","FilePath","FName","LName","Email","Phone","Position","Skills","Experience","Date","Score","Reason"]

    with get_db_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("Insert into JDList (description) values (%s) ON DUPLICATE KEY UPDATE description=description;",(filter.lower(),))
        conn.commit()
        cursor.execute("SELECT jd_id FROM JDList WHERE description = %s", (filter,))
        jd_id = cursor.fetchone()[0]
        print("JD ID:",jd_id)

        for file_path, text in resumes.items():
            file_path = os.path.relpath(file_path)
            print(file_path)

            content_hash = compute_resume_hash(text)

            #print("Time per request:",endTime-startTime)

            cursor.execute("Select * from Resumes where content_hash = %s and filepath = %s",(content_hash,file_path))
            resume_row = cursor.fetchone()
            resume_id = None
            if resume_row:
                resume_id = resume_row[0]
                print("RESUME EXISTS:",resume_id)
                cursor.execute("SELECT * FROM Matches WHERE resume_id = %s and jd_id = %s", (resume_id,jd_id))
                match_row = cursor.fetchone()
                if match_row:
                    print("MATCH EXISTS:",(resume_id,jd_id))
                    row_values = (resume_id,) + resume_row[2:] + match_row[3:]
                    matches.append(dict(zip(keys,row_values)))
                    continue

            decision = llm_match_resume(text, job_description)
            if not decision:
                print("MODEL OVERLOAD")
                break

            decision = json.loads(re.sub(r"^```json\s*|\s*```$", "", decision.strip(), flags=re.DOTALL))
            decision["File Path"] = file_path
            decision["Skills"] = json.dumps(decision["Skills"])
            decision["Date"] = datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d')
            print(decision)
            matches.append(decision)

            row_values = (
                content_hash,
                decision.get('File Path'),
                decision.get('FName'),
                decision.get('LName'),
                decision.get('Email'),
                decision.get('Phone'),
                decision.get("Position"),
                decision.get('Skills'),
                decision.get('Experience'),
                decision.get('Date')
            )
            #print(row_values)
            try:
                #cursor.execute("Update resumes set experience = %s, name = %s where filename = %s",(decision["Experience"],decision["Name"],os.path.basename()))
                if not resume_id:
                    print("IN NOT IF")
                    cursor.execute("Insert into Resumes (content_hash, filepath, fname, lname, email, phone, position, skills, experience, mdate) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",row_values)
                    conn.commit()
                    cursor.execute("Select resume_id from Resumes where content_hash = %s and filepath = %s",(content_hash,file_path))
                    resume_id = cursor.fetchone()[0]
                match_values = (resume_id,jd_id,decision['Score'],decision['Reason'])
                cursor.execute("Insert into Matches (resume_id,jd_id,score,reason) values (%s,%s,%s,%s)",match_values)
            except Exception as e:
                print(f"Error inserting row into table: {e}")
                break
            print("Inserted")
            conn.commit()

    #print(f"Matched Resumes: {matches}")
    #matches = sorted(matches,key=lambda x: int(x['Score']),reverse=True)
    #session["Matches"] = matches
    #session["Keys"] = list(key for key in matches[0].keys() if key!="File Path") if len(matches)>0 else []
    

    #return render_template("result.html")
    #print(matches)
    return {"Matches" : matches, "Keys" : keys}

@app.route("/download/<path:file_path>")
def get_file(file_path):
    if os.path.exists(file_path):
        # Define the file types you expect
        file_extension = file_path.split('.')[-1].lower()
        
        # Define MIME types for various file extensions
        mime_types = {
            'pdf': 'application/pdf',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain',
            'html': 'text/html'
        }

        # Set the correct MIME type based on the file extension
        mimetype = mime_types.get(file_extension, 'application/octet-stream')  # Default to binary stream if type is unknown
        
        # Send the file for viewing (as_attachment=False)
        return send_from_directory(
            '.', 
            file_path, 
            as_attachment=False,
            mimetype=mimetype
        )
    else:
        return "File not found", 404
    
def send_mail_from_user(access_token, to_email, subject, body):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "Text",
                "content": body
            },
            "toRecipients": [
                {"emailAddress": {"address": to_email}}
            ]
        },
        "saveToSentItems": "true"
    }

    print(headers,email_msg)

    response = requests.post(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        headers=headers,
        json=email_msg
    )

    if response.status_code == 202:
        return "Email sent successfully"
    else:
        return f"Failed to send email: {response.status_code}, {response.text}"
    
@app.route("/request-mail-consent")
def request_mail_consent():
    redirect_uri = url_for("mail_callback", _external=True)
    return microsoft.authorize_redirect(
        redirect_uri,
        scope="Mail.Send",  # Request consent only now
        prompt="consent"  # Force consent screen for Mail.Send
    )

@app.route("/mail/callback")
def mail_callback():
    token = microsoft.authorize_access_token()
    print("MAIL TOKEN:",len(token))
    session["mail_token"] = token  # Save separately from login token
    return redirect(url_for("send_mail"))  # Or wherever you want to go next


@app.route("/send-mail", methods=["POST"])
def send_mail():
        
    '''if request.method == "POST":
        data = request.form
        to_email = data.get("to_email","rushilak03@gmail.com")
        subject = data.get("subject", "Hello from Flask")
        body = data.get("body", "This is a test email sent from Microsoft Graph API.")
        # Store the email data in the session to persist it
        session['email_data'] = {
            "to_email": to_email,
            "subject": subject,
            "body": body
        }

        print("USER IN SENDMAIL:",session.get("user"))

        if "user" not in session:
            return {"error": "User not authenticated"}, 401

        token = session.get("mail_token")
        if not token:
            return redirect(url_for("request_mail_consent"))
    
    
    data = session.get('email_data',{})
    to_email = data.get("to_email","rushilak03@gmail.com")
    subject = data.get("subject", "Hello from Flask")
    body = data.get("body", "This is a test email sent from Microsoft Graph API.")
    session.pop('email_data')

    return send_mail_from_user(token["access_token"], to_email, subject, body)'''

    msg_data = request.get_json()

    sender_mail = "rushilak03@gmail.com"
    sender_pwd = APP_PWD
    to_email = msg_data.get("to_email", "rushilgoku@gmail.com")
    subject = msg_data.get("subject", "Interview Time Selection")

    # List of available slots (could be fetched from DB instead)
    slots = [
        "2025-05-14T10:00",
        "2025-05-14T11:00",
        "2025-05-14T14:00"
    ]

    # Generate buttons
    buttons_html = ""
    for slot in slots:
        buttons_html += f"""
            <a href="http://localhost:5000/select-slot?email={to_email}&slot={slot}"
               style="display: inline-block; margin: 10px 0; padding: 10px 15px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">
               {slot}
            </a><br>
        """

    html_content = f"""
        <html>
            <body>
                <p>Please select a time slot for your interview:</p>
                {buttons_html}
            </body>
        </html>
    """

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_mail
    # For testing only
    to_email = "rushilgoku@gmail.com"
    msg['To'] = to_email
    msg.set_content("Please use an HTML-compatible email viewer.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(msg["From"], sender_pwd)
            smtp.send_message(msg)
        return {"message": "Mail sent successfully!"}, 200
    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"error": "Failed to send email"}, 500
    
@app.route("/select-slot")
def select_time_slot():

    resume_id = request.args.get("resume_id")
    email = request.args.get("email")
    time_slot = request.args.get("slot")
    slot_date,slot_time = time_slot.split("T")
    print(email,slot_date,slot_time)

    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("Insert into InterviewSlots (resume_id,email,slot_date,slot_time) values (%s,%s,%s,%s) ON DUPLICATE KEY UPDATE resume_id=resume_id",(resume_id,email,slot_date,slot_time))
        #return redirect(os.getenv("FRONTEND_URL") + '/confirmation')
        confirmation_html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Confirmation</title>
                <style>
                    body {
                        background-color: #f0f9f4;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-family: Arial, sans-serif;
                    }
                    .container {
                        text-align: center;
                    }
                    .tick {
                        font-size: 120px;
                        color: green;
                    }
                    .message {
                        font-size: 24px;
                        margin-top: 20px;
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="tick">✔️</div>
                    <div class="message">Your slot has been confirmed!</div>
                </div>
            </body>
            </html>
            """
        return render_template_string(confirmation_html)
    except:
        return {"error": "Failed to select slot"}, 500
    
@app.route("/jd-list")
def get_jd_list():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("Select description from JDList")
            jd_list = [item[0] for item in cursor.fetchall()]
            print(jd_list)
            return jd_list
    except:
        print("Error in accessing Database")
        return []
    

if __name__=="__main__":
    init_database() # Initialize Database contents
    app.run(debug=True)