const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white/5 rounded-full">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;