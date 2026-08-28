export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 text-red-600 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
