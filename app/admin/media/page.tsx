"use client";

import { uploadImageClient } from "@/lib/upload-client";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  getUploadedImagesAction,
  deleteUploadedImageAction,
  deleteMultipleUploadedImagesAction,
  getSystemAssetsAction,
  saveSystemAssetAction,
  deleteSystemAssetAction,
  getSiteSettingsAction,
  updateSiteSettingsAction,
  saveCroppedImageAction,
  type UploadedImageItem,
  type SystemAssetRecord,
  type SiteSettings,
  type TeamMemberItem,
  type CoreValueItem
} from "@/app/actions/upload";
import { places } from "@/data/places";
import { siteConfig, products, blogPosts } from "@/data/site";
import { normalizeImageUrl, detectImageSource } from "@/lib/image-helper";
import { AppImage } from "@/components/ui/app-image";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Crop,
  Scissors,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Move,
  CheckSquare,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  Facebook,
  FileCode,
  FileImage,
  Filter,
  FolderOpen,
  Globe,
  Grid,
  HardDrive,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Instagram,
  Laptop,
  Layers,
  List,
  Loader2,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  MoreVertical,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Square,
  Tag,
  Trash2,
  Upload,
  UploadCloud,
  UserPlus,
  Users2,
  X
} from "lucide-react";

// Types for Media Item Metadata
interface MediaItemMetadata {
  id: string;
  name: string;
  url: string;
  alt: string;
  caption: string;
  category: "all" | "brand" | "hero" | "place" | "product" | "blog" | "other";
  size?: string;
  createdAt: string;
  isUploaded?: boolean;
}

interface ImageUsageDetail {
  isUsed: boolean;
  locations: { type: string; title: string; link?: string }[];
}

export default function AdminMediaPage() {
  // Tabs: 'library' (Kho tài nguyên dùng chung), 'brand' (Cấu hình Logo & Banner), 'about' (Nội dung & Đội ngũ Giới thiệu), 'contact' (Thông tin liên hệ & Footer), 'picker-demo' (Thử nghiệm Media Picker)
  const [activeTab, setActiveTab] = useState<"library" | "brand" | "about" | "contact" | "picker-demo">("library");

  // State for editing avatar member with media picker
  const [pickingMemberId, setPickingMemberId] = useState<string | null>(null);

  // --- Image Cropper & Resizer Modal State ---
  const [cropTarget, setCropTarget] = useState<{
    url: string;
    name: string;
    field?: keyof SiteSettings | "mediaItem" | null;
    aspect?: "free" | "4:1" | "3:1" | "1:1" | "16:9";
  } | null>(null);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    logo: "/images/logo.svg",
    logoDark: "/images/logo-white.svg",
    logoMobile: "/images/logo.svg",
    logoHeight: 56,
    logoWidth: 220,
    logoScale: 100,
    favicon: "/favicon.ico",
    heroImage: "/images/home-hero-local.jpg",
    aboutHeroImage: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=82",
    contactAddress: "Huyện A Lưới, Thừa Thiên Huế",
    contactPhone: "0905 000 118",
    contactEmail: "hotro@chamaluoi.vn",
    facebookUrl: "https://facebook.com/chamaluoi",
    instagramUrl: "https://instagram.com/chamaluoi",
    zaloUrl: "https://zalo.me/0905000118",
    footerDescription: "Nền tảng du lịch cộng đồng kết nối du khách với các homestay, làng nghề truyền thống, ẩm thực bản địa và những điểm đến sinh thái nguyên sơ tại A Lưới, Thừa Thiên Huế.",
    announcement: "Chào mừng quý khách đến với du lịch cộng đồng Chạm A Lưới!",
    aboutBadge: "Về chúng tôi",
    aboutTitle: "Cầu nối số cho du lịch cộng đồng",
    aboutSubtitle: "Chạm A Lưới là nền tảng du lịch trung gian giúp kết nối du khách với nét đẹp văn hóa bản địa, các chủ nhà homestay ấm áp, đơn vị dịch vụ trách nhiệm và những nghệ nhân vùng cao kiên trì gìn giữ nghề truyền thống.",
    aboutCommitment1: "Minh bạch đối soát",
    aboutCommitment2: "Đồng hành cùng bà con",
    aboutCoreValues: [
      {
        title: "Sứ mệnh",
        text: "Giúp du lịch cộng đồng A Lưới dễ hiểu hơn, dễ đặt hơn và đem lại nguồn sinh kế thực sự cho người dân địa phương."
      },
      {
        title: "Tầm nhìn",
        text: "Trở thành điểm chạm số uy tín nhất phía Tây Thừa Thiên Huế cho những chuyến đi văn hóa bền vững và giàu cảm xúc."
      },
      {
        title: "Giá trị cốt lõi",
        text: "Đặt con người và bản sắc dân tộc Pa Cô, Tà Ôi, Cơ Tu làm trung tâm, công nghệ đóng vai trò cầu nối tiện lợi."
      }
    ],
    aboutTeamMembers: [
      {
        id: "team-1",
        name: "Đặng Thị Hoài",
        role: "Trưởng nhóm & Thiết kế Sản phẩm",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        bio: "Phụ trách định hướng trải nghiệm số, kết nối nền tảng với các hộ kinh doanh du lịch cộng đồng tại A Lưới."
      },
      {
        id: "team-2",
        name: "Hồ Văn Hạnh",
        role: "Đại diện Cộng đồng & Nghệ nhân Tà Ôi",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        bio: "Cố vấn văn hóa bản địa, kết nối các làng nghề dệt Zèng truyền thống và điểm lưu trú homestay."
      },
      {
        id: "team-3",
        name: "Nguyễn Lê Bảo Trâm",
        role: "Nội dung & Truyền thông Bản địa",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        bio: "Biên tập câu chuyện văn hóa, hỗ trợ các cơ sở địa phương số hóa hình ảnh và tạo voucher ưu đãi."
      },
      {
        id: "team-4",
        name: "Lê Văn Đạt",
        role: "Kỹ thuật Công nghệ & Vận hành",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        bio: "Phát triển hệ thống điều phối Lead ID, đối soát hoa hồng và tích hợp kênh kết nối Zalo trực tiếp."
      }
    ],
    aboutImpactTitle: "Tác động cộng đồng",
    aboutImpactItems: [
      "Tạo thu nhập trực tiếp cho chủ nhà và nghệ nhân địa phương",
      "Bảo tồn văn hóa thông qua trải nghiệm có hướng dẫn",
      "Giáo dục du lịch có trách nhiệm cho du khách",
      "Tăng khả năng tiếp cận thị trường cho sản phẩm vùng cao"
    ],
    aboutPartnersTitle: "Mạng lưới Đối tác",
    aboutPartnersText: "Các gia đình homestay địa phương, hợp tác xã dệt thổ cẩm Zèng A Đớt, các đội trekking rừng nguyên sinh, đơn vị lữ hành Huế và các giảng viên cố vấn phát triển cộng đồng."
  });
  const [initialSettings, setInitialSettings] = useState<SiteSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Media Library Data
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [systemAssets, setSystemAssets] = useState<SystemAssetRecord[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "used" | "unused">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selection & Operations
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Upload Zone State
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{ id: string; name: string; size: string; status: "uploading" | "done" | "error"; error?: string }[]>([]);
  const [showUrlInputModal, setShowUrlInputModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlInputName, setUrlInputName] = useState("");
  const [urlInputCategory, setUrlInputCategory] = useState<MediaItemMetadata["category"]>("other");
  const [isAddingUrl, setIsAddingUrl] = useState(false);

  // Detail / Edit Metadata Modal
  const [previewItem, setPreviewItem] = useState<MediaItemMetadata | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItemMetadata | null>(null);
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  // Delete Safety Warning Modal
  const [deleteWarningItem, setDeleteWarningItem] = useState<{ item: MediaItemMetadata; usage: ImageUsageDetail } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker Standalone Demo State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickedResult, setPickedResult] = useState<{ url: string; title: string; category: string } | null>(null);

  // Hidden File Inputs for Brand
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const logoDarkInputRef = useRef<HTMLInputElement | null>(null);
  const logoMobileInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const aboutInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setIsLoadingMedia(true);
    try {
      await Promise.all([loadSiteSettings(), loadImages(), loadSystemAssets()]);
    } finally {
      setIsLoadingMedia(false);
    }
  }

  async function loadSiteSettings() {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSiteSettings(data.settings);
          setInitialSettings(data.settings);
          return;
        }
      }
      const s = await getSiteSettingsAction();
      if (s) {
        setSiteSettings(s);
        setInitialSettings(s);
      }
    } catch (e) {
      console.error("Lỗi tải site settings:", e);
    }
  }

  async function loadImages() {
    try {
      const images = await getUploadedImagesAction();
      setUploadedImages(images);
    } catch (e) {
      console.error("Lỗi tải uploaded images:", e);
    }
  }

  async function loadSystemAssets() {
    try {
      const assets = await getSystemAssetsAction();
      setSystemAssets(assets);
    } catch (e) {
      console.error("Lỗi tải system assets:", e);
    }
  }

  function showToast(type: "success" | "error" | "info", text: string) {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4500);
  }

  function copyToClipboard(url: string, message = "Đã sao chép link ảnh vào bộ nhớ tạm!") {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast("success", message);
    setTimeout(() => setCopiedUrl(null), 2500);
  }

  // --- Smart Image Usage Detection ---
  function getUsageDetail(url: string): ImageUsageDetail {
    if (!url) return { isUsed: false, locations: [] };
    const normTarget = normalizeImageUrl(url).toLowerCase();
    const rawTarget = url.toLowerCase().trim();
    const fileName = url.split("/").pop()?.toLowerCase() || "";

    const locations: { type: string; title: string; link?: string }[] = [];

    function matches(testUrl?: string | null) {
      if (!testUrl) return false;
      const norm = normalizeImageUrl(testUrl).toLowerCase();
      const raw = testUrl.toLowerCase().trim();
      if (norm === normTarget || raw === rawTarget) return true;
      if (fileName && fileName.length > 3 && (raw.endsWith("/" + fileName) || norm.endsWith("/" + fileName))) return true;
      return false;
    }

    // Site Settings
    if (matches(siteSettings.logo)) locations.push({ type: "Cấu hình", title: "Logo chính Website" });
    if (matches(siteSettings.logoDark)) locations.push({ type: "Cấu hình", title: "Logo Footer / Nền tối" });
    if (matches(siteSettings.logoMobile)) locations.push({ type: "Cấu hình", title: "Logo Mobile" });
    if (matches(siteSettings.favicon)) locations.push({ type: "Cấu hình", title: "Favicon trình duyệt" });
    if (matches(siteSettings.heroImage)) locations.push({ type: "Cấu hình", title: "Hero Banner Trang chủ" });
    if (matches(siteSettings.aboutHeroImage)) locations.push({ type: "Cấu hình", title: "Banner trang Giới thiệu" });

    // Places
    for (const p of places) {
      if (matches(p.image)) {
        locations.push({ type: "Địa điểm", title: p.name, link: `/places/${p.slug}` });
      }
    }

    // Products
    for (const pr of products) {
      if (matches(pr.image)) {
        locations.push({ type: "Sản phẩm", title: pr.name, link: `/products/${pr.slug}` });
      }
    }

    // Blog Posts
    for (const b of blogPosts) {
      if (matches(b.image)) {
        locations.push({ type: "Blog", title: b.title, link: `/blog/${b.slug}` });
      }
    }

    return {
      isUsed: locations.length > 0,
      locations
    };
  }

  // --- Consolidate All Media Items into a Single Master List ---
  const allMediaItems: MediaItemMetadata[] = useMemo(() => {
    const list: MediaItemMetadata[] = [];
    const seenUrls = new Set<string>();

    // 1. System Assets from Store
    for (const a of systemAssets) {
      const norm = normalizeImageUrl(a.url);
      seenUrls.add(norm);
      let parsed = { alt: "", caption: "", category: "other" as MediaItemMetadata["category"] };
      try {
        if (a.note && a.note.startsWith("{")) {
          parsed = { ...parsed, ...JSON.parse(a.note) };
        } else {
          parsed.caption = a.note || "";
        }
      } catch {}

      list.push({
        id: a.id,
        name: a.name || "Ảnh thư viện",
        url: a.url,
        alt: parsed.alt || a.name || "",
        caption: parsed.caption || a.note || "",
        category: parsed.category || "other",
        createdAt: a.createdAt || "Trước đó",
        isUploaded: false
      });
    }

    // 2. Uploaded Physical Files
    for (const u of uploadedImages) {
      const norm = normalizeImageUrl(u.url);
      if (!seenUrls.has(norm)) {
        seenUrls.add(norm);
        // Deduce category from name
        let cat: MediaItemMetadata["category"] = "other";
        const low = u.name.toLowerCase();
        if (low.includes("logo")) cat = "brand";
        else if (low.includes("hero") || low.includes("banner")) cat = "hero";
        else if (low.includes("place") || low.includes("thac") || low.includes("suoi")) cat = "place";
        else if (low.includes("product") || low.includes("deng") || low.includes("mat-ong")) cat = "product";
        else if (low.includes("blog")) cat = "blog";

        const sizeDisplay = typeof u.size === "number" ? (u.size / (1024 * 1024)).toFixed(2) + " MB" : String(u.size || "");

        list.push({
          id: `upload-${u.name}`,
          name: u.name,
          url: u.url,
          alt: u.name.replace(/[-_.]/g, " "),
          caption: `File tải lên từ máy tính (${sizeDisplay})`,
          category: cat,
          size: sizeDisplay,
          createdAt: u.createdAt || "Mới tải lên",
          isUploaded: true
        });
      }
    }

    return list;
  }, [systemAssets, uploadedImages]);

  // Filtered & Sorted Media Items
  const filteredMedia = useMemo(() => {
    return allMediaItems.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter (Used vs Unused)
      const usage = getUsageDetail(item.url);
      if (selectedStatus === "used" && !usage.isUsed) return false;
      if (selectedStatus === "unused" && usage.isUsed) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAlt = item.alt.toLowerCase().includes(q);
        const matchesCaption = item.caption.toLowerCase().includes(q);
        const matchesUrl = item.url.toLowerCase().includes(q);
        const matchesLocation = usage.locations.some((l) => l.title.toLowerCase().includes(q));
        if (!matchesName && !matchesAlt && !matchesCaption && !matchesUrl && !matchesLocation) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "oldest") return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [allMediaItems, selectedCategory, selectedStatus, searchQuery, sortBy, siteSettings]);

  // Statistics
  const stats = useMemo(() => {
    let usedCount = 0;
    for (const item of allMediaItems) {
      if (getUsageDetail(item.url).isUsed) usedCount++;
    }
    return {
      total: allMediaItems.length,
      used: usedCount,
      unused: allMediaItems.length - usedCount
    };
  }, [allMediaItems, siteSettings]);

  // --- Multi-file Upload Handler ---
  async function handleBatchUpload(files: FileList | File[]) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const newQueueItems = fileList.map((f, i) => ({
      id: `queue-${Date.now()}-${i}`,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + " MB",
      status: "uploading" as const
    }));

    setUploadQueue((prev) => [...newQueueItems, ...prev]);

    let successCount = 0;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const queueId = newQueueItems[i].id;

      try {
        const res = await uploadImageClient(file, { category: "media" });

        if (res.success && res.url) {
          successCount++;
          setUploadQueue((prev) =>
            prev.map((q) => (q.id === queueId ? { ...q, status: "done" } : q))
          );
        } else {
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === queueId ? { ...q, status: "error", error: res.error || "Tải lên thất bại" } : q
            )
          );
        }
      } catch (err) {
        setUploadQueue((prev) =>
          prev.map((q) =>
            q.id === queueId ? { ...q, status: "error", error: "Lỗi kết nối máy chủ" } : q
          )
        );
      }
    }

    if (successCount > 0) {
      showToast("success", `Đã tải lên thành công ${successCount}/${fileList.length} ảnh!`);
      await loadImages();
    }
  }

  // --- Add by URL / Google Drive ---
  async function handleAddUrlItem(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsAddingUrl(true);
    try {
      const directUrl = normalizeImageUrl(urlInput);
      const newAsset: SystemAssetRecord = {
        id: `asset-${Date.now()}`,
        name: urlInputName.trim() || `Ảnh ${new Date().toLocaleDateString("vi-VN")}`,
        url: directUrl,
        note: JSON.stringify({
          alt: urlInputName.trim(),
          caption: `Nguồn: ${detectImageSource(urlInput)}`,
          category: urlInputCategory
        }),
        createdAt: new Date().toISOString()
      };

      const res = await saveSystemAssetAction(newAsset);
      if (res.success) {
        showToast("success", "Đã thêm ảnh vào Thư viện tài nguyên thành công!");
        setUrlInput("");
        setUrlInputName("");
        setShowUrlInputModal(false);
        await loadSystemAssets();
      } else {
        showToast("error", res.error || "Không thể lưu ảnh.");
      }
    } catch {
      showToast("error", "Lỗi khi lưu ảnh từ URL.");
    } finally {
      setIsAddingUrl(false);
    }
  }

  // --- Save / Update Metadata (Name, Alt, Caption, Category) ---
  async function handleSaveMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingMetadata(true);
    try {
      const assetToSave: SystemAssetRecord = {
        id: editingItem.id.startsWith("upload-") ? `asset-${Date.now()}` : editingItem.id,
        name: editingItem.name,
        url: editingItem.url,
        note: JSON.stringify({
          alt: editingItem.alt,
          caption: editingItem.caption,
          category: editingItem.category
        }),
        createdAt: editingItem.createdAt
      };

      const res = await saveSystemAssetAction(assetToSave);
      if (res.success) {
        showToast("success", `Đã cập nhật thông tin ảnh "${editingItem.name}" thành công!`);
        setEditingItem(null);
        await loadSystemAssets();
      } else {
        showToast("error", res.error || "Không thể cập nhật.");
      }
    } catch {
      showToast("error", "Lỗi lưu thông tin ảnh.");
    } finally {
      setIsSavingMetadata(false);
    }
  }

  // --- Safe Delete with Protection ---
  function initiateDelete(item: MediaItemMetadata) {
    const usage = getUsageDetail(item.url);
    if (usage.isUsed) {
      // MUST show explicit warning confirmation
      setDeleteWarningItem({ item, usage });
    } else {
      if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ảnh "${item.name}"?`)) {
        executeDelete(item);
      }
    }
  }

  async function executeDelete(item: MediaItemMetadata) {
    setIsDeleting(true);
    try {
      let success = false;
      if (item.isUploaded) {
        const res = await deleteUploadedImageAction(item.name);
        success = res.success;
      } else {
        const res = await deleteSystemAssetAction(item.id);
        success = res.success;
      }

      if (success) {
        showToast("success", `Đã xóa ảnh "${item.name}" thành công!`);
        setDeleteWarningItem(null);
        setPreviewItem(null);
        await Promise.all([loadImages(), loadSystemAssets()]);
      } else {
        showToast("error", "Không thể xóa ảnh.");
      }
    } catch {
      showToast("error", "Lỗi trong quá trình xóa ảnh.");
    } finally {
      setIsDeleting(false);
    }
  }

  // --- Robust API Saver (Immune to Server Action hash mismatches) ---
  async function saveSettingsViaApi(settings: Partial<SiteSettings>): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Lỗi máy chủ (${res.status})` }));
        return { success: false, error: err.error || "Không thể lưu cấu hình" };
      }
      return await res.json();
    } catch (e: any) {
      try {
        return await updateSiteSettingsAction(settings);
      } catch (err: any) {
        return { success: false, error: e.message || "Lỗi kết nối khi lưu cấu hình" };
      }
    }
  }

  // --- Quick Assign Handlers ---
  async function assignAs(target: "logo" | "hero" | "blog-cover" | "blog-content" | "place" | "product", item: MediaItemMetadata) {
    if (target === "logo") {
      setIsSavingSettings(true);
      try {
        const res = await saveSettingsViaApi({ ...siteSettings, logo: item.url });
        if (res.success && res.settings) {
          setSiteSettings(res.settings);
          setInitialSettings(res.settings);
          showToast("success", `Đã đặt ảnh "${item.name}" làm Logo chính website thành công!`);
        } else {
          showToast("error", res.error || "Không thể lưu Logo.");
        }
      } finally {
        setIsSavingSettings(false);
      }
    } else if (target === "hero") {
      setIsSavingSettings(true);
      try {
        const res = await saveSettingsViaApi({ ...siteSettings, heroImage: item.url });
        if (res.success && res.settings) {
          setSiteSettings(res.settings);
          setInitialSettings(res.settings);
          showToast("success", `Đã đặt ảnh "${item.name}" làm Hero Banner trang chủ!`);
        } else {
          showToast("error", res.error || "Không thể lưu Hero Banner.");
        }
      } finally {
        setIsSavingSettings(false);
      }
    } else if (target === "blog-content") {
      const mdSnippet = `![${item.alt || item.name}](${item.url})`;
      copyToClipboard(mdSnippet, "Đã copy cú pháp Markdown cho nội dung Blog: " + mdSnippet);
    } else if (target === "blog-cover") {
      copyToClipboard(item.url, `Đã copy URL ảnh làm Cover Blog cho "${item.name}"!`);
    } else if (target === "place") {
      copyToClipboard(item.url, `Đã copy URL ảnh để gán cho Địa điểm ("${item.name}")!`);
    } else if (target === "product") {
      copyToClipboard(item.url, `Đã copy URL ảnh để gán cho Sản phẩm ("${item.name}")!`);
    }
  }

  // --- Brand Asset Upload (With Automatic Immediate Persistence) ---
  async function handleFileUploadForBrand(
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: keyof SiteSettings,
    assetType: "logo" | "logo-dark" | "logo-mobile" | "favicon" | "hero" | "about"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(String(fieldKey));
    try {
      const res = await uploadImageClient(file, { category: assetType });
      if (res.success && res.url) {
        const nextSettings: SiteSettings = { ...siteSettings, [fieldKey]: res.url };
        setSiteSettings(nextSettings);

        // TỰ ĐỘNG LƯU VÀO HỆ THỐNG STORE NGAY LẬP TỨC
        const saveRes = await saveSettingsViaApi(nextSettings);
        if (saveRes.success && saveRes.settings) {
          setSiteSettings(saveRes.settings);
          setInitialSettings(saveRes.settings);
          showToast("success", `Đã tải lên và TỰ ĐỘNG LƯU ảnh mới cho website thành công!`);
        } else {
          showToast("success", `Đã tải lên ảnh mới cho ${fieldKey}. Hãy bấm "Lưu" để kích hoạt.`);
        }
        await loadImages();
      } else {
        showToast("error", res.error || "Không thể tải file lên.");
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Lỗi tải file.");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  }

  // --- Save Single Setting (e.g. Logo, Favicon) Directly from Card ---
  async function handleSaveSingleSetting(fieldKey: keyof SiteSettings, label: string) {
    setIsSavingSettings(true);
    try {
      const res = await saveSettingsViaApi(siteSettings);
      if (res.success && res.settings) {
        setSiteSettings(res.settings);
        setInitialSettings(res.settings);
        showToast("success", `Đã lưu thành công ${label} vào website!`);
      } else {
        showToast("error", res.error || `Không thể lưu ${label}.`);
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : `Lỗi khi lưu ${label}.`);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleSaveAllBrandSettings() {
    setIsSavingSettings(true);
    try {
      const res = await saveSettingsViaApi(siteSettings);
      if (res.success && res.settings) {
        setSiteSettings(res.settings);
        setInitialSettings(res.settings);
        showToast("success", "Đã lưu toàn bộ cấu hình nhận diện thương hiệu & website thành công!");
      } else {
        showToast("error", res.error || "Không thể lưu cấu hình.");
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Lỗi khi lưu cấu hình.");
    } finally {
      setIsSavingSettings(false);
    }
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            statusMessage.type === "success"
              ? "bg-emerald-900 text-white border border-emerald-500/30"
              : statusMessage.type === "error"
              ? "bg-red-900 text-white border border-red-500/30"
              : "bg-ink text-white border border-white/20"
          }`}
        >
          {statusMessage.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />}
          {statusMessage.type === "error" && <AlertCircle className="size-5 shrink-0 text-red-400" />}
          {statusMessage.type === "info" && <Info className="size-5 shrink-0 text-amber-300" />}
          <span className="text-xs font-semibold leading-relaxed">{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="ml-2 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-ink">Thư viện Tài nguyên Hình ảnh</h1>
            <span className="rounded-full bg-forest/10 px-3 py-0.5 text-xs font-bold text-forest">
              Chạm A Lưới CMS
            </span>
          </div>
          <p className="text-xs text-ink/60 mt-1">
            Hệ thống quản lý tài nguyên hình ảnh dùng chung cho toàn bộ website, Blog, Địa điểm, Sản phẩm và Nhận diện thương hiệu.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => multiFileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-forest/90 transition"
          >
            <Upload className="size-4" />
            Tải nhiều ảnh từ máy
          </button>
          <button
            onClick={() => setShowUrlInputModal(true)}
            className="flex items-center gap-2 rounded-2xl border border-forest/20 bg-white px-4 py-2.5 text-xs font-bold text-forest hover:bg-forest/5 transition shadow-sm"
          >
            <Globe className="size-4" />
            Thêm từ URL / Google Drive
          </button>
          <button
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-clay/30 bg-clay/10 px-4 py-2.5 text-xs font-bold text-clay hover:bg-clay/20 transition shadow-sm"
            title="Mở popup chọn ảnh như khi viết Blog hoặc sửa Địa điểm"
          >
            <Sparkles className="size-4" />
            Dùng thử Media Picker
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "library"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <ImageIcon className="size-4" />
          Kho Media Dùng Chung ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab("brand")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "brand"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <Palette className="size-4" />
          Logo & Banner Thương hiệu
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "about"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <Users2 className="size-4" />
          Nội dung & Đội ngũ Giới thiệu
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "contact"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <Phone className="size-4" />
          Thông tin Liên hệ & Footer
        </button>
        <button
          onClick={() => setActiveTab("picker-demo")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "picker-demo"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <Layers className="size-4" />
          Tích hợp Media Picker
        </button>
      </div>

      {/* Hidden Multi-file input */}
      <input
        type="file"
        ref={multiFileInputRef}
        onChange={(e) => e.target.files && handleBatchUpload(e.target.files)}
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        className="hidden"
      />

      {/* ========================================================
          TAB 1: KHO TÀI NGUYÊN MEDIA DÙNG CHUNG
         ======================================================== */}
      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <ImageIcon className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Tổng tài nguyên</p>
                <p className="text-xl font-black text-ink">{stats.total} ảnh</p>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Đang sử dụng</p>
                <p className="text-xl font-black text-emerald-700">{stats.used} ảnh</p>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Chưa sử dụng</p>
                <p className="text-xl font-black text-amber-700">{stats.unused} ảnh</p>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-clay/10 text-clay flex items-center justify-center">
                <HardDrive className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Dung lượng tối đa</p>
                <p className="text-xl font-black text-ink">100MB / ảnh</p>
              </div>
            </div>
          </div>

          {/* Multi-file Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                handleBatchUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => multiFileInputRef.current?.click()}
            className={`rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-forest bg-forest/15 scale-[0.99] shadow-inner"
                : "border-forest/25 bg-forest/[0.02] hover:border-forest hover:bg-forest/5"
            }`}
          >
            <div className="mx-auto size-14 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-3">
              <UploadCloud className="size-7" />
            </div>
            <h3 className="text-sm font-extrabold text-ink">
              Kéo thả nhiều ảnh vào đây hoặc nhấp để tải lên từ máy tính
            </h3>
            <p className="text-xs text-ink/60 mt-1 max-w-md mx-auto">
              Hỗ trợ chọn cùng lúc nhiều file JPG, PNG, WebP, SVG, AVIF. Giới hạn dung lượng lên đến 100MB/file.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-forest shadow-sm border border-forest/10">
                <Sparkles className="size-3" /> Tự động nén & tạo direct link
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-ink/70 shadow-sm border border-black/5">
                <Check className="size-3 text-emerald-600" /> Đồng bộ hai chiều Website
              </span>
            </div>
          </div>

          {/* Upload Progress Queue */}
          {uploadQueue.length > 0 && (
            <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                  <UploadCloud className="size-4 text-forest" />
                  Tiến trình tải ảnh ({uploadQueue.filter((q) => q.status === "done").length}/{uploadQueue.length})
                </h4>
                <button
                  onClick={() => setUploadQueue([])}
                  className="text-xs font-semibold text-ink/50 hover:text-ink"
                >
                  Xóa danh sách
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {uploadQueue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-beige/40 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileImage className="size-4 shrink-0 text-forest" />
                      <span className="font-semibold text-ink truncate">{item.name}</span>
                      <span className="text-[10px] text-ink/40 font-mono">({item.size})</span>
                    </div>
                    <div>
                      {item.status === "uploading" && (
                        <span className="flex items-center gap-1.5 text-forest font-bold">
                          <Loader2 className="size-3.5 animate-spin" /> Đang tải...
                        </span>
                      )}
                      {item.status === "done" && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="size-3.5" /> Xong
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="flex items-center gap-1 text-red-600 font-bold" title={item.error}>
                          <AlertCircle className="size-3.5" /> Lỗi
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
                <input
                  type="text"
                  placeholder="Tìm theo tên ảnh, alt text, mô tả, hoặc vị trí đang dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-beige/60 text-xs text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-forest"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-xl bg-beige/60 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "grid" ? "bg-white text-forest shadow-sm" : "text-ink/50 hover:text-ink"
                  }`}
                  title="Chế độ lưới"
                >
                  <Grid className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === "list" ? "bg-white text-forest shadow-sm" : "text-ink/50 hover:text-ink"
                  }`}
                  title="Chế độ danh sách"
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>

            {/* Category and Status Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/5 text-xs">
              {/* Categories */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-ink/50 mr-1 flex items-center gap-1">
                  <Filter className="size-3" /> Loại:
                </span>
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "brand", label: "Logo & Brand" },
                  { id: "hero", label: "Hero Banner" },
                  { id: "place", label: "Địa điểm" },
                  { id: "product", label: "Sản phẩm" },
                  { id: "blog", label: "Blog" },
                  { id: "other", label: "Khác" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      selectedCategory === cat.id
                        ? "bg-forest text-white"
                        : "bg-beige/60 text-ink/70 hover:bg-beige"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Status and Sort */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status */}
                <div className="flex items-center gap-1">
                  <span className="font-bold text-ink/50 mr-1">Trạng thái:</span>
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "used", label: "Đang dùng" },
                    { id: "unused", label: "Chưa dùng" }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStatus(st.id as any)}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
                        selectedStatus === st.id
                          ? "bg-ink text-white"
                          : "text-ink/60 hover:bg-beige"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Media Items Display */}
          {isLoadingMedia ? (
            <div className="p-16 text-center">
              <Loader2 className="size-8 animate-spin text-forest mx-auto mb-2" />
              <p className="text-xs font-bold text-ink/60">Đang tải kho tài nguyên hình ảnh...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-black/5 shadow-card">
              <ImageIcon className="size-12 text-ink/20 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-ink">Không tìm thấy hình ảnh phù hợp</h4>
              <p className="text-xs text-ink/50 mt-1">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm nút Tải ảnh lên để bổ sung tài nguyên mới.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* ================= GRID VIEW ================= */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => {
                const usage = getUsageDetail(item.url);
                const source = detectImageSource(item.url);

                return (
                  <div
                    key={item.id}
                    className="group relative rounded-3xl bg-white p-3 shadow-card border border-black/5 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-forest/5 border border-black/5 mb-2.5">
                        <AppImage
                          src={item.url}
                          alt={item.alt || item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                          {/* Usage Status Badge */}
                          {usage.isUsed ? (
                            <span className="rounded-full bg-emerald-600/95 text-white px-2 py-0.5 text-[10px] font-extrabold shadow-md flex items-center gap-1 backdrop-blur-sm">
                              <CheckCircle2 className="size-2.5" /> Đang dùng
                            </span>
                          ) : (
                            <span className="rounded-full bg-black/60 text-white/90 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                              Chưa dùng
                            </span>
                          )}

                          {/* Source icon badge */}
                          {source === "google-drive" && (
                            <span className="rounded-full bg-blue-600 text-white px-1.5 py-0.5 text-[9px] font-black shadow" title="Google Drive Direct">
                              GDrive
                            </span>
                          )}
                        </div>

                        {/* Hover Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-ink/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setCropTarget({
                                  url: item.url,
                                  name: item.name,
                                  field: "mediaItem",
                                  aspect: "free"
                                })
                              }
                              className="p-1.5 rounded-lg bg-amber-500/85 hover:bg-amber-500 text-white transition"
                              title="Cắt xén & Thu phóng ảnh này"
                            >
                              <Crop className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-ink transition"
                              title="Xem chi tiết & phóng to"
                            >
                              <Maximize2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-ink transition"
                              title="Sửa tên, alt text, mô tả"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.url)}
                              className="w-full py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-ink text-[10px] font-bold transition flex items-center justify-center gap-1"
                            >
                              <Copy className="size-3" /> Copy URL
                            </button>
                            <button
                              type="button"
                              onClick={() => initiateDelete(item)}
                              className="w-full py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold transition flex items-center justify-center gap-1"
                            >
                              <Trash2 className="size-3" /> Xóa
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Info & Title */}
                      <div className="space-y-1">
                        <p className="font-extrabold text-ink text-xs line-clamp-1" title={item.name}>
                          {item.name}
                        </p>
                        <p className="text-[10px] text-ink/50 font-mono line-clamp-1" title={item.url}>
                          {item.url}
                        </p>
                      </div>
                    </div>

                    {/* Usage Locations & Quick Assign Dropdown */}
                    <div className="mt-2.5 pt-2 border-t border-black/5 space-y-1.5">
                      {usage.isUsed ? (
                        <div className="flex flex-wrap gap-1">
                          {usage.locations.slice(0, 2).map((loc, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-forest/10 px-1.5 py-0.5 text-[9px] font-bold text-forest truncate max-w-full"
                              title={`${loc.type}: ${loc.title}`}
                            >
                              {loc.title}
                            </span>
                          ))}
                          {usage.locations.length > 2 && (
                            <span className="rounded-md bg-beige px-1.5 py-0.5 text-[9px] font-bold text-ink/60">
                              +{usage.locations.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-ink/40 italic">Chưa gắn vào trang nào</p>
                      )}

                      {/* Quick Assign Menu */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <span className="text-[10px] font-bold text-ink/40">Gán nhanh:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => assignAs("logo", item)}
                            className="px-1.5 py-0.5 rounded bg-forest/10 hover:bg-forest hover:text-white text-forest text-[9px] font-bold transition"
                            title="Đặt làm Logo chính website"
                          >
                            Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => assignAs("hero", item)}
                            className="px-1.5 py-0.5 rounded bg-clay/10 hover:bg-clay hover:text-white text-clay text-[9px] font-bold transition"
                            title="Đặt làm Hero Banner trang chủ"
                          >
                            Hero
                          </button>
                          <button
                            type="button"
                            onClick={() => assignAs("blog-content", item)}
                            className="px-1.5 py-0.5 rounded bg-sky-100 hover:bg-sky-600 hover:text-white text-sky-800 text-[9px] font-bold transition"
                            title="Copy cú pháp chèn bài viết Blog"
                          >
                            Blog
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= LIST VIEW ================= */
            <div className="rounded-3xl bg-white shadow-card border border-black/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
                    <tr>
                      <th className="p-4">Hình ảnh</th>
                      <th className="p-4">Tên / Alt text</th>
                      <th className="p-4">Phân loại</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Nơi đang sử dụng</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredMedia.map((item) => {
                      const usage = getUsageDetail(item.url);
                      return (
                        <tr key={item.id} className="hover:bg-beige/30 transition">
                          <td className="p-4">
                            <div className="relative size-14 rounded-xl overflow-hidden bg-forest/5 border border-black/10 shrink-0">
                              <AppImage src={item.url} alt={item.alt || item.name} fill sizes="60px" className="object-cover" />
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-extrabold text-ink">{item.name}</p>
                            <p className="text-[11px] text-ink/50 font-mono mt-0.5 line-clamp-1">{item.url}</p>
                            {item.alt && <p className="text-[11px] text-forest font-semibold mt-0.5">Alt: {item.alt}</p>}
                          </td>
                          <td className="p-4">
                            <span className="rounded-full bg-beige px-2.5 py-0.5 font-bold text-[11px] text-ink/70">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            {usage.isUsed ? (
                              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-extrabold inline-flex items-center gap-1">
                                <CheckCircle2 className="size-3" /> Đang sử dụng
                              </span>
                            ) : (
                              <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-1 text-[11px] font-bold">
                                Chưa sử dụng
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {usage.isUsed ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {usage.locations.map((loc, i) => (
                                  <span key={i} className="rounded-md bg-forest/10 px-2 py-0.5 text-[10px] font-bold text-forest">
                                    {loc.title}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-ink/40 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewItem(item)}
                                className="p-2 rounded-xl bg-beige hover:bg-forest/10 text-forest transition"
                                title="Xem phóng to"
                              >
                                <Eye className="size-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-2 rounded-xl bg-beige hover:bg-forest/10 text-forest transition"
                                title="Sửa thông tin"
                              >
                                <Edit2 className="size-3.5" />
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.url)}
                                className="p-2 rounded-xl bg-beige hover:bg-forest/10 text-forest transition"
                                title="Copy URL"
                              >
                                <Copy className="size-3.5" />
                              </button>
                              <button
                                onClick={() => initiateDelete(item)}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition"
                                title="Xóa ảnh"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: CẤU HÌNH WEBSITE & LOGO THƯƠNG HIỆU
         ======================================================== */}
      {activeTab === "brand" && (
        <div className="space-y-8">
          {/* Top Action & Status Banner */}
          <div className="rounded-3xl bg-forest p-6 text-white border border-forest/15 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-2">
                <Palette className="size-5 text-amber-300" />
                <h2 className="text-lg font-black tracking-tight">Cấu hình Logo & Nhận diện Thương hiệu Website</h2>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                Tất cả hình ảnh tải lên đều được <strong>TỰ ĐỘNG LƯU NGAY LẬP TỨC</strong> vào hệ thống.
                Bạn cũng có thể dán link ảnh và bấm nút <strong>"Lưu Logo"</strong> riêng ở từng ô hoặc bấm <strong>"Lưu Tất Cả Thay Đổi"</strong> để kích hoạt trên trang khách (<code className="font-mono font-bold text-amber-200">ChamALuoi-Customer:3000</code>).
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAllBrandSettings}
              disabled={isSavingSettings}
              className="px-6 py-3 rounded-2xl bg-white text-forest text-xs font-black hover:bg-emerald-50 transition shadow-lg flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95"
            >
              {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 text-forest" />}
              {isSavingSettings ? "ĐANG LƯU..." : "LƯU TẤT CẢ THAY ĐỔI"}
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. Logo Chính */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                    <Sparkles className="size-4 text-forest" />
                    1. Logo chính (Desktop / Header)
                  </h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                    Đang sử dụng
                  </span>
                </div>
                <p className="text-xs text-ink/60 mt-1">
                  Hiển thị trên thanh điều hướng đầu trang và các văn bản thương hiệu chính.
                </p>

                {/* Checkerboard Preview */}
                <div className="mt-4 rounded-2xl p-4 flex items-center justify-center h-28 border border-black/10 relative overflow-hidden bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
                  <div
                    className="relative transition-all"
                    style={{
                      height: `${Math.min(siteSettings.logoHeight || 56, 75)}px`,
                      width: `${Math.min(siteSettings.logoWidth || 220, 260)}px`,
                      transform: `scale(${(siteSettings.logoScale || 100) / 100})`,
                      transformOrigin: "center center"
                    }}
                  >
                    <AppImage src={siteSettings.logo} alt="Logo chính" fill className="object-contain" priority />
                  </div>
                </div>

                {/* Crop & Trim Shortcut Button */}
                <div className="mt-3 flex items-center justify-between gap-2 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-2.5 text-amber-900">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                      <Scissors className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black">Cắt xén & Bỏ viền thừa Logo</p>
                      <p className="text-[10px] text-amber-700">Loại bỏ vùng trống/trong suốt giúp Logo to rõ, không bị nhỏ</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCropTarget({
                        url: siteSettings.logo || "",
                        name: "Logo chính",
                        field: "logo",
                        aspect: "4:1"
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 shrink-0"
                  >
                    <Crop className="size-3.5" />
                    <span>Cắt Logo</span>
                  </button>
                </div>

                {/* Logo Display Size Controls (Độ to nhỏ hiển thị) */}
                <div className="mt-4 p-4 rounded-2xl bg-beige/50 border border-black/5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-ink flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="size-3.5 text-forest" />
                      Chỉnh độ to nhỏ hiển thị Logo trên Header
                    </span>
                    <span className="text-xs font-extrabold text-forest bg-forest/10 px-2.5 py-0.5 rounded-lg">
                      {siteSettings.logoHeight || 56}px
                    </span>
                  </div>

                  {/* Slider Chiều cao */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-ink/70">
                      <span>Chiều cao Logo trên thanh điều hướng:</span>
                      <span className="font-mono font-bold text-forest">{siteSettings.logoHeight || 56}px</span>
                    </div>
                    <input
                      type="range"
                      min={32}
                      max={96}
                      value={siteSettings.logoHeight || 56}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, logoHeight: parseInt(e.target.value) })
                      }
                      className="w-full accent-forest cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-ink/40 font-mono">
                      <span>Nhỏ (32px)</span>
                      <span>Mặc định (56px)</span>
                      <span>Rất lớn (96px)</span>
                    </div>
                  </div>

                  {/* Slider Chiều rộng */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-ink/70">
                      <span>Chiều rộng tối đa (Max Width):</span>
                      <span className="font-mono font-bold text-forest">{siteSettings.logoWidth || 220}px</span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={360}
                      value={siteSettings.logoWidth || 220}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, logoWidth: parseInt(e.target.value) })
                      }
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>

                  {/* Slider Scale */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-ink/70">
                      <span>Độ thu phóng nội tại (Scale %):</span>
                      <span className="font-mono font-bold text-forest">{siteSettings.logoScale || 100}%</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={200}
                      value={siteSettings.logoScale || 100}
                      onChange={(e) =>
                        setSiteSettings({ ...siteSettings, logoScale: parseInt(e.target.value) })
                      }
                      className="w-full accent-forest cursor-pointer"
                    />
                  </div>
                </div>

                {/* Live Header Mockup Simulator */}
                <div className="mt-4 rounded-2xl border border-black/10 overflow-hidden shadow-sm bg-beige/80">
                  <div className="px-3.5 py-2 bg-forest/10 border-b border-black/5 flex items-center justify-between text-[10px] font-bold text-forest">
                    <span>MÔ PHỎNG THANH HEADER WEBSITE (PORT 3000)</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Real-time
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between gap-3 overflow-x-auto bg-[#F5F2EB]">
                    <div
                      className="relative shrink-0 transition-all flex items-center"
                      style={{
                        height: `${siteSettings.logoHeight || 56}px`,
                        width: `${siteSettings.logoWidth || 220}px`,
                        transform: `scale(${(siteSettings.logoScale || 100) / 100})`,
                        transformOrigin: "left center"
                      }}
                    >
                      <AppImage
                        src={siteSettings.logo}
                        alt="Logo Preview"
                        fill
                        className="object-contain object-left"
                      />
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-ink/70 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                      <span className="px-2 py-0.5 rounded-full bg-forest text-white">Trang chủ</span>
                      <span>Địa điểm</span>
                      <span>Blog</span>
                      <span>Đặt tour</span>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 text-[10px]">
                      <span className="px-3 py-1.5 rounded-xl bg-forest text-white font-bold shadow-sm">Đặt tour</span>
                    </div>
                  </div>
                </div>


                <div className="mt-4 space-y-2">
                  <label className="text-xs font-bold text-ink">Đường dẫn ảnh Logo:</label>
                  <input
                    type="text"
                    value={siteSettings.logo}
                    onChange={(e) => setSiteSettings({ ...siteSettings, logo: e.target.value })}
                    placeholder="/images/logo.svg hoặc link URL..."
                    className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={(e) => handleFileUploadForBrand(e, "logo", "logo")}
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingField === "logo"}
                  className="flex-1 min-w-[120px] rounded-xl bg-forest py-2 px-3 text-xs font-bold text-white hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {uploadingField === "logo" ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Tải logo mới
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSingleSetting("logo", "Logo chính")}
                  disabled={isSavingSettings}
                  className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                  title="Lưu ngay thay đổi Logo chính"
                >
                  <Save className="size-3.5" />
                  Lưu Logo
                </button>
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, logo: "/images/logo.svg" })}
                  className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-beige"
                  title="Khôi phục mặc định"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Logo Mobile */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                    <Smartphone className="size-4 text-forest" />
                    2. Logo di động (Mobile Mockup)
                  </h3>
                  <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5">
                    Di động
                  </span>
                </div>
                <p className="text-xs text-ink/60 mt-1">
                  Logo thu gọn tối ưu cho màn hình điện thoại (nếu trống sẽ tự động dùng Logo chính).
                </p>

                {/* Mobile Header Mockup */}
                <div className="mt-4 rounded-2xl p-4 bg-beige border border-black/10 flex items-center justify-between">
                  <div className="relative h-9 w-28">
                    <AppImage
                      src={siteSettings.logoMobile || siteSettings.logo}
                      alt="Logo Mobile"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCropTarget({
                        url: siteSettings.logoMobile || siteSettings.logo || "",
                        name: "Logo Mobile",
                        field: "logoMobile",
                        aspect: "3:1"
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1"
                  >
                    <Crop className="size-3" />
                    <span>Cắt ảnh</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <div className="size-6 rounded-md bg-forest/10" />
                    <div className="size-6 rounded-md bg-forest/10" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-xs font-bold text-ink">Đường dẫn ảnh Logo Mobile:</label>
                  <input
                    type="text"
                    value={siteSettings.logoMobile || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, logoMobile: e.target.value })}
                    placeholder="Để trống để dùng chung logo chính..."
                    className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
                <input
                  type="file"
                  ref={logoMobileInputRef}
                  onChange={(e) => handleFileUploadForBrand(e, "logoMobile", "logo-mobile")}
                  accept="image/png,image/svg+xml,image/webp,image/jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoMobileInputRef.current?.click()}
                  disabled={uploadingField === "logoMobile"}
                  className="flex-1 min-w-[120px] rounded-xl bg-forest py-2 px-3 text-xs font-bold text-white hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {uploadingField === "logoMobile" ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Tải logo mobile
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSingleSetting("logoMobile", "Logo Mobile")}
                  disabled={isSavingSettings}
                  className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                  title="Lưu ngay thay đổi Logo Mobile"
                >
                  <Save className="size-3.5" />
                  Lưu Logo Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, logoMobile: "" })}
                  className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-beige"
                  title="Xóa để dùng logo chính"
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* 3. Favicon Website */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                    <Laptop className="size-4 text-forest" />
                    3. Favicon (Tab trình duyệt)
                  </h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                    Đang sử dụng
                  </span>
                </div>
                <p className="text-xs text-ink/60 mt-1">
                  Biểu tượng nhỏ cạnh tiêu đề trang trên thanh tab của Chrome, Edge, Safari.
                </p>

                {/* Browser Tab Mockup */}
                <div className="mt-4 rounded-2xl bg-neutral-800 p-3 shadow-inner">
                  <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-xl text-white text-xs max-w-xs shadow">
                    <div className="relative size-4 shrink-0">
                      <AppImage src={siteSettings.favicon || "/favicon.ico"} alt="Favicon" fill className="object-contain" />
                    </div>
                    <span className="font-semibold truncate text-[11px]">Chạm A Lưới | Du lịch cộng đồng...</span>
                    <X className="size-3 ml-auto text-white/40" />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-xs font-bold text-ink">Đường dẫn Favicon:</label>
                  <input
                    type="text"
                    value={siteSettings.favicon || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, favicon: e.target.value })}
                    placeholder="/favicon.ico..."
                    className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
                <input
                  type="file"
                  ref={faviconInputRef}
                  onChange={(e) => handleFileUploadForBrand(e, "favicon", "favicon")}
                  accept="image/x-icon,image/png,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingField === "favicon"}
                  className="flex-1 min-w-[120px] rounded-xl bg-forest py-2 px-3 text-xs font-bold text-white hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {uploadingField === "favicon" ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Tải favicon
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSingleSetting("favicon", "Favicon")}
                  disabled={isSavingSettings}
                  className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                  title="Lưu ngay thay đổi Favicon"
                >
                  <Save className="size-3.5" />
                  Lưu Favicon
                </button>
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, favicon: "/favicon.ico" })}
                  className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-beige"
                  title="Khôi phục /favicon.ico"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Hero Banner Trang chủ */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                    <ImageIcon className="size-4 text-forest" />
                    4. Ảnh Hero Banner Trang chủ (/)
                  </h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                    Trang chủ
                  </span>
                </div>
                <p className="text-xs text-ink/60 mt-1">
                  Hình ảnh đầu tiên khách hàng nhìn thấy khi vào trang chủ Chạm A Lưới.
                </p>

                {/* Hero Preview Mockup */}
                <div className="mt-4 relative aspect-[16/9] rounded-2xl overflow-hidden border border-black/10">
                  <AppImage src={siteSettings.heroImage} alt="Hero Banner" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Du lịch cộng đồng tại Huế</p>
                    <h4 className="text-lg font-black leading-tight">Chạm A Lưới</h4>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="text-xs font-bold text-ink">Đường dẫn ảnh Hero Banner:</label>
                  <input
                    type="text"
                    value={siteSettings.heroImage}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                    placeholder="URL ảnh hoặc /images/home-hero-local.jpg..."
                    className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5">
                <input
                  type="file"
                  ref={heroInputRef}
                  onChange={(e) => handleFileUploadForBrand(e, "heroImage", "hero")}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={uploadingField === "heroImage"}
                  className="flex-1 min-w-[120px] rounded-xl bg-forest py-2 px-3 text-xs font-bold text-white hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {uploadingField === "heroImage" ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                  Tải banner mới
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSingleSetting("heroImage", "Hero Banner")}
                  disabled={isSavingSettings}
                  className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                  title="Lưu ngay thay đổi Hero Banner"
                >
                  <Save className="size-3.5" />
                  Lưu Banner
                </button>
                <button
                  type="button"
                  onClick={() => setSiteSettings({ ...siteSettings, heroImage: "/images/home-hero-local.jpg" })}
                  className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-beige"
                  title="Khôi phục mặc định"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* 5. Ảnh Trang Giới thiệu */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4 flex flex-col justify-between md:col-span-2">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                    <ImageIcon className="size-4 text-forest" />
                    5. Ảnh Trang Giới thiệu (/about)
                  </h3>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                    Trang Giới thiệu
                  </span>
                </div>
                <p className="text-xs text-ink/60 mt-1">
                  Hình ảnh minh họa vẻ đẹp thiên nhiên và văn hóa bản địa trên trang Giới thiệu sứ mệnh dự án.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-black/10">
                    <AppImage src={siteSettings.aboutHeroImage} alt="About Banner" fill className="object-cover" />
                  </div>
                  <div className="space-y-3 flex flex-col justify-center">
                    <label className="text-xs font-bold text-ink">Đường dẫn ảnh Giới thiệu:</label>
                    <input
                      type="text"
                      value={siteSettings.aboutHeroImage}
                      onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroImage: e.target.value })}
                      placeholder="URL ảnh trang giới thiệu..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <input
                        type="file"
                        ref={aboutInputRef}
                        onChange={(e) => handleFileUploadForBrand(e, "aboutHeroImage", "about")}
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => aboutInputRef.current?.click()}
                        disabled={uploadingField === "aboutHeroImage"}
                        className="flex-1 min-w-[120px] rounded-xl bg-forest py-2.5 px-3 text-xs font-bold text-white hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {uploadingField === "aboutHeroImage" ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                        Tải ảnh mới từ máy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPickingMemberId(null);
                          setIsPickerOpen(true);
                        }}
                        className="rounded-xl border border-black/10 px-3.5 py-2.5 text-xs font-bold text-ink hover:bg-beige transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Layers className="size-3.5" />
                        Kho Media
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveSingleSetting("aboutHeroImage", "Ảnh Trang Giới Thiệu")}
                        disabled={isSavingSettings}
                        className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                        title="Lưu ngay thay đổi Ảnh Giới Thiệu"
                      >
                        <Save className="size-3.5" />
                        Lưu Ảnh Giới Thiệu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Quick Card pointing to Contact settings */}
            <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-forest/10 text-forest">
                  <Phone className="size-6" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">Thông tin Liên hệ, Hotline & Chân trang (Footer)</h3>
                  <p className="text-xs text-ink/70 mt-0.5">
                    Địa chỉ: <strong>{siteSettings.contactAddress || "Huyện A Lưới, Thừa Thiên Huế"}</strong> • Hotline: <strong>{siteSettings.contactPhone || "0905 000 118"}</strong> • Email: <strong>{siteSettings.contactEmail || "hotro@chamaluoi.vn"}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("contact")}
                className="px-4 py-2.5 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow flex items-center gap-1.5 shrink-0"
              >
                <Edit2 className="size-3.5" />
                Chỉnh sửa Thông tin Liên hệ & Footer
                <ArrowRight className="size-3.5" />
              </button>
            </div>

          {/* Sticky Bottom Action Bar for Brand Settings */}
          <div className="sticky bottom-4 z-40 rounded-3xl bg-forest p-4 text-white shadow-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold">Lưu Cấu Hình Thương Hiệu & Website</h4>
              <p className="text-[11px] text-emerald-200">
                Lưu vào hệ thống dữ liệu dùng chung. Web khách sẽ tự động cập nhật ngay lập tức.
              </p>
            </div>
            <button
              onClick={handleSaveAllBrandSettings}
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-2xl bg-white text-forest text-xs font-extrabold hover:bg-emerald-50 transition shadow flex items-center gap-2"
            >
              {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isSavingSettings ? "Đang lưu cấu hình..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB: THÔNG TIN LIÊN HỆ & FOOTER (HỖ TRỢ & LIÊN HỆ)
         ======================================================== */}
      {activeTab === "contact" && (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-forest text-xs font-black uppercase tracking-wider mb-1">
                <Phone className="size-4" />
                Cấu hình chân trang & hỗ trợ
              </div>
              <h2 className="text-xl font-black text-ink">Quản lý Thông tin Hỗ trợ & Chân trang (Footer)</h2>
              <p className="text-xs text-ink/70 mt-1 max-w-2xl leading-relaxed">
                Tất cả thông tin chỉnh sửa tại đây (Địa chỉ, Hotline, Email, Mạng xã hội, Lời giới thiệu) sẽ được tự động đồng bộ sang mục &quot;Hỗ trợ & Liên hệ&quot; ở chân trang của toàn bộ Website Khách và Trang Quản trị.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="http://localhost:3000#footer"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-2xl border border-black/10 text-xs font-bold text-ink hover:bg-beige transition flex items-center gap-1.5"
              >
                <ExternalLink className="size-3.5" />
                Xem chân trang Web Khách
              </a>
              <button
                type="button"
                onClick={handleSaveAllBrandSettings}
                disabled={isSavingSettings}
                className="px-5 py-2.5 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingSettings ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Lưu Thông Tin Ngay
              </button>
            </div>
          </div>

          {/* Live Interactive Footer Preview Card */}
          <div className="rounded-3xl bg-ink text-white p-6 md:p-8 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Eye className="size-4" />
                Xem trước trực tiếp hiển thị Chân trang (Live Preview)
              </div>
              <span className="text-[11px] text-white/50">Tự động cập nhật theo nội dung bạn nhập</span>
            </div>

            <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr_1fr] pt-2">
              {/* Brand & Intro column */}
              <div>
                <div className="relative h-10 w-44 mb-3">
                  <AppImage
                    src={siteSettings.logoDark || siteSettings.logo || "/images/logo-white.svg"}
                    alt="Logo Chân trang"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <p className="max-w-md text-xs leading-6 text-white/70">
                  {siteSettings.footerDescription || "Nền tảng du lịch cộng đồng kết nối du khách với các homestay, làng nghề truyền thống, ẩm thực bản địa và những điểm đến sinh thái nguyên sơ tại A Lưới, Thừa Thiên Huế."}
                </p>
                <p className="mt-4 text-xs text-emerald-300 flex items-center gap-1.5">
                  <Heart className="size-3.5 fill-current" /> Du lịch xanh • Tôn trọng bản sắc • Đồng hành cùng bà con
                </p>
              </div>

              {/* Navigation links sample */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Khám phá A Lưới</h4>
                <ul className="mt-4 grid gap-2 text-xs text-white/75">
                  <li className="hover:text-white transition cursor-pointer">Điểm đến & Thác suối</li>
                  <li className="hover:text-white transition cursor-pointer">Homestay & Nghỉ dưỡng</li>
                  <li className="hover:text-white transition cursor-pointer">Trải nghiệm Văn hóa</li>
                  <li className="hover:text-white transition cursor-pointer">Cẩm nang & Blog</li>
                </ul>
              </div>

              {/* Contact info column */}
              <address className="not-italic">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Hỗ trợ & Liên hệ</h4>
                <ul className="mt-4 grid gap-2.5 text-xs text-white/75">
                  <li className="flex items-center gap-2.5">
                    <MapPin className="size-4 shrink-0 text-clay" aria-hidden="true" />
                    <span>{siteSettings.contactAddress || "Huyện A Lưới, Thừa Thiên Huế"}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Phone className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    <span className="font-semibold text-emerald-300">{siteSettings.contactPhone || "0905 000 118"}</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="size-4 shrink-0 text-amber-300" aria-hidden="true" />
                    <span className="text-amber-200">{siteSettings.contactEmail || "hotro@chamaluoi.vn"}</span>
                  </li>
                </ul>
                <div className="mt-4 flex items-center gap-3 text-white/75">
                  {siteSettings.facebookUrl && (
                    <a
                      href={siteSettings.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-[11px]"
                      title="Facebook Fanpage"
                    >
                      <Facebook className="size-3.5" />
                    </a>
                  )}
                  {siteSettings.instagramUrl && (
                    <a
                      href={siteSettings.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-[11px]"
                      title="Instagram"
                    >
                      <Instagram className="size-3.5" />
                    </a>
                  )}
                  {siteSettings.zaloUrl && (
                    <a
                      href={siteSettings.zaloUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 hover:bg-blue-600/50 text-[11px] font-bold transition flex items-center gap-1"
                      title="Zalo Chat"
                    >
                      Zalo
                    </a>
                  )}
                </div>
              </address>
            </div>
          </div>

          {/* Form Editors */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Box 1: Thông tin liên lạc cốt lõi */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
                <div className="p-2 rounded-xl bg-forest/10 text-forest">
                  <Phone className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">Thông tin Liên lạc Cốt lõi</h3>
                  <p className="text-[11px] text-ink/60">Địa chỉ, đường dây nóng và hòm thư điện tử</p>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-clay" />
                  Địa chỉ trụ sở / Liên hệ:
                </label>
                <input
                  type="text"
                  value={siteSettings.contactAddress || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactAddress: e.target.value })}
                  placeholder="Ví dụ: Huyện A Lưới, Thừa Thiên Huế"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <p className="text-[11px] text-ink/50">Hiển thị dòng đầu tiên trong khối &quot;Hỗ trợ & Liên hệ&quot;.</p>
              </div>

              {/* Hotline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Phone className="size-3.5 text-emerald-600" />
                  Hotline / Số điện thoại hỗ trợ:
                </label>
                <input
                  type="text"
                  value={siteSettings.contactPhone || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                  placeholder="Ví dụ: 0905 000 118"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <p className="text-[11px] text-ink/50">Tự động kích hoạt cuộc gọi khi du khách nhấn vào trên điện thoại.</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Mail className="size-3.5 text-amber-600" />
                  Hòm thư điện tử (Email):
                </label>
                <input
                  type="email"
                  value={siteSettings.contactEmail || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  placeholder="Ví dụ: hotro@chamaluoi.vn"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <p className="text-[11px] text-ink/50">Khách hàng nhấn vào sẽ mở ngay ứng dụng gửi thư điện tử.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveSingleSetting("contactPhone", "Thông tin Liên lạc")}
                  disabled={isSavingSettings}
                  className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  Lưu khối liên lạc
                </button>
              </div>
            </div>

            {/* Box 2: Mạng xã hội & Kênh tư vấn */}
            <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
              <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Share2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-ink">Mạng Xã Hội & Kênh Kết Nối</h3>
                  <p className="text-[11px] text-ink/60">Liên kết Fanpage Facebook, Instagram và Zalo</p>
                </div>
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Facebook className="size-3.5 text-blue-600" />
                  Đường dẫn Facebook Fanpage:
                </label>
                <input
                  type="url"
                  value={siteSettings.facebookUrl || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/chamaluoi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Instagram className="size-3.5 text-pink-600" />
                  Đường dẫn Instagram:
                </label>
                <input
                  type="url"
                  value={siteSettings.instagramUrl || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/chamaluoi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              {/* Zalo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <MessageCircle className="size-3.5 text-blue-500" />
                  Đường dẫn Zalo OA / Zalo cá nhân:
                </label>
                <input
                  type="url"
                  value={siteSettings.zaloUrl || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, zaloUrl: e.target.value })}
                  placeholder="https://zalo.me/0905000118"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveSingleSetting("facebookUrl", "Mạng Xã Hội")}
                  disabled={isSavingSettings}
                  className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition shadow-sm flex items-center gap-1.5"
                >
                  <Save className="size-3.5" />
                  Lưu liên kết mạng xã hội
                </button>
              </div>
            </div>
          </div>

          {/* Box 3: Đoạn giới thiệu Chân trang & Thông báo đầu trang */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-black/5 pb-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <Edit2 className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink">Nội dung Giới thiệu Chân trang & Thông báo</h3>
                <p className="text-[11px] text-ink/60">Tùy biến lời giới thiệu sứ mệnh và dòng thông báo website</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Footer description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">
                  Đoạn mô tả giới thiệu chân trang (Footer Description):
                </label>
                <textarea
                  rows={4}
                  value={siteSettings.footerDescription || ""}
                  onChange={(e) => setSiteSettings({ ...siteSettings, footerDescription: e.target.value })}
                  placeholder="Nền tảng du lịch cộng đồng kết nối du khách với các homestay..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
                <p className="text-[11px] text-ink/50">Hiển thị dưới logo ở chân trang website.</p>
              </div>

              {/* Announcement */}
              <div className="space-y-1.5 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-ink">
                    Thông báo đầu trang (Announcement Bar):
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcement || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement: e.target.value })}
                    placeholder="Chào mừng quý khách đến với du lịch cộng đồng Chạm A Lưới!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest mt-1.5"
                  />
                  <p className="text-[11px] text-ink/50 mt-1">Thông báo trên thanh tiêu đề website.</p>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSiteSettings({
                        ...siteSettings,
                        contactAddress: "Huyện A Lưới, Thừa Thiên Huế",
                        contactPhone: "0905 000 118",
                        contactEmail: "hotro@chamaluoi.vn",
                        facebookUrl: "https://facebook.com/chamaluoi",
                        instagramUrl: "https://instagram.com/chamaluoi",
                        zaloUrl: "https://zalo.me/0905000118",
                        footerDescription: "Nền tảng du lịch cộng đồng kết nối du khách với các homestay, làng nghề truyền thống, ẩm thực bản địa và những điểm đến sinh thái nguyên sơ tại A Lưới, Thừa Thiên Huế."
                      });
                    }}
                    className="text-xs font-bold text-ink/60 hover:text-ink transition flex items-center gap-1"
                  >
                    <RotateCcw className="size-3.5" />
                    Khôi phục mẫu chuẩn
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSingleSetting("footerDescription", "Mô tả & Thông báo")}
                    disabled={isSavingSettings}
                    className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="size-3.5" />
                    Lưu mô tả
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-4 z-40 rounded-3xl bg-forest p-4 text-white shadow-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold">Lưu Thông Tin Hỗ Trợ & Chân Trang</h4>
              <p className="text-[11px] text-emerald-200">
                Toàn bộ dữ liệu sẽ được lưu vào hệ thống dùng chung và cập nhật ngay trên Website Khách.
              </p>
            </div>
            <button
              onClick={handleSaveAllBrandSettings}
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-2xl bg-white text-forest text-xs font-extrabold hover:bg-emerald-50 transition shadow flex items-center gap-2"
            >
              {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isSavingSettings ? "Đang lưu thông tin..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2.5: QUẢN LÝ NỘI DUNG & ĐỘI NGŨ GIỚI THIỆU (/about)
         ======================================================== */}
      {activeTab === "about" && (
        <div className="space-y-8">
          {/* Header Info Banner */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <Users2 className="size-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-ink">Quản Lý Trang Giới Thiệu & Đội Ngũ (/about)</h2>
                <p className="text-xs text-ink/65 mt-0.5">
                  Chỉnh sửa trực quan lời mở đầu, biểu ngữ, 3 trụ cột cốt lõi, đội ngũ sáng lập & nghệ nhân đồng hành và tác động cộng đồng.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="http://localhost:3000/about"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-beige text-xs font-bold text-ink/80 hover:text-ink hover:bg-beige/80 transition flex items-center gap-1.5 border border-black/5"
              >
                <ExternalLink className="size-3.5" />
                Xem trang /about thực tế
              </a>
              <button
                type="button"
                onClick={handleSaveAllBrandSettings}
                disabled={isSavingSettings}
                className="px-5 py-2 rounded-xl bg-forest text-xs font-extrabold text-white hover:bg-forest/90 transition shadow-sm flex items-center gap-1.5"
              >
                {isSavingSettings ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Lưu cấu hình
              </button>
            </div>
          </div>

          {/* SECTION 1: HERO & LỜI MỞ ĐẦU */}
          <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card border border-black/5 space-y-6">
            <div className="border-b border-black/5 pb-4">
              <span className="rounded-full bg-forest/10 text-forest text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider">
                Phần 1: Hero & Tiêu đề
              </span>
              <h3 className="font-black text-base text-ink mt-2">Biểu Ngữ & Thông Điệp Mở Đầu</h3>
              <p className="text-xs text-ink/60 mt-0.5">
                Nội dung xuất hiện đầu tiên khi du khách truy cập trang Giới thiệu Chạm A Lưới.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Thẻ danh mục (Badge nhỏ):</label>
                  <input
                    type="text"
                    value={siteSettings.aboutBadge || "Về chúng tôi"}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutBadge: e.target.value })}
                    placeholder="Về chúng tôi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Tiêu đề chính trang Giới thiệu (H1):</label>
                  <input
                    type="text"
                    value={siteSettings.aboutTitle || "Cầu nối số cho du lịch cộng đồng"}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutTitle: e.target.value })}
                    placeholder="Cầu nối số cho du lịch cộng đồng"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Lời mở đầu / Giới thiệu sứ mệnh:</label>
                  <textarea
                    rows={4}
                    value={siteSettings.aboutSubtitle || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutSubtitle: e.target.value })}
                    placeholder="Chạm A Lưới là nền tảng du lịch trung gian giúp kết nối du khách..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-ink flex items-center gap-1">
                      <Sparkles className="size-3 text-clay" /> Cam kết 1:
                    </label>
                    <input
                      type="text"
                      value={siteSettings.aboutCommitment1 || "Minh bạch đối soát"}
                      onChange={(e) => setSiteSettings({ ...siteSettings, aboutCommitment1: e.target.value })}
                      placeholder="Minh bạch đối soát"
                      className="w-full px-3 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-ink flex items-center gap-1">
                      <Heart className="size-3 text-emerald-600" /> Cam kết 2:
                    </label>
                    <input
                      type="text"
                      value={siteSettings.aboutCommitment2 || "Đồng hành cùng bà con"}
                      onChange={(e) => setSiteSettings({ ...siteSettings, aboutCommitment2: e.target.value })}
                      placeholder="Đồng hành cùng bà con"
                      className="w-full px-3 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>
              </div>

              {/* Banner Photo Box */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Hình ảnh đại diện trang Giới thiệu:</label>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-black/10 shadow-sm bg-neutral-900">
                    <AppImage
                      src={siteSettings.aboutHeroImage || "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=82"}
                      alt="Xem trước ảnh trang giới thiệu"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={siteSettings.aboutHeroImage || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutHeroImage: e.target.value })}
                    placeholder="URL ảnh hoặc link Google Drive..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={aboutInputRef}
                      onChange={(e) => handleFileUploadForBrand(e, "aboutHeroImage", "about")}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => aboutInputRef.current?.click()}
                      disabled={uploadingField === "aboutHeroImage"}
                      className="flex-1 min-w-[120px] rounded-xl bg-forest py-2 px-3 text-xs font-bold text-white hover:bg-forest/90 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {uploadingField === "aboutHeroImage" ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                      Tải ảnh từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPickingMemberId(null);
                        setIsPickerOpen(true);
                      }}
                      className="rounded-xl border border-black/10 px-3.5 py-2 text-xs font-bold text-ink hover:bg-beige transition flex items-center gap-1.5"
                    >
                      <Layers className="size-3.5" />
                      Kho Media
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCropTarget({
                          url: siteSettings.aboutHeroImage || "",
                          name: "Ảnh Trang Giới Thiệu",
                          field: "aboutHeroImage",
                          aspect: "4:1"
                        })
                      }
                      className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <Crop className="size-3" />
                      Cắt ảnh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 3 TRỤ CỘT CỐT LÕI (SỨ MỆNH - TẦM NHÌN - GIÁ TRỊ CỐT LÕI) */}
          <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card border border-black/5 space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider">
                  Phần 2: Giá trị định hướng
                </span>
                <h3 className="font-black text-base text-ink mt-2">Sứ Mệnh, Tầm Nhìn & Giá Trị Cốt Lõi</h3>
                <p className="text-xs text-ink/60 mt-0.5">
                  3 khối giá trị cốt lõi làm kim chỉ nam phát triển cho du lịch cộng đồng Chạm A Lưới.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const currentValues = siteSettings.aboutCoreValues || [];
                  setSiteSettings({
                    ...siteSettings,
                    aboutCoreValues: [
                      ...currentValues,
                      { title: "Giá trị mới", text: "Nội dung mô tả giá trị..." }
                    ]
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-forest/10 text-forest text-xs font-bold hover:bg-forest/20 transition flex items-center gap-1.5"
              >
                <Plus className="size-3.5" />
                Thêm trụ cột
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {(siteSettings.aboutCoreValues && siteSettings.aboutCoreValues.length > 0
                ? siteSettings.aboutCoreValues
                : [
                    { title: "Sứ mệnh", text: "Giúp du lịch cộng đồng A Lưới dễ hiểu hơn, dễ đặt hơn và đem lại nguồn sinh kế thực sự cho người dân địa phương." },
                    { title: "Tầm nhìn", text: "Trở thành điểm chạm số uy tín nhất phía Tây Thừa Thiên Huế cho những chuyến đi văn hóa bền vững và giàu cảm xúc." },
                    { title: "Giá trị cốt lõi", text: "Đặt con người và bản sắc dân tộc Pa Cô, Tà Ôi, Cơ Tu làm trung tâm, công nghệ đóng vai trò cầu nối tiện lợi." }
                  ]
              ).map((val, idx) => (
                <div key={idx} className="rounded-2xl border border-forest/15 bg-beige/40 p-5 space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider">
                      Cột mốc #{idx + 1}
                    </span>
                    {(siteSettings.aboutCoreValues && siteSettings.aboutCoreValues.length > 3) && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (siteSettings.aboutCoreValues || []).filter((_, i) => i !== idx);
                          setSiteSettings({ ...siteSettings, aboutCoreValues: updated });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Xóa trụ cột này"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink/70">Tiêu đề:</label>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => {
                        const list = [
                          ...(siteSettings.aboutCoreValues || [
                            { title: "Sứ mệnh", text: "Giúp du lịch cộng đồng A Lưới dễ hiểu hơn, dễ đặt hơn..." },
                            { title: "Tầm nhìn", text: "Trở thành điểm chạm số uy tín nhất..." },
                            { title: "Giá trị cốt lõi", text: "Đặt con người và bản sắc dân tộc..." }
                          ])
                        ];
                        list[idx] = { ...list[idx], title: e.target.value };
                        setSiteSettings({ ...siteSettings, aboutCoreValues: list });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-ink/70">Mô tả chi tiết:</label>
                    <textarea
                      rows={3}
                      value={val.text}
                      onChange={(e) => {
                        const list = [
                          ...(siteSettings.aboutCoreValues || [
                            { title: "Sứ mệnh", text: "Giúp du lịch cộng đồng A Lưới dễ hiểu hơn, dễ đặt hơn..." },
                            { title: "Tầm nhìn", text: "Trở thành điểm chạm số uy tín nhất..." },
                            { title: "Giá trị cốt lõi", text: "Đặt con người và bản sắc dân tộc..." }
                          ])
                        ];
                        list[idx] = { ...list[idx], text: e.target.value };
                        setSiteSettings({ ...siteSettings, aboutCoreValues: list });
                      }}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-ink/80 focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: ĐỘI NGŨ SÁNG LẬP & NGHỆ NHÂN ĐỒNG HÀNH (TRỌNG TÂM CỦA YÊU CẦU) */}
          <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card border border-black/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider">
                  Phần 3: Con người & Nghệ nhân
                </span>
                <h3 className="font-black text-base text-ink mt-2">
                  Đội Ngũ Sáng Lập & Nghệ Nhân A Lưới
                </h3>
                <p className="text-xs text-ink/60 mt-0.5">
                  Tùy chỉnh ảnh đại diện, họ tên, vai trò và câu chuyện của từng cá nhân đồng hành cùng dự án.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const defaultTeam: TeamMemberItem[] = [
                      {
                        id: "team-1",
                        name: "Đặng Thị Hoài",
                        role: "Trưởng nhóm & Thiết kế Sản phẩm",
                        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
                        bio: "Phụ trách định hướng trải nghiệm số, kết nối nền tảng với các hộ kinh doanh du lịch cộng đồng tại A Lưới."
                      },
                      {
                        id: "team-2",
                        name: "Hồ Văn Hạnh",
                        role: "Đại diện Cộng đồng & Nghệ nhân Tà Ôi",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
                        bio: "Cố vấn văn hóa bản địa, kết nối các làng nghề dệt Zèng truyền thống và điểm lưu trú homestay."
                      },
                      {
                        id: "team-3",
                        name: "Nguyễn Lê Bảo Trâm",
                        role: "Nội dung & Truyền thông Bản địa",
                        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
                        bio: "Biên tập câu chuyện văn hóa, hỗ trợ các cơ sở địa phương số hóa hình ảnh và tạo voucher ưu đãi."
                      },
                      {
                        id: "team-4",
                        name: "Lê Văn Đạt",
                        role: "Kỹ thuật Công nghệ & Vận hành",
                        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                        bio: "Phát triển hệ thống điều phối Lead ID, đối soát hoa hồng và tích hợp kênh kết nối Zalo trực tiếp."
                      }
                    ];
                    setSiteSettings({ ...siteSettings, aboutTeamMembers: defaultTeam });
                    showToast("info", "Đã khôi phục 4 thành viên đội ngũ về mặc định ban đầu!");
                  }}
                  className="px-3 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige transition flex items-center gap-1"
                  title="Khôi phục danh sách 4 thành viên gốc"
                >
                  <RotateCcw className="size-3.5" />
                  Khôi phục mặc định
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentTeam = siteSettings.aboutTeamMembers || [];
                    const newMember: TeamMemberItem = {
                      id: "team-" + Date.now(),
                      name: "Thành viên mới",
                      role: "Cố vấn cộng đồng / Nghệ nhân",
                      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
                      bio: "Mô tả vai trò đóng góp cho cộng đồng và dự án Chạm A Lưới."
                    };
                    setSiteSettings({ ...siteSettings, aboutTeamMembers: [...currentTeam, newMember] });
                    showToast("success", "Đã thêm thành viên mới vào danh sách!");
                  }}
                  className="px-4 py-2 rounded-xl bg-forest text-xs font-extrabold text-white hover:bg-forest/90 transition shadow-sm flex items-center gap-1.5"
                >
                  <UserPlus className="size-3.5" />
                  Thêm thành viên mới
                </button>
              </div>
            </div>

            {/* Grid of Team Member Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(siteSettings.aboutTeamMembers || []).map((member, mIdx) => (
                <div
                  key={member.id}
                  className="rounded-3xl border border-black/10 bg-white overflow-hidden shadow-card transition duration-300 hover:shadow-xl flex flex-col justify-between"
                >
                  {/* Avatar with overlays and action buttons */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 group">
                      <AppImage
                        src={member.avatar}
                        alt={"Ảnh đại diện " + member.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-2 p-3">
                        <button
                          type="button"
                          onClick={() => {
                            setPickingMemberId(member.id);
                            setIsPickerOpen(true);
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-forest text-white text-[11px] font-bold shadow-md hover:bg-forest/90 transition flex items-center justify-center gap-1"
                        >
                          <Layers className="size-3" />
                          Chọn từ Kho Media
                        </button>
                        <label className="w-full py-1.5 px-3 rounded-xl bg-white text-ink text-[11px] font-bold shadow-md hover:bg-beige transition cursor-pointer flex items-center justify-center gap-1">
                          <Upload className="size-3" />
                          Tải ảnh từ máy
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const res = await uploadImageClient(file, { category: "team" });
                              if (res.success && res.url) {
                                const list = (siteSettings.aboutTeamMembers || []).map((m) =>
                                  m.id === member.id ? { ...m, avatar: res.url! } : m
                                );
                                setSiteSettings({ ...siteSettings, aboutTeamMembers: list });
                                showToast("success", "Đã tải ảnh chân dung mới cho " + member.name + "!");
                              } else {
                                showToast("error", res.error || "Không thể tải ảnh lên.");
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setCropTarget({
                              url: member.avatar,
                              name: member.name,
                              aspect: "1:1"
                            })
                          }
                          className="w-full py-1.5 px-3 rounded-xl bg-amber-500 text-white text-[11px] font-bold shadow-md hover:bg-amber-600 transition flex items-center justify-center gap-1"
                        >
                          <Crop className="size-3" />
                          Cắt vuông (1:1)
                        </button>
                      </div>
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-black/60 text-white text-[10px] font-mono px-2 py-0.5">
                        #{mIdx + 1}
                      </span>
                    </div>

                    {/* Member Details Inputs */}
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Họ và tên:</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => {
                            const list = (siteSettings.aboutTeamMembers || []).map((m) =>
                              m.id === member.id ? { ...m, name: e.target.value } : m
                            );
                            setSiteSettings({ ...siteSettings, aboutTeamMembers: list });
                          }}
                          placeholder="Họ và tên..."
                          className="w-full mt-0.5 px-3 py-1.5 rounded-xl bg-beige/60 text-xs font-extrabold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Chức danh / Vai trò:</label>
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => {
                            const list = (siteSettings.aboutTeamMembers || []).map((m) =>
                              m.id === member.id ? { ...m, role: e.target.value } : m
                            );
                            setSiteSettings({ ...siteSettings, aboutTeamMembers: list });
                          }}
                          placeholder="Vai trò..."
                          className="w-full mt-0.5 px-3 py-1.5 rounded-xl bg-beige/60 text-xs font-bold text-clay focus:outline-none focus:ring-2 focus:ring-forest"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Link ảnh đại diện:</label>
                        <input
                          type="text"
                          value={member.avatar}
                          onChange={(e) => {
                            const list = (siteSettings.aboutTeamMembers || []).map((m) =>
                              m.id === member.id ? { ...m, avatar: e.target.value } : m
                            );
                            setSiteSettings({ ...siteSettings, aboutTeamMembers: list });
                          }}
                          placeholder="URL ảnh hoặc link Drive..."
                          className="w-full mt-0.5 px-3 py-1.5 rounded-xl bg-beige/60 text-[11px] font-mono text-ink/70 focus:outline-none focus:ring-2 focus:ring-forest"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-ink/60 uppercase">Tiểu sử / Giới thiệu:</label>
                        <textarea
                          rows={3}
                          value={member.bio}
                          onChange={(e) => {
                            const list = (siteSettings.aboutTeamMembers || []).map((m) =>
                              m.id === member.id ? { ...m, bio: e.target.value } : m
                            );
                            setSiteSettings({ ...siteSettings, aboutTeamMembers: list });
                          }}
                          placeholder="Giới thiệu đóng góp..."
                          className="w-full mt-0.5 px-3 py-1.5 rounded-xl bg-beige/60 text-xs text-ink/75 leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Delete Member */}
                  <div className="p-3 pt-0 border-t border-black/5 mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-ink/40 font-mono">{member.id}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Bạn có chắc chắn muốn xóa thành viên " + member.name + " khỏi trang Giới thiệu?")) {
                          const updated = (siteSettings.aboutTeamMembers || []).filter((m) => m.id !== member.id);
                          setSiteSettings({ ...siteSettings, aboutTeamMembers: updated });
                          showToast("info", "Đã xóa thành viên " + member.name + ".");
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="size-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: TÁC ĐỘNG CỘNG ĐỒNG & ĐỐI TÁC */}
          <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card border border-black/5 space-y-6">
            <div className="border-b border-black/5 pb-4">
              <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 uppercase tracking-wider">
                Phần 4: Tác động & Đối tác
              </span>
              <h3 className="font-black text-base text-ink mt-2">Tác Động Cộng Đồng & Mạng Lưới Đối Tác</h3>
              <p className="text-xs text-ink/60 mt-0.5">
                Các cam kết tác động tích cực tới đồng bào vùng cao và thông tin mạng lưới liên kết.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Impact Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">4 Tác động cộng đồng tiêu biểu:</label>
                  <button
                    type="button"
                    onClick={() => {
                      const list = siteSettings.aboutImpactItems || [];
                      setSiteSettings({
                        ...siteSettings,
                        aboutImpactItems: [...list, "Tác động cộng đồng mới..."]
                      });
                    }}
                    className="text-[11px] font-bold text-forest hover:underline flex items-center gap-1"
                  >
                    <Plus className="size-3" /> Thêm mục
                  </button>
                </div>

                <div className="space-y-2">
                  {(siteSettings.aboutImpactItems && siteSettings.aboutImpactItems.length > 0
                    ? siteSettings.aboutImpactItems
                    : [
                        "Tạo thu nhập trực tiếp cho chủ nhà và nghệ nhân địa phương",
                        "Bảo tồn văn hóa thông qua trải nghiệm có hướng dẫn",
                        "Giáo dục du lịch có trách nhiệm cho du khách",
                        "Tăng khả năng tiếp cận thị trường cho sản phẩm vùng cao"
                      ]
                  ).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="size-5 rounded-full bg-forest/10 text-forest text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const list = [
                            ...(siteSettings.aboutImpactItems || [
                              "Tạo thu nhập trực tiếp cho chủ nhà và nghệ nhân địa phương",
                              "Bảo tồn văn hóa thông qua trải nghiệm có hướng dẫn",
                              "Giáo dục du lịch có trách nhiệm cho du khách",
                              "Tăng khả năng tiếp cận thị trường cho sản phẩm vùng cao"
                            ])
                          ];
                          list[idx] = e.target.value;
                          setSiteSettings({ ...siteSettings, aboutImpactItems: list });
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-beige/60 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                      />
                      {(siteSettings.aboutImpactItems && siteSettings.aboutImpactItems.length > 2) && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (siteSettings.aboutImpactItems || []).filter((_, i) => i !== idx);
                            setSiteSettings({ ...siteSettings, aboutImpactItems: updated });
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Partners Banner Box */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Tiêu đề Mạng lưới Đối tác:</label>
                  <input
                    type="text"
                    value={siteSettings.aboutPartnersTitle || "Mạng lưới Đối tác"}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutPartnersTitle: e.target.value })}
                    placeholder="Mạng lưới Đối tác"
                    className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">Nội dung mô tả Đối tác (Khung màu xanh đậm):</label>
                  <textarea
                    rows={4}
                    value={siteSettings.aboutPartnersText || ""}
                    onChange={(e) => setSiteSettings({ ...siteSettings, aboutPartnersText: e.target.value })}
                    placeholder="Các gia đình homestay địa phương, hợp tác xã dệt thổ cẩm Zèng A Đớt..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                  />
                </div>

                {/* Preview Box */}
                <div className="rounded-2xl bg-forest p-4 text-white shadow-card">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Xem trước khung đối tác</p>
                  <h4 className="text-sm font-bold mt-1">{siteSettings.aboutPartnersTitle || "Mạng lưới Đối tác"}</h4>
                  <p className="text-xs text-white/80 mt-1 leading-relaxed line-clamp-3">
                    {siteSettings.aboutPartnersText ||
                      "Các gia đình homestay địa phương, hợp tác xã dệt thổ cẩm Zèng A Đớt, các đội trekking rừng nguyên sinh..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar for About Tab */}
          <div className="sticky bottom-4 z-40 rounded-3xl bg-forest p-4 text-white shadow-2xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-extrabold">Lưu Cấu Hình Trang Giới Thiệu & Đội Ngũ</h4>
              <p className="text-[11px] text-emerald-200">
                Toàn bộ thay đổi về ảnh đại diện, chức danh và bài viết sẽ được áp dụng ngay trên Website Khách (/about).
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveAllBrandSettings}
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-2xl bg-white text-forest text-xs font-extrabold hover:bg-emerald-50 transition shadow flex items-center gap-2"
            >
              {isSavingSettings ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isSavingSettings ? "Đang lưu thông tin..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </div>
      )}


      {/* ========================================================
          TAB 3: TÍCH HỢP MEDIA PICKER & DEMO
         ======================================================== */}
      {activeTab === "picker-demo" && (
        <div className="rounded-3xl bg-white p-8 shadow-card border border-black/5 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-lg font-black text-ink flex items-center gap-2">
              <Layers className="size-5 text-forest" />
              Tái sử dụng Component Media Picker
            </h2>
            <p className="text-xs text-ink/70 leading-relaxed">
              Component Media Picker đã được tích hợp sẵn sàng để tái sử dụng trên mọi trang quản trị:
              <strong> Blog Editor</strong>, <strong>Place Editor</strong>, <strong>Product Manager</strong>, và <strong>Voucher</strong>.
              Thay vì bắt người dùng nhập URL thủ công, chỉ cần mở Media Picker để chọn trực tiếp ảnh từ kho tài nguyên.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-beige/60 border border-forest/15 space-y-4">
            <h3 className="text-xs font-extrabold text-forest uppercase tracking-wider">Trải nghiệm tương tác Media Picker</h3>
            <p className="text-xs text-ink/70">
              Nhấp vào nút dưới đây để kiểm tra hộp thoại chọn ảnh trực quan:
            </p>
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="px-6 py-3 rounded-2xl bg-forest text-white text-xs font-extrabold hover:bg-forest/90 transition shadow-md flex items-center gap-2"
            >
              <ImageIcon className="size-4" />
              Mở hộp thoại Media Picker
            </button>

            {pickedResult && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-500/30 flex items-center gap-4">
                <div className="relative size-16 rounded-xl overflow-hidden bg-forest/5 shrink-0">
                  <AppImage src={pickedResult.url} alt={pickedResult.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Đã chọn thành công
                  </span>
                  <p className="font-extrabold text-ink text-xs mt-1">{pickedResult.title}</p>
                  <p className="text-[11px] font-mono text-ink/50 truncate">{pickedResult.url}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: THÊM ẢNH TỪ URL / GOOGLE DRIVE
         ======================================================== */}
      {showUrlInputModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Globe className="size-4 text-forest" />
                Thêm ảnh từ URL hoặc Google Drive
              </h3>
              <button onClick={() => setShowUrlInputModal(false)} className="p-1 rounded-lg text-ink/40 hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddUrlItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Đường dẫn ảnh (URL hoặc Link Google Drive):</label>
                <input
                  type="text"
                  required
                  placeholder="https://drive.google.com/file/d/... hoặc https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
                {urlInput && detectImageSource(urlInput) === "google-drive" && (
                  <p className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Sparkles className="size-3" /> Đã nhận diện link Google Drive! Hệ thống sẽ tự động chuyển đổi sang Direct CDN.
                  </p>
                )}
              </div>

              {urlInput && (
                <div className="p-3 rounded-2xl bg-forest/5 border border-forest/15 flex items-center gap-3">
                  <div className="relative size-14 rounded-xl overflow-hidden bg-forest/10 shrink-0">
                    <AppImage src={normalizeImageUrl(urlInput)} alt="Xem trước" fill className="object-cover" />
                  </div>
                  <div className="text-xs min-w-0 flex-1">
                    <p className="font-bold text-ink">Xem trước hình ảnh</p>
                    <p className="text-[10px] text-ink/50 truncate font-mono">{normalizeImageUrl(urlInput)}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Tên định danh ảnh:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thác A Nôr mùa hè, Đan lát Dệt Dèng..."
                  value={urlInputName}
                  onChange={(e) => setUrlInputName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Phân loại ảnh:</label>
                <select
                  value={urlInputCategory}
                  onChange={(e) => setUrlInputCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none"
                >
                  <option value="other">Chung / Khác</option>
                  <option value="place">Địa điểm du lịch</option>
                  <option value="product">Sản phẩm truyền thống</option>
                  <option value="blog">Bài viết Blog</option>
                  <option value="hero">Hero Banner</option>
                  <option value="brand">Logo & Thương hiệu</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowUrlInputModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAddingUrl || !urlInput.trim()}
                  className="px-5 py-2 rounded-xl bg-forest text-xs font-bold text-white hover:bg-forest/90 transition shadow flex items-center gap-1.5"
                >
                  {isAddingUrl ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Lưu vào Thư viện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: XEM TRƯỚC PHÓNG TO & METADATA CHI TIẾT
         ======================================================== */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white overflow-hidden shadow-2xl border border-black/10 flex flex-col md:flex-row max-h-[90vh]">
            {/* Image Preview Box */}
            <div className="relative flex-1 min-h-[300px] md:min-h-[420px] bg-neutral-900 flex items-center justify-center p-4">
              <div className="relative w-full h-full min-h-[280px]">
                <AppImage src={previewItem.url} alt={previewItem.alt || previewItem.name} fill className="object-contain" priority />
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute top-4 left-4 size-8 rounded-full bg-black/60 text-white flex items-center justify-center md:hidden"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Metadata Info Panel */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-black/5">
                  <h3 className="font-black text-ink text-sm">Chi tiết tài nguyên</h3>
                  <button onClick={() => setPreviewItem(null)} className="hidden md:block p-1 text-ink/40 hover:text-ink">
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase">Tên ảnh:</span>
                    <p className="font-extrabold text-ink text-sm mt-0.5">{previewItem.name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase">Alt text (SEO):</span>
                    <p className="text-ink/80 mt-0.5">{previewItem.alt || <span className="text-ink/40 italic">Chưa có</span>}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase">Mô tả / Ghi chú:</span>
                    <p className="text-ink/80 mt-0.5">{previewItem.caption || <span className="text-ink/40 italic">Chưa có</span>}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase">Trạng thái sử dụng:</span>
                    {getUsageDetail(previewItem.url).isUsed ? (
                      <div className="mt-1 space-y-1">
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 inline-flex items-center gap-1">
                          <CheckCircle2 className="size-3" /> Đang sử dụng ({getUsageDetail(previewItem.url).locations.length} vị trí)
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getUsageDetail(previewItem.url).locations.map((l, i) => (
                            <span key={i} className="text-[10px] font-bold bg-forest/10 text-forest px-2 py-0.5 rounded-md">
                              {l.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-ink/50 mt-0.5 font-bold">Chưa sử dụng trong trang nào</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-ink/40 uppercase">Đường dẫn đầy đủ:</span>
                    <p className="font-mono text-[10px] text-ink/60 break-all bg-beige/80 p-2 rounded-xl mt-0.5">
                      {previewItem.url}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => {
                    setCropTarget({
                      url: previewItem.url,
                      name: previewItem.name,
                      field: "mediaItem",
                      aspect: "free"
                    });
                    setPreviewItem(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shadow flex items-center justify-center gap-1.5"
                >
                  <Scissors className="size-3.5" /> ✂️ Cắt xén & Thu phóng hình ảnh này
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(previewItem.url)}
                  className="w-full py-2.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow flex items-center justify-center gap-1.5"
                >
                  <Copy className="size-3.5" /> Sao chép URL
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(previewItem);
                      setPreviewItem(null);
                    }}
                    className="flex-1 py-2 rounded-xl border border-black/10 text-xs font-bold text-ink hover:bg-beige transition flex items-center justify-center gap-1"
                  >
                    <Edit2 className="size-3.5" /> Chỉnh sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => initiateDelete(previewItem)}
                    className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="size-3.5" /> Xóa ảnh
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CHỈNH SỬA METADATA (TÊN, ALT, MÔ TẢ, LOẠI)
         ======================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <Edit2 className="size-4 text-forest" />
                Chỉnh sửa thông tin tài nguyên hình ảnh
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded-lg text-ink/40 hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-forest/5 border border-forest/15">
                <div className="relative size-14 rounded-xl overflow-hidden bg-forest/10 shrink-0">
                  <AppImage src={editingItem.url} alt={editingItem.alt || editingItem.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-bold text-ink truncate">{editingItem.name}</p>
                  <p className="text-[10px] text-ink/50 truncate font-mono">{editingItem.url}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Tên hiển thị hình ảnh:</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Alt Text (Mô tả trợ năng & SEO Google):</label>
                <input
                  type="text"
                  placeholder="Mô tả nội dung bức ảnh cho máy đọc và tìm kiếm..."
                  value={editingItem.alt}
                  onChange={(e) => setEditingItem({ ...editingItem, alt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Mô tả / Chú thích ảnh:</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về bối cảnh, nguồn chụp, nhân vật trong ảnh..."
                  value={editingItem.caption}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">Phân loại:</label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none"
                >
                  <option value="other">Chung / Khác</option>
                  <option value="brand">Logo & Nhận diện thương hiệu</option>
                  <option value="hero">Hero Banner</option>
                  <option value="place">Địa điểm du lịch</option>
                  <option value="product">Sản phẩm đặc sản</option>
                  <option value="blog">Bài viết Blog</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingMetadata}
                  className="px-5 py-2 rounded-xl bg-forest text-xs font-bold text-white hover:bg-forest/90 transition shadow flex items-center gap-1.5"
                >
                  {isSavingMetadata ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CẢNH BÁO AN TOÀN KHI XÓA ẢNH ĐANG SỬ DỤNG
         ======================================================== */}
      {deleteWarningItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-2 border-red-500/40 space-y-4">
            <div className="size-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="size-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-red-700">CẢNH BÁO: ẢNH ĐANG ĐƯỢC SỬ DỤNG!</h3>
              <p className="text-xs text-ink/70">
                Ảnh <strong>"{deleteWarningItem.item.name}"</strong> hiện đang được liên kết và hiển thị trực tiếp tại{" "}
                <strong>{deleteWarningItem.usage.locations.length}</strong> vị trí trên website:
              </p>
            </div>

            {/* List of used locations */}
            <div className="rounded-2xl bg-red-50 p-3 max-h-36 overflow-y-auto space-y-1.5 border border-red-200 text-xs">
              {deleteWarningItem.usage.locations.map((loc, i) => (
                <div key={i} className="flex items-center gap-2 text-red-800 font-bold">
                  <span className="size-1.5 rounded-full bg-red-600 shrink-0" />
                  <span className="text-[11px] text-red-600 font-semibold">[{loc.type}]</span>
                  <span className="truncate">{loc.title}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-red-600 font-semibold leading-relaxed text-center bg-red-100/60 p-2 rounded-xl">
              ⚠️ Nếu bạn xóa ảnh này, giao diện trên website của khách hàng có thể bị vỡ hoặc hiển thị khung trống!
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteWarningItem(null)}
                className="w-full py-2.5 rounded-xl bg-forest text-white text-xs font-extrabold hover:bg-forest/90 transition shadow"
              >
                Hủy bỏ (Khuyên dùng - Giữ lại ảnh)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => executeDelete(deleteWarningItem.item)}
                className="w-full py-2.5 rounded-xl border border-red-500 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Tôi hiểu rủi ro, vẫn muốn xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          COMPONENT: MEDIA PICKER MODAL (TÁI SỬ DỤNG CHO BLOG, PLACE,...)
         ======================================================== */}
      {isPickerOpen && (
        <MediaPickerModal
          isOpen={isPickerOpen}
          onClose={() => {
            setIsPickerOpen(false);
            setPickingMemberId(null);
          }}
          onSelect={(url, meta) => {
            if (pickingMemberId) {
              const updatedMembers = (siteSettings.aboutTeamMembers || []).map((m) =>
                m.id === pickingMemberId ? { ...m, avatar: url } : m
              );
              setSiteSettings({ ...siteSettings, aboutTeamMembers: updatedMembers });
              showToast("success", `Đã cập nhật ảnh đại diện từ Thư viện Media cho thành viên! Hãy bấm Lưu.`);
              setPickingMemberId(null);
            } else {
              setPickedResult({ url, title: meta.name, category: meta.category });
              showToast("success", `Đã chọn ảnh "${meta.name}" từ Thư viện Media!`);
            }
            setIsPickerOpen(false);
          }}
          title={pickingMemberId ? "Chọn ảnh đại diện cho thành viên đội ngũ" : "Chọn ảnh từ Thư viện Media Chạm A Lưới"}
          items={allMediaItems}
        />
      )}
    </div>
  );
}

/**
 * REUSABLE MEDIA PICKER MODAL COMPONENT
 * Sẵn sàng gọi trong Blog, Place, Product, Voucher
 */
function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = "Chọn ảnh từ Thư viện Media",
  items = []
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, item: MediaItemMetadata) => void;
  title?: string;
  items?: MediaItemMetadata[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    if (cat !== "all" && item.category !== cat) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.alt.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl border border-black/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div>
            <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
              <ImageIcon className="size-4 text-forest" />
              {title}
            </h3>
            <p className="text-[11px] text-ink/50 mt-0.5">Nhấp vào một ảnh để chọn ngay mà không cần nhập URL thủ công</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-beige text-ink/50 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-black/5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
            <input
              type="text"
              placeholder="Tìm kiếm hình ảnh..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {["all", "place", "product", "blog", "brand"].map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize ${
                  cat === c ? "bg-forest text-white" : "text-ink/60 hover:bg-beige"
                }`}
              >
                {c === "all" ? "Tất cả" : c}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-ink/50 text-xs">Không tìm thấy ảnh phù hợp.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.url, item)}
                  className="group relative rounded-2xl bg-white p-2 border border-black/10 hover:border-forest hover:shadow-lg transition cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-forest/5 mb-1.5">
                    <AppImage src={item.url} alt={item.alt || item.name} fill className="object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-forest/80 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1">
                      <Check className="size-4" /> Chọn ảnh này
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-ink truncate line-clamp-1">{item.name}</p>
                  <span className="text-[9px] text-ink/40 font-mono truncate">{item.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
          <span className="text-ink/50 text-[11px]">Tổng cộng: {filtered.length} ảnh trong kho</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl border border-black/10 font-bold hover:bg-beige">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}


/**
 * Interactive HTML5 Canvas Image Cropper & Scaler Modal
 */
function ImageCropperModal({
  target,
  onClose,
  onSaved
}: {
  target: {
    url: string;
    name: string;
    field?: keyof SiteSettings | "mediaItem" | null;
    aspect?: "free" | "4:1" | "3:1" | "1:1" | "16:9";
  };
  onClose: () => void;
  onSaved: (newUrl: string, field?: keyof SiteSettings | "mediaItem" | null) => void;
}) {
  const [aspect, setAspect] = useState<"free" | "4:1" | "3:1" | "1:1" | "16:9">(target.aspect || "4:1");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoTrimming, setIsAutoTrimming] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Load Image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = target.url;
    img.onload = () => {
      imgRef.current = img;
      renderCanvas();
    };
  }, [target.url]);

  // Update canvas on changes
  useEffect(() => {
    if (imgRef.current) {
      renderCanvas();
    }
  }, [zoom, pan, aspect]);

  function getTargetDimensions() {
    if (aspect === "4:1") return { w: 600, h: 150 };
    if (aspect === "3:1") return { w: 600, h: 200 };
    if (aspect === "1:1") return { w: 400, h: 400 };
    if (aspect === "16:9") return { w: 640, h: 360 };
    return { w: 600, h: 300 }; // free
  }

  function renderCanvas() {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = getTargetDimensions();
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    // Calculate scaling to cover canvas
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;

    let drawW, drawH;
    if (imgRatio > canvasRatio) {
      drawH = h * zoom;
      drawW = drawH * imgRatio;
    } else {
      drawW = w * zoom;
      drawH = drawW / imgRatio;
    }

    const drawX = (w - drawW) / 2 + pan.x;
    const drawY = (h - drawH) / 2 + pan.y;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    try {
      setPreviewDataUrl(canvas.toDataURL("image/png"));
    } catch {
      // ignore
    }
  }

  // Auto-Trim: scan pixels to eliminate empty padding
  function handleAutoTrim() {
    const img = imgRef.current;
    if (!img) return;

    setIsAutoTrimming(true);
    try {
      // Offscreen canvas at natural size
      const off = document.createElement("canvas");
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const ctx = off.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, off.width, off.height);
      const data = imgData.data;

      let minX = off.width,
        maxX = -1,
        minY = off.height,
        maxY = -1;

      for (let y = 0; y < off.height; y++) {
        for (let x = 0; x < off.width; x++) {
          const idx = (y * off.width + x) * 4;
          const a = data[idx + 3];
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Check if pixel is not transparent and not solid white/light background
          const isNotTransparent = a > 20;
          const isNotWhite = !(r > 245 && g > 245 && b > 245);

          if (isNotTransparent && isNotWhite) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX >= minX && maxY >= minY) {
        // We found bounding box!
        const boxW = maxX - minX;
        const boxH = maxY - minY;
        const { w, h } = getTargetDimensions();

        // Calculate needed zoom so this box covers ~90% of the canvas
        const scaleX = (w * 0.9) / boxW;
        const scaleY = (h * 0.9) / boxH;
        const fitScale = Math.min(scaleX, scaleY);

        const newZoom = Math.max(1, Math.min(4, fitScale / (w / img.naturalWidth)));
        setZoom(newZoom);

        // Center on the bounding box center
        const boxCenterX = minX + boxW / 2;
        const boxCenterY = minY + boxH / 2;
        const imgCenterX = img.naturalWidth / 2;
        const imgCenterY = img.naturalHeight / 2;

        const panOffsetX = -(boxCenterX - imgCenterX) * (w / img.naturalWidth) * newZoom;
        const panOffsetY = -(boxCenterY - imgCenterY) * (h / img.naturalHeight) * newZoom;

        setPan({ x: panOffsetX, y: panOffsetY });
      } else {
        // Fallback: zoom 2x
        setZoom(2);
        setPan({ x: 0, y: 0 });
      }
    } catch {
      setZoom(1.8);
    } finally {
      setIsAutoTrimming(false);
    }
  }

  // Mouse Drag / Touch Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Save Cropped Image
  async function handleSaveCropped() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await saveCroppedImageAction({
        dataUrl,
        name: target.name,
        category: target.field === "logo" ? "brand" : "cropped"
      });

      if (res.success && res.url) {
        onSaved(res.url, target.field);
      } else {
        alert(res.error || "Lỗi lưu ảnh.");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Không thể lưu ảnh.");
    } finally {
      setIsSaving(false);
    }
  }

  const { w, h } = getTargetDimensions();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-beige/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest text-white">
              <Scissors className="size-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-ink flex items-center gap-2">
                Trình Cắt Xén & Thu Phóng Hình Ảnh
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 text-ink/60">
                  {target.name}
                </span>
              </h3>
              <p className="text-xs text-ink/50">
                Kéo thả để định vị, phóng to để loại bỏ viền trống, hoặc bấm nút Tự động cắt sát viền
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-ink/75">
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-[1fr_320px] gap-6">
          {/* Left: Viewport */}
          <div className="space-y-4 flex flex-col items-center">
            {/* Aspect Ratio Selector */}
            <div className="flex flex-wrap items-center gap-1.5 self-start">
              <span className="text-xs font-bold text-ink mr-1">Tỉ lệ khung hình:</span>
              {[
                { id: "4:1", label: "Logo ngang (4:1)" },
                { id: "3:1", label: "Logo chuẩn (3:1)" },
                { id: "1:1", label: "Vuông 1:1" },
                { id: "16:9", label: "Banner 16:9" },
                { id: "free", label: "Tự do" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAspect(item.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    aspect === item.id ? "bg-forest text-white shadow-sm" : "bg-beige/60 text-ink/70 hover:bg-beige"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Canvas Viewport */}
            <div
              className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-forest/30 flex items-center justify-center p-4 select-none bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[size:16px_16px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? "grabbing" : "grab", minHeight: "260px" }}
            >
              <canvas ref={canvasRef} className="rounded-xl shadow-lg border border-black/10 max-w-full" />
              <div className="absolute top-2 right-2 pointer-events-none bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                {w} x {h} px
              </div>
            </div>

            {/* Zoom & Pan Controls */}
            <div className="w-full bg-beige/40 p-4 rounded-2xl border border-black/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <ZoomIn className="size-4 text-forest" />
                  <span>Thu phóng hình ảnh (Zoom Scale):</span>
                </div>
                <span className="text-xs font-mono font-extrabold text-forest">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                  className="p-1.5 rounded-lg bg-white border border-black/10 hover:bg-black/5"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="size-4" />
                </button>
                <input
                  type="range"
                  min={0.5}
                  max={4}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-forest cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(4, z + 0.2))}
                  className="p-1.5 rounded-lg bg-white border border-black/10 hover:bg-black/5"
                  title="Phóng to"
                >
                  <ZoomIn className="size-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-xs">
                {/* Magic Auto Trim */}
                <button
                  type="button"
                  onClick={handleAutoTrim}
                  disabled={isAutoTrimming}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  title="Tự động phát hiện mép vẽ và cắt bỏ 100% viền trắng/trong suốt"
                >
                  <Sparkles className="size-3.5" />
                  <span>✨ Tự động cắt sát viền logo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-black/10 text-ink/70 hover:bg-black/5 font-bold flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  <span>Căn giữa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview & Save */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="size-3.5 text-forest" />
                Xem trước kết quả cắt thực tế
              </h4>

              {/* Cropped Output on Checkerboard */}
              <div className="p-3 rounded-2xl bg-white border border-black/10 shadow-sm space-y-1.5">
                <span className="text-[10px] text-ink/50 font-bold block">Nền trong suốt (PNG):</span>
                <div className="rounded-xl overflow-hidden h-24 flex items-center justify-center p-2 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[size:12px_12px]">
                  {previewDataUrl && (
                    <img src={previewDataUrl} alt="Cropped Preview" className="max-h-full max-w-full object-contain" />
                  )}
                </div>
              </div>

              {/* Website Header Mockup Preview */}
              <div className="p-3 rounded-2xl bg-[#F5F2EB] border border-black/10 shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-forest font-black uppercase tracking-wider">Trên thanh Header Website:</span>
                  <span className="text-[9px] text-ink/40">Khách xem</span>
                </div>
                <div className="rounded-xl p-3 bg-white/90 border border-black/5 flex items-center justify-between gap-2 shadow-inner">
                  <div className="h-10 max-w-[140px] flex items-center overflow-hidden shrink-0">
                    {previewDataUrl && (
                      <img src={previewDataUrl} alt="Header Preview" className="max-h-full w-auto object-contain" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-ink/60">
                    <span className="px-1.5 py-0.5 rounded-full bg-forest text-white">Home</span>
                    <span>Địa điểm</span>
                    <span>Blog</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Sẵn sàng áp dụng
                </p>
                <p className="text-[11px] text-emerald-800/80">
                  Ảnh cắt sẽ được xuất với độ nét cao, định dạng PNG bảo toàn nền trong suốt, loại bỏ hoàn toàn hiện tượng logo bị nhỏ.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-black/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-ink/75 hover:bg-beige"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleSaveCropped}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-black hover:bg-forest/90 transition shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                <span>
                  {target.field === "logo" ? "Cắt & Cập nhật Logo ngay" : "Lưu ảnh đã cắt"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
