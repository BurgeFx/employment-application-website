import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Super admin routes' });
});

export default router;
