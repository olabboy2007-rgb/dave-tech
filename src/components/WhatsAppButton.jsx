export default function WhatsAppButton() {
  
  const phoneNumber = "2349073852732"; 
  const message = "Hello DAVE TECH, I have an inquiry about your courses.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      {/* The Text Sign (Hidden on mobile to save space, visible on desktop) */}
      <div className="hidden md:flex items-center rounded-full border border-line bg-bg-card/90 px-4 py-2 text-xs font-medium text-slate-300 shadow-lg backdrop-blur-sm transition-all group-hover:border-brand/50 group-hover:text-white">
        For more info, speak to the admin
      </div>
      
      {/* The Button */}
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </div>
    </a>
  );
}