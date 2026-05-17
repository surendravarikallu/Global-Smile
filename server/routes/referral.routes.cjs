const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

router.get('/', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ referrals, total: referrals.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const referral = await prisma.referral.findUnique({ where: { id: req.params.id } });
    if (!referral) return res.status(404).json({ error: 'Referral not found' });
    res.json({ referral });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { dentistId, dentistName, patientName, reason, notes, urgency } = req.body;
    if (!dentistId || !patientName || !reason) {
      return res.status(400).json({ error: 'dentistId, patientName, and reason required' });
    }

    const referral = await prisma.referral.create({
      data: {
        dentistId,
        dentistName: dentistName || '',
        patientName,
        reason,
        notes: notes || '',
        urgency: urgency || 'MEDIUM',
        status: 'PENDING',
      },
    });
    res.status(201).json({ referral });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, specialistId, specialistName, notes } = req.body;
    const data = {};
    if (status && ['PENDING', 'IN_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      data.status = status;
      if (status === 'COMPLETED') data.completedAt = new Date();
    }
    if (specialistId) data.specialistId = specialistId;
    if (specialistName) data.specialistName = specialistName;
    if (notes) data.notes = notes;

    const referral = await prisma.referral.update({ where: { id: req.params.id }, data });
    res.json({ referral });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Referral not found' });
    res.status(500).json({ error: 'Failed to update referral' });
  }
});

module.exports = router;
