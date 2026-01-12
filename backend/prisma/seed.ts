import { PrismaClient, WorkMode, JobType, ExperienceLevel } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean up database (optional: remove if you want to keep old data)
  await prisma.application.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const developer = await prisma.user.create({
    data: {
      email: 'dev@test.com',
      passwordHash,
      fullName: 'John Developer',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      preferences: {
        preferredLocations: ['Remote', 'New York'],
        preferredWorkMode: ['REMOTE', 'HYBRID'],
        minSalary: 80000,
      },
    },
  });

  console.log(`👤 Created user: ${developer.email}`);

  // 3. Create Jobs
  const jobsData = [
    {
      title: 'Senior Frontend Engineer',
      company: 'TechCorp',
      location: 'Remote',
      workMode: WorkMode.REMOTE,
      jobType: JobType.FULL_TIME,
      salaryMin: 90000,
      salaryMax: 140000,
      experienceLevel: ExperienceLevel.SENIOR,
      requiredSkills: ['React', 'TypeScript', 'CSS', 'Redux'],
      description: 'We are looking for a React expert to lead our frontend team.',
    },
    {
      title: 'Backend Developer (Node.js)',
      company: 'StartupX',
      location: 'New York, NY',
      workMode: WorkMode.HYBRID,
      jobType: JobType.FULL_TIME,
      salaryMin: 80000,
      salaryMax: 120000,
      experienceLevel: ExperienceLevel.MID,
      requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
      description: 'Join our fast-paced startup building scalable APIs.',
    },
    {
      title: 'Full Stack Developer',
      company: 'Innovate Ltd',
      location: 'San Francisco, CA',
      workMode: WorkMode.ONSITE,
      jobType: JobType.CONTRACT,
      salaryMin: 70000,
      salaryMax: 110000,
      experienceLevel: ExperienceLevel.MID,
      requiredSkills: ['Python', 'Django', 'React', 'AWS'],
      description: 'Help us build internal tools using Python and React.',
    },
    {
      title: 'Junior Web Developer',
      company: 'Creative Agency',
      location: 'London, UK',
      workMode: WorkMode.HYBRID,
      jobType: JobType.FULL_TIME,
      salaryMin: 40000,
      salaryMax: 60000,
      experienceLevel: ExperienceLevel.ENTRY,
      requiredSkills: ['HTML', 'CSS', 'JavaScript', 'Vue'],
      description: 'Great opportunity for a junior dev to learn Vue.js.',
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudSystems',
      location: 'Remote',
      workMode: WorkMode.REMOTE,
      jobType: JobType.FULL_TIME,
      salaryMin: 110000,
      salaryMax: 160000,
      experienceLevel: ExperienceLevel.SENIOR,
      requiredSkills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
      description: 'Manage our cloud infrastructure and deployment pipelines.',
    },
  ];

  // Create duplicates to fill up the DB
  for (const job of jobsData) {
    await prisma.job.create({ data: job });
    // Create a variation
    await prisma.job.create({
      data: {
        ...job,
        title: `${job.title} II`,
        status: 'Active',
      },
    });
  }

  console.log(`💼 Created ${jobsData.length * 2} jobs`);
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });