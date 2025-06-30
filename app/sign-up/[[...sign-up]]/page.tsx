import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function Page() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.svg" 
              alt="Tempest" 
              className="h-8"
            />
          </div>
          <p className="text-gray-400">Create your account</p>
        </div>
        <SignUp 
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "mx-auto",
              card: "bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
              formFieldInput: "bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500",
              formFieldLabel: "text-zinc-300",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-purple-400 hover:text-purple-300",
              footerActionText: "text-zinc-400",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              dividerLine: "bg-zinc-700",
              dividerText: "text-zinc-500",
            },
            variables: {
              colorPrimary: "#a855f7",
              colorDanger: "#ef4444",
              colorSuccess: "#10b981",
              colorWarning: "#f59e0b",
              colorTextOnPrimaryBackground: "#ffffff",
              colorBackground: "#18181b",
              colorInputBackground: "#27272a",
              colorInputText: "#ffffff",
              borderRadius: "0.5rem"
            }
          }}
        />
      </div>
    </div>
  );
}