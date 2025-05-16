import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$lang/content/edit')({
  component: ContentEdit,
});

function ContentEdit() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Content</h1>
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
              value="Example Content Title"
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
              <option selected>Article</option>
              <option>Tutorial</option>
              <option>Course</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              className="w-full p-2 bg-gray-700 rounded h-64"
            >
              This is some example content that would be loaded from the
              database.
            </textarea>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Preview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
