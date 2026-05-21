import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ReadingChallenge from '@/models/ReadingChallenge';
import { getAuthUser } from '@/lib/auth-helper';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const challenge = await ReadingChallenge.findOneAndDelete({ _id: params.id, user_id: user.userId });
    if (!challenge) return NextResponse.json({ error: 'Défi non trouvé' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
