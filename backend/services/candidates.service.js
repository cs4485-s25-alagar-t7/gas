import Candidate from '../models/Candidate.js';
import Assignment from '../models/Assignment.js';
import Section from '../models/Section.js';
import * as xlsx from 'xlsx/xlsx.mjs';

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
}

export default CandidateService;