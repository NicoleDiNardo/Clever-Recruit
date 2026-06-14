import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { candidatesRouter } from './routes/candidates.js';
import { jobsRouter } from './routes/jobs.js';
import { companiesRouter } from './routes/companies.js';
import { teamRouter } from './routes/team.js';
import { dashboardRouter } from './routes/dashboard.js';
import { notesRouter } from './routes/notes.js';
import { tasksRouter } from './routes/tasks.js';
import { assignmentsRouter } from './routes/assignments.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/team', teamRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notes', notesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/assignments', assignmentsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
