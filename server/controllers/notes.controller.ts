import type { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getNotes = async (req: Request, res: Response) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(notes);
  } catch (err) {
    console.log("error in get notes", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    console.log(req.body);
    if (!title || !content) {
      return res.status(400).json({ error: "Title and Content required" });
    }

    const note = await prisma.note.create({
      data: { title, content, userId: req.user?.id },
    });

    res.status(201).json(note);
  } catch (err) {
    console.log("error in create note", err);
    res.status(500).json({ error: "Failed to create note" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.userId !== req.user?.id) {
      return res.status(404).json({ error: "Note not found" });
    }

    await prisma.note.delete({ where: { id } });
    res.json({ id });
  } catch {
    res.status(500).json({ error: "Failed to delete note" });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== req.user?.id) {
      return res.status(404).json({ error: "Note not found" });
    }

    const updated = await prisma.note.update({
      where: { id },
      data: { title, content },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update note" });
  }
};
