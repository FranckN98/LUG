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
  }[] = [];

  try {
    const rows = await prisma.teamMember.findMany();
    const byName = new Map(rows.map((r) => [r.name, r]));

    dbMembers = CORE_TEAM_MEMBERS.map((m, index) => {
      const row = byName.get(m.name);
      return {
        id: row?.id ?? `draft-${index}-${m.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: m.name,
        roleDe: row?.roleDe ?? m.role.de,
        roleEn: row?.roleEn ?? m.role.en,
        roleFr: row?.roleFr ?? m.role.fr,
        bioDe: row?.bioDe ?? '',
        bioEn: row?.bioEn ?? '',
        bioFr: row?.bioFr ?? '',
        linkedin: row?.linkedin ?? '',
        imageUrl: row?.imageUrl ?? m.image,
      };
    });
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
    }));
  }

  return <TeamMembersEditor initialData={dbMembers} />;
}
