// src/pages/childpanel/ChildPanelOrders.jsx

import { useEffect, useState, useCallback } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import ChildPanelLayout from "../../components/childpanel/ChildPanelLayout";

import CPOrdersStats from "../../components/childpanel/orders/CPOrdersStats";
import CPOrdersFilters from "../../components/childpanel/orders/CPOrdersFilters";
import CPOrdersTable from "../../components/childpanel/orders/CPOrdersTable";
import CPOrdersConfirmModal from "../../components/childpanel/orders/CPOrdersConfirmModal";
import CPOrdersPartialModal from "../../components/childpanel/orders/CPOrdersPartialModal";
import CPOrdersEditModal from "../../components/childpanel/orders/CPOrdersEditModal";

export default function ChildPanelOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [confirmModal, setConfirmModal] = useState(null); // { message, danger, onConfirm }
  const [partialModal, setPartialModal] = useState(null); // order
  const [editModal, setEditModal] = useState(null);       // order

  // ─── Fetch ──────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(status && { status }),
        ...(search && { search }),
      });
      const res = await API.get(`/cp/orders?${params}`);
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  // ─── Optimistic update helper ────────────────────────────
  const patchOrder = (id, patch) =>
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, ...patch } : o))
    );

  // ─── Complete ────────────────────────────────────────────
  const handleComplete = (order) => {
    setConfirmModal({
      message: `Mark order #${order.customOrderId} as completed?`,
      danger: false,
      onConfirm: async () => {
        try {
          await API.post(`/cp/orders/${order._id}/complete`);
          patchOrder(order._id, { status: "completed", quantityDelivered: order.quantity });
          toast.success("Order completed");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // ─── Refund ──────────────────────────────────────────────
  const handleRefund = (order) => {
    setConfirmModal({
      message: `Refund order #${order.customOrderId}? Charge will be returned to the user.`,
      danger: true,
      onConfirm: async () => {
        try {
          await API.post(`/cp/orders/${order._id}/refund`);
          patchOrder(order._id, { status: "refunded" });
          toast.success("Order refunded");
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed");
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // ─── Partial ─────────────────────────────────────────────
  const handlePartial = (order) => setPartialModal(order);

  const confirmPartial = async (quantityDelivered) => {
    try {
      await API.post(`/cp/orders/${partialModal._id}/partial`, { quantityDelivered });
      patchOrder(partialModal._id, { status: "partial", quantityDelivered });
      toast.success("Order marked as partial");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setPartialModal(null);
    }
  };

  // ─── Manual Edit ─────────────────────────────────────────
  const handleEdit = (order) => setEditModal(order);

  const confirmEdit = async (form) => {
    try {
      const res = await API.patch(`/cp/orders/${editModal._id}/edit`, form);
      patchOrder(editModal._id, res.data.order || form);
      toast.success("Order updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setEditModal(null);
    }
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <ChildPanelLayout>
      <div className="space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">Manage orders placed on your panel</p>
        </div>

        {/* Stats */}
        <CPOrdersStats />

        {/* Filters */}
        <CPOrdersFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Table */}
        <CPOrdersTable
          orders={orders}
          loading={loading}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          onComplete={handleComplete}
          onRefund={handleRefund}
          onPartial={handlePartial}
          onEdit={handleEdit}
        />
      </div>

      {/* Modals */}
      {confirmModal && (
        <CPOrdersConfirmModal
          message={confirmModal.message}
          danger={confirmModal.danger}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {partialModal && (
        <CPOrdersPartialModal
          order={partialModal}
          onConfirm={confirmPartial}
          onClose={() => setPartialModal(null)}
        />
      )}

      {editModal && (
        <CPOrdersEditModal
          order={editModal}
          onConfirm={confirmEdit}
          onClose={() => setEditModal(null)}
        />
      )}
    </ChildPanelLayout>
  );
      }
