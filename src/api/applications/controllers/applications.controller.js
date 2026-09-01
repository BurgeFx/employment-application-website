import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import { uploadToCloudinary } from '../../../config/cloudinary.js';
import { sendApplicationSubmittedEmail } from '../../../config/email/index.js';

dotenv.config({ quiet: true });

const pgp = pgPromise({ noWarnings: true });

const cn = process.env.DATABASE_URL || {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
};

const db = pgp(cn);
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

async function saveApplication(req) {
  const files = req.files || {};
  const fileEntries = Object.values(files).flat();

  const oversizedFile = fileEntries.find((file) => file && file.size > MAX_UPLOAD_SIZE);
  if (oversizedFile) {
    const error = new Error('One or more files are too large. Please upload files smaller than 50MB.');
    error.status = 413;
    throw error;
  }

  const [resume, id_front, id_back, ssn_card] = await Promise.all([
    files.resume?.[0]
      ? uploadToCloudinary(files.resume[0], 'employment-applications/resume')
      : null,
    files.id_front?.[0]
      ? uploadToCloudinary(files.id_front[0], 'employment-applications/id-front')
      : null,
    files.id_back?.[0]
      ? uploadToCloudinary(files.id_back[0], 'employment-applications/id-back')
      : null,
    files.ssn_card?.[0]
      ? uploadToCloudinary(files.ssn_card[0], 'employment-applications/ssn-card')
      : null,
  ]);

  const {
    full_name, email, phone, ssn, work_auth, citizen, street, city, state, zip, country, suitability
  } = req.body;

  await db.none(`CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    ssn TEXT NOT NULL,
    work_auth TEXT,
    citizen TEXT,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT NOT NULL,
    suitability TEXT NOT NULL,
    resume_path TEXT,
    id_front_path TEXT,
    id_back_path TEXT,
    ssn_card_path TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );`);

  await db.none(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS work_auth TEXT;`);
  await db.none(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS citizen TEXT;`);

  const insertQuery = `INSERT INTO applications
    (full_name, email, phone, ssn, work_auth, citizen, street, city, state, zip, country, suitability, resume_path, id_front_path, id_back_path, ssn_card_path)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING id`;

  const values = [full_name, email, phone, ssn, work_auth || null, citizen || null, street, city, state, zip, country, suitability, resume, id_front, id_back, ssn_card];

  const result = await db.one(insertQuery, values);
  return { id: result.id, email, full_name };
}

export async function createApplication(req, res, next) {
  try {
    const { id, email, full_name } = await saveApplication(req);

    setImmediate(() => {
      sendApplicationSubmittedEmail({
        to: email,
        name: full_name || 'Applicant',
      })
        .then(() => console.log('Application confirmation email sent to:', email))
        .catch((emailError) => console.error('Application email notification failed:', emailError));
    });

    const acceptsHtml = req.headers && req.headers.accept && req.headers.accept.includes('text/html');
    if (acceptsHtml) {
      return res.redirect(303, '/submitted.html');
    }

    return res.status(201).json({ status: 'success', id });
  } catch (err) {
    next(err);
  }
}

export async function submitApplication(req, res, next) {
  try {
    const { id, email, full_name } = await saveApplication(req);

    setImmediate(() => {
      sendApplicationSubmittedEmail({
        to: email,
        name: full_name || 'Applicant',
      })
        .then(() => console.log('Application confirmation email sent to:', email))
        .catch((emailError) => console.error('Application email notification failed:', emailError));
    });

    return res.redirect(303, '/submitted.html');
  } catch (err) {
    next(err);
  }
}

export default { createApplication, submitApplication };
