import { MdDelete } from "react-icons/md";

export default function SelectionBar({ count, onDelete, onCancel }) {
  return (
    <div className="bottom-0 left-0 w-full bg-[#202c33] p-4 flex justify-between items-center">
      <span className="text-gray-300">{count} selected</span>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 rounded-lg border-2 border-gray-400"
        >
          Cancel
        </button>

        <button
          onClick={onDelete}
          className="flex justify-center items-center gap-1 px-4 py-2 text-green-500 rounded-lg border-2 border-green-500"
        >
          <MdDelete />
          Delete
        </button>
      </div>
    </div>
  );
}
