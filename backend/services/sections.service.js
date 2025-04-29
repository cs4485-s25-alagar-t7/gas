import Section from '../models/Section.js';

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
