import {Router} from 'express';

const router = Router();
router.get('/coffee', (_, res) => res.sendStatus(418));
router.get('/*', (_, res) => res.sendStatus(404));

export default router;