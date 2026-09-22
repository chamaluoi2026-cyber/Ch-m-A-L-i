import { NextResponse } from "next/server";
import { getPlacesFromCloudAsync, savePlacesToCloudAsync } from "@/lib/cloud-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const places = await getPlacesFromCloudAsync();

    let filtered = places.filter((p) => !p.isDeleted);
    if (category && category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      places: filtered,
      total: filtered.length
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi lấy danh sách địa điểm" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.name || !body.slug) {
      return NextResponse.json(
        { success: false, error: "Tên và slug địa điểm là bắt buộc" },
        { status: 400 }
      );
    }

    const currentPlaces = await getPlacesFromCloudAsync();
    const existingIdx = currentPlaces.findIndex((p) => p.slug === body.slug || p.id === body.id);

    const now = new Date().toISOString();
    const newRecord = {
      ...body,
      id: body.id || body.slug,
      updatedAt: now,
      createdAt: (existingIdx >= 0 ? currentPlaces[existingIdx].createdAt : undefined) || now
    };

    let updatedList;
    if (existingIdx >= 0) {
      updatedList = [...currentPlaces];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...newRecord };
    } else {
      updatedList = [newRecord, ...currentPlaces];
    }

    const ok = await savePlacesToCloudAsync(updatedList);
    return NextResponse.json({ success: ok, place: newRecord });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi khi lưu địa điểm" },
      { status: 500 }
    );
  }
}
