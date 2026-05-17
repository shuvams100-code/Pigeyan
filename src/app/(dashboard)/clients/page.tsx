export default function ClientsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">Clients</h1>
        <button className="bg-[#0D7377] hover:bg-[#0A5C60] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Add Client
        </button>
      </div>
      <div className="p-6 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
        <p className="text-[#64748B]">Client list will appear here.</p>
      </div>
    </div>
  );
}
