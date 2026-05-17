const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');

router.get('/compare', async (req, res) => {
  try {
    const { treatment, country, days: rawDays = '7' } = req.query;
    const days = Math.max(1, Math.min(90, parseInt(rawDays) || 7));

    if (!treatment) {
      const treatments = await prisma.treatmentCost.findMany({ select: { treatment: true }, distinct: ['treatment'] });
      const countries = await prisma.travelCost.findMany({ select: { fromCountry: true } });
      return res.json({
        treatments: treatments.map(t => t.treatment),
        countries: countries.map(c => c.fromCountry),
      });
    }

    const costs = await prisma.treatmentCost.findMany({ where: { treatment } });
    if (costs.length === 0) {
      return res.status(400).json({ error: 'Treatment not found', available: [] });
    }

    const travel = country
      ? await prisma.travelCost.findUnique({ where: { fromCountry: country } })
      : null;

    const travelData = travel || { flightCost: 700, accommodationPerDay: 50 };
    const totalTravel = travelData.flightCost + (travelData.accommodationPerDay * days);
    const vijCost = costs.find(c => c.city === 'Vijayawada')?.cost || 0;
    const vijayawadaTotal = vijCost + totalTravel;

    res.json({
      treatment,
      country: country || 'Average',
      days,
      comparison: costs.map(c => ({
        city: c.city,
        treatmentCost: c.cost,
        totalCost: c.city === 'Vijayawada' ? vijayawadaTotal : c.cost,
        savings: c.city !== 'Vijayawada' ? Math.round(((c.cost - vijayawadaTotal) / c.cost) * 100) : 0,
      })),
      travelBreakdown: {
        flight: travelData.flightCost,
        accommodation: travelData.accommodationPerDay * days,
        total: totalTravel,
      },
    });
  } catch (error) {
    console.error('Tourism Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

router.get('/treatments', async (req, res) => {
  try {
    const allCosts = await prisma.treatmentCost.findMany();
    const treatments = {};
    allCosts.forEach(c => {
      if (!treatments[c.treatment]) treatments[c.treatment] = {};
      treatments[c.treatment][c.city] = c.cost;
    });

    const summary = Object.entries(treatments).map(([name, cities]) => {
      const values = Object.values(cities);
      return {
        name,
        minCost: Math.min(...values),
        maxCost: Math.max(...values),
        vijayawadaCost: cities['Vijayawada'] || 0,
        savingsPercent: cities['New York'] ? Math.round(((cities['New York'] - (cities['Vijayawada'] || 0)) / cities['New York']) * 100) : 0,
      };
    });
    res.json({ treatments: summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch treatments' });
  }
});

module.exports = router;
