const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, country: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const summary = patients.map(p => ({
      id: p.id,
      userId: p.userId,
      firstName: p.user.firstName,
      lastName: p.user.lastName,
      email: p.user.email,
      country: p.user.country,
      treatmentStatus: p.treatmentStatus,
      treatmentType: p.treatmentType,
      completionPercent: p.completionPercent,
      nextAppointment: p.nextAppointment,
      joinedAt: p.createdAt,
    }));

    res.json({ patients: summary, total: patients.length });
  } catch (error) {
    console.error('Patients Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, country: true, avatar: true } },
        milestones: { orderBy: { order: 'asc' } },
        appointments: { orderBy: { scheduledAt: 'asc' } },
        aiReports: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    res.json({
      patient: {
        ...patient,
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        email: patient.user.email,
        country: patient.user.country,
      },
    });
  } catch (error) {
    console.error('Patient Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Get patient milestones
router.get('/:id/milestones', async (req, res) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { patientId: req.params.id },
      orderBy: { order: 'asc' },
    });
    res.json({ milestones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

module.exports = router;
