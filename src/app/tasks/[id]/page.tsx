interface TaskDetailPageProps {
  params: {
    id: string;
  };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Task Details</h1>
        <p className="text-gray-600">Task ID: {params.id}</p>
        {/* Task details will be implemented here */}
      </div>
    </div>
  );
}
