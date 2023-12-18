"use client";

const Clear = ({
  wipe,
  undoCanvas,
  redoCanvas,
}: {
  [key: string]: () => void;
}) => {
  return (
    <div className="absolute bottom-2 left-3 bg-white rounded-md px-2">
      <button onClick={undoCanvas} className="p-2">
        Undo
      </button>
      <button onClick={redoCanvas} className="p-2">
        Redo
      </button>
      <button
        className="p-3"
        onClick={() => {
          wipe();
        }}
      >
        Clear Canvas
      </button>{" "}
    </div>
  );
};

export default Clear;
