import fs from 'fs/promises';
const pdf = require('pdf-parse'); // This will now work perfectly with v1.1.1

const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 
  'Ruby', 'PHP', 'React', 'Angular', 'Vue', 'Node', 'Express', 'Django', 
  'Flask', 'Spring', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 
  'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'REST', 'GraphQL', 'HTML', 'CSS'
];

export async function extractSkillsFromResume(filePath: string): Promise<string[]> {
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    // With v1.1.1, this is a simple function call
    const data = await pdf(fileBuffer);
    
    // Clean up text (remove extra spaces/newlines)
    const text = data.text.toLowerCase().replace(/\s+/g, ' ');

    console.log('=== EXTRACTED TEXT START ===');
    console.log(text.substring(0, 300)); 
    console.log('=== EXTRACTED TEXT END ===');

    const foundSkills = SKILL_KEYWORDS.filter((skill) =>
      text.includes(skill.toLowerCase())
    );

    const uniqueSkills = Array.from(new Set(foundSkills));

    console.log('Found skills:', uniqueSkills);

    return uniqueSkills.length > 0 ? uniqueSkills : ['General'];
  } catch (error) {
    console.error('Error parsing resume:', error);
    return ['General'];
  }
}