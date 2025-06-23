import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/icon.svg" 
              alt="Tempest Icon" 
              className="h-10 w-10"
            />
            <img 
              src="/logo.svg" 
              alt="Tempest" 
              className="h-6"
            />
          </div>
          <p className="text-white/70">Sign in to your university account</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white/10 backdrop-blur border-white/20",
              headerTitle: "text-white",
              headerSubtitle: "text-white/70",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
              formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-white/50",
              formFieldLabel: "text-white",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-purple-400",
              footerActionText: "text-white/70",
              footerActionLink: "text-purple-400 hover:text-purple-300",
            }
          }}
        />
      </div>
    </div>
  );
}