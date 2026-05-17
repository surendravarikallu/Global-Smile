const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

// ─── Get Patient Medications ───────────────────
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const medications = await prisma.medicationSchedule.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    const active = medications.filter(m => m.isActive);
    const completed = medications.filter(m => !m.isActive);
    const adherenceRate = medications.length > 0
      ? Math.round(medications.reduce((sum, m) => {
          const total = m.takenCount + m.missedCount;
          return sum + (total > 0 ? (m.takenCount / total) * 100 : 100);
        }, 0) / medications.length)
      : 100;

    res.json({ medications, active: active.length, completed: completed.length, adherenceRate });
  } catch (error) {
    console.error('Medications Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// ─── Create Medication Schedule ────────────────
router.post('/', async (req, res) => {
  try {
    const { patientId, name, dosage, frequency, startDate, endDate, timeSlots, notes } = req.body;

    if (!patientId || !name || !dosage || !startDate || !endDate) {
      return res.status(400).json({ error: 'patientId, name, dosage, startDate, and endDate required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (end <= start) {
      return res.status(400).json({ error: 'endDate must be after startDate' });
    }

    const validFrequencies = ['ONCE_DAILY', 'TWICE_DAILY', 'THRICE_DAILY', 'EVERY_6_HOURS', 'EVERY_8_HOURS', 'EVERY_12_HOURS', 'AS_NEEDED', 'WEEKLY'];
    const freq = validFrequencies.includes(frequency) ? frequency : 'THRICE_DAILY';

    const medication = await prisma.medicationSchedule.create({
      data: {
        patientId,
        name: name.trim().substring(0, 200),
        dosage: dosage.trim().substring(0, 100),
        frequency: freq,
        startDate: start,
        endDate: end,
        timeSlots: timeSlots || ['08:00', '14:00', '20:00'],
        notes: notes?.substring(0, 500) || null,
        reminders: true,
        isActive: true,
      },
    });

    // Auto-generate reminder logs for the first 7 days
    const reminders = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(date.getDate() + day);
      if (date > end) break;

      const slots = medication.timeSlots || ['08:00'];
      for (const slot of slots) {
        const [h, m] = slot.split(':');
        const scheduled = new Date(date);
        scheduled.setHours(parseInt(h) || 8, parseInt(m) || 0, 0, 0);

        reminders.push({
          patientId,
          type: 'medication',
          channel: 'PUSH',
          title: `💊 Time for ${name}`,
          message: `Take ${dosage} of ${name}. ${notes || ''}`.trim(),
          status: 'SCHEDULED',
          scheduledAt: scheduled,
        });
      }
    }

    if (reminders.length > 0) {
      await prisma.reminderLog.createMany({ data: reminders });
    }

    res.status(201).json({ medication, remindersGenerated: reminders.length });
  } catch (error) {
    console.error('Create Medication Error:', error.message);
    res.status(500).json({ error: 'Failed to create medication schedule' });
  }
});

// ─── Update Medication ─────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { isActive, takenCount, missedCount, notes } = req.body;
    const data = {};

    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof takenCount === 'number') data.takenCount = Math.max(0, takenCount);
    if (typeof missedCount === 'number') data.missedCount = Math.max(0, missedCount);
    if (notes !== undefined) data.notes = notes?.substring(0, 500);

    const medication = await prisma.medicationSchedule.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ medication });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Medication not found' });
    res.status(500).json({ error: 'Failed to update medication' });
  }
});

// ─── Record Dose Taken / Missed ────────────────
router.post('/:id/dose', async (req, res) => {
  try {
    const { taken } = req.body;
    if (typeof taken !== 'boolean') {
      return res.status(400).json({ error: 'Field "taken" (boolean) required' });
    }

    const medication = await prisma.medicationSchedule.update({
      where: { id: req.params.id },
      data: taken
        ? { takenCount: { increment: 1 } }
        : { missedCount: { increment: 1 } },
    });

    res.json({ medication, recorded: taken ? 'taken' : 'missed' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Medication not found' });
    res.status(500).json({ error: 'Failed to record dose' });
  }
});

// ─── Delete Medication ─────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await prisma.medicationSchedule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Medication not found' });
    res.status(500).json({ error: 'Failed to delete medication' });
  }
});

module.exports = router;
