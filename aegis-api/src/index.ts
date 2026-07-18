import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  aegis_db: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// 1. Enable CORS for both Localhost AND your Live Production Site
app.use('/*', cors({
  origin: [
    'http://localhost:5173', 
    'https://aegis-digital.pages.dev' // ADD YOUR LIVE SITE URL HERE
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// --- WEB CRYPTO UTILITIES FOR PASSWORD HASHING ---
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  const pbkdf2Derivation = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  
  const hashArray = Array.from(new Uint8Array(pbkdf2Derivation))
  const saltArray = Array.from(salt)
  
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, originalHashHex] = storedHash.split(':')
  const encoder = new TextEncoder()
  
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  const pbkdf2Derivation = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  
  const hashArray = Array.from(new Uint8Array(pbkdf2Derivation))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex === originalHashHex
}

// Helper function to dynamically generate your exact 3-part custom Intern ID format
// Part 1: Domain  (one unique 3-letter code per program - exact match first,
//         so every one of the 11 tracks gets its own code instead of being
//         guessed by loose substring matching)
// Part 2: Year    (from the application's created_at)
// Part 3: Main ID (derived from the application's database row id)
const PROGRAM_DOMAIN_CODES: Record<string, string> = {
  'cyber security': 'CYB',
  'security analysis': 'SEC',
  'software development': 'DEV',
  'web development': 'WEB',
  'artificial intelligence': 'ARI',
  'python programming': 'PYT',
  'java programming': 'JAV',
  'c++ programming': 'CPP',
  'javascript programming': 'JSC',
  'typescript programming': 'TSC',
  'ui/ux design': 'UIX',
}

function generateInternId(programName: string, createdAt: string, idString: string): string {
  // Part 1: Internship Domain Prefix Mapping
  const track = (programName || '').trim().toLowerCase()
  let domainPrefix = PROGRAM_DOMAIN_CODES[track]

  if (!domainPrefix) {
    // Fallback for anything that doesn't exactly match one of the 11
    // programs above (e.g. a legacy/typo'd program name already in the DB).
    if (track.includes('cyber') || track.includes('security') || track.includes('testing')) {
      domainPrefix = 'CYB'
    } else if (track.includes('artificial') || track.includes('intelligence')) {
      domainPrefix = 'ARI'
    } else if (track.includes('python')) {
      domainPrefix = 'PYT'
    } else if (track.includes('java') && !track.includes('script')) {
      domainPrefix = 'JAV'
    } else if (track.includes('c++') || track.includes('cpp')) {
      domainPrefix = 'CPP'
    } else if (track.includes('javascript')) {
      domainPrefix = 'JSC'
    } else if (track.includes('typescript')) {
      domainPrefix = 'TSC'
    } else if (track.includes('ui') || track.includes('ux') || track.includes('design')) {
      domainPrefix = 'UIX'
    } else if (track.includes('cloud') || track.includes('architecture')) {
      domainPrefix = 'CLD'
    } else if (track.includes('web')) {
      domainPrefix = 'WEB'
    } else if (track.includes('software') || track.includes('development')) {
      domainPrefix = 'DEV'
    } else {
      domainPrefix = 'GEN'
    }
  }

  // Part 2: Year Parameter Selection
  const submissionYear = createdAt ? new Date(createdAt).getFullYear() : 2026

  // Part 3: Application Sequence Identifier
  // Takes the final 4 uppercase digits of the unique database key descriptor
  const padIndex = idString ? idString.toString().substring(0, 4).toUpperCase() : '001'

  return `${domainPrefix}-${submissionYear}-${padIndex}`
}


// --- API ROUTES ---

// Health Check
app.get('/', (c) => {
  return c.json({ message: 'Aegis Backend API is fully active and running on the Cloudflare Edge network!' })
})

// PUBLIC: SITE-WIDE STATS (aggregate counts only — no student names/emails,
// safe to expose on the public homepage, unlike /api/applications)
app.get('/api/stats', async (c) => {
  try {
    const result = await c.env.aegis_db
      .prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'approved'")
      .first<{ count: number }>()

    return c.json({ success: true, activeInterns: result?.count ?? 0 })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// REGISTER USER WITH ACTIVE 20-QUESTION QUIZ SCREENING GATE
app.post('/api/register', async (c) => {
  try {
    const { name, email, password, quizScore } = await c.req.json()

    if (!name || !email || !password) {
      return c.json({ success: false, message: 'All fields (name, email, password) are required.' }, 400)
    }

    // 20-Question Aptitude Verification Check (60% Passing Benchmark = 12 Correct)
    if (quizScore === undefined || quizScore < 12) {
      return c.json({ 
        success: false, 
        message: 'Registration Denied. You must clear the technical screening test with a minimum score of 60% (12/20) to enroll.' 
      }, 403)
    }

    const existingUser = await c.env.aegis_db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first()

    if (existingUser) {
      return c.json({ success: false, message: 'An account with this email address already exists.' }, 400)
    }

    const userId = globalThis.crypto.randomUUID()
    const password_hash = await hashPassword(password)

    await c.env.aegis_db
      .prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)')
      .bind(userId, name, email, password_hash)
      .run()

    return c.json({
      success: true,
      message: 'Aptitude screening passed! Account registered successfully.',
      user: { id: userId, name, email, role: 'student' }
    }, 201)

  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// LOGIN USER
app.post('/api/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ success: false, message: 'Email and password are required.' }, 400)
    }

    const user = await c.env.aegis_db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; name: string; email: string; password_hash: string; role: string }>()

    if (!user) {
      return c.json({ success: false, message: 'Invalid email or password.' }, 401)
    }

    const isPasswordValid = await verifyPassword(password, user.password_hash)
    if (!isPasswordValid) {
      return c.json({ success: false, message: 'Invalid email or password.' }, 401)
    }

    return c.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// --- APPLICATION ROUTES ---

// 1. SUBMIT AN APPLICATION (REPLACEMENT)
app.post('/api/apply', async (c) => {
  try {
    const { userId, programName, details, password } = await c.req.json();

    if (!userId || !programName) {
      return c.json({ success: false, message: 'User ID and Program Name are required.' }, 400);
    }

    let finalUserId = userId;
    const parsedDetails = JSON.parse(details || '{}');

    // Check if user exists
    const user = await c.env.aegis_db
      .prepare('SELECT id FROM users WHERE id = ? OR email = ?')
      .bind(userId, parsedDetails.studentEmail || '')
      .first<{ id: string }>();

    if (user) {
      finalUserId = user.id;

      // SYNC: Keep the user's profile current with what was just submitted.
      // Without this, a placeholder name/email created by an earlier
      // auto-register (e.g. before fullName was being sent, or from a
      // stale localStorage userId) would stick around forever and never
      // reflect what the applicant actually typed on later submissions.
      const syncFields: string[] = [];
      const syncValues: any[] = [];
      if (parsedDetails.fullName) {
        syncFields.push('name = ?');
        syncValues.push(parsedDetails.fullName);
      }
      if (parsedDetails.studentEmail) {
        syncFields.push('email = ?');
        syncValues.push(parsedDetails.studentEmail);
      }
      if (syncFields.length > 0) {
        syncValues.push(finalUserId);
        await c.env.aegis_db
          .prepare(`UPDATE users SET ${syncFields.join(', ')} WHERE id = ?`)
          .bind(...syncValues)
          .run();
      }
    } else {
      // AUTO-REGISTER: User not found, so we create them now
      const newUserPasswordHash = password
        ? await hashPassword(password)
        : "PENDING_REGISTRATION";

      await c.env.aegis_db
        .prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)')
        .bind(
          userId, 
          parsedDetails.fullName || "New Applicant", 
          parsedDetails.studentEmail || "pending@aegis.com", 
          newUserPasswordHash, 
          "student"
        )
        .run();
      finalUserId = userId;
    }

    // Insert Application
    const applicationId = globalThis.crypto.randomUUID();
    await c.env.aegis_db
      .prepare('INSERT INTO applications (id, user_id, program_name, details) VALUES (?, ?, ?, ?)')
      .bind(applicationId, finalUserId, programName, details || '')
      .run();

    return c.json({
      success: true,
      message: 'Application submitted successfully!',
      application: { id: applicationId, userId: finalUserId, programName, status: 'pending' }
    }, 201);

  } catch (error: any) {
    console.error("Apply API Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 2. GET ALL APPLICATIONS (For Admin Dashboard)
app.get('/api/applications', async (c) => {
  try {
    const { results } = await c.env.aegis_db
      .prepare(`
        SELECT 
          applications.id,
          applications.program_name as programName,
          applications.status,
          applications.details,
          applications.created_at as createdAt,
          applications.certificateIssued as certificateIssued,
          users.name as studentName,
          users.email as studentEmail
        FROM applications
        JOIN users ON applications.user_id = users.id
        ORDER BY applications.created_at DESC
      `)
      .all()

    const formattedApplications = results.map((app: any) => ({
      ...app,
      certificateIssued: app.certificateIssued === true || Number(app.certificateIssued) === 1,
      internId: generateInternId(app.programName, app.createdAt, app.id)
    }))

    return c.json({ success: true, applications: formattedApplications })

  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 3. UPDATE APPLICATION STATUS (Approve or Reject)
app.put('/api/applications/:id/status', async (c) => {
  try {
    const applicationId = c.req.param('id')
    const { status } = await c.req.json()

    if (!status || !['approved', 'rejected', 'pending'].includes(status.toLowerCase())) {
      return c.json({ success: false, message: 'Invalid or missing status value.' }, 400)
    }

    const result = await c.env.aegis_db
      .prepare('UPDATE applications SET status = ? WHERE id = ?')
      .bind(status.toLowerCase(), applicationId)
      .run()

    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Application record not found.' }, 404)
    }

    return c.json({
      success: true,
      message: `Application status updated to ${status} successfully!`
    })

  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 4. GET STUDENT APPLICATIONS (For Student Dashboard)
app.get('/api/applications/student/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')

    const { results } = await c.env.aegis_db
      .prepare(`
        SELECT 
          id,
          program_name as programName,
          status,
          details,
          created_at as createdAt,
          certificateIssued
        FROM applications
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .bind(userId)
      .all()

    const formattedApplications = results.map((app: any) => ({
      ...app,
      certificateIssued: app.certificateIssued === true || Number(app.certificateIssued) === 1,
      internId: generateInternId(app.programName, app.createdAt, app.id)
    }))

    return c.json({ success: true, applications: formattedApplications })

  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 5. DELETE APPLICATION
app.delete('/api/applications/:id', async (c) => {
  try {
    const applicationId = c.req.param('id')

    const result = await c.env.aegis_db
      .prepare('DELETE FROM applications WHERE id = ?')
      .bind(applicationId)
      .run()

    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Application record not found.' }, 404)
    }

    return c.json({ success: true, message: 'Student application permanently purged from D1 storage.' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 6. EDIT APPLICATION INFO
app.put('/api/applications/:id/edit', async (c) => {
  try {
    const applicationId = c.req.param('id')
    const { studentName, studentEmail, programName, details } = await c.req.json()

    if (!studentName || !studentEmail || !programName || !details) {
      return c.json({ success: false, message: 'All parameter adjustments are required.' }, 400)
    }

    const applicationRow = await c.env.aegis_db
      .prepare('SELECT user_id FROM applications WHERE id = ?')
      .bind(applicationId)
      .first<{ user_id: string }>()

    if (!applicationRow) {
      return c.json({ success: false, message: 'Application record not found.' }, 404)
    }

    const linkedUserId = applicationRow.user_id

    await c.env.aegis_db
      .prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
      .bind(studentName, studentEmail, linkedUserId)
      .run()

    await c.env.aegis_db
      .prepare('UPDATE applications SET program_name = ?, details = ? WHERE id = ?')
      .bind(programName, details, applicationId)
      .run()

    return c.json({ success: true, message: 'Student master records overwritten cleanly.' })
  } catch (error: any) {
    console.error("Admin Override Error:", error.message)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 7. ADMIN PASSWORD RESET
app.put('/api/applications/:id/reset-password', async (c) => {
  try {
    const applicationId = c.req.param('id')
    const rawBody = await c.req.text()
    let newPassword = ''
    
    try {
      const parsed = JSON.parse(rawBody)
      newPassword = parsed.newPassword
    } catch {
      return c.json({ success: false, message: 'Invalid payload structure. Request body must be valid JSON.' }, 400)
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return c.json({ success: false, message: 'A valid new password (minimum 6 characters) is required.' }, 400)
    }

    const applicationRow = await c.env.aegis_db
      .prepare('SELECT user_id FROM applications WHERE id = ?')
      .bind(applicationId)
      .first<{ user_id: string }>()

    if (!applicationRow) {
      return c.json({ success: false, message: 'Application record not found.' }, 404)
    }

    const newHash = await hashPassword(newPassword.trim())

    await c.env.aegis_db
      .prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .bind(newHash, applicationRow.user_id)
      .run()

    return c.json({ success: true, message: 'Student password hash re-calculated and committed successfully.' })

  } catch (error: any) {
    console.error("Password reset fatal error:", error.message)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 8. ADMIN CERTIFICATE DISPATCH ROUTE
app.put('/api/applications/:id/issue-certificate', async (c) => {
  try {
    const appId = c.req.param('id');

    const query = await c.env.aegis_db
      .prepare('UPDATE applications SET certificateIssued = 1 WHERE id = ?')
      .bind(appId)
      .run();

    if (query.meta.changes === 0) {
      return c.json({ success: false, message: 'No rows modified. Application row not found.' }, 404);
    }

    return c.json({ success: true, certificateIssued: 1, message: 'Certificate status updated successfully.' });
  } catch (error: any) {
    console.error("Certificate generation error:", error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});
// 8.5 PUBLIC: VERIFY INTERN ID
app.get('/api/verify/:internId', async (c) => {
  try {
    const internId = c.req.param('internId');
    
    const { results } = await c.env.aegis_db
      .prepare(`SELECT applications.*, users.name as studentName FROM applications JOIN users ON applications.user_id = users.id`)
      .all();

    const app = results.find((a: any) => {
      const generated = generateInternId(a.program_name, a.created_at, a.id);
      console.log(`Comparing: ${generated} vs ${internId}`); 
      return generated === internId && a.certificateIssued === 1;
    });

    if (!app) {
      return c.json({ success: false, message: 'Invalid or unverified Intern ID.' }, 404);
    }

    return c.json({ 
      success: true, 
      data: { 
        name: app.studentName, 
        program: app.program_name, 
        internId: internId, 
        issuedDate: new Date(app.created_at).toLocaleDateString() 
      } 
    });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
});

// 9. STUDENT PROJECT GOOGLE DRIVE PATH SUBMISSION ROUTE
app.post('/api/submissions', async (c) => {
  try {
    const { applicationId, taskId, repoUrl, notes } = await c.req.json()

    if (!applicationId || !taskId || !repoUrl) {
      return c.json({ success: false, message: 'Application link, Task identifier, and Google Drive URL are required parameters.' }, 400)
    }

    const submissionId = globalThis.crypto.randomUUID()

    await c.env.aegis_db
      .prepare('INSERT INTO submissions (id, application_id, task_id, repo_url, notes) VALUES (?, ?, ?, ?, ?)')
      .bind(submissionId, applicationId, taskId, repoUrl, notes || '')
      .run()

    return c.json({ success: true, message: 'Project Google Drive link submitted successfully to edge evaluation rows!' }, 201)
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
// 10. ADMIN: GET ALL SUBMISSIONS
app.get('/api/admin/submissions', async (c) => {
  try {
    const { results } = await c.env.aegis_db
      .prepare(`
        SELECT 
          submissions.*, 
          users.name as studentName, 
          applications.program_name as programName
        FROM submissions
        JOIN applications ON submissions.application_id = applications.id
        JOIN users ON applications.user_id = users.id
        ORDER BY submissions.submitted_at DESC
      `)
      .all()
    return c.json({ success: true, submissions: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
// 11. ADMIN: UPDATE OR DELETE SUBMISSION
app.all('/api/admin/submissions/:id', async (c) => {
  const method = c.req.method;
  const id = c.req.param('id');

  // HANDLE UPDATE (Approve/Reject)
  if (method === 'PUT') {
    try {
      const { status, feedback } = await c.req.json();
      await c.env.aegis_db
        .prepare('UPDATE submissions SET status = ?, feedback = ? WHERE id = ?')
        .bind(status, feedback || '', id)
        .run();
      return c.json({ success: true, message: 'Submission updated.' });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  // HANDLE DELETE
  if (method === 'DELETE') {
    try {
      const result = await c.env.aegis_db
        .prepare('DELETE FROM submissions WHERE id = ?')
        .bind(id)
        .run();
      if (result.meta.changes === 0) {
        return c.json({ success: false, message: 'Submission not found.' }, 404);
      }
      return c.json({ success: true, message: 'Submission deleted successfully.' });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 500);
    }
  }

  return c.json({ success: false, message: 'Method not allowed' }, 405);
});

// 12. STUDENT: GET MY SUBMISSIONS
app.get('/api/submissions/student/:applicationId', async (c) => {
  try {
    const applicationId = c.req.param('applicationId');
    const { results } = await c.env.aegis_db
      .prepare('SELECT * FROM submissions WHERE application_id = ? ORDER BY submitted_at DESC')
      .bind(applicationId)
      .all();
      
    return c.json({ success: true, submissions: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
// 14. ADMIN: ASSIGN A TASK
app.post('/api/admin/tasks', async (c) => {
  try {
    const { applicationId, title, driveLink } = await c.req.json(); // Note: must match the keys sent by frontend
    
    if (!applicationId || !title || !driveLink) {
      return c.json({ success: false, message: "Missing required fields" }, 400);
    }

    const taskId = globalThis.crypto.randomUUID();
    
    // Ensure 'tasks' table has 'drive_link' column
    await c.env.aegis_db
      .prepare('INSERT INTO tasks (id, application_id, title, drive_link) VALUES (?, ?, ?, ?)')
      .bind(taskId, applicationId, title, driveLink)
      .run();
      
    return c.json({ success: true, taskId });
  } catch (error: any) {
    console.error("Task Assignment Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// 15. GET TASKS FOR AN APPLICATION (Used for progress calculation)
app.get('/api/tasks', async (c) => {
  try {
    const appId = c.req.query('applicationId'); // Matches fetch('.../api/tasks?applicationId=...')
    const { results } = await c.env.aegis_db
      .prepare('SELECT * FROM tasks WHERE application_id = ?')
      .bind(appId)
      .all();
    return c.json({ success: true, tasks: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
// 16. STUDENT: SUBMIT A SPECIFIC TASK
app.put('/api/tasks/:taskId/submit', async (c) => {
  const taskId = c.req.param('taskId');
  const { file_url } = await c.req.json();
  
  await c.env.aegis_db
    .prepare('UPDATE tasks SET status = "completed", file_url = ? WHERE id = ?')
    .bind(file_url, taskId)
    .run();
    
  return c.json({ success: true });
});
// 17. NEW CONTACT ROUTES to admin
app.post('/api/contact', async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json();
    const id = globalThis.crypto.randomUUID();
    await c.env.aegis_db
      .prepare("INSERT INTO contact_messages (id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)")
      .bind(id, name, email, subject, message)
      .run();
    return c.json({ success: true, message: 'Message sent successfully!' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
// 18. GET ALL CONTACT MESSAGES (Admin only)
app.get('/api/admin/messages', async (c) => {
  try {
    const { results } = await c.env.aegis_db
      .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC")
      .all();
    return c.json({ success: true, messages: results });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});
// 19. DELETE A CONTACT MESSAGE (Admin only)
app.delete('/api/admin/messages/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await c.env.aegis_db
      .prepare("DELETE FROM contact_messages WHERE id = ?")
      .bind(id)
      .run();
      
    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Message not found.' }, 404);
    }
    return c.json({ success: true, message: 'Message deleted successfully.' });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

export default app