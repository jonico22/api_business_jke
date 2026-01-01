import { Request, Response } from "express";
import prisma from "@/config/database";

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const [users, roles, sessions] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.role.count(),
      prisma.session.count({ where: { expiresAt: { gte: new Date() } } }),
    ]);

    res.json({ users, roles, sessions });
  } catch (error) {
    res.status(500).json({ error: "Error al cargar resumen del dashboard" });
  }
};
