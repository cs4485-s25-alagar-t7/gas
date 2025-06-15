import Section from '../models/Section.js';
import * as XLSX from 'xlsx/xlsx.mjs';

// Create a new section
export async function createSection(data) {
  const section = new Section(data);
  return await section.save();
}

// Get all sections
export async function getSections(filter = {}) {
  return await Section.find(filter);
}

// Get a section by ID
export async function getSectionById(id) {
  return await Section.findById(id);
}

// Update a section by ID
export async function updateSection(id, data) {
  return await Section.findByIdAndUpdate(id, data, { new: true });
}

// Delete a section by ID
export async function deleteSection(id) {
  return await Section.findByIdAndDelete(id);
}

// Bulk create sections from Excel buffer
export async function bulkCreateSectionsFromExcel(buffer, semester) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const headers = data[0];

  const sections = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const section = {};
    for (let j = 0; j < headers.length; j++) {
      section[headers[j]] = row[j];
    }
    section.semester = semester;
    sections.push(section);
  }
  if (sections.length === 0) {
    throw new Error('No valid sections found in the file');
  }

  const formatted_sections = sections.map(section => ({
    course_name: section['Course Number'],
    section_num: section['Section'],
    instructor: {
      name: section['Professor Name'],
      netid: section['Professor Email'] ? section['Professor Email'].split('@')[0] : ''
    },
    keywords: section['Keywords'] ? section['Keywords'].split(',').map(keyword => keyword.trim().toLowerCase()) : [],
    semester: semester,
    num_required_graders: parseInt(section['Num of graders']),
    requested_candidate_UTDIDs: section['Recommended Student ID'] ? section['Recommended Student ID'].toString().split(',').map(utdid => utdid.trim()) : [],
    recommended_candidate_names: section['Recommended Student Name'] ? section['Recommended Student Name'].split(',').map(name => name.trim()) : []
  }));

  // Optionally log the first parsed section
  if (formatted_sections.length > 0) {
    console.log('First section parsed:', formatted_sections[0]);
  }

  // Only add new sections (skip duplicates)
  const addedSections = [];
  for (const data of formatted_sections) {
    const exists = await Section.findOne({
      course_name: data.course_name,
      section_num: data.section_num,
      semester: data.semester
    });
    if (!exists) {
      const section = new Section(data);
      await section.save();
      addedSections.push(section);
    }
  }
  if (addedSections.length > 0) {
    console.log('First section added:', addedSections[0]);
  }
  return addedSections;
}
