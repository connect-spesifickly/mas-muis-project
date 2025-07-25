import prisma from "../prisma";
import { ResponseError } from "../helpers/error";
import { generateHashedPassword } from "../utils/generate-password";
import { Role } from "@prisma/client";

class UserService {
  async list() {
    // Exclude OWNER and soft-deleted users from list
    return prisma.user.findMany({
      where: { role: { not: Role.OWNER }, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
    });
  }
  async create(data: {
    email: string;
    password: string;
    name: string;
    role: Role;
  }) {
    if (data.role === Role.OWNER)
      throw new ResponseError(403, "Cannot create OWNER");
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ResponseError(409, "Email already registered");
    const hashedPassword = await generateHashedPassword(data.password);
    return prisma.user.create({ data: { ...data, password: hashedPassword } });
  }
  async remove(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ResponseError(404, "User not found");
    if (user.role === Role.OWNER)
      throw new ResponseError(403, "Cannot delete OWNER");
    if (user.deletedAt) throw new ResponseError(400, "User already deleted");
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  }
  async restore(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new ResponseError(404, "User not found");
    if (user.deletedAt === null)
      throw new ResponseError(400, "User is not deleted");
    await prisma.user.update({ where: { id }, data: { deletedAt: null } });
    return true;
  }
  async listDeleted() {
    // List user yang sudah di-soft delete (bisa untuk UI pemulihan)
    return prisma.user.findMany({
      where: { role: { not: Role.OWNER }, deletedAt: { not: null } },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        deletedAt: true,
      },
    });
  }
}

export default new UserService();
