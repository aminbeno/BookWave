import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ReadingList from '@/models/ReadingList';
import ReadingListBook from '@/models/ReadingListBook';
import { getAuthUser } from '@/lib/auth-helper';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    await ReadingListBook.deleteMany({ list_id: params.id });
    const list = await ReadingList.findOneAndDelete({ _id: params.id, user_id: user.userId });
    if (!list) return NextResponse.json({ error: 'Liste non trouvée' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
