import Candidate from '../models/Candidate.js';
import Assignment from '../models/Assignment.js';
import Section from '../models/Section.js';
import * as xlsx from 'xlsx/xlsx.mjs';
import JSZip from 'jszip';
import { parseResume } from '/resume-parser/dist/services/parsing.service.js';

class CandidateService {
    static async getCandidates({ semester, unassigned }) {
        const filter = {};
        if (semester) filter.semester = semester;

        let candidates = await Candidate.find(filter);

        if (unassigned === 'true' && semester) {
            // Find all assigned candidate IDs for the semester
            const assigned = await Assignment.find({ semester }).distinct('grader_id');
            candidates = candidates.filter(c => !assigned.includes(c._id));
        }

        const assignments = await Assignment.find(semester ? { semester } : {}).populate('course_section_id');

        console.log("Total candidates:", candidates.length);
        console.log("Total assignments:", assignments.length);

        const result = candidates.map(candidate => {
            const assigned = assignments.find(a => a.grader_id?.toString() === candidate._id.toString());
            return {
                ...candidate.toObject(),
                assignmentStatus: !!assigned,
                course: assigned?.course_section_id || null,
            };
        });

        return result;
    }


    // Modifies the candidates in the database for a particular semester based on the data in the Excel file
    // should update the UTDID based on the matching document ID
    // should also update the seniority score and major 
    static async bulkModifyCandidatesFromExcel(excelBuffer, semester) {
        const workbook = xlsx.read(excelBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { range: 1 });

        if (!data.length) {
            throw new Error('No data found in the Excel file');
        }

        // fetch all candidates for the semester
        const existingCandidates = await Candidate.find({ semester: semester });
        // Create a map of existing candidates by netid (actually document ID)
        const existingCandidatesMap = new Map(existingCandidates.map(c => [c.netid, c]));
        const updatePromises = [];
        const updatedCandidates = [];

        for (const row of data) {
            const UTDID = row['Student ID'].toString();
            const seniority = row['Student School Year Name'];
            const major = row['Majors'];
            const name = row['Student First Name'] + ' ' + row['Student Last Name'];
            const document_id = row['Document IDs'].toString();

            if (!document_id || !seniority || !major || !UTDID) {
                throw new Error('Missing required fields in the Excel file');
            }
            const candidate = existingCandidatesMap.get(document_id);
            if (candidate) {
                // Prepare update
                updatePromises.push(
                    Candidate.findByIdAndUpdate(candidate._id, {
                        seniority: seniority,
                        major: major,
                        netid: UTDID,
                        name: name
                    }, { new: true }).then(updated => {
                        if (updated) {
                            updatedCandidates.push(updated.netid);
                        }
                    })
                );
            } else {
                console.error(`Candidate with netid/document_id ${document_id} was in the excel sheet but not found in the database`);
            }
        }

        await Promise.all(updatePromises);

        if (updatedCandidates.length === 0) {
            throw new Error('No valid candidates found in the file');
        }
        console.log(`Successfully updated ${updatedCandidates.length} candidates' IDs`);
        return updatedCandidates;
    }

    static async addCandidate(candidateData) {
        const newCandidate = new Candidate(candidateData);
        return await newCandidate.save();
    }

    static async removeCandidate(id) {
        return await Candidate.findByIdAndDelete(id);
    }

    static async deleteAllBySemester(semester) {
        const candidateResult = await Candidate.deleteMany({ semester });
        const assignmentResult = await Assignment.deleteMany({ semester });
        const sectionResult = await Section.deleteMany({ semester });
        return {
            candidates: candidateResult.deletedCount,
            assignments: assignmentResult.deletedCount,
            sections: sectionResult.deletedCount
        };
    }

    static async deleteAll() {
        return await Candidate.deleteMany({});
    }

    static async getAllSemesters() {
        return await Candidate.distinct('semester');
    }

    static async getRecentCandidates(semester, count) {
        return await Candidate
            .find({ semester })
            .sort({ _id: -1 })  // Sort by _id descending (most recent first)
            .limit(count);
    }

    static async processResumeZip(zipBuffer, semester) {
        // helper function reads the resume data and checks if the candidate has TA or grader experience
        // does not look for previous grader experience in the database because previous
        //  graders are already carried over from the previous semester
        const hasGraderExperience = (resumeData) => {
            const experience = resumeData.workExperiences.map(exp => exp.jobTitle + exp.company + exp.descriptions.join(' ')).join(' ');
            const education = resumeData.educations.map(edu => edu.descriptions.join(' ')).join(' ');
            const allText = experience + education;
            const allTextLower = allText.toLowerCase();
            return allText.includes('TA') || allTextLower.includes('grader') || allTextLower.includes('teaching assistant');
        }
        // Helper function to generate random values
        const generateRandomValues = (id) => {
            const majors = ['Computer Science', 'Software Engineering', 'Computer Engineering', 'Data Science', 'Information Technology'];
            const seniorities = ['Junior', 'Senior', 'Masters', 'Doctorate'];
            const gpa = (3.0 + Math.random()).toFixed(2);
            return {
                major: majors[Math.floor(Math.random() * majors.length)],
                seniority: seniorities[Math.floor(Math.random() * seniorities.length)],
                gpa: parseFloat(gpa),
                netid: id,
            };
        };

        let zipContent;
        try {
            const zip = new JSZip();
            zipContent = await zip.loadAsync(zipBuffer, {
                createFolders: true,
                checkCRC32: true
            });
        } catch (error) {
            throw new Error('Invalid zip file: ' + error.message);
        }

        // Get all files recursively
        const files = [];
        zipContent.forEach((relativePath, file) => {
            if (!file.dir) {
                files.push({
                    name: relativePath,
                    file: file
                });
            }
        });

        let processedCount = 0;
        let errors = [];

        // Process each PDF file
        for (const { name, file } of files) {
            if (name.toLowerCase().endsWith('.pdf')) {
                try {
                    let pdfBuffer;
                    try {
                        pdfBuffer = await file.async('nodebuffer');
                    } catch (error) {
                        errors.push({ filename: name, error: 'Failed to extract PDF: ' + error.message });
                        continue;
                    }
                    //TODO: only save keywords if they appear in at least one section
                    let resumeData;
                    try {
                        resumeData = await parseResume(pdfBuffer);

                        // Extract name and ID from filename (e.g., "Douglas_Lewis_559082.pdf")
                        const filenameParts = name.replace('.pdf', '').split('_');
                        const extractedName = filenameParts.slice(0, -1).join(' ');
                        const extractedId = filenameParts[filenameParts.length - 1];

                        // Generate random values for required fields
                        const randomValues = generateRandomValues(extractedId);

                        // get keywords from resume
                        const keywords_string_from_featured = resumeData.skills.featuredSkills ? resumeData.skills.featuredSkills.map(featSkill => featSkill.skill.toLowerCase().trim() ?? "").join(",") : "";
                        const all_keywords = resumeData.skills.descriptions ? (resumeData.skills.descriptions.join(",") + keywords_string_from_featured)
                            .toLowerCase().split(/[,:()]/).map(skill => skill.trim())
                            .filter(skill => skill.length > 0 && skill.length <= 18) : [];
                        console.log("featuredSkills:", resumeData.skills.featuredSkills);
                        // check if the resume includes TA or grader experience
                        const experience = hasGraderExperience(resumeData);
                        // Add required fields with random values
                        const candidateData = {
                            name: extractedName,
                            ...randomValues,
                            semester,
                            previous_grader_experience: experience,
                            assignmentStatus: false,
                            resume_keywords: [...new Set(all_keywords)],
                            // ...resumeData  // This will override defaults if values exist in resumeData
                        };



                        try {
                            await CandidateService.addCandidate(candidateData);
                            processedCount++;
                        } catch (error) {
                            errors.push({ filename: name, error: 'Failed to save to database: ' + error.message });
                            continue;
                        }
                    } catch (error) {
                        errors.push({ filename: name, error: 'Failed to parse resume: ' + error.message });
                        continue;
                    }
                } catch (error) {
                    errors.push({ filename: name, error: error.message });
                }
            }
        }

        if (processedCount === 0) {
            return {
                message: 'No resumes were processed. Please check that your ZIP file contains PDF files.',
                processedCount: 0,
                totalFiles: files.length,
                filesFound: files.map(f => f.name),
                errors: errors.length > 0 ? errors : undefined
            };
        }

        return {
            message: `Successfully processed ${processedCount} resumes`,
            processedCount,
            totalFiles: files.length,
            filesFound: files.map(f => f.name),
            errors: errors.length > 0 ? errors : undefined
        };
    }

}

export default CandidateService;