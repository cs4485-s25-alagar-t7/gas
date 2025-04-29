import { parseResumeFromPdf } from "../lib/parse-resume-from-pdf/index.js";
import { Resume } from "../lib/redux/types.js";

export const parseResume = async (resumeBuf: Buffer<ArrayBufferLike>) : Promise<Resume> => {
  try {
    const resume = await parseResumeFromPdf(resumeBuf);
    return resume;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume");
  }
};


export const saveResumeInfoToDB = async (resume: Resume) => {
    // NOTE: 5000 (backend service) not 5001 (this service)
    // API endpoint is POST http://localhost:5000/api/resumes/
    const response = await fetch('http://localhost:5000/api/resumes/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
    });
    if (!response.ok) {
        throw new Error('Failed to save resume info to DB');
    }
    const data = await response.json();
    return data;
};

