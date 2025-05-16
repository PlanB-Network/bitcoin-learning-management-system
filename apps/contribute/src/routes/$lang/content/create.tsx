import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/content/create')({
  component: ContentCreate,
});

function ContentCreate() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Content</h1>
      <div className="bg-gray-800 p-4 rounded">
        <form>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Enter title"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="contentType"
              className="block text-sm font-medium mb-1"
            >
              Content Type
            </label>
            <select id="contentType" className="w-full p-2 bg-gray-700 rounded">
              <option value="article">Article</option>
              <option value="tutorial">Tutorial</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              className="w-full p-2 bg-gray-700 rounded h-64"
              placeholder="Write your content here..."
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Save Draft
          </button>
        </form>
      </div>
    </div>
  );
}
