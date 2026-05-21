import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';
import { getAuthUser } from '@/lib/auth-helper';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const entry = await JournalEntry.findOneAndDelete({ _id: params.id, user_id: user.userId });
    if (!entry) return NextResponse.json({ error: 'Entrée non trouvée' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
