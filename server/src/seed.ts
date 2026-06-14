import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'jenny@cleverrecruit.com',
        password: hashedPassword,
        firstName: 'Jenny',
        lastName: 'Chen',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'mark@cleverrecruit.com',
        password: hashedPassword,
        firstName: 'Mark',
        lastName: 'Williams',
        role: 'recruiter',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sarah@cleverrecruit.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@cleverrecruit.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Kim',
        role: 'recruiter',
      },
    }),
  ]);

  const companies = await Promise.all([
    prisma.company.create({
      data: { name: 'Google', industry: 'Technology', website: 'https://google.com', location: 'Mountain View, CA', size: '10,000+' },
    }),
    prisma.company.create({
      data: { name: 'Meta', industry: 'Technology', website: 'https://meta.com', location: 'Menlo Park, CA', size: '10,000+' },
    }),
    prisma.company.create({
      data: { name: 'Stripe', industry: 'FinTech', website: 'https://stripe.com', location: 'San Francisco, CA', size: '5,000-10,000' },
    }),
    prisma.company.create({
      data: { name: 'Spotify', industry: 'Entertainment', website: 'https://spotify.com', location: 'Stockholm, Sweden', size: '5,000-10,000' },
    }),
    prisma.company.create({
      data: { name: 'Airbnb', industry: 'Travel', website: 'https://airbnb.com', location: 'San Francisco, CA', size: '5,000-10,000' },
    }),
    prisma.company.create({
      data: { name: 'Amazon', industry: 'Technology', website: 'https://amazon.com', location: 'Seattle, WA', size: '10,000+' },
    }),
    prisma.company.create({
      data: { name: 'Netflix', industry: 'Entertainment', website: 'https://netflix.com', location: 'Los Gatos, CA', size: '10,000+' },
    }),
    prisma.company.create({
      data: { name: 'Microsoft', industry: 'Technology', website: 'https://microsoft.com', location: 'Redmond, WA', size: '10,000+' },
    }),
  ]);

  const jobs = await Promise.all([
    prisma.job.create({
      data: { title: 'Senior Software Engineer', description: 'We are looking for a senior software engineer to join our team.', location: 'Mountain View, CA', type: 'Full-time', salary: '$180,000 - $250,000', status: 'open', companyId: companies[0].id },
    }),
    prisma.job.create({
      data: { title: 'Product Designer', description: 'Join our design team to create beautiful user experiences.', location: 'Remote', type: 'Full-time', salary: '$130,000 - $180,000', status: 'open', companyId: companies[3].id },
    }),
    prisma.job.create({
      data: { title: 'Engineering Manager', description: 'Lead a team of 8-12 engineers building payment infrastructure.', location: 'San Francisco, CA', type: 'Full-time', salary: '$220,000 - $300,000', status: 'open', companyId: companies[2].id },
    }),
    prisma.job.create({
      data: { title: 'Backend Engineer', description: 'Build scalable distributed systems for our core platform.', location: 'Menlo Park, CA', type: 'Full-time', salary: '$160,000 - $220,000', status: 'open', companyId: companies[1].id },
    }),
    prisma.job.create({
      data: { title: 'DevOps Engineer', description: 'Manage and scale our cloud infrastructure.', location: 'Seattle, WA', type: 'Full-time', salary: '$150,000 - $200,000', status: 'closed', companyId: companies[5].id },
    }),
    prisma.job.create({
      data: { title: 'Data Scientist', description: 'Apply ML to improve content recommendations.', location: 'Los Gatos, CA', type: 'Full-time', salary: '$170,000 - $240,000', status: 'open', companyId: companies[6].id },
    }),
    prisma.job.create({
      data: { title: 'Frontend Engineer', description: 'Build the next generation of our web platform.', location: 'Redmond, WA', type: 'Full-time', salary: '$140,000 - $190,000', status: 'paused', companyId: companies[7].id },
    }),
    prisma.job.create({
      data: { title: 'UX Researcher', description: 'Conduct user research to inform product decisions.', location: 'San Francisco, CA', type: 'Contract', salary: '$120,000 - $160,000', status: 'open', companyId: companies[4].id },
    }),
  ]);

  const candidatesData = [
    { firstName: 'Robert', lastName: 'Wolf', email: 'r.wolf@gmail.com', phone: '+44 (452) 886 09 12', jobTitle: 'SOFTWARE ENGINEER', score: 79, status: 'active', stage: 'interview', location: 'Rome', currentPosition: 'Software Engineer', currentOrganization: 'Google', employmentStatus: 'Unemployed', ownerId: users[0].id },
    { firstName: 'Jill', lastName: 'Lenon', email: 'j.lenon@gmail.com', phone: '+44 (452) 886 09 13', jobTitle: 'ENGINEER', score: 75, status: 'active', stage: 'interview', location: 'London', currentPosition: 'Backend Engineer', currentOrganization: 'Meta', employmentStatus: 'Employed', ownerId: users[0].id },
    { firstName: 'Henry', lastName: 'Smith', email: 'h.smith@gmail.com', phone: '+44 (452) 886 09 14', jobTitle: 'DESIGNER', score: 60, status: 'inactive', stage: null, location: 'Berlin', currentPosition: 'UI Designer', currentOrganization: 'Spotify', employmentStatus: 'Employed', ownerId: users[1].id },
    { firstName: 'Bill', lastName: 'Moore', email: 'b.moore@gmail.com', phone: '+44 (452) 886 09 15', jobTitle: 'DESIGNER', score: 55, status: 'inactive', stage: null, location: 'Paris', currentPosition: 'Product Designer', currentOrganization: 'Airbnb', employmentStatus: 'Employed', ownerId: users[1].id },
    { firstName: 'Jeremy', lastName: 'Cooper', email: 'j.cooper@gmail.com', phone: '+44 (452) 886 09 16', jobTitle: 'MANAGER', score: 45, status: 'inactive', stage: null, location: 'New York', currentPosition: 'Engineering Manager', currentOrganization: 'Amazon', employmentStatus: 'Employed', ownerId: users[0].id },
    { firstName: 'Sophia', lastName: 'Martinez', email: 's.martinez@gmail.com', phone: '+44 (452) 886 09 19', jobTitle: 'MANAGER', score: 73, status: 'active', stage: 'interview', location: 'Madrid', currentPosition: 'Product Manager', currentOrganization: 'Stripe', employmentStatus: 'Employed', ownerId: users[0].id },
    { firstName: 'Liam', lastName: 'Johnson', email: 'l.johnson@gmail.com', phone: '+44 (452) 886 09 18', jobTitle: 'MANAGER', score: 70, status: 'active', stage: 'interview', location: 'Dublin', currentPosition: 'Tech Lead', currentOrganization: 'Microsoft', employmentStatus: 'Employed', ownerId: users[2].id },
    { firstName: 'Emma', lastName: 'Thompson', email: 'e.thompson@gmail.com', phone: '+44 (452) 886 09 17', jobTitle: 'MANAGER', score: 42, status: 'active', stage: null, location: 'Amsterdam', currentPosition: 'Operations Manager', currentOrganization: 'Netflix', employmentStatus: 'Employed', ownerId: users[1].id },
    { firstName: 'Noah', lastName: 'Brown', email: 'n.brown@gmail.com', phone: '+44 (452) 886 09 20', jobTitle: 'MANAGER', score: 30, status: 'active', stage: 'rejected', location: 'Toronto', currentPosition: 'Project Manager', currentOrganization: 'Shopify', employmentStatus: 'Employed', ownerId: users[2].id },
    { firstName: 'Olivia', lastName: 'Davis', email: 'o.davis@gmail.com', phone: '+44 (452) 886 09 21', jobTitle: 'MANAGER', score: 20, status: 'active', stage: 'rejected', location: 'Sydney', currentPosition: 'Sales Manager', currentOrganization: 'Atlassian', employmentStatus: 'Employed', ownerId: users[0].id },
    { firstName: 'Ethan', lastName: 'Wilson', email: 'e.wilson@gmail.com', phone: '+44 (452) 886 09 22', jobTitle: 'MANAGER', score: 62, status: 'inactive', stage: null, location: 'Singapore', currentPosition: 'DevOps Manager', currentOrganization: 'Grab', employmentStatus: 'Employed', ownerId: users[3].id },
    { firstName: 'Ava', lastName: 'Garcia', email: 'a.garcia@gmail.com', phone: '+44 (452) 886 09 23', jobTitle: 'MANAGER', score: 33, status: 'active', stage: 'rejected', location: 'Barcelona', currentPosition: 'HR Manager', currentOrganization: 'Klarna', employmentStatus: 'Employed', ownerId: users[1].id },
    { firstName: 'Mason', lastName: 'Lee', email: 'm.lee@gmail.com', phone: '+44 (452) 886 09 24', jobTitle: 'MANAGER', score: 70, status: 'active', stage: 'interview', location: 'Seoul', currentPosition: 'Data Manager', currentOrganization: 'Samsung', employmentStatus: 'Employed', ownerId: users[0].id },
  ];

  const candidates = await Promise.all(
    candidatesData.map((c) => prisma.candidate.create({ data: c }))
  );

  await Promise.all([
    prisma.assignment.create({
      data: { candidateId: candidates[0].id, jobId: jobs[0].id, companyId: companies[0].id, stage: 'interview', type: 'Technical Assignment' },
    }),
    prisma.assignment.create({
      data: { candidateId: candidates[0].id, jobId: jobs[2].id, companyId: companies[2].id, stage: 'applied', type: 'Assigned' },
    }),
    prisma.assignment.create({
      data: { candidateId: candidates[1].id, jobId: jobs[3].id, companyId: companies[1].id, stage: 'interview', type: 'Technical Assignment' },
    }),
    prisma.assignment.create({
      data: { candidateId: candidates[5].id, jobId: jobs[2].id, companyId: companies[2].id, stage: 'interview', type: 'Final Round' },
    }),
  ]);

  await Promise.all([
    prisma.note.create({
      data: { title: 'Initial screening call', content: 'Robert performed well in the initial screening. Strong technical background.', candidateId: candidates[0].id, authorId: users[0].id },
    }),
    prisma.note.create({
      data: { title: 'Technical assessment results', content: 'Scored 85/100 on the coding challenge. Excellent problem solving.', candidateId: candidates[0].id, authorId: users[0].id },
    }),
    prisma.note.create({
      data: { title: 'Culture fit interview', content: 'Great communication skills. Aligns well with team values.', candidateId: candidates[0].id, authorId: users[1].id },
    }),
    prisma.note.create({
      data: { title: 'Reference check', content: 'Positive references from previous managers at Google.', candidateId: candidates[0].id, authorId: users[0].id },
    }),
  ]);

  await Promise.all([
    prisma.task.create({
      data: { title: 'Follow up on technical assessment', content: 'Send results and next steps', dueDate: new Date('2025-04-20'), candidateId: candidates[0].id, assigneeId: users[0].id },
    }),
    prisma.task.create({
      data: { title: 'Schedule final interview', content: 'Coordinate with hiring manager', dueDate: new Date('2025-04-25'), candidateId: candidates[0].id, assigneeId: users[0].id },
    }),
  ]);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
