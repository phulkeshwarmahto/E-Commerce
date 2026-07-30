import { resolveReportRequest } from "../../api/admin.api";

export function AdminReportsTab({
  loadingReports,
  reportsList,
  reportsPage,
  loadReports,
  loadDashboard,
  notify,
  confirm
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 stack">
      <h2 className="text-lg font-bold text-gray-900 mb-1">⚠️ Reports Moderation Dashboard</h2>
      <p className="text-xs text-gray-500 mb-4">Investigate and handle reports on products or reviews from users.</p>

      {loadingReports ? (
        <p className="text-sm text-gray-500 py-6 text-center animate-pulse">Loading reports...</p>
      ) : reportsList.length > 0 ? (
        <div className="table-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reported By</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Target Type</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Reason</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="!py-3 !px-4 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reportsList.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="!py-3 !px-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {rpt.reporterName} ({rpt.reporterEmail})
                  </td>
                  <td className="!py-3 !px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      rpt.targetType === "product" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {rpt.targetType}
                    </span>
                  </td>
                  <td className="!py-3 !px-4 text-gray-700 text-xs">{rpt.reason}</td>
                  <td className="!py-3 !px-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(rpt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="!py-3 !px-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="button text-[10px] px-2.5 py-1.5 font-bold bg-gray-500 hover:bg-gray-600 text-white rounded-lg border-0 cursor-pointer"
                        onClick={async () => {
                          try {
                            await resolveReportRequest(rpt.id, "resolve");
                            notify("Report marked as resolved.");
                            loadReports(reportsPage).catch(() => {});
                          } catch (err) {
                            notify(err.message || "Failed to resolve report.");
                          }
                        }}
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        className="button text-[10px] px-2.5 py-1.5 font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg border-0 cursor-pointer"
                        onClick={async () => {
                          if (await confirm(`Are you sure you want to resolve and DELETE the reported ${rpt.targetType}?`)) {
                            try {
                              await resolveReportRequest(rpt.id, "deleteTarget");
                              notify(`Report resolved and target ${rpt.targetType} deleted.`);
                              loadReports(reportsPage).catch(() => {});
                              loadDashboard().catch(() => {});
                            } catch (err) {
                              notify(err.message || "Failed to delete target.");
                            }
                          }
                        }}
                      >
                        Delete Target
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No pending reports found!
        </p>
      )}
    </div>
  );
}
