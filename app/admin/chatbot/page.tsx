import ChatbotComponent from "../../components/admin/ChatbotComponent";

export default function ChatbotPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">AI Chatbot</h1>
        <p className="text-gray-600 mt-2">Chat with your AI tutor for help with web development concepts</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatbotComponent />
      </div>
    </div>
  );
}
