
import { SignIn } from "@clerk/clerk-react";
import { Card } from "@/components/ui/card";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 shadow-lg">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-none p-0",
            }
          }}
        />
      </Card>
    </div>
  );
};

export default Auth;
