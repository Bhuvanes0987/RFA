
CREATE TABLE IF NOT EXISTS Users (email varchar(50) primary key);
CREATE TABLE IF NOT EXISTS Resumes(
    resume_id serial primary key, 
    content_hash TEXT,
    filepath varchar(150), 
    fname TEXT,
    lname TEXT,
    email varchar(50), 
    phone varchar(50), 
    position TEXT,
    skills JSONB, 
    experience float,
    mdate date,
    UNIQUE(content_hash,filepath)
);
CREATE TABLE IF NOT EXISTS JDList (jd_id serial primary key, description TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS Matches (
    match_id SERIAL PRIMARY KEY,
    resume_id INT REFERENCES Resumes(resume_id) ON DELETE CASCADE,
    jd_id INT REFERENCES JDList(jd_id) ON DELETE CASCADE,
    score INT,
    reason TEXT,
    UNIQUE (resume_id, jd_id)  -- prevent duplicate match records
);
CREATE TABLE IF NOT EXISTS InterviewSlots (email varchar(50) primary key, slot_date date, slot_time time)
