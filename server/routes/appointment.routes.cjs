const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

router.get('/', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { scheduledAt: 'asc' },
      take: 50,
    });
    res.json({ appointments, total: appointments.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patientId, type, scheduledAt, duration, doctorName, notes } = req.body;
    if (!patientId || !type || !scheduledAt) {
      return res.status(400).json({ error: 'patientId, type, and scheduledAt required' });
    }

    const schedDate = new Date(scheduledAt);
    if (isNaN(schedDate.getTime())) return res.status(400).json({ error: 'Invalid date' });

    const dur = Math.max(15, Math.min(480, parseInt(duration) || 60));

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        type,
        scheduledAt: schedDate,
        duration: dur,
        doctorName: doctorName || '',
        notes: notes || '',
        status: 'SCHEDULED',
      },
    });
    res.status(201).json({ appointment });
  } catch (error) {
    console.error('Appointment Error:', error.message);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, scheduledAt, notes } = req.body;
    const data = {};
    if (status && ['PENDING', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(status)) data.status = status;
    if (scheduledAt) { const d = new Date(scheduledAt); if (!isNaN(d.getTime())) data.scheduledAt = d; }
    if (notes) data.notes = notes;

    const appointment = await prisma.appointment.update({ where: { id: req.params.id }, data });
    res.json({ appointment });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Appointment not found' });
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

module.exports = router;
