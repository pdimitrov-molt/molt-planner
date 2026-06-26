import { RoomWorkspaceView } from "@/features/rooms/components/room-workspace-view";

interface RoomPageProps {
  params: Promise<{ id: string; roomId: string }>;
  searchParams: Promise<{ focusPhase?: string }>;
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { id, roomId } = await params;
  const { focusPhase } = await searchParams;

  return (
    <RoomWorkspaceView
      projectId={id}
      roomId={roomId}
      focusPhaseId={focusPhase}
    />
  );
}
