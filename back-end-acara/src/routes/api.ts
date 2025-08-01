import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import { ROLES } from "../utils/constant";
import mediaMiddleware from "../middlewares/media.middleware";
import mediaController from "../controllers/media.controller";
import categoryController from "../controllers/category.controller";
import regionController from "../controllers/region.controller";
import eventController from "../controllers/event.controller";

const router = express.Router();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);
router.post('/auth/activation', authController.activation);

router.post('/category', [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.create);
router.get('/category', categoryController.findAll);
router.get('/category/:id', categoryController.findOne);
router.put('/category/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.update);
router.delete('/category/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.remove);

router.post('/events', [authMiddleware, aclMiddleware([ROLES.ADMIN])], eventController.create);
router.get('/events', eventController.findAll);
router.get('/events/:id', eventController.findOne);
router.put('/events/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], eventController.update);
router.delete('/events/:id', [authMiddleware, aclMiddleware([ROLES.ADMIN])], eventController.remove);
router.get('/events/:slug/slug', eventController.findOneBySlug);

router.get('/regions', regionController.getAllProvinces);
router.get('/regions/:id/province', regionController.getProvince);
router.get('/regions/:id/regency', regionController.getRegency);
router.get('/regions/:id/district', regionController.getDistrict);
router.get('/regions/:id/village', regionController.getVillage);
router.get('/regions-search', regionController.findByCity);

router.post("/media/upload-single", [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
    mediaMiddleware.single('file'),
], mediaController.single);
router.post("/media/upload-multiple", [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
    mediaMiddleware.multiple('files'),
], mediaController.multiple);
router.delete("/media/remove", [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]),
], mediaController.remove);

export default router;