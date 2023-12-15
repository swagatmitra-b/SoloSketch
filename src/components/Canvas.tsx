"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { useToolBar } from "@/store";
import Clear from "./Clear";

interface ImgData {
  data?: Uint8ClampedArray;
  colorSpace: PredefinedColorSpace;
  height?: number;
  width?: number;
}

interface PixelState {
  undo: ImgData[];
  redo: ImgData[];
}

const Canvas = () => {
  const [drawing, setDrawing] = useState(false);
  const [pixelState, setPixelState] = useState<PixelState>({
    undo: [],
    redo: [],
  });
  const [undoCount, setUndoCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { tool, color, strokeSize } = useToolBar((state) => state);

  const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.lineCap = "round";
    ctx.lineWidth = strokeSize;
    ctx.strokeStyle = tool == "pen" ? color : "white";
    ctx.beginPath();
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
    setDrawing(true);
    if (pixelState.undo.length == 1) {
      setPixelState({ ...pixelState, redo: [] });
      setUndoCount(0);
    }
  };

  const draw = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    setPixelState({
      redo: [
        ...pixelState.redo,
        ctx.getImageData(0, 0, canvas.width, canvas.height),
      ],
      undo: [
        ...pixelState.undo,
        ctx.getImageData(0, 0, canvas.width, canvas.height),
      ],
    });
    setDrawing(false);
  };

  const wipe = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    setPixelState({
      ...pixelState,
      undo: [ctx.getImageData(0, 0, canvas.width, canvas.height)],
    });
  };

  useEffect(wipe, []);

  const undoCanvas = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const { undo, redo } = pixelState;
    if (undoCount < redo.length) setUndoCount(undoCount + 1);
    const prevState = undo[undo.length - 2];
    if (undo.length == 1) {
      wipe();
      return;
    }
    undo.length != 2
      ? setPixelState((prev) => ({
          ...prev,
          undo: prev.undo.filter((state) => state != prevState),
        }))
      : setPixelState((prev) => ({
          ...prev,
          undo: [prev.undo[0]],
        }));
    ctx.putImageData(prevState, 0, 0);
  };

  const redoCanvas = () => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const { redo } = pixelState;
    if (redo.length - undoCount > redo.length - 1) return;
    const nextState = redo[redo.length - undoCount];
    setPixelState({ ...pixelState, undo: pixelState.redo });
    if (undoCount > 0) setUndoCount(undoCount - 1);
    ctx.putImageData(nextState, 0, 0);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
      ></canvas>
      <Clear wipe={wipe} undoCanvas={undoCanvas} redoCanvas={redoCanvas} />
    </div>
  );
};

export default Canvas;
