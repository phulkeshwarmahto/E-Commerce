import { resolveSupportTicketRequest } from "../../api/support.api";

export function AdminSupportTab({
  loadingTickets,
  ticketsList,
  loadSupportTickets,
  notify,
  confirm
}) {
  const handleResolveTicket = async (ticketId) => {
    if (await confirm("Mark this support ticket as resolved?")) {
      try {
        await resolveSupportTicketRequest(ticketId);
        notify("Support ticket resolved.");
        loadSupportTickets().catch(() => {});
      } catch (err) {
        notify(err.message || "Failed to resolve ticket.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">🎟️ Support Tickets Center</h2>
      <p className="text-xs text-gray-500 mb-4">View and respond to customer help desk inquiries and support requests.</p>

      {loadingTickets ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading support tickets...</p>
      ) : ticketsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Subject</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Message</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {ticketsList.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="!py-3 !px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {tkt.userName || "User"} ({tkt.userEmail || "No email"})
                  </td>
                  <td className="!py-3 !px-4 text-sm font-bold text-gray-800">{tkt.subject}</td>
                  <td className="!py-3 !px-4 text-xs text-gray-700 max-w-xs truncate">{tkt.message}</td>
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      tkt.status === "Open" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                    }`}>
                      {tkt.status}
                    </span>
                  </td>
                  <td className="!py-3 !px-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(tkt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="!py-3 !px-4">
                    {tkt.status === "Open" && (
                      <button
                        type="button"
                        className="button text-[10px] px-2.5 py-1.5 font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg border-0 cursor-pointer"
                        onClick={() => handleResolveTicket(tkt.id)}
                      >
                        ✅ Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No support tickets found!
        </p>
      )}
    </div>
  );
}
