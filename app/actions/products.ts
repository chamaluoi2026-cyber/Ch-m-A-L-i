"use server";

import { revalidatePath } from "next/cache";
import { getProductsFromCloudAsync, saveProductsToCloudAsync } from "@/lib/cloud-store";
import type { ProductRecord, ProductStatus } from "@/data/products";
import { defaultProducts } from "@/data/products";

export async function fetchProductsAction(): Promise<ProductRecord[]> {
  try {
    const list = await getProductsFromCloudAsync();
    return list.filter((p) => !p.isDeleted);
  } catch (err) {
    console.error("[ACTIONS] Error fetching products:", err);
    return defaultProducts;
  }
}

export async function fetchProductBySlugAction(slug: string): Promise<ProductRecord | null> {
  try {
    const list = await getProductsFromCloudAsync();
    const found = list.find((p) => p.slug === slug && !p.isDeleted);
    return found || null;
  } catch (err) {
    console.error("[ACTIONS] Error fetching product by slug:", err);
    return null;
  }
}

export async function saveProductAction(product: ProductRecord): Promise<{
  success: boolean;
  product?: ProductRecord;
  error?: string;
}> {
  try {
    const now = new Date().toISOString();
    const currentList = await getProductsFromCloudAsync();

    const recordToSave: ProductRecord = {
      ...product,
      id: product.id || `prod-${product.slug || Date.now()}`,
      slug: product.slug.trim(),
      name: product.name.trim(),
      category: product.category || "OCOP A Lưới",
      price: Number(product.price) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      unit: product.unit || "sản phẩm",
      image: product.image || "/images/products/forest-honey.png",
      coverImage: product.coverImage || product.image || "/images/products/forest-honey.png",
      gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image || "/images/products/forest-honey.png"],
      description: product.description || "",
      specs: product.specs || [],
      videoUrl: product.videoUrl || "",
      status: product.status || "active",
      businessName: product.businessName || "Chạm A Lưới",
      businessId: product.businessId || ("biz-" + product.slug),
      phone: product.phone || "0905 000 118",
      zaloUrl: product.zaloUrl || "https://zalo.me/0905000118",
      isOcop: !!product.isOcop,
      ocopStars: product.ocopStars || 3,
      rating: product.rating || 4.9,
      reviewCount: product.reviewCount || 1,
      createdAt: product.createdAt || now,
      updatedAt: now
    };

    const existingIdx = currentList.findIndex(
      (p) => p.slug === recordToSave.slug || (recordToSave.id && p.id === recordToSave.id)
    );

    let updatedList: ProductRecord[];
    if (existingIdx >= 0) {
      updatedList = [...currentList];
      updatedList[existingIdx] = {
        ...updatedList[existingIdx],
        ...recordToSave,
        createdAt: updatedList[existingIdx].createdAt || recordToSave.createdAt
      };
    } else {
      updatedList = [recordToSave, ...currentList];
    }

    const ok = await saveProductsToCloudAsync(updatedList);
    if (!ok) {
      return { success: false, error: "Không thể lưu dữ liệu lên máy chủ đám mây." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${recordToSave.slug}`);
    revalidatePath("/");

    return { success: true, product: recordToSave };
  } catch (err: any) {
    console.error("[ACTIONS] Error saving product:", err);
    return { success: false, error: err.message || "Lỗi khi lưu thông tin đặc sản." };
  }
}

export async function deleteProductAction(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const currentList = await getProductsFromCloudAsync();
    const updatedList = currentList.map((p) => {
      if (p.slug === slug || p.id === slug) {
        return { ...p, isDeleted: true, deletedAt: new Date().toISOString() };
      }
      return p;
    });

    const ok = await saveProductsToCloudAsync(updatedList);
    if (!ok) {
      return { success: false, error: "Không thể cập nhật trạng thái xóa." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("[ACTIONS] Error deleting product:", err);
    return { success: false, error: err.message || "Lỗi khi xóa đặc sản." };
  }
}

export async function toggleProductStatusAction(
  slug: string,
  newStatus: ProductStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentList = await getProductsFromCloudAsync();
    const updatedList = currentList.map((p) => {
      if (p.slug === slug || p.id === slug) {
        return { ...p, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    const ok = await saveProductsToCloudAsync(updatedList);
    if (!ok) {
      return { success: false, error: "Không thể cập nhật trạng thái." };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("[ACTIONS] Error toggling product status:", err);
    return { success: false, error: err.message || "Lỗi khi đổi trạng thái." };
  }
}
