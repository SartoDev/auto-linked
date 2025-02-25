
import { SignIn } from "@clerk/clerk-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to AI Chat</p>
        </div>
        <div className="bg-background/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-white transition-colors",
                card: "bg-transparent shadow-none",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
