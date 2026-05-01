import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const updateData: Record<string, unknown> = {};
  for (const key of ['page', 'labelDe', 'labelEn', 'labelFr', 'suffix', 'valueText', 'isActive']) {
    if (Object.prototype.hasOwnProperty.call(data, key)) updateData[key] = data[key];
  }
  if (Object.prototype.hasOwnProperty.call(data, 'valueNumber')) {
    const v = data.valueNumber;
    updateData.valueNumber = v === null || v === '' || v === undefined ? null : Number(v);
  }
  if (Object.prototype.hasOwnProperty.call(data, 'displayOrder')) {
    updateData.displayOrder = Number(data.displayOrder);
  }
  const stat = await prisma.siteStat.update({ where: { id: params.id }, data: updateData });
  return NextResponse.json(stat);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.siteStat.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
