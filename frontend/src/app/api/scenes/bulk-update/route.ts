import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, scenes } = body;

    if (!projectId || !scenes || !Array.isArray(scenes)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // TODO: 백엔드 API 호출하여 씬 순서 업데이트
    // 현재는 모킹된 응답 반환
    console.log('Updating scene order for project:', projectId);
    console.log('New order:', scenes);

    // 실제 구현 시 백엔드 API 호출
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scenes/bulk-update`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ projectId, scenes })
    // });

    return NextResponse.json({
      success: true,
      message: 'Scene order updated successfully',
      scenes: scenes
    });
  } catch (error) {
    console.error('Error updating scene order:', error);
    return NextResponse.json(
      { error: 'Failed to update scene order' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, scenes } = body;

    if (!projectId || !scenes || !Array.isArray(scenes)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // TODO: 백엔드 API 호출하여 여러 씬 생성
    console.log('Creating scenes for project:', projectId);
    console.log('Scenes:', scenes);

    return NextResponse.json({
      success: true,
      message: 'Scenes created successfully',
      scenes: scenes.map((scene, index) => ({
        ...scene,
        id: `scene-${Date.now()}-${index}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    });
  } catch (error) {
    console.error('Error creating scenes:', error);
    return NextResponse.json(
      { error: 'Failed to create scenes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sceneIds = searchParams.get('ids')?.split(',') || [];

    if (!sceneIds.length) {
      return NextResponse.json(
        { error: 'No scene IDs provided' },
        { status: 400 }
      );
    }

    // TODO: 백엔드 API 호출하여 씬 일괄 삭제
    console.log('Deleting scenes:', sceneIds);

    return NextResponse.json({
      success: true,
      message: 'Scenes deleted successfully',
      deletedIds: sceneIds
    });
  } catch (error) {
    console.error('Error deleting scenes:', error);
    return NextResponse.json(
      { error: 'Failed to delete scenes' },
      { status: 500 }
    );
  }
}