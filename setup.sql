CREATE TABLE IF NOT EXISTS Users (
    email VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Resumes (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    content_hash TEXT,
    filepath VARCHAR(150),
    fname TEXT,
    lname TEXT,
    email VARCHAR(50),
    phone VARCHAR(50),
    position TEXT,
    skills JSON,  -- MySQL 5.7+ supports JSON
    experience FLOAT,
    mdate DATE,
    UNIQUE KEY unique_hash_path (content_hash(255), filepath(150))
);

CREATE TABLE IF NOT EXISTS JDList (
    jd_id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    UNIQUE KEY unique_description (description(150))
);

CREATE TABLE IF NOT EXISTS Matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT,
    jd_id INT,
    score INT,
    reason TEXT,
    UNIQUE KEY unique_resume_jd (resume_id, jd_id),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id) ON DELETE CASCADE,
    FOREIGN KEY (jd_id) REFERENCES JDList(jd_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS InterviewSlots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT,
    email VARCHAR(50),
    slot_date DATE,
    slot_time TIME,
    UNIQUE (resume_id),
    FOREIGN KEY (resume_id) REFERENCES Resumes(resume_id) ON DELETE CASCADE
);
