import { RoomWorkspaceView } from "@/features/rooms/components/room-workspace-view";

interface RoomPageProps {
  params: Promise<{ id: string; roomId: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id, roomId } = await params;
  return <RoomWorkspaceView projectId={id} roomId={roomId} />;
}
