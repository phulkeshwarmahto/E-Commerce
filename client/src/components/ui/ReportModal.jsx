import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { createReportRequest } from "../../api/report.api";
import { useAppContext } from "../../hooks/useAppContext";

export function ReportModal({ isOpen, onClose, reportType, targetId, targetName, onSubmitSuccess }) {
  const { notify } = useAppContext();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState("admin");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasons = {
    product: [
      "Inappropriate Content/Language",
      "Misleading Information/Images",
      "Counterfeit or Fake Product",
      "Safety Hazard",
      "Incorrect Pricing",
      "Other",
    ],
    review: [
      "Inappropriate/Offensive Language",
      "Fake Review / Spam",
      "Advertisement / Promotional Content",
      "Personal Information Leak",
      "Other",
    ],
    seller: [
      "Fraud / Scam Attempt",
      "Abusive / Unprofessional Behavior",
      "Policy Violation",
      "Delayed Shipping / No Response",
      "Other",
    ],
    other: [
      "General Store Issue",
      "Technical Bug",
      "Payment Problem",
      "Other",
    ],
  };

  const currentReasons = reasons[reportType] || reasons.other;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      notify("Please select a reason.");
      return;
    }
    if (!description.trim()) {
      notify("Please describe the issue.");
      return;
    }

    setSubmitting(true);
    try {
      await createReportRequest({
        reportType,
        targetId,
        targetName,
        reason,
        description: description.trim(),
        recipient,
      });
      notify("⚠️ Report submitted successfully.");
      setReason("");
      setDescription("");
      setRecipient("admin");
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (err) {
      notify(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={`⚠️ Report ${reportType}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="stack text-sm p-2 flex flex-col gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            You are reporting: <strong className="text-gray-900">{targetName}</strong>
          </p>
          <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg p-2 leading-relaxed border border-amber-100">
            Reports will be sent to the selected party. Abuse of this feature may lead to account suspension.
          </p>
        </div>

        {reportType !== "other" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700">Send Report To</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
              required
            >
              <option value="admin">Store Administrator</option>
              <option value="seller">Product Seller / Merchant</option>
              <option value="both">Both (Admin & Seller)</option>
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Reason for Report</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#c4622d] bg-white cursor-pointer"
            required
          >
            <option value="">-- Select a reason --</option>
            {currentReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-700">Details / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please provide detailed context about the issue..."
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-xs min-h-[100px] focus:outline-none focus:border-[#c4622d] bg-white resize-y"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
