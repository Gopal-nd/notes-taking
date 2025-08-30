import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../controllers/notes.controller";

const router = Router();

router.use(authenticate);

router.get("/", getNotes);
router.post("/", createNote);
router.delete("/:id", deleteNote);
router.put("/:id", updateNote);

export default router;
