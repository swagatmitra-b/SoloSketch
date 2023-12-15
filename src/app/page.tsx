import Toolbar from "../components/Toolbar";
import Canvas from "@/components/Canvas";
import Clear from "@/components/Clear";

export default function Home() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Toolbar />
      <Canvas />
    </div>
  );
}
