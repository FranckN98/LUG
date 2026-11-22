import { prisma } from '@/lib/prisma';
import { TeamMembersEditor } from './TeamMembersEditor';
import { CORE_TEAM_MEMBERS } from '@/content/core-team';

export default async function AdminTeamPage() {
  let dbMembers: {
    id: string;
    name: string;
    roleDe: string;
    roleEn: string;
    roleFr: string;
    bioDe: string;
    bioEn: string;
    bioFr: string;
    linkedin: string;
    imageUrl: string;
    categoryIds: string[];
  }[] = [];

  try {
    const rows = await prisma.teamMember.findMany({ include: { categories: { select: { id: true } } } });

    if (rows.length > 0) {
      dbMembers = rows.map((row) => {
        const staticMember = CORE_TEAM_MEMBERS.find((member) => member.name === row.name);
        return {
          id: row.id,
          name: row.name,
          roleDe: row.roleDe || staticMember?.role.de || '',
          roleEn: row.roleEn || staticMember?.role.en || '',
          roleFr: row.roleFr || staticMember?.role.fr || '',
          bioDe: row.bioDe ?? '',
          bioEn: row.bioEn ?? '',
          bioFr: row.bioFr ?? '',
          linkedin: row.linkedin ?? '',
          imageUrl: row.imageUrl || staticMember?.image || '',
          categoryIds: row.categories.map((category) => category.id),
        };
      });
    } else {
      dbMembers = CORE_TEAM_MEMBERS.map((m, index) => ({
        id: `draft-${index}-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: m.name,
        roleDe: m.role.de,
        roleEn: m.role.en,
        roleFr: m.role.fr,
        bioDe: '',
        bioEn: '',
        bioFr: '',
        linkedin: '',
        imageUrl: m.image,
        categoryIds: [],
      }));
    }
  } catch {
    // DB not yet migrated — start from static members in draft mode
    dbMembers = CORE_TEAM_MEMBERS.map((m, index) => ({
      id: `draft-${index}-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: m.name,
      roleDe: m.role.de,
      roleEn: m.role.en,
      roleFr: m.role.fr,
      bioDe: '',
      bioEn: '',
      bioFr: '',
      linkedin: '',
      imageUrl: m.image,
      categoryIds: [],
    }));
  }

  return <TeamMembersEditor initialData={dbMembers} />;
}
