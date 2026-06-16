import { Role } from "@prisma/client";

export function userCanDeploy(role: Role): boolean {
  return role === Role.DEVELOPER || role === Role.ADMIN;
}
