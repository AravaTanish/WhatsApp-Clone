import LeftRail from "../Chat_components/LeftRail.jsx";
import Sidebar from "../Chat_components/Sidebar.jsx";
import useChatStore from "../../store/chatStore.js";

function LeftSide() {
  const { showSidebar } = useChatStore();
  return (
    <div
      className={`fixed md:static z-20 top-0 left-0 h-full flex
  w-[384px] md:w-auto
  transform ${showSidebar ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0 transition-transform duration-300 ease-in-out`}
    >
      <LeftRail />
      <Sidebar />
    </div>
  );
}

export default LeftSide;
