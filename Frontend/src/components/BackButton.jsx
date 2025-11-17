import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ className = "", size = 22 }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className={`
        inline-flex items-center justify-center 
        p-2 rounded-full 
        hover:bg-base-200/60 dark:hover:bg-zinc-700/60
        transition-all duration-150 active:scale-95
        shadow-sm
        ${className}
      `}
    >
      <ArrowLeft size={size} />
    </button>
  );
};

export default BackButton;
