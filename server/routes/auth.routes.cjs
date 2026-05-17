const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma.cjs');

// ─── Auth Middleware ───────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'globalsmile-secret');
    next();
  } catch (error) {
    return res.status(401).json({ error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
  }
}

// ─── Validation ────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function sanitize(str) { return typeof str === 'string' ? str.trim().substring(0, 100) : ''; }

// ─── Brute Force Protection ───────────────────
const loginAttempts = new Map();
function checkBrute(ip) {
  const e = loginAttempts.get(ip);
  if (!e) return false;
  if (Date.now() - e.first > 15 * 60 * 1000) { loginAttempts.delete(ip); return false; }
  return e.count >= 5;
}
function recordFail(ip) {
  const e = loginAttempts.get(ip);
  if (e) e.count++; else loginAttempts.set(ip, { count: 1, first: Date.now() });
}

// ─── Seed demo users on first run ──────────────
async function ensureDemoUsers() {
  try {
    const count = await prisma.user.count();
    if (count > 0) return;

    const hash = await bcrypt.hash('demo83', 8);
    const demoUsers = [
      { email: 'patient@globalsmile.com', passwordHash: hash, firstName: 'Sarah', lastName: 'Johnson', role: 'PATIENT', country: 'United States' },
      { email: 'admin@globalsmile.com', passwordHash: hash, firstName: 'Dr. Ravi', lastName: 'Kumar', role: 'ADMIN', country: 'India' },
      { email: 'dentist@globalsmile.com', passwordHash: hash, firstName: 'Dr. Emily', lastName: 'Chen', role: 'DENTIST', country: 'Australia' },
      { email: 'specialist@globalsmile.com', passwordHash: hash, firstName: 'Dr. Priya', lastName: 'Sharma', role: 'SPECIALIST', country: 'India' },
    ];

    for (const u of demoUsers) {
      const user = await prisma.user.create({ data: u });

      // Create patient profile for patient user
      if (u.role === 'PATIENT') {
        await prisma.patient.create({
          data: {
            userId: user.id,
            treatmentType: 'Full Mouth Rehabilitation',
            treatmentStatus: 'IN_PROGRESS',
            completionPercent: 65,
          },
        });
      }

      // Create dentist profile
      if (u.role === 'DENTIST') {
        await prisma.dentistProfile.create({
          data: { userId: user.id, specialization: 'General Dentistry', clinicName: 'Sydney Dental Centre', yearsExperience: 8 },
        });
      }
      if (u.role === 'SPECIALIST') {
        await prisma.dentistProfile.create({
          data: { userId: user.id, specialization: 'Prosthodontics', clinicName: 'Global Smile Vijayawada', yearsExperience: 18 },
        });
      }
    }

    // Seed certifications
    await prisma.certification.createMany({
      data: [
        { name: 'ISO 9001:2015', issuedBy: 'Bureau Veritas', category: 'Quality Management', validUntil: new Date('2027-03-15'), status: 'active' },
        { name: 'NABH Accreditation', issuedBy: 'National Accreditation Board', category: 'Healthcare Standards', validUntil: new Date('2027-06-20'), status: 'active' },
        { name: 'ADA Recognized', issuedBy: 'American Dental Association', category: 'Professional Standards', validUntil: new Date('2026-8-31'), status: 'active' },
        { name: 'Infection Control Certificate', issuedBy: 'OSAP', category: 'Sterilization', validUntil: new Date('2026-08-15'), status: 'active' },
      ],
    });

    // Seed treatment costs
    const costs = [
      ['Dental Implants', 'New York', 5000], ['Dental Implants', 'London', 4200], ['Dental Implants', 'Sydney', 4800], ['Dental Implants', 'Vijayawada', 800],
      ['Full Mouth Rehabilitation', 'New York', 30000], ['Full Mouth Rehabilitation', 'London', 25000], ['Full Mouth Rehabilitation', 'Sydney', 28000], ['Full Mouth Rehabilitation', 'Vijayawada', 8000],
      ['Porcelain Veneers', 'New York', 2000], ['Porcelain Veneers', 'London', 1800], ['Porcelain Veneers', 'Sydney', 1900], ['Porcelain Veneers', 'Vijayawada', 400],
      ['Crowns & Bridges', 'New York', 1500], ['Crowns & Bridges', 'London', 1300], ['Crowns & Bridges', 'Sydney', 1400], ['Crowns & Bridges', 'Vijayawada', 300],
      ['All-on-4 Implants', 'New York', 25000], ['All-on-4 Implants', 'London', 22000], ['All-on-4 Implants', 'Sydney', 24000], ['All-on-4 Implants', 'Vijayawada', 6000],
      ['Root Canal', 'New York', 800], ['Root Canal', 'London', 1000], ['Root Canal', 'Sydney', 1100], ['Root Canal', 'Vijayawada', 150],
      ['Teeth Whitening', 'New York', 800], ['Teeth Whitening', 'London', 700], ['Teeth Whitening', 'Sydney', 750], ['Teeth Whitening', 'Vijayawada', 100],
    ];
    await prisma.treatmentCost.createMany({
      data: costs.map(([treatment, city, cost]) => ({ treatment, city, cost })),
    });

    // Seed travel costs
    await prisma.travelCost.createMany({
      data: [
        { fromCountry: 'United States', flightCost: 800, accommodationPerDay: 50 },
        { fromCountry: 'United Kingdom', flightCost: 650, accommodationPerDay: 45 },
        { fromCountry: 'Australia', flightCost: 900, accommodationPerDay: 55 },
        { fromCountry: 'Canada', flightCost: 850, accommodationPerDay: 50 },
        { fromCountry: 'Germany', flightCost: 600, accommodationPerDay: 40 },
        { fromCountry: 'UAE', flightCost: 350, accommodationPerDay: 60 },
      ],
    });

    // Seed follow-up rules (Module 5)
    const followUpRules = [
      // Dental Implants
      { treatmentType: 'Dental Implants', dayAfter: 1, type: 'checkup', title: 'Post-Op Day 1 Check', message: 'How are you feeling after your implant surgery? Please report any unusual pain, swelling, or bleeding. Apply ice packs as directed.', channel: 'PUSH', priority: 'HIGH' },
      { treatmentType: 'Dental Implants', dayAfter: 3, type: 'review', title: 'Day 3: Healing Check', message: 'Time for your 3-day post-op assessment. Swelling should be reducing. Continue soft diet and prescribed medications.', channel: 'PUSH', priority: 'HIGH' },
      { treatmentType: 'Dental Implants', dayAfter: 7, type: 'checkup', title: 'Week 1: Suture Check', message: 'Your 1-week follow-up is due. We need to check healing and possibly remove sutures. Please schedule your visit.', channel: 'EMAIL', priority: 'HIGH' },
      { treatmentType: 'Dental Implants', dayAfter: 14, type: 'review', title: '2-Week Recovery Review', message: 'Two weeks post-surgery! We\'d like to assess your healing progress. You can gradually return to normal diet.', channel: 'PUSH', priority: 'MEDIUM' },
      { treatmentType: 'Dental Implants', dayAfter: 30, type: 'xray', title: '1-Month X-Ray Review', message: 'Time for your 1-month X-ray to check osseointegration progress. Please book your appointment.', channel: 'EMAIL', priority: 'MEDIUM' },
      { treatmentType: 'Dental Implants', dayAfter: 90, type: 'review', title: '3-Month Integration Check', message: 'Your 3-month check is important to verify implant integration before final prosthetic placement.', channel: 'EMAIL', priority: 'HIGH' },
      // Full Mouth Rehabilitation
      { treatmentType: 'Full Mouth Rehabilitation', dayAfter: 1, type: 'checkup', title: 'Day 1 Post-Treatment', message: 'Rest today. Take all prescribed medications on schedule. Avoid hot foods and drinks.', channel: 'PUSH', priority: 'HIGH' },
      { treatmentType: 'Full Mouth Rehabilitation', dayAfter: 7, type: 'review', title: 'Week 1 Follow-Up', message: 'How is your bite feeling? Any sensitivity or discomfort with the temporary restorations? Let us know.', channel: 'PUSH', priority: 'MEDIUM' },
      { treatmentType: 'Full Mouth Rehabilitation', dayAfter: 14, type: 'checkup', title: '2-Week Adjustment', message: 'Bite adjustment appointment needed. We\'ll fine-tune your temporary restorations for comfort.', channel: 'EMAIL', priority: 'MEDIUM' },
      { treatmentType: 'Full Mouth Rehabilitation', dayAfter: 30, type: 'review', title: '1-Month Evaluation', message: 'Your 1-month evaluation is crucial. We\'ll plan the final restoration phase based on healing.', channel: 'EMAIL', priority: 'HIGH' },
      // Porcelain Veneers
      { treatmentType: 'Porcelain Veneers', dayAfter: 1, type: 'checkup', title: 'Day After Veneer Placement', message: 'Your new veneers are bonded! Avoid biting hard foods for 48 hours. Report any rough edges.', channel: 'PUSH', priority: 'MEDIUM' },
      { treatmentType: 'Porcelain Veneers', dayAfter: 7, type: 'review', title: '1-Week Veneer Check', message: 'How do your veneers feel? We\'ll check the bite alignment and bonding integrity.', channel: 'PUSH', priority: 'MEDIUM' },
      { treatmentType: 'Porcelain Veneers', dayAfter: 30, type: 'cleaning', title: 'First Cleaning with Veneers', message: 'Time for your first professional cleaning since veneer placement. Special care protocols apply.', channel: 'EMAIL', priority: 'LOW' },
    ];
    await prisma.followUpRule.createMany({ data: followUpRules });

    // Seed demo medication for patient
    const demoPatient = await prisma.patient.findFirst();
    if (demoPatient) {
      const now = new Date();
      const weekLater = new Date(now);
      weekLater.setDate(weekLater.getDate() + 7);

      await prisma.medicationSchedule.createMany({
        data: [
          { patientId: demoPatient.id, name: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'THRICE_DAILY', startDate: now, endDate: weekLater, timeSlots: ['08:00', '14:00', '20:00'], reminders: true, isActive: true, takenCount: 4, missedCount: 1 },
          { patientId: demoPatient.id, name: 'Ibuprofen 400mg', dosage: '1 tablet', frequency: 'TWICE_DAILY', startDate: now, endDate: weekLater, timeSlots: ['09:00', '21:00'], reminders: true, isActive: true, takenCount: 3, missedCount: 0 },
          { patientId: demoPatient.id, name: 'Chlorhexidine Mouthwash', dosage: '15ml rinse', frequency: 'TWICE_DAILY', startDate: now, endDate: weekLater, timeSlots: ['08:30', '20:30'], reminders: true, isActive: true, takenCount: 5, missedCount: 1 },
        ],
      });
    }

    console.log('  ✅ Demo data seeded successfully');
  } catch (error) {
    console.warn('  ⚠ Seed skipped (may already exist):', error.message);
  }
}

// Run seed on module load
ensureDemoUsers();

// ─── Register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, country } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (password.length < 6 || password.length > 88) {
      return res.status(400).json({ error: 'Password must be 6-88 characters' });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      await bcrypt.hash('dummy', 8); // timing attack mitigation
      return res.status(409).json({ error: 'Registration failed. Please try a different email.' });
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const user = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
        firstName: sanitize(firstName),
        lastName: sanitize(lastName),
        role: 'PATIENT',
        country: sanitize(country || ''),
      },
    });

    // Auto-create patient profile
    await prisma.patient.create({ data: { userId: user.id } });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'globalsmile-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { passwordHash: _, ...safe } = user;
    res.status(201).json({ token, user: { ...safe, role: safe.role.toLowerCase() } });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ─── Login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress;
    if (checkBrute(ip)) {
      return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const normalized = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    if (!user) {
      await bcrypt.compare(password, '$2a$8$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ8345678'); // valid format dummy hash
      recordFail(ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      recordFail(ip);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    loginAttempts.delete(ip);

    // Update last login asynchronously so we don't block the client response
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(e => console.error('Last login update failed:', e.message));

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'globalsmile-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { passwordHash: _, ...safe } = user;
    res.json({ token, user: { ...safe, role: safe.role.toLowerCase() } });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ─── Get Current User ──────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { patient: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash: _, ...safe } = user;
    res.json({ user: { ...safe, role: safe.role.toLowerCase() } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
