import { dark } from '@clerk/themes'
import { SignIn } from "@clerk/clerk-react";

const AuthPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <SignIn/>
    </div>
  );
};

export default AuthPage;
