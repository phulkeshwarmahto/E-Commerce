import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProductRequest,
  getDashboardRequest,
  updateOrderStatusRequest,
  updateProductRequest,
  getUsersRequest,
  updateUserCreditScoreRequest,
  updateUserCertificationRequest,
  updateUserRoleRequest,
  sendAdminNotificationRequest,
  broadcastNotificationRequest,
  getAdminCouponsRequest,
  createAdminCouponRequest,
  deleteAdminCouponRequest,
  getAdminBrandsRequest,
  createAdminBrandRequest,
  deleteAdminBrandRequest,
  banUserRequest,
  unbanUserRequest,
  getAdminReportsRequest,
  resolveReportRequest,
  getAdminSalesAnalyticsRequest,
  getPendingReviewsRequest,
  approveReviewRequest,
  rejectReviewRequest,
  getAdminGeoAnalyticsRequest,
  getAdminSettingsRequest,
  updateAdminSettingsRequest,
} from "../api/admin.api";
import { getReturnRequests, updateReturnRequestStatus } from "../api/return.api";
import { getNewsletterSubscribersRequest } from "../api/newsletter.api";
import {
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
} from "../api/category.api";
import {
  getSupportTicketsRequest,
  resolveSupportTicketRequest,
} from "../api/support.api";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { OrderTable } from "../components/admin/OrderTable";
import { ProductForm } from "../components/admin/ProductForm";
import { ProductTable } from "../components/admin/ProductTable";
import { StatCard } from "../components/admin/StatCard";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { Spinner } from "../components/ui/Spinner";
import { useAppContext } from "../hooks/useAppContext";
import { useDocumentMetadata } from "../hooks/useDocumentMetadata";
import { ImageUploadZone } from "../components/admin/ImageUploadZone";
import { AdminReportsTab } from "../components/admin/AdminReportsTab";
import { AdminCouponsTab } from "../components/admin/AdminCouponsTab";
import { AdminCategoriesTab } from "../components/admin/AdminCategoriesTab";
import { AdminSupportTab } from "../components/admin/AdminSupportTab";
import { apiRequest } from "../api/axios";

export function AdminPage() {
  const navigate = useNavigate();
  const { user, login, logout, notify, categories, reloadCategories, confirm } = useAppContext();
  const [section, setSection] = useState("overview");

  // Prompt configuration for premium custom popups instead of window.prompt
  const [promptConfig, setPromptConfig] = useState(null); 

  // AI-Assisted States & Handlers
  const [loadingBroadcastAI, setLoadingBroadcastAI] = useState(false);
  const [loadingIndividualAI, setLoadingIndividualAI] = useState(false);
  
  // Newsletter compose states
  const [newsletterTheme, setNewsletterTheme] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterBody, setNewsletterBody] = useState("");
  const [loadingNewsletterAI, setLoadingNewsletterAI] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  // Spotlights / Brand ad AI
  const [loadingSpotlightAI, setLoadingSpotlightAI] = useState(false);

  // Site Settings AI
  const [loadingSettingsAI, setLoadingSettingsAI] = useState(false);

  // Handlers
  const handleAIDraftBroadcast = () => {
    setPromptConfig({
      title: "Draft Broadcast Announcement",
      description: "Enter the theme or topic of the broadcast announcement you want the AI to write (e.g., 'Diwali Special Sale' or 'Free delivery this Sunday').",
      placeholder: "e.g. Diwali Fest Weekend Discount",
      onSubmit: async (theme) => {
        if (!theme || !theme.trim()) return;
        setLoadingBroadcastAI(true);
        try {
          const data = await apiRequest("/ai/draft-broadcast", {
            method: "POST",
            body: { theme: theme.trim() }
          });
          if (data) {
            setBroadcastTitle(data.title || "");
            setBroadcastBody(data.body || "");
            notify("✨ Broadcast announcement drafted with AI!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to generate broadcast draft.");
        } finally {
          setLoadingBroadcastAI(false);
        }
      }
    });
  };

  const handleAIDraftIndividual = () => {
    if (!individualUserId) {
      notify("Please select a target user first.");
      return;
    }
    const selectedUser = usersList.find(u => u.id === individualUserId);
    setPromptConfig({
      title: `Draft Message for ${selectedUser?.name || "Customer"}`,
      description: `Enter the message context/reason for sending this message to ${selectedUser?.name || "this user"} (e.g. 'coupon loyalty reward', 'unpaid order nudge').`,
      placeholder: "e.g. coupon loyalty reward",
      onSubmit: async (context) => {
        if (!context || !context.trim()) return;
        setLoadingIndividualAI(true);
        try {
          const data = await apiRequest("/ai/draft-user-message", {
            method: "POST",
            body: { userName: selectedUser?.name || "Customer", context: context.trim() }
          });
          if (data) {
            setIndividualTitle(`Special update regarding ${context.trim()}`);
            setIndividualBody(data.message || "");
            notify("✨ Personal direct message drafted with AI!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to generate message draft.");
        } finally {
          setLoadingIndividualAI(false);
        }
      }
    });
  };

  const handleAIDraftNewsletter = async () => {
    if (!newsletterTheme.trim()) {
      notify("Please enter a promotion/newsletter theme first.");
      return;
    }
    setLoadingNewsletterAI(true);
    try {
      const data = await apiRequest("/ai/draft-newsletter", {
        method: "POST",
        body: { theme: newsletterTheme.trim() }
      });
      if (data) {
        setNewsletterSubject(data.subject || "");
        setNewsletterBody(data.body || "");
        notify("✨ Newsletter draft generated with AI!");
      }
    } catch (err) {
      console.error(err);
      notify(err.message || "Failed to draft newsletter.");
    } finally {
      setLoadingNewsletterAI(false);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterSubject.trim() || !newsletterBody.trim()) {
      notify("Subject and email body are required.");
      return;
    }
    setSendingNewsletter(true);
    try {
      const data = await apiRequest("/newsletter/send", {
        method: "POST",
        body: { subject: newsletterSubject.trim(), html: newsletterBody.trim() }
      });
      if (data) {
        notify("📧 Newsletter successfully sent to all subscribers!");
        setNewsletterTheme("");
        setNewsletterSubject("");
        setNewsletterBody("");
      }
    } catch (err) {
      console.error(err);
      notify(err.message || "Failed to send newsletter.");
    } finally {
      setSendingNewsletter(false);
    }
  };

  const handleAIDraftSpotlight = () => {
    if (!newBrand.brand.trim()) {
      notify("Please enter the Brand Name first.");
      return;
    }
    setPromptConfig({
      title: `Draft Spotlight for ${newBrand.brand}`,
      description: `Enter campaign highlights or products to focus on for ${newBrand.brand} (e.g. 'organic skincare, 20% off all spices').`,
      placeholder: "e.g. organic skincare, 20% off all spices",
      onSubmit: async (highlight) => {
        if (!highlight || !highlight.trim()) return;
        setLoadingSpotlightAI(true);
        try {
          const data = await apiRequest("/ai/draft-spotlight", {
            method: "POST",
            body: { brandName: newBrand.brand.trim(), highlight: highlight.trim() }
          });
          if (data) {
            setNewBrand((current) => ({
              ...current,
              title: data.title || "",
              copy: data.copy || "",
              offer: data.offer || "",
              accent: data.accent || "#c4622d"
            }));
            notify("✨ Spotlight banner suggestions drafted with AI!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to draft spotlight banner.");
        } finally {
          setLoadingSpotlightAI(false);
        }
      }
    });
  };

  const handleAISiteSettings = () => {
    setPromptConfig({
      title: "Draft Banner Suggestions",
      description: "Enter a seasonal theme or campaign name to auto-populate the homepage banner title and redirect link with AI suggestions.",
      placeholder: "e.g. Monsoon Deals, Winter Spices",
      onSubmit: async (theme) => {
        if (!theme || !theme.trim()) return;
        setLoadingSettingsAI(true);
        try {
          const data = await apiRequest("/ai/suggest-site-settings", {
            method: "POST",
            body: { season: theme.trim() }
          });
          if (data) {
            setNewBanner((current) => ({
              ...current,
              title: data.heroHeadline || data.announcementBarText || "",
              linkUrl: "/shop",
            }));
            notify("✨ Banner suggestions populated in the Add Banner form!");
          }
        } catch (err) {
          console.error(err);
          notify(err.message || "Failed to generate banner suggestions.");
        } finally {
          setLoadingSettingsAI(false);
        }
      }
    });
  };

  // Admin login states
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError("Please enter both email and password.");
      return;
    }
    setLoginLoading(true);
    try {
      const loggedInUser = await login({ email: adminEmail.trim(), password: adminPassword });
      if (loggedInUser.role !== "admin") {
        setLoginError("Access denied. Admin credentials required.");
        await logout();
      } else {
        notify("Welcome back, Administrator! 🛠️");
      }
    } catch (err) {
      setLoginError(err?.message || "Invalid credentials.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Seller Verification states
  const [sellersList, setSellersList] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sellersPage, setSellersPage] = useState(1);
  const [sellersPagination, setSellersPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  // Review Moderation states
  const [pendingReviewsList, setPendingReviewsList] = useState([]);
  const [loadingPendingReviews, setLoadingPendingReviews] = useState(false);
  const [pendingReviewsPage, setPendingReviewsPage] = useState(1);
  const [pendingReviewsPagination, setPendingReviewsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  useDocumentMetadata({
    title: "Administrator Panel",
    description: "Manage system dashboard, moderate products, review orders, verify user profiles, and send notifications on GaramBazaar.",
    noindex: true
  });
  const [dashboard, setDashboard] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPagination, setUsersPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [reportsList, setReportsList] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsPagination, setReportsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [returnsList, setReturnsList] = useState([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [returnsPage, setReturnsPage] = useState(1);
  const [returnsPagination, setReturnsPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const [salesAnalytics, setSalesAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Message modal state
  const [selectedUserForMsg, setSelectedUserForMsg] = useState(null);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendEmailCheckbox, setSendEmailCheckbox] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Messaging section state
  const [messagingMode, setMessagingMode] = useState("broadcast");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastEmail, setBroadcastEmail] = useState(true);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [individualUserId, setIndividualUserId] = useState("");
  const [individualTitle, setIndividualTitle] = useState("");
  const [individualBody, setIndividualBody] = useState("");
  const [individualEmail, setIndividualEmail] = useState(true);
  const [sendingIndividual, setSendingIndividual] = useState(false);

  // Coupons state
  const [couponsList, setCouponsList] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderAmount: "",
    expiresAt: "",
  });

  // Brands state
  const [brandsList, setBrandsList] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [newBrand, setNewBrand] = useState({
    brand: "",
    title: "",
    copy: "",
    offer: "",
    accent: "#2f5f4b",
    image: "",
  });

  // Users Search, Sort, Filter State
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userSort, setUserSort] = useState("name-asc");

  // Products Search, Sort, Filter State
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productSort, setProductSort] = useState("name-asc");

  // Geo Analytics and Newsletter state
  const [geoAnalytics, setGeoAnalytics] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [subscribersList, setSubscribersList] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);

  // Site Settings state
  const [siteSettings, setSiteSettings] = useState({
    shippingFee: 49,
    shippingFreeThreshold: 500,
    homepageBanners: []
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [newBanner, setNewBanner] = useState({
    imageUrl: "",
    linkUrl: "/shop",
    title: ""
  });

  const loadDashboard = useCallback(async () => {
    const data = await getDashboardRequest();
    setDashboard(data);
  }, []);

  const handleExportCSV = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5001";
      const session = JSON.parse(localStorage.getItem("GaramBazaar_auth") || "{}");
      const token = session?.token;
      if (!token) throw new Error("Authentication required.");

      const response = await fetch(`${backendUrl}/api/admin/analytics/export`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to export admin CSV report.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin-sales-report-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify("CSV report downloaded successfully!");
    } catch (err) {
      notify(err.message || "Failed to download CSV.");
    }
  };

  const loadUsers = useCallback(async (page = 1) => {
    setLoadingUsers(true);
    try {
      const data = await getUsersRequest(page, 10);
      setUsersList(data.users || []);
      if (data.pagination) {
        setUsersPagination(data.pagination);
      }
    } catch (err) {
      notify(err.message || "Failed to load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [notify]);

  const loadReports = useCallback(async (page = 1) => {
    setLoadingReports(true);
    try {
      const res = await getAdminReportsRequest(page, 10);
      setReportsList(res.reports || []);
      if (res.pagination) {
        setReportsPagination(res.pagination);
      }
    } catch (err) {
      notify(err.message || "Failed to load reports.");
    } finally {
      setLoadingReports(false);
    }
  }, [notify]);

  const loadReturns = useCallback(async (page = 1) => {
    setLoadingReturns(true);
    try {
      const res = await getReturnRequests(page, 10);
      setReturnsList(res.returns || []);
      if (res.pagination) {
        setReturnsPagination(res.pagination);
      }
    } catch (err) {
      notify(err.message || "Failed to load returns.");
    } finally {
      setLoadingReturns(false);
    }
  }, [notify]);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await getAdminSalesAnalyticsRequest();
      setSalesAnalytics(data);
    } catch (err) {
      notify(err.message || "Failed to load sales analytics.");
    } finally {
      setLoadingAnalytics(false);
    }
  }, [notify]);

  const loadGeoAnalytics = useCallback(async () => {
    setLoadingGeo(true);
    try {
      const data = await getAdminGeoAnalyticsRequest();
      setGeoAnalytics(data.geoStats || []);
    } catch (err) {
      notify(err.message || "Failed to load geographic analytics.");
    } finally {
      setLoadingGeo(false);
    }
  }, [notify]);

  const loadSubscribers = useCallback(async () => {
    setLoadingSubscribers(true);
    try {
      const data = await getNewsletterSubscribersRequest();
      setSubscribersList(data.subscribers || []);
    } catch (err) {
      notify(err.message || "Failed to load newsletter subscribers.");
    } finally {
      setLoadingSubscribers(false);
    }
  }, [notify]);

  const loadPendingSellers = useCallback(async (page = 1) => {
    setLoadingSellers(true);
    try {
      const data = await getUsersRequest(page, 10, "seller", "new");
      setSellersList(data.users || []);
      if (data.pagination) {
        setSellersPagination(data.pagination);
      }
    } catch (err) {
      notify(err.message || "Failed to load pending sellers.");
    } finally {
      setLoadingSellers(false);
    }
  }, [notify]);

  const handleApproveSeller = async (sellerId) => {
    try {
      await updateUserCertificationRequest(sellerId, "certified");
      notify("Seller verified and certified successfully!");
      loadPendingSellers(sellersPage).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to verify seller.");
    }
  };

  const loadPendingReviews = useCallback(async (page = 1) => {
    setLoadingPendingReviews(true);
    try {
      const data = await getPendingReviewsRequest(page, 10);
      setPendingReviewsList(data.reviews || []);
      if (data.pagination) {
        setPendingReviewsPagination(data.pagination);
      }
    } catch (err) {
      notify(err.message || "Failed to load pending reviews.");
    } finally {
      setLoadingPendingReviews(false);
    }
  }, [notify]);

  const handleApproveReview = async (id) => {
    try {
      await approveReviewRequest(id);
      notify("Review approved and published!");
      loadPendingReviews(pendingReviewsPage).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to approve review.");
    }
  };

  const handleRejectReview = async (id) => {
    if (!(await confirm("Are you sure you want to REJECT and delete this review?"))) return;
    try {
      await rejectReviewRequest(id);
      notify("Review rejected and deleted.");
      loadPendingReviews(pendingReviewsPage).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to reject review.");
    }
  };

  const drawLineChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return { points: [], path: "", areaPath: "" };
    const maxVal = Math.max(...data, 100);
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const y = height - ((val / maxVal) * (height - 40) + 20);
      return { x, y, val, label: salesAnalytics.labels[idx] };
    });
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    const areaPath = `${path} L ${points[points.length - 1].x} ${height - 10} L ${points[0].x} ${height - 10} Z`;
    return { points, path, areaPath };
  };

  const drawBarChart = (data, width = 600, height = 200) => {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...data, 5);
    const barWidth = ((width - 40) / data.length) * 0.7;
    const gap = ((width - 40) / data.length) * 0.3;
    return data.map((val, idx) => {
      const x = 20 + idx * (barWidth + gap);
      const barHeight = (val / maxVal) * (height - 40);
      const y = height - barHeight - 20;
      return { x, y, width: barWidth, height: barHeight, val, label: salesAnalytics.labels[idx] };
    });
  };

  const loadCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const res = await getAdminCouponsRequest();
      setCouponsList(res.coupons || []);
    } catch (err) {
      notify(err.message || "Failed to load coupons.");
    } finally {
      setLoadingCoupons(false);
    }
  }, [notify]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUserForMsg || !msgTitle || !msgBody) return;
    setSendingMsg(true);
    try {
      await sendAdminNotificationRequest({
        userId: selectedUserForMsg.id,
        title: msgTitle,
        message: msgBody,
        sendEmailCheckbox,
      });
      notify(`Message sent successfully to ${selectedUserForMsg.name}.`);
      setSelectedUserForMsg(null);
      setMsgTitle("");
      setMsgBody("");
    } catch (err) {
      notify(err.message || "Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;
    setSendingBroadcast(true);
    try {
      const res = await broadcastNotificationRequest({
        title: broadcastTitle,
        message: broadcastBody,
        sendEmailCheckbox: broadcastEmail,
      });
      notify(`📢 Broadcast sent to ${res.notificationCount} user(s). ${res.emailsSent ? `${res.emailsSent} email(s) sent.` : ""}`);
      setBroadcastTitle("");
      setBroadcastBody("");
    } catch (err) {
      notify(err.message || "Failed to send broadcast.");
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleIndividualMessage = async (e) => {
    e.preventDefault();
    if (!individualUserId || !individualTitle || !individualBody) {
      notify("Please select a user and fill all fields.");
      return;
    }
    setSendingIndividual(true);
    try {
      await sendAdminNotificationRequest({
        userId: individualUserId,
        title: individualTitle,
        message: individualBody,
        sendEmailCheckbox: individualEmail,
      });
      const targetUser = usersList.find((u) => u.id === individualUserId);
      notify(`Message sent to ${targetUser?.name || "user"}.`);
      setIndividualTitle("");
      setIndividualBody("");
      setIndividualUserId("");
    } catch (err) {
      notify(err.message || "Failed to send message.");
    } finally {
      setSendingIndividual(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discountValue) {
      notify("Code and value are required.");
      return;
    }
    try {
      await createAdminCouponRequest({
        ...newCoupon,
        discountValue: Number(newCoupon.discountValue),
        minOrderAmount: Number(newCoupon.minOrderAmount || 0),
      });
      notify("Coupon created successfully.");
      setNewCoupon({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderAmount: "",
        expiresAt: "",
      });
      loadCoupons().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to create coupon.");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!(await confirm("Are you sure you want to delete this coupon?"))) return;
    try {
      await deleteAdminCouponRequest(id);
      notify("Coupon deleted successfully.");
      loadCoupons().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to delete coupon.");
    }
  };

  const loadBrands = useCallback(async () => {
    setLoadingBrands(true);
    try {
      const res = await getAdminBrandsRequest();
      setBrandsList(res.brands || []);
    } catch (err) {
      notify(err.message || "Failed to load brands.");
    } finally {
      setLoadingBrands(false);
    }
  }, [notify]);

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrand.brand || !newBrand.title || !newBrand.copy || !newBrand.offer || !newBrand.image) {
      notify("All fields are required.");
      return;
    }
    try {
      await createAdminBrandRequest(newBrand);
      notify("Brand spotlight created successfully.");
      setNewBrand({
        brand: "",
        title: "",
        copy: "",
        offer: "",
        accent: "#2f5f4b",
        image: "",
      });
      loadBrands().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to create brand spotlight.");
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!(await confirm("Are you sure you want to delete this brand spotlight?"))) return;
    try {
      await deleteAdminBrandRequest(id);
      notify("Brand spotlight deleted successfully.");
      loadBrands().catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to delete brand spotlight.");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadDashboard().catch(() => {});
    }
  }, [loadDashboard, user]);

  useEffect(() => {
    if (user?.role === "admin" && (section === "users" || section === "messaging")) {
      loadUsers(usersPage).catch(() => {});
    }
  }, [section, loadUsers, user, usersPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "reports") {
      loadReports(reportsPage).catch(() => {});
    }
  }, [section, loadReports, user, reportsPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "returns") {
      loadReturns(returnsPage).catch(() => {});
    }
  }, [section, loadReturns, user, returnsPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "overview") {
      loadAnalytics().catch(() => {});
      loadGeoAnalytics().catch(() => {});
    }
  }, [section, loadAnalytics, loadGeoAnalytics, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "newsletter") {
      loadSubscribers().catch(() => {});
    }
  }, [section, loadSubscribers, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "coupons") {
      loadCoupons().catch(() => {});
    }
  }, [section, loadCoupons, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "brands") {
      loadBrands().catch(() => {});
    }
  }, [section, loadBrands, user]);

  useEffect(() => {
    if (user?.role === "admin" && section === "seller-verifications") {
      loadPendingSellers(sellersPage).catch(() => {});
    }
  }, [section, loadPendingSellers, user, sellersPage]);

  useEffect(() => {
    if (user?.role === "admin" && section === "review-moderations") {
      loadPendingReviews(pendingReviewsPage).catch(() => {});
    }
  }, [section, loadPendingReviews, user, pendingReviewsPage]);

  const loadSiteSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const data = await getAdminSettingsRequest();
      if (data) {
        setSiteSettings({
          shippingFee: data.shippingFee ?? 49,
          shippingFreeThreshold: data.shippingFreeThreshold ?? 500,
          homepageBanners: data.homepageBanners || []
        });
      }
    } catch (err) {
      notify(err.message || "Failed to load site settings.");
    } finally {
      setLoadingSettings(false);
    }
  }, [notify]);

  const handleUpdateSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAdminSettingsRequest({
        shippingFee: Number(siteSettings.shippingFee),
        shippingFreeThreshold: Number(siteSettings.shippingFreeThreshold),
        homepageBanners: siteSettings.homepageBanners
      });
      notify("Site settings updated successfully! ⚙️");
      await loadSiteSettings();
    } catch (err) {
      notify(err.message || "Failed to update site settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!newBanner.imageUrl) {
      notify("Please provide a banner image URL.");
      return;
    }
    setSiteSettings((prev) => ({
      ...prev,
      homepageBanners: [...prev.homepageBanners, newBanner]
    }));
    setNewBanner({ imageUrl: "", linkUrl: "/shop", title: "" });
  };

  const handleRemoveBanner = (indexToRemove) => {
    setSiteSettings((prev) => ({
      ...prev,
      homepageBanners: prev.homepageBanners.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  useEffect(() => {
    if (user?.role === "admin" && section === "settings") {
      loadSiteSettings().catch(() => {});
    }
  }, [section, loadSiteSettings, user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-[#1f2937] p-8 rounded-2xl border border-gray-700 shadow-2xl">
          <div>
            <div className="flex justify-center text-4xl mb-3">🛠️</div>
            <h2 className="text-center text-2xl font-extrabold text-white">
              GaramBazaar Admin Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Sign in to manage the platform settings, users, and listings
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAdminLogin}>
            {loginError && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 text-xs rounded-xl p-3 text-center font-medium">
                {loginError}
              </div>
            )}
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@garambazaar.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-[#374151] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-200 text-xs font-semibold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loginLoading ? "Authenticating..." : "Sign In to Admin Portal →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filtered and Sorted Users
  const filteredUsers = usersList
    .filter((usr) => {
      const searchLower = userSearch.toLowerCase();
      const matchesSearch =
        (usr.name || "").toLowerCase().includes(searchLower) ||
        (usr.email || "").toLowerCase().includes(searchLower);

      if (userRoleFilter === "all") return matchesSearch;
      return matchesSearch && usr.role === userRoleFilter;
    })
    .sort((a, b) => {
      if (userSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (userSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (userSort === "credit-desc") {
        return (b.creditScore ?? 0) - (a.creditScore ?? 0);
      }
      if (userSort === "credit-asc") {
        return (a.creditScore ?? 0) - (b.creditScore ?? 0);
      }
      return 0;
    });

  // Filtered and Sorted Products
  const filteredProducts = (dashboard?.products || [])
    .filter((prod) => {
      const searchLower = productSearch.toLowerCase();
      const matchesSearch =
        (prod.name || "").toLowerCase().includes(searchLower) ||
        (prod.category || "").toLowerCase().includes(searchLower) ||
        (prod.seller?.name || "admin").toLowerCase().includes(searchLower);

      if (productCategoryFilter === "all") return matchesSearch;
      return matchesSearch && prod.category === productCategoryFilter;
    })
    .sort((a, b) => {
      if (productSort === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (productSort === "name-desc") {
        return (b.name || "").localeCompare(a.name || "");
      }
      if (productSort === "price-desc") {
        return (b.price ?? 0) - (a.price ?? 0);
      }
      if (productSort === "price-asc") {
        return (a.price ?? 0) - (b.price ?? 0);
      }
      return 0;
    });

  return (
    <section className="page-content admin-page">
      <div className="admin-page-head">
        <div>
          <div className="sec-label">Admin Panel</div>
          <h1 className="page-title">Store Control Center</h1>
        </div>
      </div>
      <div className="admin-layout">
        <AdminSidebar section={section} onChange={setSection} />
        <div className="stack">
          {section === "overview" && dashboard ? (
            <>
              <div className="flex justify-between items-center my-4 flex-wrap gap-2">
                <h2 className="text-base font-bold text-gray-800 m-0">📊 Performance Overview</h2>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-[#c4622d] hover:from-amber-500 hover:to-[#a35225] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0 inline-flex items-center gap-1.5"
                >
                  📥 Export CSV Revenue Report
                </button>
              </div>

              <div className="stats-grid">
                <StatCard label="Revenue" value={dashboard.stats.revenue} currency />
                <StatCard label="Orders" value={dashboard.stats.orders} />
                <StatCard label="Products" value={dashboard.stats.products} />
                <StatCard label="Users" value={dashboard.stats.users} />
              </div>

              {/* Custom Interactive SVG Charts */}
              {salesAnalytics ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 relative">
                  {/* Revenue Line Chart */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">💰 30-Day Revenue Trend</h3>
                    {(() => {
                      const { points, path, areaPath } = drawLineChart(salesAnalytics.revenueData);
                      return (
                        <div className="relative">
                          <svg className="w-full h-52 overflow-visible" viewBox="0 0 600 200">
                            <defs>
                              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#c4622d" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#c4622d" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            {/* Gridlines */}
                            <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                            <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                            <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f1f1" strokeWidth="1" />
                            <line x1="20" y1="180" x2="580" y2="180" stroke="#e0e0e0" strokeWidth="1.5" />

                            {/* Area Path */}
                            <path d={areaPath} fill="url(#revGrad)" />

                            {/* Line Path */}
                            <path d={path} fill="none" stroke="#c4622d" strokeWidth="3" strokeLinecap="round" />

                            {/* Interactive Dots */}
                            {points.map((p, idx) => (
                              <circle
                                key={idx}
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                className="fill-white stroke-[#c4622d] stroke-[2px] cursor-pointer hover:r-[7px] hover:fill-[#c4622d] transition-all"
                                onMouseEnter={() => setHoveredPoint({ ...p, type: "revenue" })}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            ))}
                          </svg>

                          {/* Chart X Labels */}
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-4">
                            <span>{salesAnalytics.labels[0]}</span>
                            <span>{salesAnalytics.labels[14]}</span>
                            <span>{salesAnalytics.labels[29]}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Orders Bar Chart */}
                  <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm relative">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">📦 30-Day Orders Volume</h3>
                    {(() => {
                      const bars = drawBarChart(salesAnalytics.orderData);
                      return (
                        <div className="relative">
                          <svg className="w-full h-52 overflow-visible" viewBox="0 0 600 200">
                            {/* Gridlines */}
                            <line x1="20" y1="20" x2="580" y2="20" stroke="#f1f1f1" strokeWidth="1" />
                            <line x1="20" y1="80" x2="580" y2="80" stroke="#f1f1f1" strokeWidth="1" />
                            <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f1f1" strokeWidth="1" />
                            <line x1="20" y1="180" x2="580" y2="180" stroke="#e0e0e0" strokeWidth="1.5" />

                            {/* Bars */}
                            {bars.map((b, idx) => (
                              <rect
                                key={idx}
                                x={b.x}
                                y={b.y}
                                width={b.width}
                                height={b.height}
                                rx="3"
                                className="fill-[#e0a96d] hover:fill-[#c4622d] transition-colors cursor-pointer"
                                onMouseEnter={() => setHoveredPoint({ ...b, type: "orders" })}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                            ))}
                          </svg>

                          {/* Chart X Labels */}
                          <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2 px-4">
                            <span>{salesAnalytics.labels[0]}</span>
                            <span>{salesAnalytics.labels[14]}</span>
                            <span>{salesAnalytics.labels[29]}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tooltip Overlay */}
                  {hoveredPoint && (
                    <div
                      className="absolute z-20 bg-gray-900/90 text-white rounded-xl px-3 py-2 text-[10px] shadow-lg pointer-events-none font-bold backdrop-blur-sm border border-gray-800"
                      style={{
                        left: `${(hoveredPoint.x / 600) * 100}%`,
                        top: `${(hoveredPoint.y / 200) * 100 - 25}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div>Date: {hoveredPoint.label}</div>
                      <div className="text-orange mt-0.5">
                        {hoveredPoint.type === "revenue"
                          ? `Revenue: ₹${hoveredPoint.val}`
                          : `Orders: ${hoveredPoint.val}`}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-455 italic my-4 px-2">Loading interactive sales charts...</p>
              )}

              {/* Geographic Sales Distribution Card */}
              <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm my-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#9b6b3a] mb-4">🌍 Geographic Sales Distribution</h3>
                {loadingGeo ? (
                  <p className="text-xs text-gray-500 italic py-4 animate-pulse">Loading geographic statistics...</p>
                ) : geoAnalytics && geoAnalytics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* List of locations */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                      {geoAnalytics.map((stat, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                          <div>
                            <span className="font-bold text-gray-800">{stat.city}</span>
                            <span className="text-gray-400 font-medium ml-1">({stat.state})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-gray-900">₹{stat.revenue}</div>
                            <div className="text-[10px] text-gray-400 font-bold">{stat.salesCount} {stat.salesCount === 1 ? "order" : "orders"}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Simple SVG Bar visualization of top geographic markets */}
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Revenue Breakdown by City</p>
                      <div className="space-y-3">
                        {geoAnalytics.slice(0, 5).map((stat, idx) => {
                          const maxRevenue = geoAnalytics[0]?.revenue || 1;
                          const percent = Math.max(5, Math.min(100, (stat.revenue / maxRevenue) * 100));
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-gray-700">{stat.city}</span>
                                <span className="text-orange">₹{stat.revenue}</span>
                              </div>
                              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 to-[#c4622d] rounded-full transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic py-4">No geographic sales data recorded yet.</p>
                )}
              </div>

              <OrderTable
                orders={dashboard.recentOrders}
                readOnly={true}
              />
            </>
          ) : null}

          {section === "products" && dashboard ? (
            <>
              <div className="section-head mb-4">
                <h1 className="page-title">Products</h1>
                <button className="button button-primary" onClick={() => setShowCreateModal(true)}>
                  Add product
                </button>
              </div>

              {/* Search, Filter, and Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Search by product name, category, or seller..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Home">Home</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Health">Health</option>
                  </select>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="price-desc">Price (High-Low)</option>
                    <option value="price-asc">Price (Low-High)</option>
                  </select>
                </div>
              </div>

              <ProductTable products={filteredProducts} onEdit={setEditingProduct} />
              
              {filteredProducts.length === 0 && (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No products match your search/filters.
                </p>
              )}
            </>
          ) : null}

          {section === "orders" && dashboard ? (
            <OrderTable
              orders={dashboard.recentOrders}
              readOnly={true}
            />
          ) : null}

          {section === "reviews" && dashboard ? (
            <div className="stack">
              {dashboard.reviews.map((review) => (
                <article key={review.id} className="rcard">
                  <div className="rcard-head">
                    <span className="rcard-name">{review.title}</span>
                  </div>
                  <div className="rcard-text">{review.body}</div>
                </article>
              ))}
            </div>
          ) : null}

          {section === "users" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">👤 Buyers & Sellers Management</h2>
              <p className="text-xs text-gray-500 mb-4">Administrate user access permissions, modify credit ratings, and approve certification statuses.</p>

              {/* Search, Filter, and Sort Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 text-sm">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#c4622d]"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Customer (Buyer)</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select
                    value={userSort}
                    onChange={(e) => setUserSort(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="credit-desc">Credit Score (High-Low)</option>
                    <option value="credit-asc">Credit Score (Low-High)</option>
                  </select>
                </div>
              </div>

              {loadingUsers ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading users list...</p>
              ) : filteredUsers.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">User</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Email</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Role</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Certification</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Credit Score</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="!py-3 !px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {usr.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <span className="font-semibold text-gray-900 text-sm">{usr.name || "Unknown User"}</span>
                            </div>
                          </td>
                          <td className="!py-3 !px-4 text-gray-600 text-xs whitespace-nowrap">{usr.email || "No Email"}</td>
                          <td className="!py-3 !px-4">
                            <select
                              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                              value={usr.role}
                              onChange={async (e) => {
                                try {
                                  await updateUserRoleRequest(usr.id, e.target.value);
                                  notify("User role updated.");
                                  loadUsers().catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to update role.");
                                }
                              }}
                            >
                              <option value="user">Customer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="!py-3 !px-4">
                            <select
                              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
                              value={usr.certificationStatus}
                              onChange={async (e) => {
                                try {
                                  await updateUserCertificationRequest(usr.id, e.target.value);
                                  notify("Certification status updated.");
                                  loadUsers().catch(() => {});
                                } catch (err) {
                                  notify(err.message || "Failed to update certification.");
                                }
                              }}
                            >
                              <option value="new">New</option>
                              <option value="certified">Certified</option>
                            </select>
                          </td>
                          <td className="!py-3 !px-4">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="1000"
                                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-[#c4622d]"
                                defaultValue={usr.creditScore ?? 750}
                                onBlur={async (e) => {
                                  const val = Number(e.target.value);
                                  if (val !== usr.creditScore) {
                                    try {
                                      await updateUserCreditScoreRequest(usr.id, val);
                                      notify("Credit score updated.");
                                      loadUsers().catch(() => {});
                                    } catch (err) {
                                      notify(err.message || "Failed to update credit score.");
                                      e.target.value = usr.creditScore; // reset
                                    }
                                  }
                                }}
                              />
                              <span className="text-[10px] text-gray-400 font-semibold">/1000</span>
                            </div>
                          </td>
                          <td className="!py-3 !px-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="button button-secondary text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                                onClick={() => setSelectedUserForMsg(usr)}
                              >
                                ✉️ Message
                              </button>
                              {usr.role !== "admin" && (
                                usr.isBanned ? (
                                  <button
                                    type="button"
                                    className="button text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer rounded-lg"
                                    onClick={async () => {
                                      try {
                                        await unbanUserRequest(usr.id);
                                        notify(`${usr.name || "User"} has been unbanned.`);
                                        loadUsers(usersPage).catch(() => {});
                                      } catch (err) {
                                        notify(err.message || "Failed to unban user.");
                                      }
                                    }}
                                  >
                                    😇 Unban
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="button text-[11px] px-3 py-1.5 inline-flex items-center gap-1 font-semibold whitespace-nowrap bg-red-600 hover:bg-red-700 text-white border-0 cursor-pointer rounded-lg"
                                    onClick={async () => {
                                      if (await confirm(`Are you sure you want to ban ${usr.name || "this user"}? They won't be able to log in.`)) {
                                        try {
                                          await banUserRequest(usr.id);
                                          notify(`${usr.name || "User"} has been banned.`);
                                          loadUsers(usersPage).catch(() => {});
                                        } catch (err) {
                                          notify(err.message || "Failed to ban user.");
                                        }
                                      }
                                    }}
                                  >
                                    🚫 Ban
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={usersPagination.currentPage}
                    totalPages={usersPagination.totalPages}
                    onPageChange={(p) => setUsersPage(p)}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No users match your filters.
                </p>
              )}
            </div>
          ) : null}

          {section === "reports" ? (
            <AdminReportsTab
              loadingReports={loadingReports}
              reportsList={reportsList}
              reportsPage={reportsPage}
              loadReports={loadReports}
              loadDashboard={loadDashboard}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "returns" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">🔄 Customer Returns Management</h2>
              <p className="text-xs text-gray-500 mb-4">Review, approve, or reject customer return requests. Approvals will restore stock and trigger refunds.</p>

              {loadingReturns ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading return requests...</p>
              ) : returnsList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Buyer</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Order Number</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Items</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reason</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnsList.map((ret) => (
                        <tr key={ret.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="!py-3 !px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {ret.userId?.name || "Customer"} ({ret.userId?.email || ""})
                          </td>
                          <td className="!py-3 !px-4 font-bold text-xs text-gray-650 whitespace-nowrap">
                            #{ret.orderNumber}
                          </td>
                          <td className="!py-3 !px-4 text-xs text-gray-800">
                            {ret.items.map((it) => `${it.name} ${it.variantName ? `(${it.variantName})` : ""} ×${it.quantity}`).join(" · ")}
                          </td>
                          <td className="!py-3 !px-4 text-xs text-gray-600">{ret.reason}</td>
                          <td className="!py-3 !px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              ret.status === "pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : ret.status === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {ret.status}
                            </span>
                          </td>
                          <td className="!py-3 !px-4">
                            <div className="flex gap-2">
                              {ret.status === "pending" ? (
                                <>
                                  <button
                                    type="button"
                                    className="button text-[10px] px-2.5 py-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg border-0 cursor-pointer"
                                    onClick={async () => {
                                      if (await confirm("Are you sure you want to APPROVE this return request? Stock will be restored and refund initiated.")) {
                                        try {
                                          await updateReturnRequestStatus(ret.id, "approved");
                                          notify("Return request approved.");
                                          loadReturns(returnsPage).catch(() => {});
                                        } catch (err) {
                                          notify(err.message || "Failed to approve return.");
                                        }
                                      }
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="button text-[10px] px-2.5 py-1.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg border-0 cursor-pointer"
                                    onClick={async () => {
                                      if (await confirm("Are you sure you want to REJECT this return request?")) {
                                        try {
                                          await updateReturnRequestStatus(ret.id, "rejected");
                                          notify("Return request rejected.");
                                          loadReturns(returnsPage).catch(() => {});
                                        } catch (err) {
                                          notify(err.message || "Failed to reject return.");
                                        }
                                      }
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Handled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={returnsPagination.currentPage}
                    totalPages={returnsPagination.totalPages}
                    onPageChange={(p) => setReturnsPage(p)}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No return requests recorded yet.
                </p>
              )}
            </div>
          ) : null}

          {section === "messaging" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <div className="section-head mb-2">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">💬 Messaging Center</h2>
                  <p className="text-xs text-gray-500">Send in-app notifications and emails to all users or individual users.</p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setMessagingMode("broadcast")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    messagingMode === "broadcast"
                      ? "bg-[#c4622d] text-white border-[#c4622d] shadow-md"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  📢 Broadcast to All
                </button>
                <button
                  type="button"
                  onClick={() => setMessagingMode("individual")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    messagingMode === "individual"
                      ? "bg-[#c4622d] text-white border-[#c4622d] shadow-md"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ✉️ Message Individual
                </button>
              </div>

              {messagingMode === "broadcast" ? (
                <form onSubmit={handleBroadcast} className="bg-gray-50 rounded-xl border border-gray-150 p-5 stack text-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">📢</span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 m-0">Broadcast to All Users</h3>
                        <p className="text-[11px] text-gray-500 m-0">This will send a notification to every registered user{usersList.length > 0 ? ` (${usersList.length} users)` : ""}.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAIDraftBroadcast}
                      disabled={loadingBroadcastAI}
                      className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer bg-white shrink-0"
                    >
                      {loadingBroadcastAI ? "⏳ Drafting..." : "✨ Draft with AI"}
                    </button>
                  </div>
                  <div className="field">
                    <label className="label text-xs font-semibold text-gray-700">Subject / Title</label>
                    <input
                      type="text"
                      className="input py-2"
                      required
                      placeholder="e.g. 🎉 Big Sale Starting Tomorrow!"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="label text-xs font-semibold text-gray-700">Message Body</label>
                    <textarea
                      className="input min-h-[120px] py-2"
                      required
                      placeholder="Write your broadcast message here..."
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="broadcastEmailCheck"
                      checked={broadcastEmail}
                      onChange={(e) => setBroadcastEmail(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="broadcastEmailCheck" className="font-semibold text-gray-700 cursor-pointer select-none text-xs">
                      📧 Also send as Email to all users
                    </label>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="button button-primary py-2 font-semibold" disabled={sendingBroadcast}>
                      {sendingBroadcast ? "Sending to all..." : `📢 Send Broadcast${usersList.length > 0 ? ` to ${usersList.length} Users` : ""}`}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleIndividualMessage} className="bg-gray-50 rounded-xl border border-gray-150 p-5 stack text-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✉️</span>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 m-0">Message Individual User</h3>
                        <p className="text-[11px] text-gray-500 m-0">Send a personal notification and/or email to a specific user.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAIDraftIndividual}
                      disabled={loadingIndividualAI}
                      className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer bg-white shrink-0"
                    >
                      {loadingIndividualAI ? "⏳ Drafting..." : "✨ Draft with AI"}
                    </button>
                  </div>
                  <div className="field">
                    <label className="label text-xs font-semibold text-gray-700">Select User</label>
                    <select
                      className="input py-2"
                      required
                      value={individualUserId}
                      onChange={(e) => setIndividualUserId(e.target.value)}
                    >
                      <option value="">-- Choose a user --</option>
                      {usersList.map((usr) => (
                        <option key={usr.id} value={usr.id}>
                          {usr.name || "Unknown"} ({usr.email}) — {usr.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="label text-xs font-semibold text-gray-700">Subject / Title</label>
                    <input
                      type="text"
                      className="input py-2"
                      required
                      placeholder="e.g. Your order has been shipped!"
                      value={individualTitle}
                      onChange={(e) => setIndividualTitle(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="label text-xs font-semibold text-gray-700">Message Body</label>
                    <textarea
                      className="input min-h-[120px] py-2"
                      required
                      placeholder="Write your personal message here..."
                      value={individualBody}
                      onChange={(e) => setIndividualBody(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="individualEmailCheck"
                      checked={individualEmail}
                      onChange={(e) => setIndividualEmail(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="individualEmailCheck" className="font-semibold text-gray-700 cursor-pointer select-none text-xs">
                      📧 Also send direct Email
                    </label>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="button button-primary py-2 font-semibold" disabled={sendingIndividual}>
                      {sendingIndividual ? "Sending..." : "✉️ Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {section === "newsletter" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <div className="section-head mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📧 Newsletter Subscribers</h2>
                  <p className="text-xs text-gray-500">View and manage email list registrations for newsletters and product promotions.</p>
                </div>
              </div>

              {/* Compose & Send Newsletter Form */}
              <form onSubmit={handleSendNewsletter} className="bg-gray-50 rounded-xl border border-gray-150 p-5 stack text-sm mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 m-0">Compose Email Newsletter</h3>
                    <p className="text-[11px] text-gray-500 m-0">Write or draft a newsletter campaign using AI and send it to all active subscribers.</p>
                  </div>
                </div>

                <div className="field">
                  <label className="label text-xs font-bold text-gray-700">1. Newsletter Theme / Goal (for AI Suggestion)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input py-2 flex-grow"
                      placeholder="e.g. Monsoon Organic Spices Sale 15% off"
                      value={newsletterTheme}
                      onChange={(e) => setNewsletterTheme(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAIDraftNewsletter}
                      disabled={loadingNewsletterAI || !newsletterTheme.trim()}
                      className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer bg-white whitespace-nowrap"
                    >
                      {loadingNewsletterAI ? "⏳ Drafting..." : "✨ Draft with AI"}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label className="label text-xs font-bold text-gray-700">2. Subject Line</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="Catchy subject line..."
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label className="label text-xs font-bold text-gray-700">3. Email HTML Body</label>
                  <textarea
                    className="input min-h-[160px] py-2 font-mono text-xs"
                    required
                    placeholder="HTML template body..."
                    value={newsletterBody}
                    onChange={(e) => setNewsletterBody(e.target.value)}
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Supports HTML styling (e.g. &lt;h2&gt;, &lt;p&gt;, &lt;a&gt;, inline css).</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="button button-primary py-2 font-semibold"
                    disabled={sendingNewsletter || !newsletterSubject.trim() || !newsletterBody.trim()}
                  >
                    {sendingNewsletter ? "📧 Sending..." : "✉️ Send Newsletter to Subscribers"}
                  </button>
                </div>
              </form>

              {loadingSubscribers ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading subscribers...</p>
              ) : subscribersList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Email Address</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Status</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Joined Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribersList.map((sub) => (
                        <tr key={sub._id || sub.email} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0">
                          <td className="!py-3 !px-4 font-semibold text-gray-900 text-sm">{sub.email}</td>
                          <td className="!py-3 !px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              sub.active
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}>
                              {sub.active ? "Active" : "Unsubscribed"}
                            </span>
                          </td>
                          <td className="!py-3 !px-4 text-gray-500 text-xs">
                            {new Date(sub.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No newsletter subscribers found.
                </p>
              )}
            </div>
          ) : null}

          {section === "coupons" ? (
            <AdminCouponsTab
              couponsList={couponsList}
              loadingCoupons={loadingCoupons}
              newCoupon={newCoupon}
              setNewCoupon={setNewCoupon}
              loadCoupons={loadCoupons}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "brands" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <div className="section-head mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">📢 Brand Spotlight Management</h2>
                  <p className="text-xs text-gray-500">Create and manage the brand spotlights featured on the store homepage.</p>
                </div>
              </div>

              {/* Add Brand Form */}
              <form onSubmit={handleCreateBrand} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-150 mb-6 text-sm">
                <div className="field">
                  <div className="flex justify-between items-center w-full">
                    <label className="label text-xs font-semibold text-gray-700 m-0">Brand Name</label>
                    {newBrand.brand.trim() && (
                      <button
                        type="button"
                        onClick={handleAIDraftSpotlight}
                        disabled={loadingSpotlightAI}
                        className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 mb-1"
                      >
                        {loadingSpotlightAI ? "⏳ Drafting..." : "✨ Generate Spotlight with AI"}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. Pahadi Roots"
                    value={newBrand.brand}
                    onChange={(e) => setNewBrand({ ...newBrand, brand: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Campaign Title</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. Mountain Pantry Festival"
                    value={newBrand.title}
                    onChange={(e) => setNewBrand({ ...newBrand, title: e.target.value })}
                  />
                </div>
                <div className="field col-span-2">
                  <label className="label text-xs font-semibold text-gray-700">Marketing Description / Copy</label>
                  <textarea
                    className="input min-h-[60px] py-2"
                    required
                    placeholder="e.g. Stone-ground flours, wild honey, and Himalayan salts..."
                    value={newBrand.copy}
                    onChange={(e) => setNewBrand({ ...newBrand, copy: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Offer Text</label>
                  <input
                    type="text"
                    className="input py-2"
                    required
                    placeholder="e.g. Up to 25% off"
                    value={newBrand.offer}
                    onChange={(e) => setNewBrand({ ...newBrand, offer: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label className="label text-xs font-semibold text-gray-700">Accent Color (HEX)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer bg-white"
                      value={newBrand.accent}
                      onChange={(e) => setNewBrand({ ...newBrand, accent: e.target.value })}
                    />
                    <input
                      type="text"
                      className="input py-2 flex-grow"
                      required
                      placeholder="#2f5f4b"
                      value={newBrand.accent}
                      onChange={(e) => setNewBrand({ ...newBrand, accent: e.target.value })}
                    />
                  </div>
                </div>
                <div className="field col-span-2">
                  <ImageUploadZone
                    label="Campaign Image"
                    value={newBrand.image}
                    onChange={(url) => setNewBrand({ ...newBrand, image: url })}
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="button button-primary py-2 font-semibold">
                    Create Brand Spotlight
                  </button>
                </div>
              </form>

              {/* Brands List Table */}
              {loadingBrands ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading brands list...</p>
              ) : brandsList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Brand</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Title</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Offer</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Color</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brandsList.map((bd) => (
                        <tr key={bd.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="!py-3 !px-4 font-semibold text-gray-900 text-sm">{bd.brand}</td>
                          <td className="!py-3 !px-4 text-gray-700 text-xs">{bd.title}</td>
                          <td className="!py-3 !px-4 text-gray-700 text-xs font-bold">{bd.offer}</td>
                          <td className="!py-3 !px-4 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white font-bold text-[10px]" style={{ backgroundColor: bd.accent }}>
                              {bd.accent}
                            </span>
                          </td>
                          <td className="!py-3 !px-4">
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700 font-semibold text-xs transition-colors"
                              onClick={() => handleDeleteBrand(bd.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  No brand spotlights created yet. Fill in the form above to add one.
                </p>
              )}
            </div>
          ) : null}

          {section === "categories" ? (
            <AdminCategoriesTab
              categories={categories}
              reloadCategories={reloadCategories}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "seller-verifications" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">🏪 Seller Verification Queue</h2>
              <p className="text-xs text-gray-500 mb-4">Review and approve registration requests from new merchants on GaramBazaar.</p>

              {loadingSellers ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading pending sellers...</p>
              ) : sellersList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Merchant</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Email</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Verification Status</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellersList.map((seller) => (
                        <tr key={seller.id} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0">
                          <td className="!py-3 !px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {seller.name?.[0]?.toUpperCase() || "S"}
                              </div>
                              <span className="font-semibold text-gray-900 text-sm">{seller.name || "Unknown Merchant"}</span>
                            </div>
                          </td>
                          <td className="!py-3 !px-4 text-gray-600 text-xs whitespace-nowrap">{seller.email}</td>
                          <td className="!py-3 !px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                              {seller.certificationStatus || "new"}
                            </span>
                          </td>
                          <td className="!py-3 !px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleApproveSeller(seller.id)}
                              className="px-3.5 py-2 bg-[#c4622d] text-white rounded-lg text-xs font-bold hover:bg-[#e07a4a] transition-all cursor-pointer border-0 shadow-sm"
                            >
                              ✅ Approve & Certify
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={sellersPagination.currentPage}
                    totalPages={sellersPagination.totalPages}
                    onPageChange={(p) => setSellersPage(p)}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  🎉 No pending seller verifications in the queue!
                </p>
              )}
            </div>
          ) : null}

          {section === "review-moderations" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <h2 className="text-lg font-bold text-gray-900 mb-1">🛡️ Review Moderation Queue</h2>
              <p className="text-xs text-gray-500 mb-4">Approve or reject customer product reviews before they are published to the storefront.</p>

              {loadingPendingReviews ? (
                <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading pending reviews...</p>
              ) : pendingReviewsList.length > 0 ? (
                <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Product</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Customer</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Rating</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Review</th>
                        <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingReviewsList.map((rev) => (
                        <tr key={rev.id} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0">
                          <td className="!py-3 !px-4 text-xs font-semibold text-gray-900 whitespace-nowrap">
                            <span className="mr-1">{rev.product?.emoji || "📦"}</span>
                            {rev.product?.name || "Unknown Product"}
                          </td>
                          <td className="!py-3 !px-4 text-xs text-gray-750 whitespace-nowrap">
                            {rev.name} ({rev.user?.email || "No email"})
                          </td>
                          <td className="!py-3 !px-4 text-amber-500 font-bold whitespace-nowrap">{"★".repeat(rev.rating)}</td>
                          <td className="!py-3 !px-4 text-xs text-gray-600 max-w-[250px] break-words">
                            <strong className="block text-gray-800 font-bold mb-0.5">{rev.title}</strong>
                            {rev.body}
                          </td>
                          <td className="!py-3 !px-4 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveReview(rev.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectReview(rev.id)}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={pendingReviewsPagination.currentPage}
                    totalPages={pendingReviewsPagination.totalPages}
                    onPageChange={(p) => setPendingReviewsPage(p)}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  🎉 All customer reviews are fully moderated!
                </p>
              )}
            </div>
          ) : null}

          {section === "support-tickets" ? (
            <AdminSupportTab
              loadingTickets={loadingTickets}
              ticketsList={ticketsList}
              loadSupportTickets={loadSupportTickets}
              notify={notify}
              confirm={confirm}
            />
          ) : null}

          {section === "settings" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
              <div className="section-head mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">⚙️ Site Configuration Settings</h2>
                  <p className="text-xs text-gray-500">Configure global platform shipping variables and manage homepage promo banners.</p>
                </div>
              </div>

              {loadingSettings ? (
                <p className="text-sm text-gray-500 py-10 text-center animate-pulse">Loading settings...</p>
              ) : (
                <div className="space-y-8">
                  {/* Shipping variables */}
                  <form onSubmit={handleUpdateSettings} className="space-y-6 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="field">
                        <label className="label text-xs font-bold text-gray-700">Base Shipping Fee (₹)</label>
                        <input
                          type="number"
                          className="input py-2.5"
                          required
                          min="0"
                          value={siteSettings.shippingFee}
                          onChange={(e) => setSiteSettings({ ...siteSettings, shippingFee: e.target.value })}
                        />
                        <span className="text-[10px] text-gray-400 mt-1 block">Default fee applied to orders below the free delivery threshold.</span>
                      </div>
                      <div className="field">
                        <label className="label text-xs font-bold text-gray-700">Free Delivery Threshold (₹)</label>
                        <input
                          type="number"
                          className="input py-2.5"
                          required
                          min="0"
                          value={siteSettings.shippingFreeThreshold}
                          onChange={(e) => setSiteSettings({ ...siteSettings, shippingFreeThreshold: e.target.value })}
                        />
                        <span className="text-[10px] text-gray-400 mt-1 block">Subtotal threshold above which delivery becomes free.</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={savingSettings}
                        className="px-5 py-2.5 bg-[#c4622d] text-white hover:bg-[#e07a4a] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0"
                      >
                        {savingSettings ? "Saving Settings..." : "Save Shipping Configuration"}
                      </button>
                    </div>
                  </form>

                  <hr className="border-gray-100" />

                  {/* Promo Banners */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-[#9b6b3a] mb-1">🖼️ Homepage Carousel Banners</h3>
                        <p className="text-xs text-gray-500">Add or remove promotional slider banners displayed on the homepage hero section.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAISiteSettings}
                        disabled={loadingSettingsAI}
                        className="border border-[#c4622d] hover:bg-[#c4622d]/5 text-[#c4622d] font-bold py-1.5 px-3 rounded-lg text-xs transition-colors cursor-pointer bg-white shrink-0"
                      >
                        {loadingSettingsAI ? "⏳ Drafting..." : "✨ Draft Banner with AI"}
                      </button>
                    </div>

                    {/* Add Banner Form */}
                    <form onSubmit={handleAddBanner} className="bg-gray-50 rounded-xl border border-gray-150 p-5 space-y-4 text-xs text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="field">
                          <label className="label text-xs font-semibold text-gray-700">Banner Title / Caption</label>
                          <input
                            type="text"
                            placeholder="e.g. Up to 30% Off Organic Honey"
                            className="input py-2"
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                          />
                        </div>
                        <div className="field">
                          <label className="label text-xs font-semibold text-gray-700">Target Redirect Link</label>
                          <input
                            type="text"
                            placeholder="e.g. /shop?category=Pantry"
                            className="input py-2"
                            value={newBanner.linkUrl}
                            onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="field text-left">
                        <ImageUploadZone
                          label="Banner Image (16:9 recommended)"
                          value={newBanner.imageUrl}
                          onChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer border-0"
                        >
                          ➕ Add Banner to Queue
                        </button>
                      </div>
                    </form>

                    {/* Banner list */}
                    <div className="space-y-3">
                      <span className="block text-xs font-bold text-gray-700">Current Homepage Banners ({siteSettings.homepageBanners.length})</span>
                      {siteSettings.homepageBanners.length === 0 ? (
                        <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-250 p-6 text-center">
                          No promotional banners configured. Default hero section will be displayed.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {siteSettings.homepageBanners.map((banner, idx) => (
                            <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 bg-white flex flex-col group shadow-sm">
                              <img src={banner.imageUrl} alt={banner.title} className="w-full h-32 object-cover" />
                              <div className="p-3 text-left">
                                <p className="font-bold text-gray-900 text-xs truncate">{banner.title || "(Untitled Banner)"}</p>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">Link: {banner.linkUrl}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveBanner(idx)}
                                className="absolute top-2 right-2 p-1.5 bg-red-650 hover:bg-red-750 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100 border-0 shadow-sm cursor-pointer"
                                title="Remove banner"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {siteSettings.homepageBanners.length > 0 && (
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={handleUpdateSettings}
                          disabled={savingSettings}
                          className="px-5 py-2.5 bg-[#c4622d] text-white hover:bg-[#e07a4a] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border-0"
                        >
                          {savingSettings ? "Saving Settings..." : "Save Banner Changes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {editingProduct ? (
        <Modal title={`Edit ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <ProductForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSubmit={async (payload) => {
              await updateProductRequest(payload.id, payload);
              notify("Product updated.");
              setEditingProduct(null);
              loadDashboard().catch(() => {});
            }}
          />
        </Modal>
      ) : null}

      {showCreateModal ? (
        <Modal title="Add Product" onClose={() => setShowCreateModal(false)}>
          <ProductForm
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (payload) => {
              await createProductRequest(payload);
              notify("Product created.");
              setShowCreateModal(false);
              loadDashboard().catch(() => {});
            }}
          />
        </Modal>
      ) : null}

      {selectedUserForMsg ? (
        <Modal title={`Send Message to ${selectedUserForMsg.name || "Unknown User"}`} onClose={() => setSelectedUserForMsg(null)}>
          <form onSubmit={handleSendMessage} className="stack text-sm">
            <div className="field">
              <label className="label">Subject / Title</label>
              <input
                type="text"
                className="input"
                required
                placeholder="e.g. Special Offer or Account Update"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Message Body</label>
              <textarea
                className="input min-h-[120px]"
                required
                placeholder="Write your message here..."
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="sendEmailCheckbox"
                checked={sendEmailCheckbox}
                onChange={(e) => setSendEmailCheckbox(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="sendEmailCheckbox" className="font-semibold text-gray-700 cursor-pointer select-none">
                📧 Send direct Email to user
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setSelectedUserForMsg(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary" disabled={sendingMsg}>
                {sendingMsg ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {promptConfig ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dk/50 backdrop-blur-md transition-opacity duration-300 ease-out animate-fade-in" onClick={() => setPromptConfig(null)}>
          <div className="relative transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-bd/30 transition-all sm:w-full sm:max-w-md animate-fadeUp text-left" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-[#c4622d] border border-amber-100 shadow-sm mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-bold leading-6 text-dk font-serif mb-2">
                {promptConfig.title}
              </h3>
              <p className="text-sm text-gray-500 font-semibold leading-relaxed mb-4">
                {promptConfig.description}
              </p>
              <div className="field">
                <input
                  type="text"
                  className="input py-2.5 w-full text-sm rounded-xl border border-gray-250 focus:border-amber-500 focus:ring-amber-500 outline-none"
                  placeholder={promptConfig.placeholder}
                  id="modalPromptInput"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = e.target.value;
                      promptConfig.onSubmit(val);
                      setPromptConfig(null);
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                type="button"
                className="inline-flex w-full sm:w-auto justify-center rounded-xl bg-warm px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm border border-bd/50 hover:bg-cream/40 transition-colors cursor-pointer"
                onClick={() => setPromptConfig(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex w-full sm:w-auto justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md bg-tc hover:bg-tcl hover:shadow-lg transition-all cursor-pointer border-0"
                onClick={() => {
                  const val = document.getElementById("modalPromptInput")?.value;
                  promptConfig.onSubmit(val);
                  setPromptConfig(null);
                }}
              >
                Draft with AI
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CategoryFormSection({ onCreated, notify }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createCategoryRequest({ name: name.trim(), emoji: emoji.trim() });
      notify("Category created successfully.");
      setName("");
      setEmoji("📦");
      onCreated();
    } catch (err) {
      notify(err.message || "Failed to create category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl border border-gray-150 p-5 flex flex-wrap gap-4 items-end mb-6 text-sm">
      <div className="field flex-grow min-w-[200px]">
        <label className="label text-xs font-semibold text-gray-700">Category Name</label>
        <input
          type="text"
          className="input py-2"
          required
          placeholder="e.g. Organic Grains"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field w-24">
        <label className="label text-xs font-semibold text-gray-700">Emoji Icon</label>
        <input
          type="text"
          className="input py-2 text-center"
          required
          placeholder="📦"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
        />
      </div>
      <button type="submit" className="button button-primary py-2 font-bold px-5" disabled={submitting}>
        {submitting ? "Creating..." : "➕ Add Category"}
      </button>
    </form>
  );
}

function CategoryListSection({ categories, onUpdated, onDeleted, notify }) {
  const { confirm } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", emoji: "" });

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, emoji: cat.emoji });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.name.trim()) return;
    try {
      await updateCategoryRequest(id, { name: editForm.name.trim(), emoji: editForm.emoji.trim() });
      notify("Category updated successfully.");
      setEditingId(null);
      onUpdated();
    } catch (err) {
      notify(err.message || "Failed to update category.");
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm("Are you sure you want to delete this category? Products in this category will need manual reassignment."))) return;
    try {
      await deleteCategoryRequest(id);
      notify("Category deleted successfully.");
      onDeleted();
    } catch (err) {
      notify(err.message || "Failed to delete category.");
    }
  };

  return (
    <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-150">
            <th className="w-16 text-center !py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Icon</th>
            <th className="text-left !py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
            <th className="text-left !py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Slug</th>
            <th className="w-48 text-right !py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;
            return (
              <tr key={cat.id || cat.name} className="hover:bg-amber-50/20 border-b border-gray-100 last:border-0 transition-colors">
                <td className="text-center text-2xl !py-3 !px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      className="input py-1 text-center w-12 text-base"
                      value={editForm.emoji}
                      onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                    />
                  ) : (
                    cat.emoji
                  )}
                </td>
                <td className="font-bold text-gray-900 !py-3 !px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      className="input py-1 text-sm w-full"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : (
                    cat.name
                  )}
                </td>
                <td className="text-gray-500 font-mono text-xs !py-3 !px-4">{cat.slug}</td>
                <td className="text-right !py-3 !px-4">
                  <div className="flex justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs py-1.5 px-3 border border-emerald-200 rounded-lg bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
                          onClick={() => handleSaveEdit(cat.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-gray-500 hover:text-gray-750 font-semibold text-xs py-1.5 px-3 border border-gray-200 rounded-lg bg-white transition-colors"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="text-[#c4622d] hover:text-[#e07a4a] font-semibold text-xs py-1.5 px-3 border border-[#c4622d]/25 rounded-lg bg-amber-50/10 hover:bg-amber-50/30 transition-colors"
                          onClick={() => handleStartEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 font-semibold text-xs py-1.5 px-3 border border-red-200 rounded-lg bg-red-50/10 hover:bg-red-50/30 transition-colors"
                          onClick={() => handleDelete(cat.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminSupportTicketsSection({ notify }) {
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });

  const loadTickets = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await getSupportTicketsRequest(p, 10);
      setTicketsList(data.tickets || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      notify(err.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadTickets(page).catch(() => {});
  }, [page, loadTickets]);

  const handleResolve = async (id) => {
    try {
      await resolveSupportTicketRequest(id);
      notify("Support ticket resolved successfully!");
      loadTickets(page).catch(() => {});
    } catch (err) {
      notify(err.message || "Failed to resolve support ticket.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🎟️ Customer Support Tickets</h2>
      <p className="text-xs text-gray-500 mb-4">View and resolve support tickets and inquiries submitted by store customers.</p>

      {loading ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading tickets...</p>
      ) : ticketsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Customer</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Subject</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Message</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Status</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-left">Date</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.map((t) => (
                <tr key={t.id} className="hover:bg-amber-50/20 transition-colors border-b border-gray-100 last:border-0">
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                      <span className="text-xs text-gray-500">{t.email}</span>
                    </div>
                  </td>
                  <td className="!py-3 !px-4 text-xs font-semibold text-gray-800">{t.subject}</td>
                  <td className="!py-3 !px-4 text-xs text-gray-600 max-w-xs break-words">{t.message}</td>
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                      t.status === "open"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="!py-3 !px-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="!py-3 !px-4 text-right whitespace-nowrap">
                    {t.status === "open" ? (
                      <button
                        type="button"
                        onClick={() => handleResolve(t.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0 shadow-sm"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          🎉 No support tickets in the queue!
        </p>
      )}
    </div>
  );
}

